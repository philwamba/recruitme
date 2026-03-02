import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const KEY_LENGTH = 64

const scryptAsync = promisify(scrypt)
const randomBytesAsync = promisify(randomBytes)

export async function hashPassword(password: string): Promise<string> {
  const salt = (await randomBytesAsync(16)).toString('hex')
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer

  return `${salt}:${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, originalKey] = storedHash.split(':')

  if (!salt || !originalKey) {
    return false
  }

  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  const originalBuffer = Buffer.from(originalKey, 'hex')

  if (derivedKey.length !== originalBuffer.length) {
    return false
  }

  return timingSafeEqual(derivedKey, originalBuffer)
}
