import { z } from 'zod'

export const experienceSchema = z
  .object({
    company: z
      .string()
      .min(1, 'Company name is required')
      .max(100, 'Company name must be less than 100 characters'),
    role: z
      .string()
      .min(1, 'Role is required')
      .max(100, 'Role must be less than 100 characters'),
    location: z.string().max(100).optional().or(z.literal('')),
    startDate: z.date({
      required_error: 'Start date is required',
      invalid_type_error: 'Invalid date',
    }),
    endDate: z.date().optional().nullable(),
    isCurrent: z.boolean(),
    description: z
      .string()
      .max(2000, 'Description must be less than 2000 characters')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.isCurrent) return true
      if (!data.endDate) return true
      return data.endDate >= data.startDate
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )

export type ExperienceFormData = z.infer<typeof experienceSchema>
