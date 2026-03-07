'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { createAuditLog, createActivityLog } from '@/lib/observability/audit'
import { getRequestContext } from '@/lib/request-context'
import {
    jobPipelineFormSchema,
    type JobPipelineFormData,
} from '@/lib/admin/validations/job-pipeline'
import { ROUTES } from '@/lib/constants/routes'

export async function updateJobPipeline(jobId: string, data: JobPipelineFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const validated = jobPipelineFormSchema.parse(data)
    const { ipAddress, userAgent } = await getRequestContext()

    const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: { pipelineStages: true },
    })

    if (!job) {
        throw new Error('Job not found')
    }

    // Check if any stages with applications are being removed
    const stageIdsToKeep = validated.stages
        .filter(s => s.id)
        .map(s => s.id!)

    const stagesToRemove = job.pipelineStages.filter(
        s => !stageIdsToKeep.includes(s.id),
    )

    if (stagesToRemove.length > 0) {
        const stagesWithApplications = await prisma.application.findFirst({
            where: {
                currentStageId: { in: stagesToRemove.map(s => s.id) },
            },
        })

        if (stagesWithApplications) {
            throw new Error(
                'Cannot remove stages that have applications. Move applications first.',
            )
        }
    }

    await prisma.$transaction(async tx => {
        // Delete removed stages (only those without applications)
        if (stagesToRemove.length > 0) {
            await tx.jobPipelineStage.deleteMany({
                where: {
                    jobId,
                    id: { in: stagesToRemove.map(s => s.id) },
                },
            })
        }

        // Upsert stages
        for (const stage of validated.stages) {
            if (stage.id) {
                // Verify ownership
                const existingStage = job.pipelineStages.find(s => s.id === stage.id)
                if (!existingStage) {
                    throw new Error(`Stage ${stage.id} does not belong to this job`)
                }

                await tx.jobPipelineStage.update({
                    where: { id: stage.id },
                    data: {
                        name: stage.name.trim(),
                        order: stage.order,
                        isDefault: stage.isDefault,
                    },
                })
            } else {
                await tx.jobPipelineStage.create({
                    data: {
                        jobId,
                        name: stage.name.trim(),
                        order: stage.order,
                        isDefault: stage.isDefault,
                    },
                })
            }
        }
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'job_pipeline.updated',
        targetType: 'Job',
        targetId: jobId,
        metadata: {
            jobTitle: job.title,
            stageCount: validated.stages.length,
            removedStages: stagesToRemove.map(s => s.name),
        },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Updated pipeline for job "${job.title}"`,
        metadata: { jobId },
    })

    revalidatePath(`${ROUTES.ADMIN.PIPELINE}/${jobId}`)
    revalidatePath(`${ROUTES.ADMIN.JOBS}/${jobId}/pipeline`)
}

export async function addJobPipelineStage(
    jobId: string,
    stageName: string,
    order?: number,
) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
            pipelineStages: { orderBy: { order: 'desc' }, take: 1 },
        },
    })

    if (!job) {
        throw new Error('Job not found')
    }

    const nextOrder = order ?? (job.pipelineStages[0]?.order ?? 0) + 1

    const stage = await prisma.$transaction(async tx => {
        // If inserting in the middle, shift others
        if (order !== undefined) {
            await tx.jobPipelineStage.updateMany({
                where: {
                    jobId,
                    order: { gte: order },
                },
                data: {
                    order: { increment: 1 },
                },
            })
        }

        return tx.jobPipelineStage.create({
            data: {
                jobId,
                name: stageName.trim(),
                order: nextOrder,
                isDefault: false,
            },
        })
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'job_pipeline_stage.created',
        targetType: 'JobPipelineStage',
        targetId: stage.id,
        metadata: { jobId, stageName: stage.name, order: nextOrder },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Added stage "${stage.name}" to job "${job.title}"`,
        metadata: { jobId, stageId: stage.id },
    })

    revalidatePath(`${ROUTES.ADMIN.PIPELINE}/${jobId}`)
    revalidatePath(`${ROUTES.ADMIN.JOBS}/${jobId}/pipeline`)

    return stage
}

export async function deleteJobPipelineStage(stageId: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const stage = await prisma.jobPipelineStage.findUnique({
        where: { id: stageId },
        include: {
            job: { select: { id: true, title: true } },
            _count: { select: { applications: true } },
        },
    })

    if (!stage) {
        throw new Error('Pipeline stage not found')
    }

    if (stage._count.applications > 0) {
        throw new Error(
            'Cannot delete stage with applications. Move applications first.',
        )
    }

    await prisma.jobPipelineStage.delete({
        where: { id: stageId },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'job_pipeline_stage.deleted',
        targetType: 'JobPipelineStage',
        targetId: stageId,
        metadata: {
            jobId: stage.job.id,
            stageName: stage.name,
        },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Removed stage "${stage.name}" from job "${stage.job.title}"`,
        metadata: { jobId: stage.job.id },
    })

    revalidatePath(`${ROUTES.ADMIN.PIPELINE}/${stage.job.id}`)
    revalidatePath(`${ROUTES.ADMIN.JOBS}/${stage.job.id}/pipeline`)

    return { success: true, id: stageId, name: stage.name }
}

export async function reorderJobPipelineStages(
    jobId: string,
    stageIds: string[],
) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true, title: true },
    })

    if (!job) {
        throw new Error('Job not found')
    }

    // Verify all stages belong to this job
    const jobStages = await prisma.jobPipelineStage.findMany({
        where: { jobId },
        select: { id: true },
    })
    const jobStageIds = new Set(jobStages.map(s => s.id))

    if (stageIds.length !== jobStageIds.size || !stageIds.every(id => jobStageIds.has(id))) {
        throw new Error('Invalid stage IDs provided for reordering')
    }

    await prisma.$transaction(
        stageIds.map((id, index) =>
            prisma.jobPipelineStage.update({
                where: { id, jobId },
                data: { order: index + 1 },
            }),
        ),
    )

    await createAuditLog({
        actorUserId: user.id,
        action: 'job_pipeline.reordered',
        targetType: 'Job',
        targetId: jobId,
        metadata: { jobTitle: job.title },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Reordered pipeline stages for job "${job.title}"`,
        metadata: { jobId },
    })

    revalidatePath(`${ROUTES.ADMIN.PIPELINE}/${jobId}`)
    revalidatePath(`${ROUTES.ADMIN.JOBS}/${jobId}/pipeline`)
}

export async function setDefaultJobPipelineStage(stageId: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const stage = await prisma.jobPipelineStage.findUnique({
        where: { id: stageId },
        include: { job: { select: { id: true, title: true } } },
    })

    if (!stage) {
        throw new Error('Pipeline stage not found')
    }

    await prisma.$transaction(async tx => {
        // Unset current default for this job
        await tx.jobPipelineStage.updateMany({
            where: { jobId: stage.job.id, isDefault: true },
            data: { isDefault: false },
        })

        // Set new default
        await tx.jobPipelineStage.update({
            where: { id: stageId },
            data: { isDefault: true },
        })
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'job_pipeline_stage.set_default',
        targetType: 'JobPipelineStage',
        targetId: stageId,
        metadata: {
            jobId: stage.job.id,
            stageName: stage.name,
        },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Set "${stage.name}" as default entry stage for job "${stage.job.title}"`,
        metadata: { jobId: stage.job.id, stageId },
    })

    revalidatePath(`${ROUTES.ADMIN.PIPELINE}/${stage.job.id}`)
    revalidatePath(`${ROUTES.ADMIN.JOBS}/${stage.job.id}/pipeline`)
}
