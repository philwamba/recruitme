import { z } from 'zod'
import { QuestionType, QuestionnaireType } from '@prisma/client'

export const questionnaireFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200, 'Name is too long'),
    code: z
        .string()
        .min(1, 'Code is required')
        .max(20, 'Code is too long')
        .regex(/^[A-Z0-9_]+$/, 'Code must be uppercase alphanumeric with underscores'),
    description: z.string().max(1000, 'Description is too long').optional().nullable(),
    type: z.nativeEnum(QuestionnaireType),
    isActive: z.boolean(),
})

export type QuestionnaireFormData = z.infer<typeof questionnaireFormSchema>

export const questionOptionSchema = z.object({
    value: z.string(),
    label: z.string(),
})

export const questionFormSchema = z.object({
    text: z.string().min(1, 'Question text is required'),
    type: z.nativeEnum(QuestionType),
    options: z.array(questionOptionSchema).optional(),
    isRequired: z.boolean(),
    helpText: z.string().optional().nullable(),
    sortOrder: z.coerce.number().int().min(0),
    validations: z
        .object({
            min: z.number().optional(),
            max: z.number().optional(),
            pattern: z.string().optional(),
        })
        .optional()
        .nullable(),
})

export type QuestionFormData = z.infer<typeof questionFormSchema>

export const questionnaireTypes = [
    { value: 'APPLICATION', label: 'Application' },
    { value: 'SCREENING', label: 'Screening' },
    { value: 'INTERVIEW', label: 'Interview' },
    { value: 'ASSESSMENT', label: 'Assessment' },
    { value: 'EXIT', label: 'Exit' },
    { value: 'ONBOARDING', label: 'Onboarding' },
] as const

export const questionTypes = [
    { value: 'TEXT', label: 'Short Text' },
    { value: 'TEXTAREA', label: 'Long Text' },
    { value: 'SINGLE_CHOICE', label: 'Single Choice' },
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
    { value: 'RATING', label: 'Rating (1-5)' },
    { value: 'DATE', label: 'Date' },
    { value: 'FILE_UPLOAD', label: 'File Upload' },
    { value: 'YES_NO', label: 'Yes/No' },
    { value: 'NUMBER', label: 'Number' },
] as const
