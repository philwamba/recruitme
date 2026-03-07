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

export const employmentTypes = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'TEMPORARY', label: 'Temporary' },
] as const

export const workplaceTypes = [
    { value: 'ONSITE', label: 'On-site' },
    { value: 'REMOTE', label: 'Remote' },
    { value: 'HYBRID', label: 'Hybrid' },
] as const

export const jobRequestStatuses: { value: JobRequestStatus; label: string; className: string }[] = [
    { value: 'DRAFT', label: 'Draft', className: 'bg-gray-100 text-gray-800' },
    { value: 'PENDING_APPROVAL', label: 'Pending Approval', className: 'bg-yellow-100 text-yellow-800' },
    { value: 'APPROVED', label: 'Approved', className: 'bg-green-100 text-green-800' },
    { value: 'REJECTED', label: 'Rejected', className: 'bg-red-100 text-red-800' },
    { value: 'CANCELLED', label: 'Cancelled', className: 'bg-gray-100 text-gray-600' },
    { value: 'CONVERTED', label: 'Converted to Job', className: 'bg-blue-100 text-blue-800' },
]
