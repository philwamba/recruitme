import 'server-only'

import { prisma } from '@/lib/prisma'
import type { JobStatus, EmploymentType, WorkplaceType } from '@prisma/client'

export interface JobsQueryParams {
    status?: JobStatus
    departmentId?: string
    search?: string
    page?: number
    limit?: number
}

export async function getJobs(params: JobsQueryParams = {}) {
    const { status, departmentId, search, page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const where = {
        ...(status && { status }),
        ...(departmentId && { departmentId }),
        ...(search && {
            OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { company: { contains: search, mode: 'insensitive' as const } },
            ],
        }),
    }

    const [jobs, totalCount] = await Promise.all([
        prisma.job.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                department: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        applications: true,
                    },
                },
            },
        }),
        prisma.job.count({ where }),
    ])

    return {
        jobs,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
    }
}

export async function getJobById(id: string) {
    const job = await prisma.job.findUnique({
        where: { id },
        include: {
            department: true,
            createdBy: {
                select: {
                    id: true,
                    email: true,
                },
            },
            pipelineStages: {
                orderBy: { order: 'asc' },
            },
            _count: {
                select: {
                    applications: true,
                },
            },
        },
    })

    return job
}

export async function getJobBySlug(slug: string) {
    const job = await prisma.job.findUnique({
        where: { slug },
        include: {
            department: true,
            createdBy: {
                select: {
                    id: true,
                    email: true,
                },
            },
            pipelineStages: {
                orderBy: { order: 'asc' },
            },
            _count: {
                select: {
                    applications: true,
                },
            },
        },
    })

    return job
}

export async function getDepartments() {
    return prisma.department.findMany({
        orderBy: { name: 'asc' },
    })
}

export async function getJobStats(jobId: string) {
    const [
        totalApplications,
        newApplications,
        inReview,
        shortlisted,
        interviewed,
        offered,
        hired,
        rejected,
    ] = await Promise.all([
        prisma.application.count({ where: { jobId } }),
        prisma.application.count({ where: { jobId, status: 'SUBMITTED' } }),
        prisma.application.count({ where: { jobId, status: 'UNDER_REVIEW' } }),
        prisma.application.count({ where: { jobId, status: 'SHORTLISTED' } }),
        prisma.application.count({
            where: {
                jobId,
                status: { in: ['INTERVIEW_PHASE_1', 'INTERVIEW_PHASE_2'] },
            },
        }),
        prisma.application.count({ where: { jobId, status: 'OFFER' } }),
        prisma.application.count({ where: { jobId, status: 'HIRED' } }),
        prisma.application.count({ where: { jobId, status: 'REJECTED' } }),
    ])

    return {
        totalApplications,
        newApplications,
        inReview,
        shortlisted,
        interviewed,
        offered,
        hired,
        rejected,
    }
}
