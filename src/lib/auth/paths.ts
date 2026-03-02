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

    // Must start with single slash (not //)
    if (!path.startsWith('/') || path.startsWith('//')) {
        return defaultPath
    }

    // Try to decode and validate
    let decoded: string
    try {
        decoded = decodeURIComponent(path)
    } catch {
        return defaultPath
    }

    // Reject control characters, backslashes, and path traversal
    if (/[\x00-\x1f\x7f\\]/.test(decoded) || /\.\./.test(decoded)) {
        return defaultPath
    }

    // Also check the original (in case of double-encoding tricks)
    if (/[\x00-\x1f\x7f\\]/.test(path) || /\.\./.test(path)) {
        return defaultPath
    }

    // Allow only safe characters in the path
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
