import { z } from 'zod'
import { EmploymentType, WorkplaceType, JobRequestStatus } from '@prisma/client'

export const jobRequestFormSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    organizationId: z.string().min(1, 'Organization is required'),
    categoryId: z.string().optional().nullable(),
    headcount: z.coerce.number().int().min(1, 'At least 1 position required'),
    employmentType: z.nativeEnum(EmploymentType),
    workplaceType: z.nativeEnum(WorkplaceType),
    location: z.string().optional().nullable(),
    justification: z.string().min(10, 'Please provide a justification'),
    requirements: z.string().optional().nullable(),
    salaryMin: z.coerce.number().int().positive().optional().nullable(),
    salaryMax: z.coerce.number().int().positive().optional().nullable(),
    salaryCurrency: z.string().max(3).optional().nullable(),
    targetStartDate: z.string().optional().nullable(),
})

export type JobRequestFormData = z.infer<typeof jobRequestFormSchema>

export const jobRequestStatusSchema = z.object({
    status: z.nativeEnum(JobRequestStatus),
    comments: z.string().optional(),
})

export type JobRequestStatusData = z.infer<typeof jobRequestStatusSchema>

export const approvalDecisionSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    comments: z.string().optional(),
})

export type ApprovalDecisionData = z.infer<typeof approvalDecisionSchema>
