import 'server-only'

import type { Permission, Prisma, User, UserRole } from '@prisma/client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'
import { createAuditLog, createActivityLog } from '@/lib/observability/audit'
import { reportError } from '@/lib/observability/error-reporting'
import { getRequestContext } from '@/lib/request-context'
import { roleHasPermission } from '@/lib/security/permissions'
import { createOpaqueToken, hashToken } from '@/lib/security/token'

const SESSION_EXTENSION_THRESHOLD_MS = 1000 * 60 * 60 * 12

export type AuthenticatedUser = Pick<
  User,
  'id' | 'email' | 'role' | 'emailVerified' | 'lockedUntil'
>

export async function getSessionCookieValue() {
    const cookieStore = await cookies()
    return cookieStore.get(env.sessionCookieName)?.value
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
    const rawToken = await getSessionCookieValue()

    if (!rawToken) {
        return null
    }

    const session = await prisma.session.findUnique({
        where: {
            sessionTokenHash: hashToken(rawToken),
        },
        include: {
            user: true,
        },
    })

    if (!session) {
        return null
    }

    if (session.expiresAt <= new Date()) {
        await prisma.session.delete({
            where: { id: session.id },
        }).catch(() => undefined)
        await clearSessionCookie()
        return null
    }

    if (session.expiresAt.getTime() - Date.now() <= SESSION_EXTENSION_THRESHOLD_MS) {
        const nextExpiry = getSessionExpiryDate()
        await prisma.session.update({
            where: { id: session.id },
            data: {
                expiresAt: nextExpiry,
                lastUsedAt: new Date(),
            },
        }).catch((error: unknown) => {
            reportError(error, {
                scope: 'auth.extend-session',
                userId: session.userId,
            })
        })

        const cookieStore = await cookies()
        cookieStore.set(env.sessionCookieName, rawToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            expires: nextExpiry,
        })
    }

    return {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        emailVerified: session.user.emailVerified,
        lockedUntil: session.user.lockedUntil,
    }
}

export async function requireCurrentUser(
    options?: {
    roles?: UserRole[]
    permission?: Permission
    redirectTo?: string
  },
): Promise<AuthenticatedUser> {
    const user = await getCurrentUser()

    if (!user) {
        redirect(options?.redirectTo ?? '/sign-in')
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
        redirect('/sign-in?error=locked')
    }

    if (options?.roles && !options.roles.includes(user.role)) {
        await recordUnauthorizedAccess(user.id, user.email, {
            roles: options.roles,
            permission: options.permission,
        })
        redirect('/unauthorized')
    }

    if (options?.permission && !roleHasPermission(user.role, options.permission)) {
        await recordUnauthorizedAccess(user.id, user.email, {
            roles: options.roles,
            permission: options.permission,
        })
        redirect('/unauthorized')
    }

    return user
}

export async function createUserSession(user: AuthenticatedUser) {
    const rawToken = createOpaqueToken(32)
    const { ipAddress, userAgent } = await getRequestContext()

    await prisma.session.create({
        data: {
            sessionTokenHash: hashToken(rawToken),
            userId: user.id,
            expiresAt: getSessionExpiryDate(),
            ipAddress,
            userAgent,
        },
    })

    const cookieStore = await cookies()
    cookieStore.set(env.sessionCookieName, rawToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        expires: getSessionExpiryDate(),
    })

    await createAuditLog({
        actorUserId: user.id,
        action: 'session.created',
        targetType: 'Session',
        metadata: {
            role: user.role,
        },
        ipAddress,
        userAgent,
    })
}

export async function signOutCurrentUser() {
    const rawToken = await getSessionCookieValue()
    const user = await getCurrentUser()
    const { ipAddress, userAgent } = await getRequestContext()

    if (rawToken) {
        await prisma.session.deleteMany({
            where: {
                sessionTokenHash: hashToken(rawToken),
            },
        })
    }

    await clearSessionCookie()

    if (user) {
        await createAuditLog({
            actorUserId: user.id,
            action: 'session.destroyed',
            targetType: 'Session',
            metadata: {
                role: user.role,
            },
            ipAddress,
            userAgent,
        })

        await createActivityLog({
            actorUserId: user.id,
            description: 'Signed out',
        })
    }
}

async function clearSessionCookie() {
    const cookieStore = await cookies()
    cookieStore.set(env.sessionCookieName, '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 0,
    })
}

function getSessionExpiryDate() {
    return new Date(Date.now() + env.sessionTtlHours * 60 * 60 * 1000)
}

async function recordUnauthorizedAccess(
    userId: string,
    email: string,
    metadata: Record<string, unknown>,
) {
    const { ipAddress, userAgent } = await getRequestContext()

    await prisma.authSecurityEvent.create({
        data: {
            userId,
            email,
            type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
            ipAddress,
            userAgent,
            metadata: metadata as Prisma.InputJsonValue,
        },
    }).catch((error: unknown) => {
        reportError(error, {
            scope: 'auth.unauthorized-access',
            userId,
            metadata,
        })
    })
}
