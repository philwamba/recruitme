import { z } from 'zod'
import { ApplicationStatus } from '@prisma/client'

export const candidateSearchSchema = z.object({
    // Basic filters
    search: z.string().optional().default(''),
    status: z.nativeEnum(ApplicationStatus).optional(),
    jobId: z.string().optional(),

    // Advanced filters
    skills: z.array(z.string()).optional().default([]),
    tags: z.array(z.string()).optional().default([]),
    minRating: z.coerce.number().min(1).max(5).optional(),
    maxRating: z.coerce.number().min(1).max(5).optional(),
    minExperience: z.coerce.number().min(0).optional(),
    maxExperience: z.coerce.number().min(0).optional(),
    location: z.string().optional(),
    appliedAfter: z.string().optional(), // ISO date string
    appliedBefore: z.string().optional(), // ISO date string
    hasDocuments: z.boolean().optional(),

    // Pagination
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CandidateSearchInput = z.infer<typeof candidateSearchSchema>

export const savedSearchSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    filters: candidateSearchSchema,
    isPublic: z.boolean().default(false),
})

export type SavedSearchFormData = z.infer<typeof savedSearchSchema>
