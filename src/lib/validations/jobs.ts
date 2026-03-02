import { z } from 'zod'
import { EmploymentType, JobStatus, WorkplaceType } from '@prisma/client'

export const jobSearchSchema = z.object({
    q: z.string().optional().default(''),
    department: z.string().optional().default(''),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    workplaceType: z.nativeEnum(WorkplaceType).optional(),
    location: z.string().optional().default(''),
    page: z.coerce.number().int().min(1).default(1),
})

export const jobFormSchema = z.object({
    title: z.string().min(3).max(150),
    company: z.string().min(2).max(150),
    location: z.string().min(2).max(150),
    departmentName: z.string().min(2).max(80),
    description: z.string().min(20),
    requirements: z.string().min(10),
    benefits: z.string().optional().default(''),
    salaryMin: z.coerce.number().int().min(0).optional().nullable(),
    salaryMax: z.coerce.number().int().min(0).optional().nullable(),
    salaryCurrency: z.string().min(3).max(3).default('USD'),
    employmentType: z.nativeEnum(EmploymentType),
    workplaceType: z.nativeEnum(WorkplaceType),
    status: z.nativeEnum(JobStatus),
    expiresAt: z.string().optional().default('').refine(
        val => val === '' || !isNaN(Date.parse(val)),
        { message: 'expiresAt must be empty or a valid ISO date' },
    ),
}).refine(
    data => {
    // If both salaryMin and salaryMax are provided, max must be >= min
        if (data.salaryMin != null && data.salaryMax != null) {
            return data.salaryMax >= data.salaryMin
        }
        return true
    },
    { message: 'salaryMax must be greater than or equal to salaryMin', path: ['salaryMax'] },
)

export type JobSearchInput = z.infer<typeof jobSearchSchema>
export type JobFormInput = z.infer<typeof jobFormSchema>
