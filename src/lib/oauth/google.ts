import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import { createOpaqueToken } from '@/lib/security/token'

const GOOGLE_STATE_COOKIE = 'recruitme_google_oauth_state'
const GOOGLE_NEXT_COOKIE = 'recruitme_google_oauth_next'
const OAUTH_FETCH_TIMEOUT_MS = 10000

export function isGoogleOAuthConfigured() {
    return Boolean(env.googleClientId && env.googleClientSecret)
}

export function getGoogleRedirectUri() {
    return env.googleRedirectUri ?? `${env.appUrl}/api/auth/google/callback`
}

export async function createGoogleAuthorizationUrl(nextPath?: string | null) {
    if (!isGoogleOAuthConfigured()) {
        throw new Error('Google OAuth is not configured')
    }

    const state = createOpaqueToken(24)
    const cookieStore = await cookies()

    cookieStore.set(GOOGLE_STATE_COOKIE, state, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 10,
    })

    cookieStore.set(GOOGLE_NEXT_COOKIE, sanitizeNextPath(nextPath), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 10,
    })

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: env.googleClientId!,
        redirect_uri: getGoogleRedirectUri(),
        scope: 'openid email profile',
        state,
        access_type: 'online',
        prompt: 'select_account',
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function consumeGoogleOAuthState(inputState: string | null) {
    const cookieStore = await cookies()
    const expectedState = cookieStore.get(GOOGLE_STATE_COOKIE)?.value ?? null
    const nextPath = cookieStore.get(GOOGLE_NEXT_COOKIE)?.value ?? null

    cookieStore.set(GOOGLE_STATE_COOKIE, '', {
        path: '/',
        maxAge: 0,
    })
    cookieStore.set(GOOGLE_NEXT_COOKIE, '', {
        path: '/',
        maxAge: 0,
    })

    return {
        valid: Boolean(inputState && expectedState && inputState === expectedState),
        nextPath: sanitizeNextPath(nextPath),
    }
}

export async function exchangeGoogleCodeForProfile(code: string) {
    if (!isGoogleOAuthConfigured()) {
        throw new Error('Google OAuth is not configured')
    }

    const tokenController = new AbortController()
    const tokenTimeoutId = setTimeout(() => tokenController.abort(), OAUTH_FETCH_TIMEOUT_MS)

    let tokenResponse: Response
    try {
        tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: getGoogleRedirectUri(),
                client_id: env.googleClientId!,
                client_secret: env.googleClientSecret!,
            }),
            signal: tokenController.signal,
        })
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Google token exchange timed out')
        }
        throw error
    } finally {
        clearTimeout(tokenTimeoutId)
    }

    const tokenPayload = await tokenResponse.json()

    if (!tokenResponse.ok || !tokenPayload.access_token) {
        throw new Error('Google token exchange failed')
    }

    const profileController = new AbortController()
    const profileTimeoutId = setTimeout(() => profileController.abort(), OAUTH_FETCH_TIMEOUT_MS)

    let profileResponse: Response
    try {
        profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
            headers: {
                Authorization: `Bearer ${tokenPayload.access_token}`,
            },
            signal: profileController.signal,
        })
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Google profile fetch timed out')
        }
        throw error
    } finally {
        clearTimeout(profileTimeoutId)
    }

    const profilePayload = await profileResponse.json()

    if (!profileResponse.ok || !profilePayload.sub || !profilePayload.email) {
        throw new Error('Google profile fetch failed')
    }

    if (profilePayload.email_verified !== true) {
        throw new Error('Google email is not verified')
    }

    return {
        googleId: String(profilePayload.sub),
        email: String(profilePayload.email).toLowerCase(),
        firstName: String(profilePayload.given_name ?? ''),
        lastName: String(profilePayload.family_name ?? ''),
        avatarUrl: typeof profilePayload.picture === 'string' ? profilePayload.picture : null,
    }
}

function sanitizeNextPath(nextPath?: string | null): string {
    const defaultPath = '/applicant/dashboard'

    if (!nextPath) return defaultPath

    if (!nextPath.startsWith('/') || nextPath.startsWith('//')) {
        return defaultPath
    }
    let decoded: string
    try {
        decoded = decodeURIComponent(nextPath)
    } catch {
        return defaultPath
    }

    if (/[\x00-\x1f\x7f\\]/.test(decoded) || /\.\./.test(decoded)) {
        return defaultPath
    }
    if (/[\x00-\x1f\x7f\\]/.test(nextPath) || /\.\./.test(nextPath)) {
        return defaultPath
    }

    if (!/^\/[a-zA-Z0-9\-_./]*$/.test(decoded)) {
        return defaultPath
    }

    return nextPath
}
