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

export async function sendEmail(input: SendEmailInput): Promise<EmailDeliveryResult> {
  const provider = env.emailProvider.toLowerCase()

  if (provider === 'resend') {
    if (!env.resendApiKey || !env.emailFrom) {
      throw new Error('EMAIL_PROVIDER=resend requires RESEND_API_KEY and EMAIL_FROM')
    }

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
  }

  reportOperationalEvent('Email delivery logged', {
    provider: 'log',
    to: input.to,
    subject: input.subject,
  })

  console.info(
    JSON.stringify({
      level: 'info',
      message: 'EMAIL_LOG',
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text ?? null,
    })
  )

  return {
    provider: 'log',
    responseCode: '202',
    responseBody: 'Logged email delivery',
  }
}
