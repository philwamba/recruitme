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
    const {
        status,
        jobId,
        search,
        skills,
        tags,
        location,
        appliedAfter,
        appliedBefore,
        hasDocuments,
        page = 1,
        limit = 20,
    } = params
    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.ApplicationWhereInput = {
        status: { not: 'DRAFT' },
    }

    if (status) {
        where.status = status
    }

    if (jobId) {
        where.jobId = jobId
    }

    // Search filter
    if (search) {
        where.OR = [
            {
                user: {
                    email: { contains: search, mode: 'insensitive' },
                },
            },
            {
                user: {
                    applicantProfile: {
                        OR: [
                            { firstName: { contains: search, mode: 'insensitive' } },
                            { lastName: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
            },
            {
                trackingId: { contains: search, mode: 'insensitive' },
            },
        ]
    }

    // Skills filter
    if (skills && skills.length > 0) {
        where.user = {
            applicantProfile: {
                skills: {
                    hasSome: skills,
                },
            },
        }
    }

    // Tags filter
    if (tags && tags.length > 0) {
        where.tags = {
            some: {
                tagId: { in: tags },
            },
        }
    }

    // Location filter (search in city and country)
    if (location) {
        if (where.user) {
            // Merge with existing user filter
            const existingProfile = (where.user as { applicantProfile?: object }).applicantProfile
            where.user = {
                applicantProfile: {
                    ...existingProfile,
                    OR: [
                        { city: { contains: location, mode: 'insensitive' } },
                        { country: { contains: location, mode: 'insensitive' } },
                    ],
                },
            }
        } else {
            where.user = {
                applicantProfile: {
                    OR: [
                        { city: { contains: location, mode: 'insensitive' } },
                        { country: { contains: location, mode: 'insensitive' } },
                    ],
                },
            }
        }
    }

    // Date filters
    if (appliedAfter || appliedBefore) {
        where.submittedAt = {}
        if (appliedAfter) {
            where.submittedAt.gte = new Date(appliedAfter)
        }
        if (appliedBefore) {
            // Use lt with start of next day to include the entire selected day
            const beforeDate = new Date(appliedBefore)
            beforeDate.setDate(beforeDate.getDate() + 1)
            where.submittedAt.lt = beforeDate
        }
    }

    // Documents filter
    if (hasDocuments === true) {
        where.documents = { some: {} }
    } else if (hasDocuments === false) {
        where.documents = { none: {} }
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
                                city: true,
                                country: true,
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

    // Filter by rating after fetching (since avgRating is calculated)
    let filteredApplications = applicationsWithRating
    if (params.minRating !== undefined || params.maxRating !== undefined) {
        filteredApplications = applicationsWithRating.filter(app => {
            if (app.avgRating === null) return false
            if (params.minRating !== undefined && app.avgRating < params.minRating) return false
            if (params.maxRating !== undefined && app.avgRating > params.maxRating) return false
            return true
        })
    }

    return {
        applications: filteredApplications,
        totalCount: params.minRating !== undefined || params.maxRating !== undefined
            ? filteredApplications.length
            : totalCount,
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

export async function getCandidateFilterOptions() {
    const [jobs, tags, skills] = await Promise.all([
        prisma.job.findMany({
            where: { status: { not: 'ARCHIVED' } },
            select: {
                id: true,
                title: true,
                company: true,
            },
            orderBy: { title: 'asc' },
        }),
        prisma.tag.findMany({
            orderBy: { name: 'asc' },
        }),
        // Get unique skills from all applicant profiles
        prisma.applicantProfile.findMany({
            select: { skills: true },
            where: {
                skills: { isEmpty: false },
            },
        }),
    ])

    // Extract and deduplicate skills
    const uniqueSkills = Array.from(
        new Set(skills.flatMap(p => p.skills)),
    ).sort()

    return {
        jobs,
        tags,
        skills: uniqueSkills,
    }
}
