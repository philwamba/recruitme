import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createUserSession } from '@/lib/auth'
import { getPostSignInPath } from '@/lib/auth/paths'
import { createActivityLog, createAuditLog } from '@/lib/observability/audit'
import { reportError, reportOperationalEvent } from '@/lib/observability/error-reporting'
import { consumeLinkedInOAuthState, exchangeLinkedInCodeForProfile } from '@/lib/oauth/linkedin'
import { createOpaqueToken, hashToken } from '@/lib/security/token'
import { sendEmail } from '@/lib/services/email-delivery'
import { getBaseUrl } from '@/lib/url'

export async function GET(request: Request) {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const oauthError = url.searchParams.get('error')

    if (oauthError) {
        return NextResponse.redirect(new URL('/sign-in?error=linkedin-access-denied', request.url))
    }

    if (!code) {
        return NextResponse.redirect(new URL('/sign-in?error=linkedin-missing-code', request.url))
    }

    const stateResult = await consumeLinkedInOAuthState(state)

    if (!stateResult.valid) {
        return NextResponse.redirect(new URL('/sign-in?error=linkedin-invalid-state', request.url))
    }

    try {
        const profile = await exchangeLinkedInCodeForProfile(code)

        const result = await prisma.$transaction(async tx => {
            const existingByLinkedIn = await tx.user.findUnique({
                where: { linkedinId: profile.linkedinId },
            })

            if (existingByLinkedIn) {
                const emailChanged = existingByLinkedIn.email !== profile.email

                if (emailChanged) {
                    const emailConflict = await tx.user.findUnique({
                        where: { email: profile.email },
                    })
                    if (emailConflict && emailConflict.id !== existingByLinkedIn.id) {
                        throw new Error('EMAIL_CONFLICT')
                    }
                }

                const user = await tx.user.update({
                    where: { id: existingByLinkedIn.id },
                    data: {
                        email: profile.email,
                        // If email changed, require re-verification based on LinkedIn's status for new email
                        // Otherwise preserve existing verification status
                        emailVerified: emailChanged
                            ? (profile.emailVerified ? new Date() : null)
                            : (existingByLinkedIn.emailVerified ?? (profile.emailVerified ? new Date() : null)),
                    },
                })

                return { user, isNewUser: false }
            }

            const existingByEmail = await tx.user.findUnique({
                where: { email: profile.email },
            })

            if (existingByEmail) {
                await tx.user.update({
                    where: { id: existingByEmail.id },
                    data: {
                        linkedinId: profile.linkedinId,
                        emailVerified: existingByEmail.emailVerified ?? (profile.emailVerified ? new Date() : null),
                    },
                })

                if (existingByEmail.role === 'APPLICANT') {
                    await tx.applicantProfile.upsert({
                        where: { userId: existingByEmail.id },
                        update: {
                            firstName: profile.firstName || undefined,
                            lastName: profile.lastName || undefined,
                            avatarUrl: profile.avatarUrl ?? undefined,
                        },
                        create: {
                            userId: existingByEmail.id,
                            firstName: profile.firstName || null,
                            lastName: profile.lastName || null,
                            avatarUrl: profile.avatarUrl,
                            skills: [],
                        },
                    })
                }

                const user = await tx.user.findUniqueOrThrow({
                    where: { id: existingByEmail.id },
                })

                return { user, isNewUser: false }
            }

            // New user - set emailVerified based on LinkedIn's verification status
            const createdUser = await tx.user.create({
                data: {
                    email: profile.email,
                    linkedinId: profile.linkedinId,
                    emailVerified: profile.emailVerified ? new Date() : null,
                    role: 'APPLICANT',
                },
            })

            await tx.applicantProfile.create({
                data: {
                    userId: createdUser.id,
                    firstName: profile.firstName || null,
                    lastName: profile.lastName || null,
                    avatarUrl: profile.avatarUrl,
                    skills: [],
                },
            })

            return { user: createdUser, isNewUser: true }
        })

        const { user, isNewUser } = result

        // If email not verified, send verification email and redirect
        if (!user.emailVerified) {
            const verificationToken = createOpaqueToken(24)

            await prisma.verificationToken.create({
                data: {
                    userId: user.id,
                    tokenHash: hashToken(verificationToken),
                    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
                },
            })

            await prisma.authSecurityEvent.create({
                data: {
                    userId: user.id,
                    email: user.email,
                    type: 'EMAIL_VERIFICATION_REQUESTED',
                },
            })

            reportOperationalEvent('LinkedIn OAuth - verification required', {
                email: user.email,
                linkedinEmailVerified: profile.emailVerified,
            })

            const appUrl = getBaseUrl()
            if (appUrl) {
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
                        scope: 'auth.linkedin.verification-email',
                        userId: user.id,
                    })
                }
            } else {
                reportError(new Error('NEXT_PUBLIC_APP_URL not configured - verification email not sent'), {
                    scope: 'auth.linkedin.verification-email.config',
                    userId: user.id,
                })
            }

            return NextResponse.redirect(
                new URL('/sign-in?message=verify-email', request.url),
            )
        }

        // Email is verified - create session and sign in
        await createUserSession({
            id: user.id,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
            lockedUntil: user.lockedUntil,
        })

        await createAuditLog({
            actorUserId: user.id,
            action: isNewUser ? 'auth.linkedin.sign-up' : 'auth.linkedin.sign-in',
            targetType: 'User',
            targetId: user.id,
            metadata: {
                provider: 'linkedin',
            },
        })

        await createActivityLog({
            actorUserId: user.id,
            description: isNewUser ? 'Signed up with LinkedIn' : 'Signed in with LinkedIn',
        })

        return NextResponse.redirect(
            new URL(getPostSignInPath(user.role, stateResult.nextPath), request.url),
        )
    } catch (error) {
        // Handle specific error types with descriptive redirects
        if (error instanceof Error && error.message === 'EMAIL_CONFLICT') {
            return NextResponse.redirect(new URL('/sign-in?error=linkedin-email-conflict', request.url))
        }
        reportError(error, {
            scope: 'auth.linkedin.callback',
        })
        return NextResponse.redirect(new URL('/sign-in?error=linkedin-auth-failed', request.url))
    }
}
