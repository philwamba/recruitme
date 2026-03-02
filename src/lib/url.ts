/**
 * Normalize and validate a URL for use in links
 * @param url - Raw URL string to normalize
 * @returns Normalized URL with trailing slash removed
 */
export function normalizeUrl(url: string | undefined): string | null {
    if (!url) return null

    const trimmed = url.trim()
    if (!trimmed) return null

    // Validate protocol
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        return null
    }

    // Remove trailing slash
    return trimmed.replace(/\/+$/, '')
}

/**
 * Get the base URL for the application with validation
 * Falls back to localhost for non-production environments
 */
export function getBaseUrl(): string {
    const appUrl = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL)

    if (appUrl) return appUrl

    // Only allow fallback in non-production
    if (process.env.NODE_ENV !== 'production') {
        return 'http://localhost:3000'
    }

    // Return empty string for production with no valid URL
    // Callers should handle this case
    return ''
}
