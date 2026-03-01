import test from 'node:test'
import assert from 'node:assert/strict'
import { checkRateLimit, resetRateLimitStore } from '../src/lib/security/rate-limit.ts'

test('rate limiter blocks calls beyond the allowed window', () => {
  resetRateLimitStore()

  assert.equal(checkRateLimit('test-key', 2, 1000), true)
  assert.equal(checkRateLimit('test-key', 2, 1000), true)
  assert.equal(checkRateLimit('test-key', 2, 1000), false)
})
