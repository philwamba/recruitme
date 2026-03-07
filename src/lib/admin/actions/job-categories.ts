'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { createAuditLog, createActivityLog } from '@/lib/observability/audit'
import { getRequestContext } from '@/lib/request-context'
import {
    jobCategoryFormSchema,
    type JobCategoryFormData,
} from '@/lib/admin/validations/job-category'
import { ROUTES } from '@/lib/constants/routes'

export async function createJobCategory(data: JobCategoryFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const validated = jobCategoryFormSchema.parse(data)
    const { ipAddress, userAgent } = await getRequestContext()

    // Check for duplicate code
    const existing = await prisma.jobCategory.findUnique({
        where: { code: validated.code },
    })

    if (existing) {
        throw new Error('A category with this code already exists')
    }

    const category = await prisma.jobCategory.create({
        data: validated,
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'job_category.created',
        targetType: 'JobCategory',
        targetId: category.id,
        metadata: { name: category.name, code: category.code },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Created job category "${category.name}"`,
        metadata: { categoryId: category.id },
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.JOB_CATEGORIES)
    redirect(ROUTES.ADMIN.MASTER_DATA.JOB_CATEGORIES)
}

export async function updateJobCategory(categoryId: string, data: JobCategoryFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const validated = jobCategoryFormSchema.parse(data)
    const { ipAddress, userAgent } = await getRequestContext()

    const existingCategory = await prisma.jobCategory.findUnique({
        where: { id: categoryId },
    })

    if (!existingCategory) {
        throw new Error('Category not found')
    }

    // Check for duplicate code (excluding current)
    if (validated.code !== existingCategory.code) {
        const duplicateCode = await prisma.jobCategory.findUnique({
            where: { code: validated.code },
        })
        if (duplicateCode) {
            throw new Error('A category with this code already exists')
        }
    }

    const category = await prisma.jobCategory.update({
        where: { id: categoryId },
        data: validated,
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'job_category.updated',
        targetType: 'JobCategory',
        targetId: category.id,
        metadata: {
            name: category.name,
            code: category.code,
            previousName: existingCategory.name,
        },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Updated job category "${category.name}"`,
        metadata: { categoryId: category.id },
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.JOB_CATEGORIES)
    redirect(ROUTES.ADMIN.MASTER_DATA.JOB_CATEGORIES)
}

export async function deleteJobCategory(categoryId: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const category = await prisma.jobCategory.findUnique({
        where: { id: categoryId },
        include: {
            _count: {
                select: {
                    jobTitles: true,
                    jobs: true,
                },
            },
        },
    })

    if (!category) {
        throw new Error('Category not found')
    }

    if (category._count.jobTitles > 0) {
        throw new Error('Cannot delete category with existing job titles')
    }

    if (category._count.jobs > 0) {
        throw new Error('Cannot delete category with existing jobs')
    }

    await prisma.jobCategory.delete({
        where: { id: categoryId },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'job_category.deleted',
        targetType: 'JobCategory',
        targetId: categoryId,
        metadata: { name: category.name, code: category.code },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Deleted job category "${category.name}"`,
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.JOB_CATEGORIES)
    redirect(ROUTES.ADMIN.MASTER_DATA.JOB_CATEGORIES)
}

export async function toggleJobCategoryStatus(categoryId: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const category = await prisma.jobCategory.findUnique({
        where: { id: categoryId },
    })

    if (!category) {
        throw new Error('Category not found')
    }

    const updated = await prisma.jobCategory.update({
        where: { id: categoryId },
        data: { isActive: !category.isActive },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'job_category.status_changed',
        targetType: 'JobCategory',
        targetId: categoryId,
        metadata: {
            name: category.name,
            previousStatus: category.isActive,
            newStatus: updated.isActive,
        },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `${updated.isActive ? 'Activated' : 'Deactivated'} job category "${category.name}"`,
        metadata: {
            name: category.name,
            previousStatus: category.isActive,
            newStatus: updated.isActive,
        },
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.JOB_CATEGORIES)

    return { success: true, isActive: updated.isActive }
}
