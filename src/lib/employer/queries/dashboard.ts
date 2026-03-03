import 'server-only'

import { prisma } from '@/lib/prisma'
import { subDays, startOfDay, format } from 'date-fns'

export async function getEmployerDashboardStats(userId: string) {
    const now = new Date()
    const thirtyDaysAgo = subDays(now, 30)
    const sixtyDaysAgo = subDays(now, 60)
    const weekFromNow = subDays(now, -7)

    const [
        activeJobs,
        activeJobsPrevious,
        totalCandidates,
        totalCandidatesPrevious,
        interviewsThisWeek,
        pendingReviews,
        hiredCount,
        offeredCount,
    ] = await Promise.all([
        prisma.job.count({
            where: {
                status: 'PUBLISHED',
                createdByUserId: userId,
            },
        }),
        prisma.job.count({
            where: {
                status: 'PUBLISHED',
                createdByUserId: userId,
                publishedAt: {
                    gte: sixtyDaysAgo,
                    lt: thirtyDaysAgo,
                },
            },
        }),
        prisma.application.count({
            where: {
                status: { not: 'DRAFT' },
                submittedAt: { gte: thirtyDaysAgo },
                job: { createdByUserId: userId },
            },
        }),
        prisma.application.count({
            where: {
                status: { not: 'DRAFT' },
                submittedAt: {
                    gte: sixtyDaysAgo,
                    lt: thirtyDaysAgo,
                },
                job: { createdByUserId: userId },
            },
        }),
        prisma.interview.count({
            where: {
                scheduledAt: {
                    gte: now,
                    lte: weekFromNow,
                },
                status: 'SCHEDULED',
                application: {
                    job: { createdByUserId: userId },
                },
            },
        }),
        prisma.application.count({
            where: {
                status: 'SUBMITTED',
                job: { createdByUserId: userId },
            },
        }),
        prisma.application.count({
            where: {
                status: 'HIRED',
                updatedAt: { gte: thirtyDaysAgo },
                job: { createdByUserId: userId },
            },
        }),
        prisma.application.count({
            where: {
                status: 'OFFER',
                job: { createdByUserId: userId },
            },
        }),
    ])

    // Calculate trends
    const jobsTrend = activeJobsPrevious > 0
        ? Math.round(((activeJobs - activeJobsPrevious) / activeJobsPrevious) * 100)
        : 0

    const candidatesTrend = totalCandidatesPrevious > 0
        ? Math.round(((totalCandidates - totalCandidatesPrevious) / totalCandidatesPrevious) * 100)
        : 0

    // Offer conversion rate = hired / (hired + current pending offers)
    // This shows how well offers convert to hires
    // Note: Does not track historical offer rejections due to schema limitations
    const totalOffers = hiredCount + offeredCount
    const offerAcceptanceRate = totalOffers > 0
        ? Math.round((hiredCount / totalOffers) * 100)
        : 0

    return {
        activeJobs,
        jobsTrend,
        totalCandidates,
        candidatesTrend,
        interviewsThisWeek,
        pendingReviews,
        hiredCount,
        offeredCount,
        offerAcceptanceRate,
    }
}

export async function getEmployerApplicationsOverTime(userId: string, days: number = 30) {
    const now = new Date()
    const startDate = startOfDay(subDays(now, days))

    const applications = await prisma.application.findMany({
        where: {
            submittedAt: { gte: startDate },
            status: { not: 'DRAFT' },
            job: { createdByUserId: userId },
        },
        select: {
            submittedAt: true,
        },
        orderBy: {
            submittedAt: 'asc',
        },
    })

    const groupedByDate = new Map<string, number>()

    for (let i = days; i >= 0; i--) {
        const date = format(subDays(now, i), 'yyyy-MM-dd')
        groupedByDate.set(date, 0)
    }

    for (const app of applications) {
        if (app.submittedAt) {
            const date = format(app.submittedAt, 'yyyy-MM-dd')
            groupedByDate.set(date, (groupedByDate.get(date) || 0) + 1)
        }
    }

    return Array.from(groupedByDate.entries()).map(([date, count]) => ({
        date,
        applications: count,
    }))
}

export async function getEmployerPipelineDistribution(userId: string) {
    const statuses = [
        'SUBMITTED',
        'UNDER_REVIEW',
        'SHORTLISTED',
        'INTERVIEW_PHASE_1',
        'INTERVIEW_PHASE_2',
        'ASSESSMENT',
        'OFFER',
    ] as const

    const counts = await prisma.application.groupBy({
        by: ['status'],
        where: {
            status: { in: [...statuses] },
            job: { createdByUserId: userId },
        },
        _count: true,
    })

    const statusLabels: Record<string, string> = {
        SUBMITTED: 'Submitted',
        UNDER_REVIEW: 'Review',
        SHORTLISTED: 'Shortlisted',
        INTERVIEW_PHASE_1: 'Interview 1',
        INTERVIEW_PHASE_2: 'Interview 2',
        ASSESSMENT: 'Assessment',
        OFFER: 'Offer',
    }

    return statuses.map(status => ({
        stage: statusLabels[status] || status,
        count: counts.find(c => c.status === status)?._count || 0,
    }))
}

export async function getEmployerRecentActivity(userId: string, limit: number = 10) {
    const activities = await prisma.activityLog.findMany({
        where: {
            actorUserId: userId,
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            actor: {
                select: {
                    id: true,
                    email: true,
                    role: true,
                },
            },
        },
    })

    return activities.map(activity => {
        const maskEmail = (email: string) => {
            const [localPart, domain] = email.split('@')
            return `${localPart.slice(0, 2)}***@${domain}`
        }

        const actorDisplayName = activity.actor
            ? maskEmail(activity.actor.email)
            : 'System'

        return {
            id: activity.id,
            description: activity.description,
            actorDisplayName,
            createdAt: activity.createdAt,
            metadata: activity.metadata,
        }
    })
}

export async function getEmployerUpcomingInterviews(userId: string, limit: number = 5) {
    const now = new Date()

    const interviews = await prisma.interview.findMany({
        where: {
            scheduledAt: { gte: now },
            status: 'SCHEDULED',
            application: {
                job: { createdByUserId: userId },
            },
        },
        take: limit,
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

    return interviews.map(interview => ({
        id: interview.id,
        title: interview.title,
        scheduledAt: interview.scheduledAt,
        durationMinutes: interview.durationMinutes,
        candidateName: interview.application.user.applicantProfile
            ? `${interview.application.user.applicantProfile.firstName || ''} ${interview.application.user.applicantProfile.lastName || ''}`.trim()
            : interview.application.user.email,
        jobTitle: interview.application.job.title,
    }))
}
