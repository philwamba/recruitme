'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { createAuditLog, createActivityLog } from '@/lib/observability/audit'
import { reportError } from '@/lib/observability/error-reporting'
import { createDefaultPipelineStages } from '@/lib/services/pipeline'
import { createJobSlug } from '@/lib/services/jobs'
import { jobFormSchema } from '@/lib/validations/jobs'
import { slugify } from '@/lib/services/slug'

export async function createJob(formData: FormData) {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const raw = {
        title: formData.get('title'),
        company: formData.get('company'),
        location: formData.get('location'),
        departmentName: formData.get('departmentName'),
        description: formData.get('description'),
        requirements: formData.get('requirements'),
        benefits: formData.get('benefits'),
        salaryMin: formData.get('salaryMin') || null,
        salaryMax: formData.get('salaryMax') || null,
        salaryCurrency: formData.get('salaryCurrency') || 'USD',
        employmentType: formData.get('employmentType'),
        workplaceType: formData.get('workplaceType'),
        status: formData.get('status'),
        expiresAt: formData.get('expiresAt') || '',
    }

    const parsed = jobFormSchema.safeParse(raw)

    if (!parsed.success) {
        redirect('/employer/jobs?error=invalid-job')
    }

    try {
        const departmentSlug = slugify(parsed.data.departmentName)

        const result = await prisma.$transaction(async tx => {
            const department = await tx.department.upsert({
                where: { slug: departmentSlug },
                update: { name: parsed.data.departmentName },
                create: {
                    name: parsed.data.departmentName,
                    slug: departmentSlug,
                },
            })

            const job = await tx.job.create({
                data: {
                    slug: `${createJobSlug(parsed.data.title, parsed.data.company)}-${Date.now().toString().slice(-5)}`,
                    title: parsed.data.title,
                    company: parsed.data.company,
                    location: parsed.data.location,
                    description: parsed.data.description,
                    requirements: parsed.data.requirements,
                    benefits: parsed.data.benefits || null,
                    salaryMin: parsed.data.salaryMin ?? null,
                    salaryMax: parsed.data.salaryMax ?? null,
                    salaryCurrency: parsed.data.salaryCurrency.toUpperCase(),
                    employmentType: parsed.data.employmentType,
                    workplaceType: parsed.data.workplaceType,
                    status: parsed.data.status,
                    departmentId: department.id,
                    createdByUserId: user.id,
                    publishedAt: parsed.data.status === 'PUBLISHED' ? new Date() : null,
                    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
                },
            })

            await createDefaultPipelineStages(job.id, tx)

            return job
        })

        await createAuditLog({
            actorUserId: user.id,
            action: 'job.created',
            targetType: 'Job',
            targetId: result.id,
            metadata: {
                slug: result.slug,
                status: result.status,
            },
        })

        await createActivityLog({
            actorUserId: user.id,
            description: `Created job ${result.title}`,
            metadata: { jobId: result.id },
        })

        revalidatePath('/employer/jobs')
        revalidatePath('/jobs')
    } catch (error) {
        reportError(error, {
            scope: 'jobs.create',
            userId: user.id,
        })
        redirect('/employer/jobs?error=create-job')
    }

    redirect('/employer/jobs?status=job-created')
}
