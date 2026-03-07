'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { createAuditLog, createActivityLog } from '@/lib/observability/audit'
import { getRequestContext } from '@/lib/request-context'
import { jobTitleFormSchema, type JobTitleFormData } from '@/lib/admin/validations/job-title'
import { ROUTES } from '@/lib/constants/routes'

export async function createJobTitle(data: JobTitleFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const validated = jobTitleFormSchema.parse(data)
    const { ipAddress, userAgent } = await getRequestContext()

    // Check for duplicate code
    const existing = await prisma.jobTitle.findUnique({
        where: { code: validated.code },
    })

    if (existing) {
        throw new Error('A job title with this code already exists')
    }

    let title
    try {
        title = await prisma.jobTitle.create({
            data: {
                name: validated.name,
                code: validated.code,
                categoryId: validated.categoryId,
                description: validated.description,
                rankGradeId: validated.rankGradeId || null,
                isActive: validated.isActive,
            },
            include: { category: true },
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error('A job title with this code already exists')
        }
        throw error
    }

    await createAuditLog({
        actorUserId: user.id,
        action: 'job_title.created',
        targetType: 'JobTitle',
        targetId: title.id,
        metadata: { name: title.name, code: title.code, categoryId: title.categoryId },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Created job title "${title.name}" in ${title.category.name}`,
        metadata: { titleId: title.id },
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.JOB_TITLES)
    redirect(ROUTES.ADMIN.MASTER_DATA.JOB_TITLES)
}

export async function updateJobTitle(titleId: string, data: JobTitleFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const validated = jobTitleFormSchema.parse(data)
    const { ipAddress, userAgent } = await getRequestContext()

    const existingTitle = await prisma.jobTitle.findUnique({
        where: { id: titleId },
    })

    if (!existingTitle) {
        throw new Error('Job title not found')
    }

    // Check for duplicate code (excluding current)
    if (validated.code !== existingTitle.code) {
        const duplicateCode = await prisma.jobTitle.findUnique({
            where: { code: validated.code },
        })
        if (duplicateCode) {
            throw new Error('A job title with this code already exists')
        }
    }

    let title
    try {
        title = await prisma.jobTitle.update({
            where: { id: titleId },
            data: {
                name: validated.name,
                code: validated.code,
                categoryId: validated.categoryId,
                description: validated.description,
                rankGradeId: validated.rankGradeId || null,
                isActive: validated.isActive,
            },
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error('A job title with this code already exists')
        }
        throw error
    }

    await createAuditLog({
        actorUserId: user.id,
        action: 'job_title.updated',
        targetType: 'JobTitle',
        targetId: title.id,
        metadata: {
            name: title.name,
            code: title.code,
            previousName: existingTitle.name,
        },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Updated job title "${title.name}"`,
        metadata: { titleId: title.id },
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.JOB_TITLES)
    redirect(ROUTES.ADMIN.MASTER_DATA.JOB_TITLES)
}

export async function deleteJobTitle(titleId: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const title = await prisma.jobTitle.findUnique({
        where: { id: titleId },
        include: {
            _count: { select: { jobs: true } },
        },
    })

    if (!title) {
        throw new Error('Job title not found')
    }

    if (title._count.jobs > 0) {
        throw new Error('Cannot delete job title with existing jobs')
    }

    await prisma.jobTitle.delete({
        where: { id: titleId },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'job_title.deleted',
        targetType: 'JobTitle',
        targetId: titleId,
        metadata: { name: title.name, code: title.code },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Deleted job title "${title.name}"`,
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.JOB_TITLES)
    redirect(ROUTES.ADMIN.MASTER_DATA.JOB_TITLES)
}

export async function toggleJobTitleStatus(titleId: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const title = await prisma.jobTitle.findUnique({
        where: { id: titleId },
    })

    if (!title) {
        throw new Error('Job title not found')
    }

    const updated = await prisma.jobTitle.update({
        where: { id: titleId },
        data: { isActive: !title.isActive },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'job_title.status_changed',
        targetType: 'JobTitle',
        targetId: titleId,
        metadata: {
            name: title.name,
            previousStatus: title.isActive,
            newStatus: updated.isActive,
        },
        ipAddress,
        userAgent,
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.JOB_TITLES)

    return { success: true, isActive: updated.isActive }
}
