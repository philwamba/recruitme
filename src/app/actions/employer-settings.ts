'use server'

import { revalidatePath } from 'next/cache'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export async function createDepartmentAction(formData: FormData) {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    const name = formData.get('name') as string
    if (!name?.trim()) {
        throw new Error('Department name is required')
    }

    const slug = slugify(name)

    await prisma.department.create({
        data: {
            name: name.trim(),
            slug,
        },
    })

    revalidatePath('/employer/settings/departments')
    revalidatePath('/employer/jobs')
}

export async function updateDepartmentAction(formData: FormData) {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    const id = formData.get('id') as string
    const name = formData.get('name') as string

    if (!id || !name?.trim()) {
        throw new Error('Department ID and name are required')
    }

    const slug = slugify(name)

    await prisma.department.update({
        where: { id },
        data: {
            name: name.trim(),
            slug,
        },
    })

    revalidatePath('/employer/settings/departments')
    revalidatePath('/employer/jobs')
}

export async function deleteDepartmentAction(formData: FormData) {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    const id = formData.get('id') as string
    if (!id) {
        throw new Error('Department ID is required')
    }

    const department = await prisma.department.findUnique({
        where: { id },
        include: { _count: { select: { jobs: true } } },
    })

    if (department && department._count.jobs > 0) {
        throw new Error('Cannot delete department with existing jobs')
    }

    await prisma.department.delete({
        where: { id },
    })

    revalidatePath('/employer/settings/departments')
    revalidatePath('/employer/jobs')
}

export async function getEmployerJobMetadata(targetUserId?: string) {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    const whereClause = user.role === 'ADMIN'
        ? targetUserId ? { createdByUserId: targetUserId } : {}
        : { createdByUserId: user.id }

    const jobs = await prisma.job.findMany({
        where: whereClause,
        select: {
            company: true,
            location: true,
        },
    })

    const companies = [...new Set(jobs.map(j => j.company).filter(Boolean))]
    const locations = [...new Set(jobs.map(j => j.location).filter(Boolean))] as string[]

    return { companies, locations }
}

export async function getDepartments() {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    return prisma.department.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { jobs: true },
            },
        },
    })
}
