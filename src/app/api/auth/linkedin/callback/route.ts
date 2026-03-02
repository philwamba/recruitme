import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createUserSession } from '@/lib/auth'
import { getPostSignInPath } from '@/lib/auth/paths'
import { createActivityLog, createAuditLog } from '@/lib/observability/audit'
import { reportError } from '@/lib/observability/error-reporting'
import { consumeLinkedInOAuthState, exchangeLinkedInCodeForProfile } from '@/lib/oauth/linkedin'

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

    const user = await prisma.$transaction(async (tx) => {
      const existingByLinkedIn = await tx.user.findUnique({
        where: { linkedinId: profile.linkedinId },
      })

      if (existingByLinkedIn) {
        return tx.user.update({
          where: { id: existingByLinkedIn.id },
          data: {
            email: profile.email,
            emailVerified: existingByLinkedIn.emailVerified ?? new Date(),
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
            linkedinId: profile.linkedinId,
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
          linkedinId: profile.linkedinId,
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
      action: 'auth.linkedin.sign-in',
      targetType: 'User',
      targetId: user.id,
      metadata: {
        provider: 'linkedin',
      },
    })

    await createActivityLog({
      actorUserId: user.id,
      description: 'Signed in with LinkedIn',
    })

    return NextResponse.redirect(
      new URL(getPostSignInPath(user.role, stateResult.nextPath), request.url)
    )
  } catch (error) {
    reportError(error, {
      scope: 'auth.linkedin.callback',
    })
    return NextResponse.redirect(new URL('/sign-in?error=linkedin-auth-failed', request.url))
  }
}
