import 'server-only'

import type { NotificationChannel, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { enqueueOutboxJob } from '@/lib/services/outbox'

export async function createNotification(input: {
  userId: string
  channel: NotificationChannel
  subject: string
  body: string
  applicationId?: string | null
  templateId?: string | null
  metadata?: Prisma.InputJsonValue
}) {
    const notification = await prisma.notification.create({
        data: {
            userId: input.userId,
            channel: input.channel,
            subject: input.subject,
            body: input.body,
            applicationId: input.applicationId ?? null,
            templateId: input.templateId ?? null,
            metadata: input.metadata,
        },
    })

    await enqueueOutboxJob('SEND_NOTIFICATION', {
        notificationId: notification.id,
    })

    return notification
}

export async function createTemplatedNotification(input: {
  userId: string
  templateName: string
  applicationId?: string | null
  replacements?: Record<string, string>
}) {
    const template = await prisma.emailTemplate.findUnique({
        where: { name: input.templateName },
    })

    if (!template) {
        throw new Error(`Template ${input.templateName} not found`)
    }

    let subject = template.subject
    let body = template.body

    for (const [key, value] of Object.entries(input.replacements ?? {})) {
        subject = subject.replaceAll(`{{${key}}}`, value)
        body = body.replaceAll(`{{${key}}}`, value)
    }

    return createNotification({
        userId: input.userId,
        channel: 'EMAIL',
        subject,
        body,
        applicationId: input.applicationId ?? null,
        templateId: template.id,
        metadata: input.replacements as Prisma.InputJsonValue,
    })
}
