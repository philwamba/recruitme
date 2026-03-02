import { Recommendation } from '@prisma/client'
import { z } from 'zod'

const dateStringSchema = z.preprocess(
  (val) => {
    if (typeof val !== 'string' || !val.trim()) return undefined
    const parsed = new Date(val)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed
  },
  z.date({ message: 'Invalid date format' })
)

const optionalDateStringSchema = z.preprocess(
  (val) => {
    if (typeof val !== 'string' || !val.trim()) return null
    const parsed = new Date(val)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  },
  z.date().nullable()
)

export const interviewSchema = z.object({
  applicationId: z.string().min(1),
  title: z.string().min(3).max(150),
  scheduledAt: dateStringSchema,
  durationMinutes: z.coerce.number().int().min(15).max(240).default(60),
  timezone: z.string().min(2).max(100),
  location: z.string().max(150).optional().default(''),
  meetingUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(4000).optional().default(''),
  participantEmails: z.string().optional().default(''),
})

export const interviewFeedbackSchema = z.object({
  interviewId: z.string().min(1),
  applicationId: z.string().min(1),
  score: z.coerce.number().int().min(1).max(5),
  recommendation: z.nativeEnum(Recommendation),
  comments: z.string().max(4000).optional().default(''),
})

export const assessmentSchema = z.object({
  applicationId: z.string().min(1),
  title: z.string().min(3).max(150),
  instructions: z.string().min(10),
  dueAt: optionalDateStringSchema,
})

export const assessmentSubmissionSchema = z.object({
  assessmentId: z.string().min(1),
  responseText: z.string().min(1).max(8000),
})

export const assessmentReviewSchema = z.object({
  submissionId: z.string().min(1),
  score: z.coerce.number().int().min(1).max(100),
  reviewerNotes: z.string().max(4000).optional().default(''),
})

export const emailTemplateSchema = z.object({
  name: z.string().min(3).max(80),
  subject: z.string().min(3).max(200),
  body: z.string().min(10),
  jobId: z.string().optional().default(''),
  isActive: z.boolean().default(true),
})

export const notificationCreateSchema = z.object({
  userId: z.string().min(1),
  applicationId: z.string().optional().default(''),
  channel: z.enum(['IN_APP', 'EMAIL']),
  subject: z.string().min(3).max(200),
  body: z.string().min(3),
  templateId: z.string().optional().default(''),
})

export const deletionRequestSchema = z.object({
  reason: z.string().max(4000).optional().default(''),
})

export const deletionDecisionSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(['approve', 'reject']),
  notes: z.string().max(4000).optional().default(''),
})
