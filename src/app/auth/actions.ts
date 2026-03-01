'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import {
  createUserSession,
  requireCurrentUser,
  signOutCurrentUser,
} from '@/lib/auth'
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '@/lib/validations/auth'
import { hashPassword, verifyPassword } from '@/lib/security/password'
import { assertRateLimit } from '@/lib/security/rate-limit'
import { createOpaqueToken, hashToken } from '@/lib/security/token'
import { getRequestContext } from '@/lib/request-context'
import { createAuditLog, createActivityLog } from '@/lib/observability/audit'
import { reportError, reportOperationalEvent } from '@/lib/observability/error-reporting'

type AuthActionState = {
  success: boolean
  message: string
}

const DEFAULT_AUTH_STATE: AuthActionState = {
  success: false,
  message: '',
}

const MAX_SIGN_IN_ATTEMPTS = 5

export async function signIn(
  previousState: AuthActionState = DEFAULT_AUTH_STATE,
  formData: FormData
): Promise<AuthActionState> {
  void previousState
  const { ipAddress, userAgent } = await getRequestContext()
  const nextPath = formData.get('next')
  let destination: string | null = null

  try {
    assertRateLimit(`signin:${ipAddress}`, 10, 1000 * 60 * 15)

    const parsed = signInSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.errors[0]?.message ?? 'Invalid credentials',
      }
    }

    const email = parsed.data.email.toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.passwordHash) {
      await prisma.authSecurityEvent.create({
        data: {
          email,
          type: 'SIGN_IN_FAILED',
          ipAddress,
          userAgent,
          metadata: {
            reason: 'user_not_found',
          },
        },
      })

      return {
        success: false,
        message: 'Invalid credentials',
      }
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return {
        success: false,
        message: 'Your account is temporarily locked. Please try again later.',
      }
    }

    const passwordMatches = verifyPassword(parsed.data.password, user.passwordHash)

    if (!passwordMatches) {
      const failedAttempts = user.failedSignInAttempts + 1
      const shouldLock = failedAttempts >= MAX_SIGN_IN_ATTEMPTS

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedSignInAttempts: failedAttempts,
          lockedUntil: shouldLock ? new Date(Date.now() + 1000 * 60 * 15) : null,
        },
      })

      await prisma.authSecurityEvent.create({
        data: {
          userId: user.id,
          email,
          type: shouldLock ? 'ACCOUNT_LOCKED' : 'SIGN_IN_FAILED',
          ipAddress,
          userAgent,
          metadata: {
            failedAttempts,
          },
        },
      })

      return {
        success: false,
        message: shouldLock
          ? 'Your account has been locked for 15 minutes.'
          : 'Invalid credentials',
      }
    }

    if (!user.emailVerified) {
      return {
        success: false,
        message: 'Verify your email before signing in.',
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedSignInAttempts: 0,
        lockedUntil: null,
        lastSignInAt: new Date(),
      },
    })

    await prisma.authSecurityEvent.create({
      data: {
        userId: user.id,
        email,
        type: 'SIGN_IN_SUCCEEDED',
        ipAddress,
        userAgent,
      },
    })

    await createUserSession({
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      lockedUntil: user.lockedUntil,
    })

    await createActivityLog({
      actorUserId: user.id,
      description: 'Signed in',
    })

    destination = getPostSignInPath(
      user.role,
      typeof nextPath === 'string' ? nextPath : null
    )
  } catch (error) {
    reportError(error, {
      scope: 'auth.sign-in',
    })

    return {
      success: false,
      message: 'Unable to sign in right now. Please try again later.',
    }
  }

  if (destination) {
    redirect(destination)
  }

  return {
    success: false,
    message: 'Unable to sign in right now. Please try again later.',
  }
}

