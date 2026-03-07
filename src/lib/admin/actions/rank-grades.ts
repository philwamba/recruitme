'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { createAuditLog, createActivityLog } from '@/lib/observability/audit'
import { getRequestContext } from '@/lib/request-context'
import { rankGradeFormSchema, type RankGradeFormData } from '@/lib/admin/validations/rank-grade'
import { ROUTES } from '@/lib/constants/routes'

export async function createRankGrade(data: RankGradeFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const validated = rankGradeFormSchema.parse(data)
    const { ipAddress, userAgent } = await getRequestContext()

    // Check for duplicate code
    const existing = await prisma.rankGrade.findUnique({
        where: { code: validated.code },
    })

    if (existing) {
        throw new Error('A rank grade with this code already exists')
    }

    const grade = await prisma.rankGrade.create({
        data: validated,
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'rank_grade.created',
        targetType: 'RankGrade',
        targetId: grade.id,
        metadata: { name: grade.name, code: grade.code, level: grade.level },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Created rank grade "${grade.name}" (Level ${grade.level})`,
        metadata: { gradeId: grade.id },
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.RANK_GRADES)
    redirect(ROUTES.ADMIN.MASTER_DATA.RANK_GRADES)
}

export async function updateRankGrade(gradeId: string, data: RankGradeFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const validated = rankGradeFormSchema.parse(data)
    const { ipAddress, userAgent } = await getRequestContext()

    const existingGrade = await prisma.rankGrade.findUnique({
        where: { id: gradeId },
    })

    if (!existingGrade) {
        throw new Error('Rank grade not found')
    }

    // Check for duplicate code (excluding current)
    if (validated.code !== existingGrade.code) {
        const duplicateCode = await prisma.rankGrade.findUnique({
            where: { code: validated.code },
        })
        if (duplicateCode) {
            throw new Error('A rank grade with this code already exists')
        }
    }

    const grade = await prisma.rankGrade.update({
        where: { id: gradeId },
        data: validated,
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'rank_grade.updated',
        targetType: 'RankGrade',
        targetId: grade.id,
        metadata: {
            name: grade.name,
            code: grade.code,
            level: grade.level,
            previousName: existingGrade.name,
        },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Updated rank grade "${grade.name}"`,
        metadata: { gradeId: grade.id },
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.RANK_GRADES)
    redirect(ROUTES.ADMIN.MASTER_DATA.RANK_GRADES)
}

export async function deleteRankGrade(gradeId: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const grade = await prisma.rankGrade.findUnique({
        where: { id: gradeId },
        include: {
            _count: { select: { jobTitles: true } },
        },
    })

    if (!grade) {
        throw new Error('Rank grade not found')
    }

    if (grade._count.jobTitles > 0) {
        throw new Error('Cannot delete rank grade with existing job titles')
    }

    await prisma.rankGrade.delete({
        where: { id: gradeId },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'rank_grade.deleted',
        targetType: 'RankGrade',
        targetId: gradeId,
        metadata: { name: grade.name, code: grade.code },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Deleted rank grade "${grade.name}"`,
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.RANK_GRADES)
    redirect(ROUTES.ADMIN.MASTER_DATA.RANK_GRADES)
}

export async function toggleRankGradeStatus(gradeId: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const grade = await prisma.rankGrade.findUnique({
        where: { id: gradeId },
    })

    if (!grade) {
        throw new Error('Rank grade not found')
    }

    const updated = await prisma.rankGrade.update({
        where: { id: gradeId },
        data: { isActive: !grade.isActive },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'rank_grade.status_changed',
        targetType: 'RankGrade',
        targetId: gradeId,
        metadata: {
            name: grade.name,
            previousStatus: grade.isActive,
            newStatus: updated.isActive,
        },
        ipAddress,
        userAgent,
    })

    revalidatePath(ROUTES.ADMIN.MASTER_DATA.RANK_GRADES)

    return { success: true, isActive: updated.isActive }
}
