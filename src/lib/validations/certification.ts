import { z } from 'zod'

export const certificationSchema = z.object({
  name: z
    .string()
    .min(1, 'Certification name is required')
    .max(150, 'Name must be less than 150 characters'),
  issuingOrg: z.string().max(150).optional().or(z.literal('')),
  issueDate: z.date().optional().nullable(),
  expirationDate: z.date().optional().nullable(),
  credentialUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export type CertificationFormData = z.infer<typeof certificationSchema>
