import 'server-only'

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/services/slug'
import type { JobSearchInput } from '@/lib/validations/jobs'

const PAGE_SIZE = 6

export async function getPublishedJobs(input: JobSearchInput) {
    // Calculate posted date filter
    let postedAfter: Date | undefined
    if (input.postedWithin) {
        const days = parseInt(input.postedWithin, 10)
        if (!isNaN(days)) {
            postedAfter = new Date()
            postedAfter.setDate(postedAfter.getDate() - days)
        }
    }

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
        ...(input.category
            ? {
                category: {
                    code: input.category,
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
        ...(input.salaryMin ? { salaryMax: { gte: input.salaryMin } } : {}),
        ...(input.salaryMax ? { salaryMin: { lte: input.salaryMax } } : {}),
        ...(postedAfter ? { publishedAt: { gte: postedAfter } } : {}),
    }

    const [jobs, totalCount, departments, categories, locations] = await Promise.all([
        prisma.job.findMany({
            where,
            include: {
                department: true,
                category: true,
            },
            orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
            skip: (input.page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
        }),
        prisma.job.count({ where }),
        prisma.department.findMany({
            orderBy: { name: 'asc' },
        }),
        prisma.jobCategory.findMany({
            where: { isActive: true },
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
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
        categories,
        locations: locations.map(l => l.location).filter((loc): loc is string => loc != null),
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
