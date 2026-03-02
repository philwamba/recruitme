import type { UserRole } from '@prisma/client'

/**
 * Get the default dashboard path for a user role
 */
function getDefaultPath(role: UserRole): string {
    switch (role) {
    case 'ADMIN':
        return '/admin/dashboard'
    case 'EMPLOYER':
        return '/employer/dashboard'
    default:
        return '/applicant/dashboard'
    }
}

/**
 * Sanitize a redirect path to prevent open redirect vulnerabilities
 */
function sanitizeRedirectPath(path: string | null, defaultPath: string): string {
    if (!path) {
        return defaultPath
    }

    if (!path.startsWith('/') || path.startsWith('//')) {
        return defaultPath
    }

    let decoded: string
    try {
        decoded = decodeURIComponent(path)
    } catch {
        return defaultPath
    }

    if (/[\x00-\x1f\x7f\\]/.test(decoded) || /\.\./.test(decoded)) {
        return defaultPath
    }

    if (/[\x00-\x1f\x7f\\]/.test(path) || /\.\./.test(path)) {
        return defaultPath
    }

    if (!/^\/[a-zA-Z0-9\-_./]*$/.test(decoded)) {
        return defaultPath
    }

    return path
}

/**
 * Get the post-sign-in redirect path for a user
 * Uses the provided nextPath if valid, otherwise returns role-specific default
 */
export function getPostSignInPath(role: UserRole, nextPath: string | null): string {
    const defaultPath = getDefaultPath(role)
    return sanitizeRedirectPath(nextPath, defaultPath)
}
