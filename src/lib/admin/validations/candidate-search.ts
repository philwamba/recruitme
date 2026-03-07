import { z } from 'zod'
import { ApplicationStatus } from '@prisma/client'

// Filters schema (without pagination - for saving searches)
export const candidateFiltersSchema = z.object({
    // Basic filters
    search: z.string().optional(),
    status: z.nativeEnum(ApplicationStatus).optional(),
    jobId: z.string().optional(),

    // Advanced filters
    skills: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    minRating: z.coerce.number().min(1).max(5).optional(),
    maxRating: z.coerce.number().min(1).max(5).optional(),
    minExperience: z.coerce.number().min(0).optional(),
    maxExperience: z.coerce.number().min(0).optional(),
    location: z.string().optional(),
    appliedAfter: z.string().optional(), // ISO date string
    appliedBefore: z.string().optional(), // ISO date string
    hasDocuments: z.boolean().optional(),
})

export type CandidateFilters = z.infer<typeof candidateFiltersSchema>

// Full search schema with pagination
export const candidateSearchSchema = candidateFiltersSchema.extend({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export type CandidateSearchInput = z.infer<typeof candidateSearchSchema>

export const savedSearchSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    filters: candidateFiltersSchema,
    isPublic: z.boolean().optional().default(false),
})

export type SavedSearchFormData = z.infer<typeof savedSearchSchema>
