import { z } from 'zod'

export const jobFormSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
    company: z.string().min(1, 'Company is required').max(200, 'Company name is too long'),
    location: z.string().max(200, 'Location is too long').optional().nullable(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    requirements: z.string().optional().nullable(),
    benefits: z.string().optional().nullable(),
    salaryMin: z.coerce.number().int().positive().optional().nullable(),
    salaryMax: z.coerce.number().int().positive().optional().nullable(),
    salaryCurrency: z.string().max(3).optional().nullable(),
    employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY']),
    workplaceType: z.enum(['REMOTE', 'HYBRID', 'ONSITE']),
    departmentId: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED']).optional(),
}).refine(
    data => {
        if (data.salaryMin && data.salaryMax) {
            return data.salaryMin <= data.salaryMax
        }
        return true
    },
    {
        message: 'Minimum salary must be less than or equal to maximum salary',
        path: ['salaryMax'],
    },
)

export type JobFormData = z.infer<typeof jobFormSchema>
