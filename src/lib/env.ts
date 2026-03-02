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
    appEnvironment: readOptional('APP_ENV', process.env.NODE_ENV ?? 'development')!,
    observabilityWebhookUrl: readOptional('OBSERVABILITY_WEBHOOK_URL'),
    emailProvider: readOptional('EMAIL_PROVIDER', 'log')!,
    emailFrom: readOptional('EMAIL_FROM'),
    resendApiKey: readOptional('RESEND_API_KEY'),
    privateStorageDriver: readOptional('PRIVATE_STORAGE_DRIVER', 'local')!,
    privateFilesRoot: readOptional('PRIVATE_FILES_ROOT', '/tmp/recruitme-private-files')!,
    cloudflareAccountId: readOptional('CLOUDFLARE_ACCOUNT_ID'),
    cloudflareR2AccessKeyId: readOptional('CLOUDFLARE_R2_ACCESS_KEY_ID'),
    cloudflareR2SecretAccessKey: readOptional('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
    cloudflareR2BucketName: readOptional('CLOUDFLARE_R2_BUCKET_NAME'),
    linkedinClientId: readOptional('LINKEDIN_CLIENT_ID'),
    linkedinClientSecret: readOptional('LINKEDIN_CLIENT_SECRET'),
    linkedinRedirectUri: readOptional('LINKEDIN_REDIRECT_URI'),
    googleClientId: readOptional('GOOGLE_CLIENT_ID'),
    googleClientSecret: readOptional('GOOGLE_CLIENT_SECRET'),
    googleRedirectUri: readOptional('GOOGLE_REDIRECT_URI'),
    redisUrl: readOptional('REDIS_URL'),
    clamavHost: readOptional('CLAMAV_HOST'),
    clamavPort: readOptional('CLAMAV_PORT', '3310'),
} as const
