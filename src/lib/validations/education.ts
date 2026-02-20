import { z } from 'zod'

export const educationSchema = z
  .object({
    institution: z
      .string()
      .min(1, 'Institution name is required')
      .max(150, 'Institution name must be less than 150 characters'),
    degree: z
      .string()
      .min(1, 'Degree is required')
      .max(100, 'Degree must be less than 100 characters'),
    fieldOfStudy: z.string().max(100).optional().or(z.literal('')),
    startDate: z.date().optional().nullable(),
    endDate: z.date().optional().nullable(),
    description: z
      .string()
      .max(1000, 'Description must be less than 1000 characters')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true
      return data.endDate >= data.startDate
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  )

export type EducationFormData = z.infer<typeof educationSchema>
