import Redis from 'ioredis'

type RateLimitEntry = {
    count: number
    expiresAt: number
}

const globalForRateLimit = globalThis as typeof globalThis & {
    __recruitmeRateLimitStore?: Map<string, RateLimitEntry>
    __recruitmeRedisClient?: Redis | null
    __recruitmeRedisAvailable?: boolean
    __recruitmeRedisUrl?: string | undefined
}

const rateLimitStore =
    globalForRateLimit.__recruitmeRateLimitStore ?? new Map<string, RateLimitEntry>()

if (!globalForRateLimit.__recruitmeRateLimitStore) {
    globalForRateLimit.__recruitmeRateLimitStore = rateLimitStore
}

function getRedisUrl(): string | undefined {
    if (globalForRateLimit.__recruitmeRedisUrl !== undefined) {
        return globalForRateLimit.__recruitmeRedisUrl
    }
    const url = process.env.REDIS_URL
    globalForRateLimit.__recruitmeRedisUrl = url || undefined
    return globalForRateLimit.__recruitmeRedisUrl
}

function getRedisClient(): Redis | null {
    if (globalForRateLimit.__recruitmeRedisClient !== undefined) {
        return globalForRateLimit.__recruitmeRedisClient
    }

    const redisUrl = getRedisUrl()
    if (!redisUrl) {
        globalForRateLimit.__recruitmeRedisClient = null
        globalForRateLimit.__recruitmeRedisAvailable = false
        return null
    }

    try {
        const client = new Redis(redisUrl, {
            maxRetriesPerRequest: 1,
            enableReadyCheck: false,
            connectTimeout: 5000,
            lazyConnect: true,
        })

        client.on('error', () => {
            // Silently handle Redis errors - will fall back to in-memory
            globalForRateLimit.__recruitmeRedisAvailable = false
        })

        client.on('connect', () => {
            globalForRateLimit.__recruitmeRedisAvailable = true
        })

        client.on('end', () => {
            globalForRateLimit.__recruitmeRedisAvailable = false
        })

        globalForRateLimit.__recruitmeRedisClient = client
        // Start with false until connection is established (lazyConnect: true)
        globalForRateLimit.__recruitmeRedisAvailable = false

        // Initiate connection attempt
        client.connect().catch(() => {
            globalForRateLimit.__recruitmeRedisAvailable = false
        })

        return client
    } catch {
        globalForRateLimit.__recruitmeRedisClient = null
        globalForRateLimit.__recruitmeRedisAvailable = false
        return null
    }
}

// Lua script for atomic rate limit check (INCR + conditional EXPIRE)
const RATE_LIMIT_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
end
return count
`

/**
 * Check rate limit using Redis if available, fallback to in-memory
 */
export async function checkRateLimitAsync(key: string, limit: number, windowMs: number): Promise<boolean> {
    const redis = getRedisClient()

    // Try Redis first if available
    if (redis && globalForRateLimit.__recruitmeRedisAvailable) {
        try {
            const redisKey = `ratelimit:${key}`
            const windowSec = Math.ceil(windowMs / 1000)

            // Use EVAL for atomic rate limiting (INCR + EXPIRE in single command)
            const count = await redis.eval(RATE_LIMIT_SCRIPT, 1, redisKey, windowSec) as number

            return count <= limit
        } catch {
            // Redis failed - fall back to in-memory
            globalForRateLimit.__recruitmeRedisAvailable = false
        }
    }

    // Fall back to in-memory
    return checkRateLimitSync(key, limit, windowMs)
}

/**
 * Synchronous in-memory rate limit check
 */
function checkRateLimitSync(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const current = rateLimitStore.get(key)

    if (!current || current.expiresAt <= now) {
        rateLimitStore.set(key, {
            count: 1,
            expiresAt: now + windowMs,
        })

        return true
    }

    if (current.count >= limit) {
        return false
    }

    current.count += 1
    rateLimitStore.set(key, current)

    return true
}

/**
 * Synchronous rate limit check (uses in-memory only)
 * Use checkRateLimitAsync for Redis support in production
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
    return checkRateLimitSync(key, limit, windowMs)
}

/**
 * Assert rate limit - throws if limit exceeded
 */
export async function assertRateLimitAsync(key: string, limit: number, windowMs: number) {
    const allowed = await checkRateLimitAsync(key, limit, windowMs)
    if (!allowed) {
        throw new Error('Too many requests. Please try again later.')
    }
}

/**
 * Synchronous rate limit assertion (uses in-memory only)
 * Use assertRateLimitAsync for Redis support in production
 */
export function assertRateLimit(key: string, limit: number, windowMs: number) {
    if (!checkRateLimitSync(key, limit, windowMs)) {
        throw new Error('Too many requests. Please try again later.')
    }
}

export function resetRateLimitStore() {
    rateLimitStore.clear()
}

/**
 * Get rate limit health status
 */
export function getRateLimitHealth() {
    return {
        driver: globalForRateLimit.__recruitmeRedisAvailable ? 'redis' : 'memory',
        redisConfigured: Boolean(getRedisUrl()),
        redisAvailable: globalForRateLimit.__recruitmeRedisAvailable ?? false,
    }
}
