import 'server-only'

import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns'
import type { InterviewStatus } from '@prisma/client'

export interface InterviewsQueryParams {
    status?: InterviewStatus
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
}

export async function getInterviews(params: InterviewsQueryParams = {}) {
    const {
        status,
        startDate = startOfWeek(new Date()),
        endDate = endOfWeek(addDays(new Date(), 30)),
        page = 1,
        limit = 50,
    } = params
    const skip = (page - 1) * limit

    const where = {
        ...(status && { status }),
        scheduledAt: {
            gte: startDate,
            lte: endDate,
        },
    }

    const [interviews, totalCount] = await Promise.all([
        prisma.interview.findMany({
            where,
            skip,
            take: limit,
            orderBy: { scheduledAt: 'asc' },
            include: {
                application: {
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
                    },
                },
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
                    select: {
                        id: true,
                        score: true,
                        recommendation: true,
                    },
                },
            },
        }),
        prisma.interview.count({ where }),
    ])

    return {
        interviews,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
    }
}

export async function getInterviewById(interviewId: string) {
    const interview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
            application: {
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
                                    phone: true,
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
                },
            },
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
            },
            feedbacks: {
                include: {
                    author: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
            createdBy: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    })

    return interview
}

export async function getInterviewsForCalendar(year: number, month: number) {
    const startDate = startOfMonth(new Date(year, month - 1))
    const endDate = endOfMonth(new Date(year, month - 1))

    const interviews = await prisma.interview.findMany({
        where: {
            scheduledAt: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: { scheduledAt: 'asc' },
        include: {
            application: {
                include: {
                    user: {
                        select: {
                            email: true,
                            applicantProfile: {
                                select: {
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                    job: {
                        select: {
                            title: true,
                        },
                    },
                },
            },
        },
    })

    return interviews
}

export async function getInterviewStats() {
    const now = new Date()
    const weekFromNow = addDays(now, 7)

    const [scheduled, completed, thisWeek, pending] = await Promise.all([
        prisma.interview.count({
            where: { status: 'SCHEDULED', scheduledAt: { gte: now } },
        }),
        prisma.interview.count({
            where: { status: 'COMPLETED' },
        }),
        prisma.interview.count({
            where: {
                status: 'SCHEDULED',
                scheduledAt: { gte: now, lte: weekFromNow },
            },
        }),
        prisma.interview.count({
            where: {
                status: 'COMPLETED',
                feedbacks: { none: {} },
            },
        }),
    ])

    return { scheduled, completed, thisWeek, pendingFeedback: pending }
}
