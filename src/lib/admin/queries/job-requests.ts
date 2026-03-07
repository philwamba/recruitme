import 'server-only'

import { prisma } from '@/lib/prisma'
import type { JobRequestStatus } from '@prisma/client'

export interface JobRequestsQueryParams {
    status?: JobRequestStatus
    organizationId?: string
    requestedById?: string
    page?: number
    limit?: number
}

export async function getJobRequests(params: JobRequestsQueryParams = {}) {
    const { status, organizationId, requestedById, page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const where = {
        ...(status && { status }),
        ...(organizationId && { organizationId }),
        ...(requestedById && { requestedById }),
    }

    const [jobRequests, totalCount] = await Promise.all([
        prisma.jobRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                requestedBy: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
                approvals: {
                    orderBy: { level: 'asc' },
                    include: {
                        approver: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
                job: {
                    select: {
                        id: true,
                        slug: true,
                        status: true,
                    },
                },
            },
        }),
        prisma.jobRequest.count({ where }),
    ])

    return {
        jobRequests,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
    }
}

export async function getJobRequestById(id: string) {
    return prisma.jobRequest.findUnique({
        where: { id },
        include: {
            organization: true,
            category: true,
            requestedBy: {
                select: {
                    id: true,
                    email: true,
                },
            },
            approvals: {
                orderBy: { level: 'asc' },
                include: {
                    approver: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
            },
            job: true,
        },
    })
}

export async function getPendingApprovalsForUser(userId: string) {
    return prisma.jobRequestApproval.findMany({
        where: {
            approverUserId: userId,
            status: 'PENDING',
        },
        orderBy: { createdAt: 'asc' },
        include: {
            request: {
                include: {
                    organization: {
                        select: {
                            name: true,
                        },
                    },
                    requestedBy: {
                        select: {
                            email: true,
                        },
                    },
                },
            },
        },
    })
}

export async function generateRequestNumber() {
    const year = new Date().getFullYear()
    const count = await prisma.jobRequest.count({
        where: {
            requestNumber: {
                startsWith: `JR-${year}`,
            },
        },
    })
    return `JR-${year}-${String(count + 1).padStart(4, '0')}`
}
