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
import { assertRateLimitAsync } from '@/lib/security/rate-limit'
import { createOpaqueToken, hashToken } from '@/lib/security/token'
import { getRequestContext } from '@/lib/request-context'
import { createAuditLog, createActivityLog } from '@/lib/observability/audit'
import { reportError, reportOperationalEvent } from '@/lib/observability/error-reporting'
import { sendEmail } from '@/lib/services/email-delivery'
import { getPostSignInPath } from '@/lib/auth/paths'
import { getBaseUrl } from '@/lib/url'

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
    formData: FormData,
): Promise<AuthActionState> {
    void previousState
    const { ipAddress, userAgent } = await getRequestContext()
    const nextPath = formData.get('next')
    let destination: string | null = null

    try {
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

        // Use email as fallback key when IP is unavailable
        const rateLimitKey = ipAddress ?? `email:${email}`
        await assertRateLimitAsync(`signin:${rateLimitKey}`, 10, 1000 * 60 * 15)
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

        const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash)

        if (!passwordMatches) {
            // Atomic increment to prevent race conditions
            const updatedUser = await prisma.user.update({
                where: { id: user.id },
                data: {
                    failedSignInAttempts: { increment: 1 },
                },
            })

            const failedAttempts = updatedUser.failedSignInAttempts
            const shouldLock = failedAttempts >= MAX_SIGN_IN_ATTEMPTS

            if (shouldLock) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        lockedUntil: new Date(Date.now() + 1000 * 60 * 15),
                    },
                })
            }

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
            typeof nextPath === 'string' ? nextPath : null,
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
    formData: FormData,
): Promise<AuthActionState> {
    void previousState
    const { ipAddress, userAgent } = await getRequestContext()

    try {
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

        const rateLimitKey = ipAddress ?? `email:${email}`
        await assertRateLimitAsync(`signup:${rateLimitKey}`, 5, 1000 * 60 * 15)
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return {
                success: true,
                message: 'Account created. Check your email for the verification link.',
            }
        }

        const verificationToken = createOpaqueToken(24)

        const passwordHash = await hashPassword(parsed.data.password)

        const user = await prisma.$transaction(async tx => {
            const createdUser = await tx.user.create({
                data: {
                    email,
                    passwordHash,
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
            tokenIssued: true,
            tokenFingerprint: hashToken(verificationToken).slice(0, 16),
        })

        const appUrl = getBaseUrl()
        if (!appUrl) {
            reportError(new Error('NEXT_PUBLIC_APP_URL not configured or invalid in production'), {
                scope: 'auth.sign-up.config',
                userId: user.id,
                metadata: { rawValue: process.env.NEXT_PUBLIC_APP_URL },
            })
            return {
                success: true,
                message: 'Account created but verification email could not be sent. Please contact support.',
            }
        }
        const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`

        try {
            await sendEmail({
                to: user.email,
                subject: 'Verify your RecruitMe account',
                html: `Complete your sign-up by opening <a href="${verificationUrl}">this verification link</a>.`,
                text: `Complete your sign-up by opening this verification link: ${verificationUrl}`,
            })
        } catch (emailError) {
            reportError(emailError, {
                scope: 'auth.sign-up.email',
                userId: user.id,
            })
            return {
                success: true,
                message: 'Account created but verification email could not be sent. Please try again or contact support.',
            }
        }

        return {
            success: true,
            message: 'Account created. Check your email for the verification link.',
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
    formData: FormData,
): Promise<AuthActionState> {
    void previousState
    const { ipAddress, userAgent } = await getRequestContext()

    try {
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

        // Use email as fallback key when IP is unavailable
        const rateLimitKey = ipAddress ?? `email:${email}`
        await assertRateLimitAsync(`password-reset:${rateLimitKey}`, 5, 1000 * 60 * 15)
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (user) {
            const resetToken = createOpaqueToken(24)

            // Invalidate any prior active tokens for this user
            await prisma.passwordResetToken.updateMany({
                where: {
                    userId: user.id,
                    usedAt: null,
                    expiresAt: { gt: new Date() },
                },
                data: {
                    expiresAt: new Date(), // Expire immediately
                },
            })

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
                tokenIssued: true,
                tokenFingerprint: hashToken(resetToken).slice(0, 16),
            })

            const appUrl = getBaseUrl()
            if (!appUrl) {
                reportError(new Error('NEXT_PUBLIC_APP_URL not configured or invalid in production'), {
                    scope: 'auth.password-reset.config',
                    userId: user.id,
                    metadata: { rawValue: process.env.NEXT_PUBLIC_APP_URL },
                })
            } else {
                const resetUrl = `${appUrl}/reset-password?token=${resetToken}`

                try {
                    await sendEmail({
                        to: user.email,
                        subject: 'Reset your RecruitMe password',
                        html: `You requested a password reset. Open <a href="${resetUrl}">this secure reset link</a> to continue.`,
                        text: `You requested a password reset. Open this secure reset link to continue: ${resetUrl}`,
                    })
                } catch (emailError) {
                    reportError(emailError, {
                        scope: 'auth.password-reset.email',
                        userId: user.id,
                    })
                }
            }
        }

        return {
            success: true,
            message: 'If an account exists for that email, a password reset link has been sent.',
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
    formData: FormData,
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

        const tokenHash = hashToken(parsed.data.token)
        const now = new Date()

        const consumeResult = await prisma.passwordResetToken.updateMany({
            where: {
                tokenHash,
                usedAt: null,
                expiresAt: { gt: now },
            },
            data: {
                usedAt: now,
            },
        })

        if (consumeResult.count === 0) {
            return {
                success: false,
                message: 'That reset token is invalid or expired.',
            }
        }

        const tokenRecord = await prisma.passwordResetToken.findUnique({
            where: { tokenHash },
            include: { user: true },
        })

        if (!tokenRecord) {
            return {
                success: false,
                message: 'That reset token is invalid or expired.',
            }
        }

        const newPasswordHash = await hashPassword(parsed.data.password)

        await prisma.$transaction([
            prisma.user.update({
                where: { id: tokenRecord.userId },
                data: {
                    passwordHash: newPasswordHash,
                    passwordChangedAt: new Date(),
                    failedSignInAttempts: 0,
                    lockedUntil: null,
                },
            }),
            // Invalidate all existing sessions for security
            prisma.session.deleteMany({
                where: { userId: tokenRecord.userId },
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
    const tokenHash = hashToken(token)
    const now = new Date()

    const consumeResult = await prisma.verificationToken.updateMany({
        where: {
            tokenHash,
            usedAt: null,
            expiresAt: { gt: now },
        },
        data: {
            usedAt: now,
        },
    })

    if (consumeResult.count === 0) {
        return false
    }

    const tokenRecord = await prisma.verificationToken.findUnique({
        where: { tokenHash },
        include: { user: true },
    })

    if (!tokenRecord) {
        return false
    }

    await prisma.$transaction([
        prisma.user.update({
            where: { id: tokenRecord.userId },
            data: {
                emailVerified: new Date(),
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
