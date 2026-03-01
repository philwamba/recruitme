const DEV_FALLBACK_SECRET = 'dev-only-auth-secret-change-me-before-production'

function readRequired(name: string): string {
  const value = process.env[name]

  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function readOptional(name: string, fallback?: string): string | undefined {
  const value = process.env[name]

  if (!value || !value.trim()) {
    return fallback
  }

  return value
}

function getAuthSecret(): string {
  const configuredSecret = readOptional('AUTH_SECRET')

  if (configuredSecret) {
    if (configuredSecret.length < 32) {
      throw new Error('AUTH_SECRET must be at least 32 characters long')
    }

    return configuredSecret
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required environment variable: AUTH_SECRET')
  }

  return DEV_FALLBACK_SECRET
}

function getSessionTtlHours(): number {
  const rawValue = readOptional('SESSION_TTL_HOURS', '168')
  const parsed = Number(rawValue)

  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error('SESSION_TTL_HOURS must be a positive number')
  }

  return parsed
}

export const env = {
  databaseUrl: readRequired('DATABASE_URL'),
  appUrl: readOptional('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')!,
  authSecret: getAuthSecret(),
  sessionCookieName: readOptional('SESSION_COOKIE_NAME', 'recruitme_session')!,
  sessionTtlHours: getSessionTtlHours(),
} as const
