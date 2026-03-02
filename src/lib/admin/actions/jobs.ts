'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { createAuditLog, createActivityLog } from '@/lib/observability/audit'
import { getRequestContext } from '@/lib/request-context'
import { jobFormSchema, type JobFormData } from '@/lib/admin/validations/job'
import { ROUTES } from '@/lib/constants/routes'

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Date.now().toString(36)
}

export async function createJob(data: JobFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const validated = jobFormSchema.parse(data)
    const { ipAddress, userAgent } = await getRequestContext()

    const job = await prisma.job.create({
        data: {
            ...validated,
            slug: generateSlug(validated.title),
            createdByUserId: user.id,
            status: validated.status || 'DRAFT',
        },
    })

    // Create default pipeline stages
    const defaultStages = [
        { name: 'Applied', order: 1, isDefault: true },
        { name: 'Screening', order: 2 },
        { name: 'Interview', order: 3 },
        { name: 'Assessment', order: 4 },
        { name: 'Offer', order: 5 },
    ]

    await prisma.jobPipelineStage.createMany({
        data: defaultStages.map(stage => ({
            ...stage,
            jobId: job.id,
        })),
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'job.created',
        targetType: 'Job',
        targetId: job.id,
        metadata: { title: job.title, status: job.status },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Created job "${job.title}"`,
        metadata: { jobId: job.id },
    })

    revalidatePath(ROUTES.ADMIN.JOBS)
    redirect(`${ROUTES.ADMIN.JOBS}/${job.id}`)
}

export async function updateJob(jobId: string, data: JobFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const validated = jobFormSchema.parse(data)
    const { ipAddress, userAgent } = await getRequestContext()

    const existingJob = await prisma.job.findUnique({
        where: { id: jobId },
        select: { title: true, status: true },
    })

    if (!existingJob) {
        throw new Error('Job not found')
    }

    const job = await prisma.job.update({
        where: { id: jobId },
        data: {
            ...validated,
            // Update slug only if title changed
            ...(validated.title !== existingJob.title && {
                slug: generateSlug(validated.title),
            }),
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'job.updated',
        targetType: 'Job',
        targetId: job.id,
        metadata: {
            title: job.title,
            previousStatus: existingJob.status,
            newStatus: job.status,
        },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Updated job "${job.title}"`,
        metadata: { jobId: job.id },
    })

    revalidatePath(ROUTES.ADMIN.JOBS)
    revalidatePath(`${ROUTES.ADMIN.JOBS}/${jobId}`)
    redirect(`${ROUTES.ADMIN.JOBS}/${jobId}`)
}

export async function updateJobStatus(jobId: string, status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED') {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const existingJob = await prisma.job.findUnique({
        where: { id: jobId },
        select: { title: true, status: true },
    })

    if (!existingJob) {
        throw new Error('Job not found')
    }

    const job = await prisma.job.update({
        where: { id: jobId },
        data: {
            status,
            ...(status === 'PUBLISHED' && existingJob.status !== 'PUBLISHED'
                ? { publishedAt: new Date() }
                : {}),
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'job.status_changed',
        targetType: 'Job',
        targetId: job.id,
        metadata: {
            title: job.title,
            previousStatus: existingJob.status,
            newStatus: status,
        },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Changed job "${job.title}" status to ${status}`,
        metadata: { jobId: job.id, status },
    })

    revalidatePath(ROUTES.ADMIN.JOBS)
    revalidatePath(`${ROUTES.ADMIN.JOBS}/${jobId}`)

    return { success: true }
}

export async function deleteJob(jobId: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { ipAddress, userAgent } = await getRequestContext()

    const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { title: true, _count: { select: { applications: true } } },
    })

    if (!job) {
        throw new Error('Job not found')
    }

    if (job._count.applications > 0) {
        throw new Error('Cannot delete job with existing applications')
    }

    await prisma.job.delete({
        where: { id: jobId },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'job.deleted',
        targetType: 'Job',
        targetId: jobId,
        metadata: { title: job.title },
        ipAddress,
        userAgent,
    })

    await createActivityLog({
        actorUserId: user.id,
        description: `Deleted job "${job.title}"`,
    })

    revalidatePath(ROUTES.ADMIN.JOBS)
    redirect(ROUTES.ADMIN.JOBS)
}
