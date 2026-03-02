'use server'

import { prisma } from '@/lib/prisma'
import { reportError } from '@/lib/observability/error-reporting'
import { assertRateLimit } from '@/lib/security/rate-limit'
import { getRequestContext } from '@/lib/request-context'

type WaitlistState = {
  message: string
  success: boolean
}

export async function addToWaitlist(
    _prevState: WaitlistState,
    formData: FormData,
) {
    try {
        const rawEmail = formData.get('email') as string
        const email = (rawEmail || '').trim().toLowerCase()

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return { message: 'Please enter a valid email address.', success: false }
        }

        const { ipAddress } = await getRequestContext()
        // Use email as fallback key when IP is unavailable
        const rateLimitKey = ipAddress ?? `email:${email}`
        assertRateLimit(`waitlist:${rateLimitKey}`, 5, 1000 * 60 * 15)

        await prisma.waitlist.create({
            data: { email },
        })
        return { message: 'Thanks for joining the waitlist!', success: true }
    } catch (error: unknown) {
        const prismaError = error as { code?: string }
        if (prismaError.code === 'P2002') {
            return { message: 'This email is already on the waitlist.', success: false }
        }
        reportError(error, {
            scope: 'waitlist.create',
        })
        return { message: 'Something went wrong. Please try again.', success: false }
    }
}
