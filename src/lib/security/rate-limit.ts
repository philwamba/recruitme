type RateLimitEntry = {
  count: number
  expiresAt: number
}

const globalForRateLimit = globalThis as typeof globalThis & {
  __recruitmeRateLimitStore?: Map<string, RateLimitEntry>
}

const rateLimitStore =
  globalForRateLimit.__recruitmeRateLimitStore ??
  new Map<string, RateLimitEntry>()

if (!globalForRateLimit.__recruitmeRateLimitStore) {
  globalForRateLimit.__recruitmeRateLimitStore = rateLimitStore
}

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
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

export function assertRateLimit(key: string, limit: number, windowMs: number) {
  if (!checkRateLimit(key, limit, windowMs)) {
    throw new Error('Too many requests. Please try again later.')
  }
}

export function resetRateLimitStore() {
  rateLimitStore.clear()
}
