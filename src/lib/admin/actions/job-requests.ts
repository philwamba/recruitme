'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { createAuditLog } from '@/lib/observability/audit'
import {
    jobRequestFormSchema,
    approvalDecisionSchema,
    type JobRequestFormData,
    type ApprovalDecisionData,
} from '@/lib/admin/validations/job-request'
import { generateRequestNumber } from '@/lib/admin/queries/job-requests'
import { ROUTES } from '@/lib/constants/routes'
import { slugify } from '@/lib/services/slug'

export async function createJobRequest(data: JobRequestFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN', 'EMPLOYER'],
        permission: 'MANAGE_JOBS',
    })

    const validated = jobRequestFormSchema.parse(data)
    const requestNumber = await generateRequestNumber()

    const jobRequest = await prisma.jobRequest.create({
        data: {
            requestNumber,
            title: validated.title,
            organizationId: validated.organizationId,
            categoryId: validated.categoryId || null,
            headcount: validated.headcount,
            employmentType: validated.employmentType,
            workplaceType: validated.workplaceType,
            location: validated.location || null,
            justification: validated.justification,
            requirements: validated.requirements || null,
            salaryMin: validated.salaryMin || null,
            salaryMax: validated.salaryMax || null,
            salaryCurrency: validated.salaryCurrency || null,
            targetStartDate: validated.targetStartDate ? new Date(validated.targetStartDate) : null,
            status: 'DRAFT',
            requestedById: user.id,
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'CREATE',
        targetType: 'JobRequest',
        targetId: jobRequest.id,
        metadata: { requestNumber, title: validated.title },
    })

    revalidatePath(ROUTES.ADMIN.JOB_REQUESTS)
    redirect(`${ROUTES.ADMIN.JOB_REQUESTS}/${jobRequest.id}`)
}

export async function updateJobRequest(id: string, data: JobRequestFormData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN', 'EMPLOYER'],
        permission: 'MANAGE_JOBS',
    })

    const existing = await prisma.jobRequest.findUnique({
        where: { id },
    })

    if (!existing) {
        throw new Error('Job request not found')
    }

    if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
        throw new Error('Can only edit draft or rejected requests')
    }

    const validated = jobRequestFormSchema.parse(data)

    const jobRequest = await prisma.jobRequest.update({
        where: { id },
        data: {
            title: validated.title,
            organizationId: validated.organizationId,
            categoryId: validated.categoryId || null,
            headcount: validated.headcount,
            employmentType: validated.employmentType,
            workplaceType: validated.workplaceType,
            location: validated.location || null,
            justification: validated.justification,
            requirements: validated.requirements || null,
            salaryMin: validated.salaryMin || null,
            salaryMax: validated.salaryMax || null,
            salaryCurrency: validated.salaryCurrency || null,
            targetStartDate: validated.targetStartDate ? new Date(validated.targetStartDate) : null,
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'UPDATE',
        targetType: 'JobRequest',
        targetId: id,
        metadata: { title: validated.title },
    })

    revalidatePath(ROUTES.ADMIN.JOB_REQUESTS)
    redirect(`${ROUTES.ADMIN.JOB_REQUESTS}/${id}`)
}

export async function submitJobRequest(id: string, approverIds: string[]) {
    const user = await requireCurrentUser({
        roles: ['ADMIN', 'EMPLOYER'],
        permission: 'MANAGE_JOBS',
    })

    const existing = await prisma.jobRequest.findUnique({
        where: { id },
    })

    if (!existing) {
        throw new Error('Job request not found')
    }

    if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
        throw new Error('Can only submit draft or rejected requests')
    }

    if (approverIds.length === 0) {
        throw new Error('At least one approver is required')
    }

    // Create approval records
    await prisma.$transaction([
        prisma.jobRequest.update({
            where: { id },
            data: { status: 'PENDING_APPROVAL' },
        }),
        prisma.jobRequestApproval.deleteMany({
            where: { requestId: id },
        }),
        prisma.jobRequestApproval.createMany({
            data: approverIds.map((approverId, index) => ({
                requestId: id,
                approverUserId: approverId,
                level: index + 1,
                status: 'PENDING',
            })),
        }),
    ])

    await createAuditLog({
        actorUserId: user.id,
        action: 'SUBMIT_FOR_APPROVAL',
        targetType: 'JobRequest',
        targetId: id,
        metadata: { approverCount: approverIds.length },
    })

    revalidatePath(ROUTES.ADMIN.JOB_REQUESTS)
    return { success: true }
}

