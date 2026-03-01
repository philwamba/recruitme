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
  formData: FormData
) {
  try {
    const { ipAddress } = await getRequestContext()
    assertRateLimit(`waitlist:${ipAddress}`, 5, 1000 * 60 * 15)

    const email = formData.get('email') as string

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return { message: 'Please enter a valid email address.', success: false }
    }

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
