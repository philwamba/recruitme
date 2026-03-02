import 'server-only'

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { reportError, reportOperationalEvent } from '@/lib/observability/error-reporting'

export async function enqueueOutboxJob(
  type: Prisma.OutboxJobCreateInput['type'],
  payload: Prisma.InputJsonValue
) {
  return prisma.outboxJob.create({
    data: {
      type,
      payload,
    },
  })
}

export async function processPendingOutboxJobs(limit = 25) {
  const jobs = await prisma.outboxJob.findMany({
    where: {
      status: 'PENDING',
      availableAt: { lte: new Date() },
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  })

  const results: { id: string; status: 'COMPLETED' | 'FAILED' }[] = []

  for (const job of jobs) {
    try {
      await prisma.outboxJob.update({
        where: { id: job.id },
        data: {
          status: 'PROCESSING',
          attempts: { increment: 1 },
        },
      })

      await processSingleOutboxJob(job.id)

      await prisma.outboxJob.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          processedAt: new Date(),
          lastError: null,
        },
      })

      results.push({ id: job.id, status: 'COMPLETED' })
    } catch (error) {
      reportError(error, {
        scope: 'outbox.process',
        metadata: { jobId: job.id, type: job.type },
      })

      await prisma.outboxJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          lastError: error instanceof Error ? error.message : 'Unknown error',
        },
      })

      results.push({ id: job.id, status: 'FAILED' })
    }
  }

  return results
}

async function processSingleOutboxJob(jobId: string) {
  const job = await prisma.outboxJob.findUnique({
    where: { id: jobId },
  })

  if (!job) return

  const payload = job.payload as { notificationId?: string }

  if (!payload.notificationId) {
    throw new Error('Notification payload missing notificationId')
  }

  const notification = await prisma.notification.findUnique({
    where: { id: payload.notificationId },
  })

  if (!notification) {
    throw new Error('Notification not found')
  }

  await prisma.$transaction([
    prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: notification.channel === 'IN_APP' ? 'READ' : 'SENT',
        sentAt: new Date(),
      },
    }),
    prisma.deliveryLog.create({
      data: {
        notificationId: notification.id,
        provider: notification.channel === 'EMAIL' ? 'console-email' : 'in-app',
        status: 'SENT',
        responseCode: '200',
        responseBody: 'Simulated delivery',
      },
    }),
  ])

  reportOperationalEvent('Processed outbox notification', {
    jobId: job.id,
    notificationId: notification.id,
    channel: notification.channel,
  })
}
