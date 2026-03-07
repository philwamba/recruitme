import 'server-only'

import { prisma } from '@/lib/prisma'

export interface JobTitlesQueryParams {
    search?: string
    categoryId?: string
    isActive?: boolean
    page?: number
    limit?: number
}

export async function getJobTitles(params: JobTitlesQueryParams = {}) {
    const { search, categoryId, isActive, page = 1, limit = 50 } = params
    const skip = (page - 1) * limit

    const where = {
        ...(isActive !== undefined && { isActive }),
        ...(categoryId && { categoryId }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { code: { contains: search, mode: 'insensitive' as const } },
            ],
        }),
    }

    const [titles, totalCount] = await Promise.all([
        prisma.jobTitle.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }],
            include: {
                category: {
                    select: { id: true, name: true, code: true },
                },
                rankGrade: {
                    select: { id: true, name: true, code: true, level: true },
                },
                _count: {
                    select: { jobs: true },
                },
            },
        }),
        prisma.jobTitle.count({ where }),
    ])

    return {
        titles,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
    }
}

export async function getJobTitleById(id: string) {
    return prisma.jobTitle.findUnique({
        where: { id },
        include: {
            category: true,
            rankGrade: true,
            _count: {
                select: { jobs: true },
            },
        },
    })
}

export async function getActiveJobTitles(categoryId?: string) {
    return prisma.jobTitle.findMany({
        where: {
            isActive: true,
            ...(categoryId && { categoryId }),
        },
        orderBy: { name: 'asc' },
        include: {
            category: { select: { id: true, name: true } },
        },
    })
}
