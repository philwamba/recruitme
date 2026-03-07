import 'server-only'

import { prisma } from '@/lib/prisma'

export async function getSavedSearches(userId: string) {
    return prisma.savedSearch.findMany({
        where: {
            OR: [
                { userId },
                { isPublic: true },
            ],
        },
        orderBy: [
            { isPublic: 'asc' },
            { updatedAt: 'desc' },
        ],
        include: {
            user: {
                select: {
                    email: true,
                },
            },
        },
    })
}

export async function getSavedSearchById(id: string) {
    return prisma.savedSearch.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
    })
}
