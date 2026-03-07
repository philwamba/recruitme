import { z } from 'zod'

export const jobTitleFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    code: z
        .string()
        .min(1, 'Code is required')
        .max(20, 'Code is too long')
        .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric with underscores'),
    categoryId: z.string().min(1, 'Category is required'),
    description: z.string().max(500, 'Description is too long').optional().nullable(),
    rankGradeId: z.string().optional().nullable(),
    isActive: z.boolean(),
})

export type JobTitleFormData = z.infer<typeof jobTitleFormSchema>
