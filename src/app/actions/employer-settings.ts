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

// ==========================================
// Company CRUD
// ==========================================

export async function createCompanyAction(formData: FormData) {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    const name = formData.get('name') as string
    const website = formData.get('website') as string | null

    if (!name?.trim()) {
        throw new Error('Company name is required')
    }

    const slug = slugify(name)

    // Check if slug already exists
    const existing = await prisma.company.findUnique({ where: { slug } })
    if (existing) {
        throw new Error('A company with this name already exists')
    }

    await prisma.company.create({
        data: {
            name: name.trim(),
            slug,
            website: website?.trim() || null,
        },
    })

    revalidatePath('/employer/settings/companies')
    revalidatePath('/employer/jobs')
}

export async function updateCompanyAction(formData: FormData) {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const website = formData.get('website') as string | null

    if (!id || !name?.trim()) {
        throw new Error('Company ID and name are required')
    }

    const slug = slugify(name)

    // Check if slug already exists for another company
    const existing = await prisma.company.findFirst({
        where: { slug, NOT: { id } },
    })
    if (existing) {
        throw new Error('A company with this name already exists')
    }

    await prisma.company.update({
        where: { id },
        data: {
            name: name.trim(),
            slug,
            website: website?.trim() || null,
        },
    })

    revalidatePath('/employer/settings/companies')
    revalidatePath('/employer/jobs')
}

export async function deleteCompanyAction(formData: FormData) {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    const id = formData.get('id') as string
    if (!id) {
        throw new Error('Company ID is required')
    }

    const company = await prisma.company.findUnique({
        where: { id },
        include: { _count: { select: { jobs: true } } },
    })

    if (company && company._count.jobs > 0) {
        throw new Error('Cannot delete company with existing jobs')
    }

    await prisma.company.delete({
        where: { id },
    })

    revalidatePath('/employer/settings/companies')
    revalidatePath('/employer/jobs')
}

export async function getCompanies() {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    return prisma.company.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { jobs: true },
            },
        },
    })
}

// ==========================================
// Location CRUD
// ==========================================

export async function createLocationAction(formData: FormData) {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    const name = formData.get('name') as string
    const city = formData.get('city') as string | null
    const country = formData.get('country') as string | null

    if (!name?.trim()) {
        throw new Error('Location name is required')
    }

    const slug = slugify(name)

    // Check if slug already exists
    const existing = await prisma.location.findUnique({ where: { slug } })
    if (existing) {
        throw new Error('A location with this name already exists')
    }

    await prisma.location.create({
        data: {
            name: name.trim(),
            slug,
            city: city?.trim() || null,
            country: country?.trim() || null,
        },
    })

    revalidatePath('/employer/settings/locations')
    revalidatePath('/employer/jobs')
}

export async function updateLocationAction(formData: FormData) {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const city = formData.get('city') as string | null
    const country = formData.get('country') as string | null

    if (!id || !name?.trim()) {
        throw new Error('Location ID and name are required')
    }

    const slug = slugify(name)

    // Check if slug already exists for another location
    const existing = await prisma.location.findFirst({
        where: { slug, NOT: { id } },
    })
    if (existing) {
        throw new Error('A location with this name already exists')
    }

    await prisma.location.update({
        where: { id },
        data: {
            name: name.trim(),
            slug,
            city: city?.trim() || null,
            country: country?.trim() || null,
        },
    })

    revalidatePath('/employer/settings/locations')
    revalidatePath('/employer/jobs')
}

export async function deleteLocationAction(formData: FormData) {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    const id = formData.get('id') as string
    if (!id) {
        throw new Error('Location ID is required')
    }

    const location = await prisma.location.findUnique({
        where: { id },
        include: { _count: { select: { jobs: true } } },
    })

    if (location && location._count.jobs > 0) {
        throw new Error('Cannot delete location with existing jobs')
    }

    await prisma.location.delete({
        where: { id },
    })

    revalidatePath('/employer/settings/locations')
    revalidatePath('/employer/jobs')
}

export async function getLocations() {
    await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    return prisma.location.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { jobs: true },
            },
        },
    })
}
