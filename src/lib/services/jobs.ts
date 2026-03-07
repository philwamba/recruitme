import 'server-only'

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/services/slug'
import type { JobSearchInput } from '@/lib/validations/jobs'

const PAGE_SIZE = 6

export async function getPublishedJobs(input: JobSearchInput) {
    const where: Prisma.JobWhereInput = {
        status: 'PUBLISHED',
        ...(input.q
            ? {
                OR: [
                    { title: { contains: input.q, mode: 'insensitive' } },
                    { company: { contains: input.q, mode: 'insensitive' } },
                    { description: { contains: input.q, mode: 'insensitive' } },
                ],
            }
            : {}),
        ...(input.department
            ? {
                department: {
                    slug: input.department,
                },
            }
            : {}),
        ...(input.employmentType ? { employmentType: input.employmentType } : {}),
        ...(input.workplaceType ? { workplaceType: input.workplaceType } : {}),
        ...(input.location
            ? {
                location: {
                    contains: input.location,
                    mode: 'insensitive',
                },
            }
            : {}),
    }

    const [jobs, totalCount, departments, locations] = await Promise.all([
        prisma.job.findMany({
            where,
            include: {
                department: true,
            },
            orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
            skip: (input.page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
        }),
        prisma.job.count({ where }),
        prisma.department.findMany({
            orderBy: { name: 'asc' },
        }),
        prisma.job.findMany({
            where: { status: 'PUBLISHED' },
            select: { location: true },
            distinct: ['location'],
            orderBy: { location: 'asc' },
        }),
    ])

    return {
        jobs,
        departments,
        locations: locations.map(l => l.location).filter(Boolean),
        page: input.page,
        pageSize: PAGE_SIZE,
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    }
}

export async function getPublishedJobBySlug(slug: string) {
    return prisma.job.findFirst({
        where: {
            slug,
            status: 'PUBLISHED',
        },
        include: {
            department: true,
            pipelineStages: {
                orderBy: {
                    order: 'asc',
                },
            },
        },
    })
}

export async function getEmployerJobs(userId: string) {
    return prisma.job.findMany({
        where: {
            createdByUserId: userId,
        },
        include: {
            department: true,
            _count: {
                select: {
                    applications: true,
                },
            },
        },
        orderBy: {
            updatedAt: 'desc',
        },
    })
}

export function createJobSlug(title: string, company: string) {
    return `${slugify(title)}-${slugify(company)}`
}
