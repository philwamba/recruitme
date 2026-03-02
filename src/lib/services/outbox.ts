import 'server-only'

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/services/email-delivery'
import { reportError, reportOperationalEvent } from '@/lib/observability/error-reporting'

const MAX_OUTBOX_ATTEMPTS = 5
const BASE_RETRY_DELAY_MS = 1000 * 60 * 5

export async function enqueueOutboxJob(
    type: Prisma.OutboxJobCreateInput['type'],
    payload: Prisma.InputJsonValue,
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

    const results: { id: string; status: 'COMPLETED' | 'FAILED' | 'RETRY_SCHEDULED' }[] = []

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
            await recordFailedDelivery(job, error)

            const attemptCount = job.attempts + 1
            const shouldRetry = attemptCount < MAX_OUTBOX_ATTEMPTS

            await prisma.outboxJob.update({
                where: { id: job.id },
                data: {
                    status: shouldRetry ? 'PENDING' : 'FAILED',
                    availableAt: shouldRetry ? getNextRetryDate(attemptCount) : job.availableAt,
                    lastError: error instanceof Error ? error.message : 'Unknown error',
                },
            })

            results.push({ id: job.id, status: shouldRetry ? 'RETRY_SCHEDULED' : 'FAILED' })
        }
    }

    async function recordFailedDelivery(
        job: {
    id: string
    payload: Prisma.JsonValue
  },
        error: unknown,
    ) {
        const payload = job.payload as { notificationId?: string }

        if (!payload.notificationId) {
            return
        }

        const notification = await prisma.notification.findUnique({
            where: { id: payload.notificationId },
        })

        if (!notification) {
            return
        }

        await prisma.$transaction([
            prisma.notification.update({
                where: { id: notification.id },
                data: {
                    status: 'FAILED',
                },
            }),
            prisma.deliveryLog.create({
                data: {
                    notificationId: notification.id,
                    provider: notification.channel === 'EMAIL' ? 'email' : notification.channel.toLowerCase(),
                    status: 'FAILED',
                    responseCode: '500',
                    responseBody: error instanceof Error ? error.message : 'Unknown delivery failure',
                },
            }),
        ]).catch(() => undefined)
    }

    return results
}

export async function retryOutboxJob(jobId: string) {
    return prisma.outboxJob.update({
        where: { id: jobId },
        data: {
            status: 'PENDING',
            availableAt: new Date(),
            processedAt: null,
            lastError: null,
        },
    })
}

function getNextRetryDate(attemptCount: number) {
    const delay = BASE_RETRY_DELAY_MS * 2 ** Math.max(0, attemptCount - 1)
    return new Date(Date.now() + delay)
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
        include: {
            user: true,
        },
    })

    if (!notification) {
        throw new Error('Notification not found')
    }

    if (notification.channel === 'SMS') {
        throw new Error('SMS delivery is not configured')
    }

    const delivery =
    notification.channel === 'EMAIL'
        ? await sendEmail({
            to: notification.user.email,
            subject: notification.subject,
            html: notification.body.replaceAll('\n', '<br />'),
            text: notification.body,
        })
        : {
            provider: 'in-app',
            responseCode: '200',
            responseBody: 'In-app notification stored',
        }

    await prisma.$transaction([
        prisma.notification.update({
            where: { id: notification.id },
            data: {
                status: 'SENT',
                sentAt: new Date(),
            },
        }),
        prisma.deliveryLog.create({
            data: {
                notificationId: notification.id,
                provider: delivery.provider,
                status: 'SENT',
                responseCode: delivery.responseCode,
                responseBody: delivery.responseBody,
            },
        }),
    ])

    reportOperationalEvent('Processed outbox notification', {
        jobId: job.id,
        notificationId: notification.id,
        channel: notification.channel,
    })
}
