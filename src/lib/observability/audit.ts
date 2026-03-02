import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { reportError } from '@/lib/observability/error-reporting'

type AuditInput = {
  actorUserId?: string | null
  action: string
  targetType: string
  targetId?: string | null
  metadata?: Record<string, unknown>
  ipAddress?: string | null
  userAgent?: string | null
}

type ActivityInput = {
  actorUserId?: string | null
  description: string
  metadata?: Record<string, unknown>
}

export async function createAuditLog(input: AuditInput) {
    try {
        await prisma.auditLog.create({
            data: {
                actorUserId: input.actorUserId ?? null,
                action: input.action,
                targetType: input.targetType,
                targetId: input.targetId ?? null,
                metadata: input.metadata as Prisma.InputJsonValue | undefined,
                ipAddress: input.ipAddress ?? null,
                userAgent: input.userAgent ?? null,
            },
        })
    } catch (error) {
        reportError(error, {
            scope: 'audit.create',
            userId: input.actorUserId ?? undefined,
            metadata: {
                action: input.action,
                targetType: input.targetType,
                targetId: input.targetId ?? undefined,
            },
        })
    }
}

export async function createActivityLog(input: ActivityInput) {
    try {
        await prisma.activityLog.create({
            data: {
                actorUserId: input.actorUserId ?? null,
                description: input.description,
                metadata: input.metadata as Prisma.InputJsonValue | undefined,
            },
        })
    } catch (error) {
        reportError(error, {
            scope: 'activity.create',
            userId: input.actorUserId ?? undefined,
            metadata: {
                description: input.description,
            },
        })
    }
}
