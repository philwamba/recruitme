import { z } from 'zod'

export const rankGradeFormSchema = z
    .object({
        name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
        code: z
            .string()
            .min(1, 'Code is required')
            .max(20, 'Code is too long')
            .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric with underscores'),
        level: z.coerce.number().int().min(1, 'Level must be at least 1').max(99, 'Level must be at most 99'),
        description: z.string().max(500, 'Description is too long').optional().nullable(),
        minSalary: z.coerce.number().int().positive().optional().nullable(),
        maxSalary: z.coerce.number().int().positive().optional().nullable(),
        isActive: z.boolean(),
    })
    .refine(
        data => {
            if (data.minSalary && data.maxSalary) {
                return data.minSalary <= data.maxSalary
            }
            return true
        },
        {
            message: 'Minimum salary must be less than or equal to maximum salary',
            path: ['maxSalary'],
        },
    )

export type RankGradeFormData = z.infer<typeof rankGradeFormSchema>
