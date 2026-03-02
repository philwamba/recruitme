import Redis from 'ioredis'
import { env } from '@/lib/env'

type RateLimitEntry = {
  count: number
  expiresAt: number
}

// In-memory store for fallback
const globalForRateLimit = globalThis as typeof globalThis & {
  __recruitmeRateLimitStore?: Map<string, RateLimitEntry>
  __recruitmeRedisClient?: Redis | null
  __recruitmeRedisAvailable?: boolean
}

const rateLimitStore =
  globalForRateLimit.__recruitmeRateLimitStore ??
  new Map<string, RateLimitEntry>()

if (!globalForRateLimit.__recruitmeRateLimitStore) {
    globalForRateLimit.__recruitmeRateLimitStore = rateLimitStore
}

// Initialize Redis client if configured
function getRedisClient(): Redis | null {
    if (globalForRateLimit.__recruitmeRedisClient !== undefined) {
        return globalForRateLimit.__recruitmeRedisClient
    }

    if (!env.redisUrl) {
        globalForRateLimit.__recruitmeRedisClient = null
        globalForRateLimit.__recruitmeRedisAvailable = false
        return null
    }

    try {
        const client = new Redis(env.redisUrl, {
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

        globalForRateLimit.__recruitmeRedisClient = client
        globalForRateLimit.__recruitmeRedisAvailable = true
        return client
    } catch {
        globalForRateLimit.__recruitmeRedisClient = null
        globalForRateLimit.__recruitmeRedisAvailable = false
        return null
    }
}

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

            // Use INCR with EXPIRE for atomic rate limiting
            const count = await redis.incr(redisKey)

            if (count === 1) {
                // First request in window - set expiry
                await redis.expire(redisKey, windowSec)
            }

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
        redisConfigured: Boolean(env.redisUrl),
        redisAvailable: globalForRateLimit.__recruitmeRedisAvailable ?? false,
    }
}
