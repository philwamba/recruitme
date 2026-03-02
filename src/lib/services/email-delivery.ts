import 'server-only'

import { env } from '@/lib/env'
import { reportOperationalEvent } from '@/lib/observability/error-reporting'

type SendEmailInput = {
  to: string
  subject: string
  html: string
  text?: string
}

type EmailDeliveryResult = {
  provider: string
  responseCode: string
  responseBody: string
}

const EMAIL_FETCH_TIMEOUT_MS = 10000

function maskEmail(email: string): string {
    const [local, domain] = email.split('@')
    if (!local || !domain) return '***@***'
    const maskedLocal = local.length > 2 ? `${local[0]}***${local[local.length - 1]}` : '***'
    return `${maskedLocal}@${domain}`
}

export async function sendEmail(input: SendEmailInput): Promise<EmailDeliveryResult> {
    const provider = env.emailProvider.toLowerCase()

    if (provider === 'resend') {
        if (!env.resendApiKey || !env.emailFrom) {
            throw new Error('EMAIL_PROVIDER=resend requires RESEND_API_KEY and EMAIL_FROM')
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), EMAIL_FETCH_TIMEOUT_MS)

        try {
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${env.resendApiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: env.emailFrom,
                    to: [input.to],
                    subject: input.subject,
                    html: input.html,
                    text: input.text ?? input.subject,
                }),
                signal: controller.signal,
            })

            const responseBody = await response.text()

            if (!response.ok) {
                throw new Error(`Resend delivery failed: ${response.status} ${responseBody}`)
            }

            return {
                provider: 'resend',
                responseCode: String(response.status),
                responseBody,
            }
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Email delivery timed out after ${EMAIL_FETCH_TIMEOUT_MS}ms`)
            }
            throw error
        } finally {
            clearTimeout(timeoutId)
        }
    }

    // Log provider - sanitize PII in production
    const isProduction = process.env.NODE_ENV === 'production'
    const sanitizedLog = {
        level: 'info',
        message: 'EMAIL_LOG',
        to: isProduction ? maskEmail(input.to) : input.to,
        subject: input.subject,
        bodyLength: input.html.length,
        ...(isProduction ? {} : { html: input.html, text: input.text ?? null }),
    }

    reportOperationalEvent('Email delivery logged', {
        provider: 'log',
        to: isProduction ? maskEmail(input.to) : input.to,
        subject: input.subject,
    })

    console.info(JSON.stringify(sanitizedLog))

    return {
        provider: 'log',
        responseCode: '202',
        responseBody: 'Logged email delivery',
    }
}
