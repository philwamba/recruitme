import { z } from 'zod'

export const personalInfoSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  phone: z
    .string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
})

export const linksSchema = z.object({
  linkedinUrl: z
    .string()
    .url('Invalid LinkedIn URL')
    .refine(
      (url) => url === '' || url.includes('linkedin.com'),
      'Must be a LinkedIn URL'
    )
    .optional()
    .or(z.literal('')),
  githubUrl: z
    .string()
    .url('Invalid GitHub URL')
    .refine(
      (url) => url === '' || url.includes('github.com'),
      'Must be a GitHub URL'
    )
    .optional()
    .or(z.literal('')),
  portfolioUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export const summarySchema = z.object({
  headline: z
    .string()
    .max(100, 'Headline must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(2000, 'Bio must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
})

export const skillsSchema = z.object({
  skills: z.array(z.string().min(1).max(50)).max(50, 'Maximum 50 skills allowed'),
})

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>
export type LinksFormData = z.infer<typeof linksSchema>
export type SummaryFormData = z.infer<typeof summarySchema>
export type SkillsFormData = z.infer<typeof skillsSchema>
