'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { createAuditLog, createActivityLog } from '@/lib/observability/audit'
import { getRequestContext } from '@/lib/request-context'
import {
    pipelineTemplateFormSchema,
    type PipelineTemplateFormData,
} from '@/lib/admin/validations/pipeline-template'
import { ROUTES } from '@/lib/constants/routes'

export async function createPipelineTemplate(data: PipelineTemplateFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const validated = pipelineTemplateFormSchema.parse(data)
    const { ipAddress, userAgent } = await getRequestContext()

    // Check for duplicate name
    const existing = await prisma.pipelineTemplate.findUnique({
        where: { name: validated.name },
    })

    if (existing) {
        throw new Error('A pipeline template with this name already exists')
    }

    let template
    try {
        template = await prisma.$transaction(async (tx) => {
            // If setting as default, unset other defaults
            if (validated.isDefault) {
                await tx.pipelineTemplate.updateMany({
                    where: { isDefault: true },
                    data: { isDefault: false },
                })
            }

            return tx.pipelineTemplate.create({
                data: {
                    name: validated.name,
                    description: validated.description,
                    isDefault: validated.isDefault,
                    isActive: validated.isActive,
                    stages: {
                        create: validated.stages.map(stage => ({
                            name: stage.name,
                            order: stage.order,
                            isDefault: stage.isDefault,
                        })),
                    },
                },
            })
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error('A pipeline template with this name already exists')
        }
        throw error
    }

    await createAuditLog({
        actorUserId: user.id,
        action: 'pipeline_template.created',
        targetType: 'PipelineTemplate',
        targetId: template.id,
        metadata: { name: template.name, stageCount: validated.stages.length },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Created pipeline template "${template.name}"`,
        metadata: { templateId: template.id },
    })

    revalidatePath(ROUTES.ADMIN.CONFIG.PIPELINE_TEMPLATES)
    redirect(ROUTES.ADMIN.CONFIG.PIPELINE_TEMPLATES)
}

export async function updatePipelineTemplate(templateId: string, data: PipelineTemplateFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const validated = pipelineTemplateFormSchema.parse(data)
    const { ipAddress, userAgent } = await getRequestContext()

    const existingTemplate = await prisma.pipelineTemplate.findUnique({
        where: { id: templateId },
        include: { stages: true },
    })

    if (!existingTemplate) {
        throw new Error('Pipeline template not found')
    }

    // Check for duplicate name (excluding current)
    if (validated.name !== existingTemplate.name) {
        const duplicateName = await prisma.pipelineTemplate.findUnique({
            where: { name: validated.name },
        })
        if (duplicateName) {
            throw new Error('A pipeline template with this name already exists')
        }
    }

    let template
    try {
        template = await prisma.$transaction(async (tx) => {
            // If setting as default, unset other defaults
            if (validated.isDefault && !existingTemplate.isDefault) {
                await tx.pipelineTemplate.updateMany({
                    where: { isDefault: true },
                    data: { isDefault: false },
                })
            }

            // Delete removed stages
            const stageIdsToKeep = validated.stages
                .filter(s => s.id)
                .map(s => s.id!)

            await tx.pipelineTemplateStage.deleteMany({
                where: {
                    templateId,
                    id: { notIn: stageIdsToKeep },
                },
            })

            // Update the template
            const updated = await tx.pipelineTemplate.update({
                where: { id: templateId },
                data: {
                    name: validated.name,
                    description: validated.description,
                    isDefault: validated.isDefault,
                    isActive: validated.isActive,
                },
            })

            // Upsert stages
            for (const stage of validated.stages) {
                if (stage.id) {
                    // Verify ownership
                    const existingStage = existingTemplate.stages.find(s => s.id === stage.id)
                    if (!existingStage) {
                        throw new Error(`Stage ${stage.id} does not belong to this template`)
                    }

                    await tx.pipelineTemplateStage.update({
                        where: { id: stage.id },
                        data: {
                            name: stage.name.trim(),
                            order: stage.order,
                            isDefault: stage.isDefault,
                        },
                    })
                } else {
                    await tx.pipelineTemplateStage.create({
                        data: {
                            templateId,
                            name: stage.name,
                            order: stage.order,
                            isDefault: stage.isDefault,
                        },
                    })
                }
            }

            return updated
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error('A pipeline template with this name already exists')
        }
        throw error
    }

    await createAuditLog({
        actorUserId: user.id,
        action: 'pipeline_template.updated',
        targetType: 'PipelineTemplate',
        targetId: template.id,
        metadata: {
            name: template.name,
            previousName: existingTemplate.name,
            stageCount: validated.stages.length,
        },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Updated pipeline template "${template.name}"`,
        metadata: { templateId: template.id },
    })

    revalidatePath(ROUTES.ADMIN.CONFIG.PIPELINE_TEMPLATES)
    redirect(ROUTES.ADMIN.CONFIG.PIPELINE_TEMPLATES)
}

export async function deletePipelineTemplate(templateId: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const template = await prisma.pipelineTemplate.findUnique({
        where: { id: templateId },
        include: {
            _count: { select: { jobs: true } },
        },
    })

    if (!template) {
        throw new Error('Pipeline template not found')
    }

    if (template._count.jobs > 0) {
        throw new Error('Cannot delete pipeline template used by jobs')
    }

    await prisma.pipelineTemplate.delete({
        where: { id: templateId },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'pipeline_template.deleted',
        targetType: 'PipelineTemplate',
        targetId: templateId,
        metadata: { name: template.name },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Deleted pipeline template "${template.name}"`,
    })

    revalidatePath(ROUTES.ADMIN.CONFIG.PIPELINE_TEMPLATES)
    return { success: true, id: templateId, name: template.name }
}

export async function togglePipelineTemplateStatus(templateId: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const template = await prisma.pipelineTemplate.findUnique({
        where: { id: templateId },
    })

    if (!template) {
        throw new Error('Pipeline template not found')
    }

    if (template.isDefault && template.isActive) {
        throw new Error('Cannot deactivate the default pipeline template. Set another template as default first.')
    }

    const updated = await prisma.pipelineTemplate.update({
        where: { id: templateId },
        data: { isActive: !template.isActive },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: updated.isActive ? 'pipeline_template.activated' : 'pipeline_template.deactivated',
        targetType: 'PipelineTemplate',
        targetId: templateId,
        metadata: { name: template.name },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `${updated.isActive ? 'Activated' : 'Deactivated'} pipeline template "${template.name}"`,
        metadata: { templateId: template.id },
    })

    revalidatePath(ROUTES.ADMIN.CONFIG.PIPELINE_TEMPLATES)
}

export async function setDefaultPipelineTemplate(templateId: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const template = await prisma.pipelineTemplate.findUnique({
        where: { id: templateId },
    })

    if (!template) {
        throw new Error('Pipeline template not found')
    }

    if (!template.isActive) {
        throw new Error('Cannot set inactive template as default')
    }

    await prisma.$transaction(async tx => {
        // Unset current default
        await tx.pipelineTemplate.updateMany({
            where: { isDefault: true },
            data: { isDefault: false },
        })

        // Set new default
        await tx.pipelineTemplate.update({
            where: { id: templateId },
            data: { isDefault: true },
        })
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'pipeline_template.set_default',
        targetType: 'PipelineTemplate',
        targetId: templateId,
        metadata: { name: template.name },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Set "${template.name}" as default pipeline template`,
        metadata: { templateId: template.id },
    })

    revalidatePath(ROUTES.ADMIN.CONFIG.PIPELINE_TEMPLATES)
}
