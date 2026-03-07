import 'server-only'

import { prisma } from '@/lib/prisma'

export interface RankGradesQueryParams {
    search?: string
    isActive?: boolean
    page?: number
    limit?: number
}

export async function getRankGrades(params: RankGradesQueryParams = {}) {
    const { search, isActive, page = 1, limit = 50 } = params
    const skip = (page - 1) * limit

    const where = {
        ...(isActive !== undefined && { isActive }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { code: { contains: search, mode: 'insensitive' as const } },
            ],
        }),
    }

    const [grades, totalCount] = await Promise.all([
        prisma.rankGrade.findMany({
            where,
            skip,
            take: limit,
            orderBy: { level: 'asc' },
            include: {
                _count: {
                    select: { jobTitles: true },
                },
            },
        }),
        prisma.rankGrade.count({ where }),
    ])

    return {
        grades,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
    }
}

export async function getRankGradeById(id: string) {
    return prisma.rankGrade.findUnique({
        where: { id },
        include: {
            _count: {
                select: { jobTitles: true },
            },
        },
    })
}

export async function getActiveRankGrades() {
    return prisma.rankGrade.findMany({
        where: { isActive: true },
        orderBy: { level: 'asc' },
    })
}
