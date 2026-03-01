import test from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, verifyPassword } from '../src/lib/security/password.ts'

test('hashPassword creates a verifiable hash', () => {
  const password = 'StrongPassword123'
  const hash = hashPassword(password)

  assert.notEqual(hash, password)
  assert.equal(verifyPassword(password, hash), true)
  assert.equal(verifyPassword('WrongPassword123', hash), false)
})
