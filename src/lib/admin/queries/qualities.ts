import 'server-only'

import { prisma } from '@/lib/prisma'

export interface QualitiesQueryParams {
    search?: string
    category?: string
    isActive?: boolean
    page?: number
    limit?: number
}

export async function getQualities(params: QualitiesQueryParams = {}) {
    const { search, category, isActive, page = 1, limit = 50 } = params
    const skip = (page - 1) * limit

    const where = {
        ...(isActive !== undefined && { isActive }),
        ...(category && { category }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { code: { contains: search, mode: 'insensitive' as const } },
            ],
        }),
    }

    const [qualities, totalCount] = await Promise.all([
        prisma.quality.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
            include: {
                _count: {
                    select: { templateItems: true },
                },
            },
        }),
        prisma.quality.count({ where }),
    ])

    return {
        qualities,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
    }
}

export async function getQualityById(id: string) {
    return prisma.quality.findUnique({
        where: { id },
        include: {
            _count: {
                select: { templateItems: true },
            },
        },
    })
}

export async function getActiveQualities(category?: string) {
    return prisma.quality.findMany({
        where: {
            isActive: true,
            ...(category && { category }),
        },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })
}

export async function getQualityCategories() {
    const categories = await prisma.quality.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
    })
    return categories.map(c => c.category).filter(Boolean) as string[]
}
