'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { createAuditLog, createActivityLog } from '@/lib/observability/audit'
import { getRequestContext } from '@/lib/request-context'
import { qualityFormSchema, type QualityFormData } from '@/lib/admin/validations/quality'
import { ROUTES } from '@/lib/constants/routes'

export async function createQuality(data: QualityFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const validated = qualityFormSchema.parse(data)
    const { ipAddress, userAgent } = await getRequestContext()

    // Check for duplicate code
    const existing = await prisma.quality.findUnique({
        where: { code: validated.code },
    })

    if (existing) {
        throw new Error('A quality with this code already exists')
    }

    let quality
    try {
        quality = await prisma.quality.create({
            data: validated,
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error('A quality with this code already exists')
        }
        throw error
    }

    await createAuditLog({
        actorUserId: user.id,
        action: 'quality.created',
        targetType: 'Quality',
        targetId: quality.id,
        metadata: { name: quality.name, code: quality.code, category: quality.category },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Created quality factor "${quality.name}"`,
        metadata: { qualityId: quality.id },
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.QUALITIES)
    redirect(ROUTES.ADMIN.MASTER_DATA.QUALITIES)
}

export async function updateQuality(qualityId: string, data: QualityFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const validated = qualityFormSchema.parse(data)
    const { ipAddress, userAgent } = await getRequestContext()

    const existingQuality = await prisma.quality.findUnique({
        where: { id: qualityId },
    })

    if (!existingQuality) {
        throw new Error('Quality not found')
    }

    // Check for duplicate code (excluding current)
    if (validated.code !== existingQuality.code) {
        const duplicateCode = await prisma.quality.findUnique({
            where: { code: validated.code },
        })
        if (duplicateCode) {
            throw new Error('A quality with this code already exists')
        }
    }

    let quality
    try {
        quality = await prisma.quality.update({
            where: { id: qualityId },
            data: validated,
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            throw new Error('A quality with this code already exists')
        }
        throw error
    }

    await createAuditLog({
        actorUserId: user.id,
        action: 'quality.updated',
        targetType: 'Quality',
        targetId: quality.id,
        metadata: {
            name: quality.name,
            code: quality.code,
            previousName: existingQuality.name,
        },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Updated quality factor "${quality.name}"`,
        metadata: { qualityId: quality.id },
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.QUALITIES)
    redirect(ROUTES.ADMIN.MASTER_DATA.QUALITIES)
}

export async function deleteQuality(qualityId: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const quality = await prisma.quality.findUnique({
        where: { id: qualityId },
        include: {
            _count: { select: { templateItems: true } },
        },
    })

    if (!quality) {
        throw new Error('Quality not found')
    }

    if (quality._count.templateItems > 0) {
        throw new Error('Cannot delete quality used in templates')
    }

    await prisma.quality.delete({
        where: { id: qualityId },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'quality.deleted',
        targetType: 'Quality',
        targetId: qualityId,
        metadata: { name: quality.name, code: quality.code },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Deleted quality factor "${quality.name}"`,
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.QUALITIES)
    redirect(ROUTES.ADMIN.MASTER_DATA.QUALITIES)
}

export async function toggleQualityStatus(qualityId: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const quality = await prisma.quality.findUnique({
        where: { id: qualityId },
    })

    if (!quality) {
        throw new Error('Quality not found')
    }

    const updated = await prisma.quality.update({
        where: { id: qualityId },
        data: { isActive: !quality.isActive },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'quality.status_changed',
        targetType: 'Quality',
        targetId: qualityId,
        metadata: {
            name: quality.name,
            previousStatus: quality.isActive,
            newStatus: updated.isActive,
        },
        ipAddress,
        userAgent,
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.QUALITIES)

    return { success: true, isActive: updated.isActive }
}
