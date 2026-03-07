import { z } from 'zod'

export const qualityFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    code: z
        .string()
        .min(1, 'Code is required')
        .max(20, 'Code is too long')
        .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric with underscores'),
    description: z.string().max(500, 'Description is too long').optional().nullable(),
    category: z.string().max(50, 'Category is too long').optional().nullable(),
    isActive: z.boolean().default(true),
})

export type QualityFormData = z.infer<typeof qualityFormSchema>

// Quality categories for dropdown
export const qualityCategories = [
    { value: 'TECHNICAL', label: 'Technical' },
    { value: 'BEHAVIORAL', label: 'Behavioral' },
    { value: 'LEADERSHIP', label: 'Leadership' },
    { value: 'COMMUNICATION', label: 'Communication' },
    { value: 'PROBLEM_SOLVING', label: 'Problem Solving' },
    { value: 'TEAMWORK', label: 'Teamwork' },
    { value: 'OTHER', label: 'Other' },
]
