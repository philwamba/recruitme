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
  sessionCookieName: readOptional('SESSION_COOKIE_NAME', 'recruitme_session')!,
  sessionTtlHours: getSessionTtlHours(),
} as const
