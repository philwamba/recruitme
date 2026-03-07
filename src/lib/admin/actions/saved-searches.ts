'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { createAuditLog } from '@/lib/observability/audit'
import { savedSearchSchema, type SavedSearchFormData } from '@/lib/admin/validations/candidate-search'
import { ROUTES } from '@/lib/constants/routes'

export async function createSavedSearch(data: SavedSearchFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const validated = savedSearchSchema.parse(data)

    const savedSearch = await prisma.savedSearch.create({
        data: {
            name: validated.name,
            filters: validated.filters as object,
            isPublic: validated.isPublic,
            userId: user.id,
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'CREATE',
        targetType: 'SavedSearch',
        targetId: savedSearch.id,
        metadata: { name: savedSearch.name },
    })

    revalidatePath(ROUTES.ADMIN.CANDIDATES)
    return { success: true, id: savedSearch.id }
}

export async function updateSavedSearch(id: string, data: SavedSearchFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const existingSearch = await prisma.savedSearch.findUnique({
        where: { id },
    })

    if (!existingSearch) {
        throw new Error('Saved search not found')
    }

    if (existingSearch.userId !== user.id) {
        throw new Error('Unauthorized to update this saved search')
    }

    const validated = savedSearchSchema.parse(data)

    const updatedSearch = await prisma.savedSearch.update({
        where: { id },
        data: {
            name: validated.name,
            filters: validated.filters as object,
            isPublic: validated.isPublic,
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'UPDATE',
        targetType: 'SavedSearch',
        targetId: id,
        metadata: { name: updatedSearch.name },
    })

    revalidatePath(ROUTES.ADMIN.CANDIDATES)
    return { success: true }
}

export async function deleteSavedSearch(id: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const existingSearch = await prisma.savedSearch.findUnique({
        where: { id },
    })

    if (!existingSearch) {
        throw new Error('Saved search not found')
    }

    // Only owner can delete
    if (existingSearch.userId !== user.id) {
        throw new Error('Unauthorized to delete this saved search')
    }

    await prisma.savedSearch.delete({
        where: { id },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'DELETE',
        targetType: 'SavedSearch',
        targetId: id,
        metadata: { name: existingSearch.name },
    })

    revalidatePath(ROUTES.ADMIN.CANDIDATES)
    return { success: true }
}