export async function processApproval(approvalId: string, data: ApprovalDecisionData) {
    const user = await requireCurrentUser({
        roles: ['ADMIN', 'EMPLOYER'],
        permission: 'MANAGE_JOBS',
    })

    const validated = approvalDecisionSchema.parse(data)

    const approval = await prisma.jobRequestApproval.findUnique({
        where: { id: approvalId },
        include: {
            request: true,
        },
    })

    if (!approval) {
        throw new Error('Approval not found')
    }

    if (approval.approverUserId !== user.id) {
        throw new Error('Unauthorized to process this approval')
    }

    if (approval.status !== 'PENDING') {
        throw new Error('Approval already processed')
    }

    // Update approval
    await prisma.jobRequestApproval.update({
        where: { id: approvalId },
        data: {
            status: validated.status,
            comments: validated.comments || null,
            decidedAt: new Date(),
        },
    })

    // Check if all approvals are complete
    const allApprovals = await prisma.jobRequestApproval.findMany({
        where: { requestId: approval.requestId },
        orderBy: { level: 'asc' },
    })

    const pendingApprovals = allApprovals.filter(a => a.status === 'PENDING')
    const rejectedApprovals = allApprovals.filter(a => a.status === 'REJECTED')

    let newStatus = approval.request.status

    if (validated.status === 'REJECTED') {
        newStatus = 'REJECTED'
    } else if (pendingApprovals.length === 0 && rejectedApprovals.length === 0) {
        newStatus = 'APPROVED'
    }

    if (newStatus !== approval.request.status) {
        await prisma.jobRequest.update({
            where: { id: approval.requestId },
            data: { status: newStatus },
        })
    }

    await createAuditLog({
        actorUserId: user.id,
        action: validated.status === 'APPROVED' ? 'APPROVE' : 'REJECT',
        targetType: 'JobRequestApproval',
        targetId: approvalId,
        metadata: {
            requestId: approval.requestId,
            decision: validated.status,
        },
    })

    revalidatePath(ROUTES.ADMIN.JOB_REQUESTS)
    return { success: true, newStatus }
}

export async function convertToJob(id: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const jobRequest = await prisma.jobRequest.findUnique({
        where: { id },
        include: {
            organization: true,
            category: true,
        },
    })

    if (!jobRequest) {
        throw new Error('Job request not found')
    }

    if (jobRequest.status !== 'APPROVED') {
        throw new Error('Can only convert approved requests')
    }

    // Create the job
    const slug = `${slugify(jobRequest.title)}-${slugify(jobRequest.organization.name)}-${Date.now()}`

    const job = await prisma.job.create({
        data: {
            slug,
            title: jobRequest.title,
            company: jobRequest.organization.name,
            location: jobRequest.location,
            description: jobRequest.justification,
            requirements: jobRequest.requirements,
            salaryMin: jobRequest.salaryMin,
            salaryMax: jobRequest.salaryMax,
            salaryCurrency: jobRequest.salaryCurrency,
            employmentType: jobRequest.employmentType,
            workplaceType: jobRequest.workplaceType,
            status: 'DRAFT',
            categoryId: jobRequest.categoryId,
            createdByUserId: user.id,
            pipelineStages: {
                createMany: {
                    data: [
                        { name: 'Applied', order: 0, isDefault: true },
                        { name: 'Screening', order: 1 },
                        { name: 'Interview', order: 2 },
                        { name: 'Offer', order: 3 },
                    ],
                },
            },
        },
    })

    // Link job request to job
    await prisma.jobRequest.update({
        where: { id },
        data: {
            status: 'CONVERTED',
            jobId: job.id,
        },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'CONVERT_TO_JOB',
        targetType: 'JobRequest',
        targetId: id,
        metadata: { jobId: job.id, jobSlug: slug },
    })

    revalidatePath(ROUTES.ADMIN.JOB_REQUESTS)
    revalidatePath(ROUTES.ADMIN.JOBS)
    redirect(`${ROUTES.ADMIN.JOBS}/${job.id}/edit`)
}

export async function cancelJobRequest(id: string) {
    const user = await requireCurrentUser({
        roles: ['ADMIN', 'EMPLOYER'],
        permission: 'MANAGE_JOBS',
    })

    const existing = await prisma.jobRequest.findUnique({
        where: { id },
    })

    if (!existing) {
        throw new Error('Job request not found')
    }

    if (existing.status === 'CONVERTED' || existing.status === 'CANCELLED') {
        throw new Error('Cannot cancel this request')
    }

    await prisma.jobRequest.update({
        where: { id },
        data: { status: 'CANCELLED' },
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'CANCEL',
        targetType: 'JobRequest',
        targetId: id,
    })

    revalidatePath(ROUTES.ADMIN.JOB_REQUESTS)
    return { success: true }
}
