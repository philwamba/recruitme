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

// Preprocess empty strings to undefined
const emptyToUndefined = (v: unknown) =>
    typeof v === 'string' && v.trim() === '' ? undefined : v

// Import row schema (what we expect from CSV)
export const importRowSchema = z.object({
    email: z.preprocess(emptyToUndefined, z.string().email('Invalid email')),
    firstName: z.preprocess(emptyToUndefined, z.string().optional()),
    lastName: z.preprocess(emptyToUndefined, z.string().optional()),
    phone: z.preprocess(emptyToUndefined, z.string().optional()),
    city: z.preprocess(emptyToUndefined, z.string().optional()),
    country: z.preprocess(emptyToUndefined, z.string().optional()),
    headline: z.preprocess(emptyToUndefined, z.string().optional()),
    linkedinUrl: z.preprocess(emptyToUndefined, z.string().url().optional()),
    githubUrl: z.preprocess(emptyToUndefined, z.string().url().optional()),
    portfolioUrl: z.preprocess(emptyToUndefined, z.string().url().optional()),
    skills: z.preprocess(emptyToUndefined, z.string().optional()), // Comma-separated
    source: z.preprocess(emptyToUndefined, z.string().optional()),
})

export type ImportRow = z.infer<typeof importRowSchema>

// Import configuration
export const importConfigSchema = z.object({
    jobId: z.string().optional(),
    skipDuplicates: z.boolean().default(true),
    sendWelcomeEmail: z.boolean().default(false),
})

export type ImportConfig = z.infer<typeof importConfigSchema>
