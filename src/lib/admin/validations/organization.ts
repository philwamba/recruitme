import { z } from 'zod'
import { OrganizationType } from '@prisma/client'

export const organizationFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
    code: z
        .string()
        .min(1, 'Code is required')
        .max(20, 'Code is too long')
        .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric with underscores or dashes'),
    type: z.nativeEnum(OrganizationType),
    parentId: z.string().optional().nullable(),
    managerId: z.string().optional().nullable(),
    isActive: z.boolean(),
})

export type OrganizationFormData = z.infer<typeof organizationFormSchema>

export const organizationTypes = [
    { value: 'COMPANY', label: 'Company' },
    { value: 'DIVISION', label: 'Division' },
    { value: 'DEPARTMENT', label: 'Department' },
    { value: 'TEAM', label: 'Team' },
    { value: 'UNIT', label: 'Unit' },
] as const
