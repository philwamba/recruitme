import 'server-only'

import { prisma } from '@/lib/prisma'
import type { ApplicationStatus, Prisma } from '@prisma/client'

export interface CandidatesQueryParams {
    status?: ApplicationStatus
    jobId?: string
    search?: string
    skills?: string[]
    tags?: string[]
    minRating?: number
    maxRating?: number
    minExperience?: number
    maxExperience?: number
    location?: string
    appliedAfter?: string
    appliedBefore?: string
    hasDocuments?: boolean
    page?: number
    limit?: number
}

export async function getCandidates(params: CandidatesQueryParams = {}) {
    const { status, jobId, search, page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const where = {
        status: { not: 'DRAFT' as const },
        ...(status && { status }),
        ...(jobId && { jobId }),
        ...(search && {
            OR: [
                {
                    user: {
                        email: { contains: search, mode: 'insensitive' as const },
                    },
                },
                {
                    user: {
                        applicantProfile: {
                            OR: [
                                { firstName: { contains: search, mode: 'insensitive' as const } },
                                { lastName: { contains: search, mode: 'insensitive' as const } },
                            ],
                        },
                    },
                },
            ],
        }),
    }

    const [applications, totalCount] = await Promise.all([
        prisma.application.findMany({
            where,
            skip,
            take: limit,
            orderBy: { submittedAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        applicantProfile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatarUrl: true,
                                headline: true,
                                skills: true,
                            },
                        },
                    },
                },
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                    },
                },
                currentStage: {
                    select: {
                        id: true,
                        name: true,
                        order: true,
                    },
                },
                ratings: {
                    select: {
                        score: true,
                    },
                },
                tags: {
                    include: {
                        tag: true,
                    },
                },
            },
        }),
        prisma.application.count({ where }),
    ])

    // Calculate average rating for each application
    const applicationsWithRating = applications.map(app => {
        const avgRating =
            app.ratings.length > 0
                ? app.ratings.reduce((sum, r) => sum + r.score, 0) / app.ratings.length
                : null
        return {
            ...app,
            avgRating,
        }
    })

    return {
        applications: applicationsWithRating,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
    }
}

export async function getCandidateById(applicationId: string) {
    const application = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    createdAt: true,
                    applicantProfile: {
                        include: {
                            workExperiences: {
                                orderBy: { startDate: 'desc' },
                            },
                            educations: {
                                orderBy: { startDate: 'desc' },
                            },
                            certifications: true,
                            candidateDocuments: true,
                        },
                    },
                },
            },
            job: {
                select: {
                    id: true,
                    title: true,
                    company: true,
                    status: true,
                    pipelineStages: {
                        orderBy: { order: 'asc' },
                    },
                },
            },
            currentStage: true,
            stageEvents: {
                orderBy: { createdAt: 'desc' },
                include: {
                    fromStage: true,
                    toStage: true,
                    changedBy: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
            },
            notes: {
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
            },
            tags: {
                include: {
                    tag: true,
                },
            },
            ratings: {
                include: {
                    author: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
            },
            documents: {
                orderBy: { createdAt: 'desc' },
            },
            interviews: {
                orderBy: { scheduledAt: 'desc' },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    email: true,
                                },
                            },
                        },
                    },
                    feedbacks: {
                        include: {
                            author: {
                                select: {
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
            assessments: {
                orderBy: { createdAt: 'desc' },
                include: {
                    submissions: true,
                },
            },
        },
    })

    return application
}

export async function getTags() {
    return prisma.tag.findMany({
        orderBy: { name: 'asc' },
    })
}
