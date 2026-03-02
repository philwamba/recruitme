import { cookies } from 'next/headers'
import { env } from '@/lib/env'
import { createOpaqueToken } from '@/lib/security/token'

const LINKEDIN_STATE_COOKIE = 'recruitme_linkedin_oauth_state'
const LINKEDIN_NEXT_COOKIE = 'recruitme_linkedin_oauth_next'
const OAUTH_FETCH_TIMEOUT_MS = 10000

export function isLinkedInOAuthConfigured() {
    return Boolean(env.linkedinClientId && env.linkedinClientSecret)
}

export function getLinkedInRedirectUri() {
    return env.linkedinRedirectUri ?? `${env.appUrl}/api/auth/linkedin/callback`
}

export async function createLinkedInAuthorizationUrl(nextPath?: string | null) {
    if (!isLinkedInOAuthConfigured()) {
        throw new Error('LinkedIn OAuth is not configured')
    }

    const state = createOpaqueToken(24)
    const cookieStore = await cookies()

    cookieStore.set(LINKEDIN_STATE_COOKIE, state, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 10,
    })

    cookieStore.set(LINKEDIN_NEXT_COOKIE, sanitizeNextPath(nextPath), {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 10,
    })

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: env.linkedinClientId!,
        redirect_uri: getLinkedInRedirectUri(),
        scope: 'openid profile email',
        state,
    })

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`
}

export async function consumeLinkedInOAuthState(inputState: string | null) {
    const cookieStore = await cookies()
    const expectedState = cookieStore.get(LINKEDIN_STATE_COOKIE)?.value ?? null
    const nextPath = cookieStore.get(LINKEDIN_NEXT_COOKIE)?.value ?? null

    cookieStore.set(LINKEDIN_STATE_COOKIE, '', {
        path: '/',
        maxAge: 0,
    })
    cookieStore.set(LINKEDIN_NEXT_COOKIE, '', {
        path: '/',
        maxAge: 0,
    })

    return {
        valid: Boolean(inputState && expectedState && inputState === expectedState),
        nextPath: sanitizeNextPath(nextPath),
    }
}

export async function exchangeLinkedInCodeForProfile(code: string) {
    if (!isLinkedInOAuthConfigured()) {
        throw new Error('LinkedIn OAuth is not configured')
    }

    // Token exchange with timeout
    const tokenController = new AbortController()
    const tokenTimeoutId = setTimeout(() => tokenController.abort(), OAUTH_FETCH_TIMEOUT_MS)

    let tokenResponse: Response
    try {
        tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: getLinkedInRedirectUri(),
                client_id: env.linkedinClientId!,
                client_secret: env.linkedinClientSecret!,
            }),
            signal: tokenController.signal,
        })
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('LinkedIn token exchange timed out')
        }
        throw error
    } finally {
        clearTimeout(tokenTimeoutId)
    }

    const tokenPayload = await tokenResponse.json()

    if (!tokenResponse.ok || !tokenPayload.access_token) {
        throw new Error('LinkedIn token exchange failed')
    }

    // Profile fetch with timeout
    const profileController = new AbortController()
    const profileTimeoutId = setTimeout(() => profileController.abort(), OAUTH_FETCH_TIMEOUT_MS)

    let profileResponse: Response
    try {
        profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${tokenPayload.access_token}`,
            },
            signal: profileController.signal,
        })
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('LinkedIn profile fetch timed out')
        }
        throw error
    } finally {
        clearTimeout(profileTimeoutId)
    }

    const profilePayload = await profileResponse.json()

    if (!profileResponse.ok || !profilePayload.sub || !profilePayload.email) {
        throw new Error('LinkedIn profile fetch failed')
    }

    return {
        linkedinId: String(profilePayload.sub),
        email: String(profilePayload.email).toLowerCase(),
        firstName: String(profilePayload.given_name ?? ''),
        lastName: String(profilePayload.family_name ?? ''),
        avatarUrl: typeof profilePayload.picture === 'string' ? profilePayload.picture : null,
    }
}

function sanitizeNextPath(nextPath?: string | null): string {
    const defaultPath = '/applicant/dashboard'

    if (!nextPath) return defaultPath

    // Must start with single slash (not //)
    if (!nextPath.startsWith('/') || nextPath.startsWith('//')) {
        return defaultPath
    }

    // Try to decode and validate
    let decoded: string
    try {
        decoded = decodeURIComponent(nextPath)
    } catch {
        return defaultPath
    }

    // Reject control characters, backslashes, and path traversal
    if (/[\x00-\x1f\x7f\\]/.test(decoded) || /\.\./.test(decoded)) {
        return defaultPath
    }

    // Also check the original (in case of double-encoding tricks)
    if (/[\x00-\x1f\x7f\\]/.test(nextPath) || /\.\./.test(nextPath)) {
        return defaultPath
    }

    // Allow only safe characters in the path
    if (!/^\/[a-zA-Z0-9\-_./]*$/.test(decoded)) {
        return defaultPath
    }

    return nextPath
}
