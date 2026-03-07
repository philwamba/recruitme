import { prisma } from '@/lib/prisma'
import { cache } from 'react'

export interface SidebarCounts {
    candidates: number
    interviews: number
    assessments: number
    pendingReviews: number
}

export const getSidebarCounts = cache(async (): Promise<SidebarCounts> => {
    const [
        candidatesCount,
        interviewsCount,
        assessmentsCount,
        pendingReviewsCount,
    ] = await Promise.all([
        // New candidates in last 7 days
        prisma.application.count({
            where: {
                status: 'SUBMITTED',
                submittedAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
        }),
        // Upcoming interviews in the next 7 days
        prisma.interview.count({
            where: {
                scheduledAt: {
                    gte: new Date(),
                    lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
                status: 'SCHEDULED',
            },
        }),
        // Pending assessments (assigned but not submitted)
        prisma.assessment.count({
            where: {
                status: 'ASSIGNED',
            },
        }),
        // Applications pending review
        prisma.application.count({
            where: {
                status: {
                    in: ['SUBMITTED', 'UNDER_REVIEW'],
                },
            },
        }),
    ])

    return {
        candidates: candidatesCount,
        interviews: interviewsCount,
        assessments: assessmentsCount,
        pendingReviews: pendingReviewsCount,
    }
})

export function formatBadgeCount(count: number): string {
    if (count <= 0) return ''
    if (count > 999) return '999+'
    return count.toString()
}
