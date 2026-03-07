import 'server-only'

import { prisma } from '@/lib/prisma'

export interface PipelineTemplatesQueryParams {
    search?: string
    isActive?: boolean
    page?: number
    limit?: number
}

export async function getPipelineTemplates(params: PipelineTemplatesQueryParams = {}) {
    const { search, isActive } = params
    const page = Math.max(1, Math.floor(params.page ?? 1) || 1)
    const limit = Math.min(100, Math.max(1, Math.floor(params.limit ?? 50) || 50))
    const skip = (page - 1) * limit

    const where = {
        ...(isActive !== undefined && { isActive }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' as const } },
                { description: { contains: search, mode: 'insensitive' as const } },
            ],
        }),
    }

    const [templates, totalCount] = await Promise.all([
        prisma.pipelineTemplate.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
            include: {
                stages: { orderBy: { order: 'asc' } },
                _count: { select: { jobs: true } },
            },
        }),
        prisma.pipelineTemplate.count({ where }),
    ])

    return {
        templates,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
    }
}

export async function getPipelineTemplateById(id: string) {
    return prisma.pipelineTemplate.findUnique({
        where: { id },
        include: {
            stages: { orderBy: { order: 'asc' } },
            _count: { select: { jobs: true } },
        },
    })
}

export async function getActivePipelineTemplates() {
    return prisma.pipelineTemplate.findMany({
        where: { isActive: true },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        include: {
            stages: { orderBy: { order: 'asc' } },
        },
    })
}

export async function getDefaultPipelineTemplate() {
    return prisma.pipelineTemplate.findFirst({
        where: { isDefault: true, isActive: true },
        include: {
            stages: { orderBy: { order: 'asc' } },
        },
    })
}
