import 'server-only'

import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type TransactionClient = Omit<
    PrismaClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

const DEFAULT_STAGE_NAMES = [
    'Applied',
    'Under Review',
    'Shortlisted',
    'Interview Phase 1',
    'Interview Phase 2',
    'Assessment',
    'Offer',
    'Hired',
    'Rejected',
]

export async function createDefaultPipelineStages(
    jobId: string,
    tx?: TransactionClient,
) {
    const client = tx ?? prisma

    // Make idempotent: check for existing stages
    const existingStages = await client.jobPipelineStage.findMany({
        where: { jobId },
        select: { name: true },
    })

    const existingNames = new Set(existingStages.map(s => s.name))
    const missingStages = DEFAULT_STAGE_NAMES.filter(name => !existingNames.has(name))

    if (missingStages.length === 0) {
        return client.jobPipelineStage.findMany({
            where: { jobId },
            orderBy: { order: 'asc' },
        })
    }

    // Only create missing stages
    const hasDefault = existingStages.length > 0
    await client.jobPipelineStage.createMany({
        data: missingStages.map((name, index) => ({
            jobId,
            name,
            order: existingStages.length + index + 1,
            isDefault: !hasDefault && index === 0,
        })),
    })

    return client.jobPipelineStage.findMany({
        where: { jobId },
        orderBy: { order: 'asc' },
    })
}

/**
 * Copy stages from a pipeline template to a job.
 * Creates job pipeline stages based on the template's stages.
 */
export async function copyTemplateToJob(
    templateId: string,
    jobId: string,
    tx?: TransactionClient,
) {
    const client = tx ?? prisma

    const template = await client.pipelineTemplate.findUnique({
        where: { id: templateId },
        include: {
            stages: { orderBy: { order: 'asc' } },
        },
    })

    if (!template) {
        throw new Error('Pipeline template not found')
    }

    if (template.stages.length === 0) {
        throw new Error('Pipeline template has no stages')
    }

    // Delete any existing stages for this job
    await client.jobPipelineStage.deleteMany({
        where: { jobId },
    })

    // Create stages from template
    await client.jobPipelineStage.createMany({
        data: template.stages.map(stage => ({
            jobId,
            name: stage.name,
            order: stage.order,
            isDefault: stage.isDefault,
        })),
    })

    return client.jobPipelineStage.findMany({
        where: { jobId },
        orderBy: { order: 'asc' },
    })
}

/**
 * Get the default pipeline template or fall back to creating default stages.
 */
export async function initializeJobPipeline(
    jobId: string,
    templateId?: string | null,
    tx?: TransactionClient,
) {
    const client = tx ?? prisma

    // If a specific template is provided, use it
    if (templateId) {
        return copyTemplateToJob(templateId, jobId, client)
    }

    // Try to find the default template
    const defaultTemplate = await client.pipelineTemplate.findFirst({
        where: { isDefault: true, isActive: true },
    })

    if (defaultTemplate) {
        return copyTemplateToJob(defaultTemplate.id, jobId, client)
    }

    // Fall back to creating default stages
    return createDefaultPipelineStages(jobId, client)
}
