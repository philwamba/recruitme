import test from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, verifyPassword } from '../src/lib/security/password.ts'

test('hashPassword creates a verifiable hash', async () => {
  const password = 'StrongPassword123'
  const hash = await hashPassword(password)

  assert.notEqual(hash, password)
  assert.equal(await verifyPassword(password, hash), true)
  assert.equal(await verifyPassword('WrongPassword123', hash), false)
})