export async function signUp(
  previousState: AuthActionState = DEFAULT_AUTH_STATE,
  formData: FormData
): Promise<AuthActionState> {
  void previousState
  const { ipAddress, userAgent } = await getRequestContext()

  try {
    assertRateLimit(`signup:${ipAddress}`, 5, 1000 * 60 * 15)

    const parsed = signUpSchema.safeParse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      password: formData.get('password'),
    })

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.errors[0]?.message ?? 'Invalid registration data',
      }
    }

    const email = parsed.data.email.toLowerCase()
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return {
        success: false,
        message: 'An account with that email already exists.',
      }
    }

    const verificationToken = createOpaqueToken(24)

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          passwordHash: hashPassword(parsed.data.password),
          role: 'APPLICANT',
          passwordChangedAt: new Date(),
        },
      })

      await tx.applicantProfile.create({
        data: {
          userId: createdUser.id,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          skills: [],
        },
      })

      await tx.verificationToken.create({
        data: {
          userId: createdUser.id,
          tokenHash: hashToken(verificationToken),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      })

      return createdUser
    })

    await prisma.authSecurityEvent.create({
      data: {
        userId: user.id,
        email: user.email,
        type: 'EMAIL_VERIFICATION_REQUESTED',
        ipAddress,
        userAgent,
      },
    })

    await createAuditLog({
      actorUserId: user.id,
      action: 'user.created',
      targetType: 'User',
      targetId: user.id,
      metadata: {
        role: user.role,
      },
      ipAddress,
      userAgent,
    })

    await createActivityLog({
      actorUserId: user.id,
      description: 'Created account',
    })

    reportOperationalEvent('Email verification token generated', {
      email: user.email,
      verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/verify-email?token=${verificationToken}`,
    })

    return {
      success: true,
      message:
        'Account created. Check the server log for the verification link in development.',
    }
  } catch (error) {
    reportError(error, {
      scope: 'auth.sign-up',
    })

    return {
      success: false,
      message: 'Unable to create account right now. Please try again later.',
    }
  }
}

export async function requestPasswordReset(
  previousState: AuthActionState = DEFAULT_AUTH_STATE,
  formData: FormData
): Promise<AuthActionState> {
  void previousState
  const { ipAddress, userAgent } = await getRequestContext()

  try {
    assertRateLimit(`password-reset:${ipAddress}`, 5, 1000 * 60 * 15)

    const parsed = requestPasswordResetSchema.safeParse({
      email: formData.get('email'),
    })

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.errors[0]?.message ?? 'Invalid email address',
      }
    }

    const email = parsed.data.email.toLowerCase()
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (user) {
      const resetToken = createOpaqueToken(24)

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(resetToken),
          expiresAt: new Date(Date.now() + 1000 * 60 * 30),
        },
      })

      await prisma.authSecurityEvent.create({
        data: {
          userId: user.id,
          email: user.email,
          type: 'PASSWORD_RESET_REQUESTED',
          ipAddress,
          userAgent,
        },
      })

      reportOperationalEvent('Password reset token generated', {
        email: user.email,
        resetUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/reset-password?token=${resetToken}`,
      })
    }

    return {
      success: true,
      message:
        'If an account exists for that email, a reset link has been generated in the server log.',
    }
  } catch (error) {
    reportError(error, {
      scope: 'auth.request-password-reset',
    })

    return {
      success: false,
      message: 'Unable to process that request right now.',
    }
  }
}

export async function resetPassword(
  previousState: AuthActionState = DEFAULT_AUTH_STATE,
  formData: FormData
): Promise<AuthActionState> {
  void previousState
  try {
    const parsed = resetPasswordSchema.safeParse({
      token: formData.get('token'),
      password: formData.get('password'),
    })

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.errors[0]?.message ?? 'Invalid reset data',
      }
    }

    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash: hashToken(parsed.data.token),
      },
      include: {
        user: true,
      },
    })

    if (
      !tokenRecord ||
      tokenRecord.usedAt ||
      tokenRecord.expiresAt <= new Date()
    ) {
      return {
        success: false,
        message: 'That reset token is invalid or expired.',
      }
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: {
          passwordHash: hashPassword(parsed.data.password),
          passwordChangedAt: new Date(),
          failedSignInAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: {
          usedAt: new Date(),
        },
      }),
      prisma.authSecurityEvent.create({
        data: {
          userId: tokenRecord.userId,
          email: tokenRecord.user.email,
          type: 'PASSWORD_RESET_COMPLETED',
        },
      }),
    ])

    return {
      success: true,
      message: 'Password updated. You can sign in now.',
    }
  } catch (error) {
    reportError(error, {
      scope: 'auth.reset-password',
    })

    return {
      success: false,
      message: 'Unable to reset your password right now.',
    }
  }
}

export async function verifyEmail(token: string) {
  const tokenRecord = await prisma.verificationToken.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    include: {
      user: true,
    },
  })

  if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt <= new Date()) {
    return false
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: {
        emailVerified: new Date(),
      },
    }),
    prisma.verificationToken.update({
      where: { id: tokenRecord.id },
      data: {
        usedAt: new Date(),
      },
    }),
    prisma.authSecurityEvent.create({
      data: {
        userId: tokenRecord.userId,
        email: tokenRecord.user.email,
        type: 'EMAIL_VERIFIED',
      },
    }),
  ])

  return true
}

export async function signOut() {
  await requireCurrentUser()
  await signOutCurrentUser()
  redirect('/sign-in')
}

function getPostSignInPath(role: 'ADMIN' | 'EMPLOYER' | 'APPLICANT', nextPath: string | null) {
  if (nextPath && nextPath.startsWith('/')) {
    return nextPath
  }

  if (role === 'ADMIN') {
    return '/admin/dashboard'
  }

  if (role === 'EMPLOYER') {
    return '/employer/dashboard'
  }

  return '/applicant/dashboard'
}
