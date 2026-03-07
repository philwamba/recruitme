import 'server-only'

import { prisma } from '@/lib/prisma'
import type { ImportStatus } from '@prisma/client'

export interface CandidateImportsQueryParams {
    status?: ImportStatus
    page?: number
    limit?: number
}

export async function getCandidateImports(
    userId: string,
    params: CandidateImportsQueryParams = {},
) {
    const { status, page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const where = {
        importedById: userId,
        ...(status && { status }),
    }

    const [imports, totalCount] = await Promise.all([
        prisma.candidateImport.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                    },
                },
            },
        }),
        prisma.candidateImport.count({ where }),
    ])

    return {
        imports,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
    }
}

export async function getCandidateImportById(id: string) {
    return prisma.candidateImport.findUnique({
        where: { id },
        include: {
            importedBy: {
                select: {
                    id: true,
                    email: true,
                },
            },
            job: {
                select: {
                    id: true,
                    title: true,
                    company: true,
                },
            },
        },
    })
}

export async function getActiveJobs() {
    return prisma.job.findMany({
        where: {
            status: 'PUBLISHED',
        },
        select: {
            id: true,
            title: true,
            company: true,
        },
        orderBy: { title: 'asc' },
    })
}
