import 'server-only'

import { prisma } from '@/lib/prisma'
import { subDays, startOfDay, endOfDay, format } from 'date-fns'

export async function getDashboardStats() {
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
        rejectedAfterOfferCount,
    ] = await Promise.all([
        // Active jobs (current)
        prisma.job.count({
            where: { status: 'PUBLISHED' },
        }),
        // Active jobs (previous period for trend)
        prisma.job.count({
            where: {
                status: 'PUBLISHED',
                publishedAt: { lt: thirtyDaysAgo },
            },
        }),
        // Total candidates (submitted applications)
        prisma.application.count({
            where: {
                status: { not: 'DRAFT' },
                submittedAt: { gte: thirtyDaysAgo },
            },
        }),
        // Previous period candidates
        prisma.application.count({
            where: {
                status: { not: 'DRAFT' },
                submittedAt: {
                    gte: sixtyDaysAgo,
                    lt: thirtyDaysAgo,
                },
            },
        }),
        // Interviews this week
        prisma.interview.count({
            where: {
                scheduledAt: {
                    gte: now,
                    lte: weekFromNow,
                },
                status: 'SCHEDULED',
            },
        }),
        // Pending reviews
        prisma.application.count({
            where: { status: 'SUBMITTED' },
        }),
        // Hired count
        prisma.application.count({
            where: {
                status: 'HIRED',
                updatedAt: { gte: thirtyDaysAgo },
            },
        }),
        // Offered count
        prisma.application.count({
            where: {
                status: 'OFFER',
            },
        }),
        // Rejected after offer (for acceptance rate)
        prisma.application.count({
            where: {
                status: 'REJECTED',
                updatedAt: { gte: thirtyDaysAgo },
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

    // Offer acceptance rate
    const totalOfferDecisions = hiredCount + rejectedAfterOfferCount
    const offerAcceptanceRate = totalOfferDecisions > 0
        ? Math.round((hiredCount / totalOfferDecisions) * 100)
        : 0

    return {
        activeJobs,
        jobsTrend,
        totalCandidates,
        candidatesTrend,
        interviewsThisWeek,
        pendingReviews,
        hiredCount,
        offerAcceptanceRate,
    }
}

export async function getApplicationsOverTime(days: number = 30) {
    const now = new Date()
    const startDate = startOfDay(subDays(now, days))

    const applications = await prisma.application.findMany({
        where: {
            submittedAt: { gte: startDate },
            status: { not: 'DRAFT' },
        },
        select: {
            submittedAt: true,
        },
        orderBy: {
            submittedAt: 'asc',
        },
    })

    // Group by date
    const groupedByDate = new Map<string, number>()

    // Initialize all dates with 0
    for (let i = days; i >= 0; i--) {
        const date = format(subDays(now, i), 'yyyy-MM-dd')
        groupedByDate.set(date, 0)
    }

    // Count applications per date
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

export async function getPipelineDistribution() {
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

export async function getSourceBreakdown() {
    const sources = await prisma.application.groupBy({
        by: ['source'],
        where: {
            status: { not: 'DRAFT' },
        },
        _count: true,
    })

    return sources.map(s => ({
        source: s.source || 'Direct',
        count: s._count,
    }))
}

export async function getRecentActivity(limit: number = 10) {
    const activities = await prisma.activityLog.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            actor: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    })

    return activities.map(activity => ({
        id: activity.id,
        description: activity.description,
        actorEmail: activity.actor?.email || 'System',
        createdAt: activity.createdAt,
        metadata: activity.metadata,
    }))
}

export async function getUpcomingInterviews(limit: number = 5) {
    const now = new Date()

    const interviews = await prisma.interview.findMany({
        where: {
            scheduledAt: { gte: now },
            status: 'SCHEDULED',
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
