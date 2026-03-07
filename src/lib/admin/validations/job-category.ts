import { z } from 'zod'

export const jobCategoryFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    code: z
        .string()
        .min(1, 'Code is required')
        .max(20, 'Code is too long')
        .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric with underscores'),
    description: z.string().max(500, 'Description is too long').optional().nullable(),
    isActive: z.boolean().default(true),
    sortOrder: z.coerce.number().int().min(0).default(0),
})

export type JobCategoryFormData = z.infer<typeof jobCategoryFormSchema>
