import { env } from '@/lib/env'

/**
 * Check which OAuth providers are configured
 * Safe to call from server components
 */
export function getOAuthConfig() {
    return {
        google: Boolean(env.googleClientId && env.googleClientSecret),
        linkedin: Boolean(env.linkedinClientId && env.linkedinClientSecret),
    }
}

export type OAuthConfig = ReturnType<typeof getOAuthConfig>
