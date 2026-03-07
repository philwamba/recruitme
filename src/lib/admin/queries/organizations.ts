import 'server-only'

import { prisma } from '@/lib/prisma'
import type { OrganizationType } from '@prisma/client'

export interface OrganizationsQueryParams {
    type?: OrganizationType
    parentId?: string | null
    isActive?: boolean
    page?: number
    limit?: number
}

export async function getOrganizations(params: OrganizationsQueryParams = {}) {
    const { type, parentId, isActive, page = 1, limit = 50 } = params
    const skip = (page - 1) * limit

    const where = {
        ...(type && { type }),
        ...(parentId !== undefined && { parentId }),
        ...(isActive !== undefined && { isActive }),
    }

    const [organizations, totalCount] = await Promise.all([
        prisma.organization.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ type: 'asc' }, { name: 'asc' }],
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        type: true,
                    },
                },
                manager: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        children: true,
                        jobRequests: true,
                    },
                },
            },
        }),
        prisma.organization.count({ where }),
    ])

    return {
        organizations,
        totalCount,
        pageCount: Math.ceil(totalCount / limit),
        currentPage: page,
    }
}

export async function getOrganizationById(id: string) {
    return prisma.organization.findUnique({
        where: { id },
        include: {
            parent: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                },
            },
            children: {
                orderBy: { name: 'asc' },
                select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    isActive: true,
                },
            },
            manager: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    })
}

export async function getOrganizationTree() {
    // Get all organizations and build tree structure
    const organizations = await prisma.organization.findMany({
        where: { isActive: true },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
        include: {
            manager: {
                select: {
                    id: true,
                    email: true,
                },
            },
            _count: {
                select: {
                    children: true,
                },
            },
        },
    })

    // Build tree structure
    const orgMap = new Map(organizations.map(org => [org.id, { ...org, children: [] as typeof organizations }]))

    const roots: typeof organizations = []

    for (const org of organizations) {
        if (org.parentId && orgMap.has(org.parentId)) {
            const parent = orgMap.get(org.parentId)!
            parent.children.push(orgMap.get(org.id)!)
        } else {
            roots.push(orgMap.get(org.id)!)
        }
    }

    return roots
}

export async function getOrganizationsForSelect() {
    return prisma.organization.findMany({
        where: { isActive: true },
        select: {
            id: true,
            name: true,
            code: true,
            type: true,
            parentId: true,
        },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
    })
}

export async function getAdminUsers() {
    return prisma.user.findMany({
        where: {
            role: { in: ['ADMIN', 'EMPLOYER'] },
        },
        select: {
            id: true,
            email: true,
        },
        orderBy: { email: 'asc' },
    })
}
