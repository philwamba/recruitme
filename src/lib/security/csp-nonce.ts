import { randomBytes } from 'node:crypto'
import { headers } from 'next/headers'

const CSP_NONCE_HEADER = 'x-csp-nonce'

/**
 * Generate a cryptographically secure nonce for CSP
 */
export function generateNonce(): string {
    return randomBytes(16).toString('base64')
}

/**
 * Get the CSP nonce from the request headers (set by proxy)
 * Returns undefined if not available (for static pages or during build)
 */
export async function getNonce(): Promise<string | undefined> {
    try {
        const headersList = await headers()
        return headersList.get(CSP_NONCE_HEADER) ?? undefined
    } catch {
        // headers() throws during static generation
        return undefined
    }
}

/**
 * Build CSP header value with the given nonce
 */
export function buildCSPHeader(nonce: string): string {
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
