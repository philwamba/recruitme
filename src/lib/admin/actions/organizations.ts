'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { createAuditLog } from '@/lib/observability/audit'
import {
    organizationFormSchema,
    type OrganizationFormData,
} from '@/lib/admin/validations/organization'
import { ROUTES } from '@/lib/constants/routes'

export async function createOrganization(data: OrganizationFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const validated = organizationFormSchema.parse(data)

    // Check for duplicate code
    const existing = await prisma.organization.findUnique({
        where: { code: validated.code },
    })

    if (existing) {
        throw new Error('Organization code already exists')
    }

    const organization = await prisma.organization.create({
        data: {
            name: validated.name,
            code: validated.code,
            type: validated.type,
            parentId: validated.parentId || null,
            managerId: validated.managerId || null,
            isActive: validated.isActive,
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'CREATE',
        targetType: 'Organization',
        targetId: organization.id,
        metadata: { name: organization.name, code: organization.code },
    })

    revalidatePath(ROUTES.ADMIN.CONFIG.ORGANIZATION)
    redirect(ROUTES.ADMIN.CONFIG.ORGANIZATION)
}

export async function updateOrganization(id: string, data: OrganizationFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const existing = await prisma.organization.findUnique({
        where: { id },
    })

    if (!existing) {
        throw new Error('Organization not found')
    }

    const validated = organizationFormSchema.parse(data)

    // Check for duplicate code (excluding current)
    const duplicate = await prisma.organization.findFirst({
        where: {
            code: validated.code,
            id: { not: id },
        },
    })

    if (duplicate) {
        throw new Error('Organization code already exists')
    }

    // Prevent circular parent references
    if (validated.parentId) {
        if (validated.parentId === id) {
            throw new Error('Organization cannot be its own parent')
        }
        // Check if parent is a descendant
        const descendants = await getDescendants(id)
        if (descendants.includes(validated.parentId)) {
            throw new Error('Cannot set a descendant as parent')
        }
    }

    const organization = await prisma.organization.update({
        where: { id },
        data: {
            name: validated.name,
            code: validated.code,
            type: validated.type,
            parentId: validated.parentId || null,
            managerId: validated.managerId || null,
            isActive: validated.isActive,
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'UPDATE',
        targetType: 'Organization',
        targetId: id,
        metadata: { name: organization.name, code: organization.code },
    })

    revalidatePath(ROUTES.ADMIN.CONFIG.ORGANIZATION)
    redirect(ROUTES.ADMIN.CONFIG.ORGANIZATION)
}

export async function deleteOrganization(id: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_SYSTEM_SETTINGS',
    })

    const existing = await prisma.organization.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    children: true,
                    jobRequests: true,
                },
            },
        },
    })

    if (!existing) {
        throw new Error('Organization not found')
    }

    if (existing._count.children > 0) {
        throw new Error('Cannot delete organization with child units')
    }

    if (existing._count.jobRequests > 0) {
        throw new Error('Cannot delete organization with job requests')
    }

    await prisma.organization.delete({
        where: { id },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'DELETE',
        targetType: 'Organization',
        targetId: id,
        metadata: { name: existing.name, code: existing.code },
    })

    revalidatePath(ROUTES.ADMIN.CONFIG.ORGANIZATION)
    return { success: true }
}

async function getDescendants(orgId: string): Promise<string[]> {
    const children = await prisma.organization.findMany({
        where: { parentId: orgId },
        select: { id: true },
    })

    const ids = children.map(c => c.id)
    for (const childId of ids) {
        const grandchildren = await getDescendants(childId)
        ids.push(...grandchildren)
    }

    return ids
}
