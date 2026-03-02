import { z } from 'zod'

export const applicationDraftSchema = z.object({
    coverLetter: z.string().max(4000).optional().default(''),
    source: z.string().max(120).optional().default('Website'),
    consentAccepted: z.boolean().default(false),
})

export const stageMoveSchema = z.object({
    applicationId: z.string().min(1),
    stageId: z.string().min(1),
    note: z.string().max(1000).optional().default(''),
})

export const applicationNoteSchema = z.object({
    applicationId: z.string().min(1),
    body: z.string().min(1).max(4000),
})

export const applicationTagSchema = z.object({
    applicationId: z.string().min(1),
    tagName: z.string().min(1).max(50),
    tagColor: z.string().max(30).optional().default(''),
})

export const applicationRatingSchema = z.object({
    applicationId: z.string().min(1),
    score: z.coerce.number().int().min(1).max(5),
    comment: z.string().max(2000).optional().default(''),
})

export type ApplicationDraftInput = z.infer<typeof applicationDraftSchema>
