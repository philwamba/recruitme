import { z } from 'zod'

// Field mapping schema
export const fieldMappingSchema = z.record(z.string(), z.string().optional())

export type FieldMapping = z.infer<typeof fieldMappingSchema>

// Available candidate fields that can be mapped
export const candidateFields = [
    { key: 'email', label: 'Email', required: true },
    { key: 'firstName', label: 'First Name', required: false },
    { key: 'lastName', label: 'Last Name', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'country', label: 'Country', required: false },
    { key: 'headline', label: 'Headline/Title', required: false },
    { key: 'linkedinUrl', label: 'LinkedIn URL', required: false },
    { key: 'githubUrl', label: 'GitHub URL', required: false },
    { key: 'portfolioUrl', label: 'Portfolio URL', required: false },
    { key: 'skills', label: 'Skills (comma-separated)', required: false },
    { key: 'source', label: 'Source', required: false },
] as const

export type CandidateFieldKey = (typeof candidateFields)[number]['key']

// Import row schema (what we expect from CSV)
export const importRowSchema = z.object({
    email: z.string().email('Invalid email'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    headline: z.string().optional(),
    linkedinUrl: z.string().url().optional().or(z.literal('')),
    githubUrl: z.string().url().optional().or(z.literal('')),
    portfolioUrl: z.string().url().optional().or(z.literal('')),
    skills: z.string().optional(), // Comma-separated
    source: z.string().optional(),
})

export type ImportRow = z.infer<typeof importRowSchema>

// Import configuration
export const importConfigSchema = z.object({
    jobId: z.string().optional(),
    skipDuplicates: z.boolean().default(true),
    sendWelcomeEmail: z.boolean().default(false),
})

export type ImportConfig = z.infer<typeof importConfigSchema>
