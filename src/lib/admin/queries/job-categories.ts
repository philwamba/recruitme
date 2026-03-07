import 'server-only'

import { prisma } from '@/lib/prisma'

export interface JobCategoriesQueryParams {
    search?: string
    isActive?: boolean
    page?: number
    limit?: number
}

export async function getJobCategories(params: JobCategoriesQueryParams = {}) {
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

    const [categories, totalCount] = await Promise.all([
        prisma.jobCategory.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
            include: {
                _count: {
                    select: {
                        jobTitles: true,
                        jobs: true,
                    },
                },
            },
        }),
        prisma.jobCategory.count({ where }),
    ])

    return {
        categories,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
    }
}

export async function getJobCategoryById(id: string) {
    return prisma.jobCategory.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    jobTitles: true,
                    jobs: true,
                },
            },
        },
    })
}

export async function getActiveJobCategories() {
    return prisma.jobCategory.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
}
