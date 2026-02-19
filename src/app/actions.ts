'use server'

import { prisma } from '@/lib/prisma'

export async function addToWaitlist(prevState: any, formData: FormData) {
  const email = formData.get('email') as string

  // Simple email validation
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { message: 'Please enter a valid email address.', success: false }
  }

  try {
    await prisma.waitlist.create({
      data: { email },
    })
    return { message: 'Thanks for joining the waitlist!', success: true }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { message: 'This email is already on the waitlist.', success: false }
    }
    console.error('Waitlist error:', error)
    return { message: 'Something went wrong. Please try again.', success: false }
  }
}
