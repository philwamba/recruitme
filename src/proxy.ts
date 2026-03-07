import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Route protection proxy for Next.js 16
 *
 * Performs optimistic authentication checks at the edge.
 * Full authorization (role/permission checks) is enforced server-side via requireCurrentUser().
 *
 * Protected route groups:
 * - /applicant/* - Requires authenticated user (APPLICANT role enforced server-side)
 * - /employer/*  - Requires authenticated user (EMPLOYER role enforced server-side)
 * - /admin/*     - Requires authenticated user (ADMIN role enforced server-side)
 */

const CSP_NONCE_HEADER = 'x-csp-nonce'

/**
 * Generate a cryptographically secure nonce using Web Crypto API
 */
function generateNonce(): string {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return btoa(String.fromCharCode(...bytes))
}

/**
 * Build CSP header value with the given nonce
 */
function buildCSPHeader(nonce: string): string {
    return [
        "default-src 'self'",
        "img-src 'self' data: https:",
        `style-src 'self' 'nonce-${nonce}'`,
        `script-src 'self' 'nonce-${nonce}'`,
        "font-src 'self' data:",
        "connect-src 'self' https:",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; ')
}

// Explicitly public paths that never require authentication
const PUBLIC_PATHS = new Set([
    '/',
    '/sign-in',
    '/sign-up',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/unauthorized',
    '/jobs',
])

/**
 * Check if a path is explicitly public
 */
function isPublicPath(pathname: string): boolean {
    if (PUBLIC_PATHS.has(pathname)) {
        return true
    }

    if (pathname.startsWith('/jobs/')) {
        return true
    }

    return false
}

/**
 * Check if a path requires authentication
 */
function isProtectedPath(pathname: string): boolean {

    return (
        pathname.startsWith('/applicant') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/employer')
    )
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    const nonce = generateNonce()

    if (!isPublicPath(pathname) && isProtectedPath(pathname)) {
        const cookieName = process.env.SESSION_COOKIE_NAME ?? 'recruitme_session'
        const hasSession = Boolean(request.cookies.get(cookieName)?.value)

        if (!hasSession) {
            const signInUrl = new URL('/sign-in', request.url)

            const fullPath = request.nextUrl.search
                ? `${pathname}${request.nextUrl.search}`
                : pathname
            signInUrl.searchParams.set('next', fullPath)
            return NextResponse.redirect(signInUrl)
        }
    }

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set(CSP_NONCE_HEADER, nonce)

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    response.headers.set('Content-Security-Policy', buildCSPHeader(nonce))

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes handle their own auth)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - Static assets
         */
        '/((?!api|_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
}
