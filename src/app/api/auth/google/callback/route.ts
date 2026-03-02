import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createUserSession } from '@/lib/auth'
import { getPostSignInPath } from '@/lib/auth/paths'
import { createActivityLog, createAuditLog } from '@/lib/observability/audit'
import { reportError } from '@/lib/observability/error-reporting'
import { consumeGoogleOAuthState, exchangeGoogleCodeForProfile } from '@/lib/oauth/google'

export async function GET(request: Request) {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const oauthError = url.searchParams.get('error')

    if (oauthError) {
        return NextResponse.redirect(new URL('/sign-in?error=google-access-denied', request.url))
    }

    if (!code) {
        return NextResponse.redirect(new URL('/sign-in?error=google-missing-code', request.url))
    }

    const stateResult = await consumeGoogleOAuthState(state)

    if (!stateResult.valid) {
        return NextResponse.redirect(new URL('/sign-in?error=google-invalid-state', request.url))
    }

    try {
        const profile = await exchangeGoogleCodeForProfile(code)

        const user = await prisma.$transaction(async tx => {
            const existingByGoogle = await tx.user.findUnique({
                where: { googleId: profile.googleId },
            })

            if (existingByGoogle) {
                if (existingByGoogle.email !== profile.email) {
                    const emailConflict = await tx.user.findUnique({
                        where: { email: profile.email },
                    })
                    if (emailConflict && emailConflict.id !== existingByGoogle.id) {
                        throw new Error('EMAIL_CONFLICT')
                    }
                }

                return tx.user.update({
                    where: { id: existingByGoogle.id },
                    data: {
                        email: profile.email,
                        emailVerified: existingByGoogle.emailVerified ?? new Date(),
                    },
                })
            }

            const existingByEmail = await tx.user.findUnique({
                where: { email: profile.email },
            })

            if (existingByEmail) {
                await tx.user.update({
                    where: { id: existingByEmail.id },
                    data: {
                        googleId: profile.googleId,
                        emailVerified: existingByEmail.emailVerified ?? new Date(),
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

                return tx.user.findUniqueOrThrow({
                    where: { id: existingByEmail.id },
                })
            }

            const createdUser = await tx.user.create({
                data: {
                    email: profile.email,
                    googleId: profile.googleId,
                    emailVerified: new Date(),
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

            return createdUser
        })

        await createUserSession({
            id: user.id,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified,
            lockedUntil: user.lockedUntil,
        })

        await createAuditLog({
            actorUserId: user.id,
            action: 'auth.google.sign-in',
            targetType: 'User',
            targetId: user.id,
            metadata: {
                provider: 'google',
            },
        })

        await createActivityLog({
            actorUserId: user.id,
            description: 'Signed in with Google',
        })

        return NextResponse.redirect(
            new URL(getPostSignInPath(user.role, stateResult.nextPath), request.url),
        )
    } catch (error) {
        // Handle specific error types with descriptive redirects
        if (error instanceof Error && error.message === 'EMAIL_CONFLICT') {
            return NextResponse.redirect(new URL('/sign-in?error=google-email-conflict', request.url))
        }
        reportError(error, {
            scope: 'auth.google.callback',
        })
        return NextResponse.redirect(new URL('/sign-in?error=google-auth-failed', request.url))
    }
}
