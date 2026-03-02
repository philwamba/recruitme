import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto'
import { promisify } from 'node:util'

const KEY_LENGTH = 64

const SCRYPT_OPTIONS: ScryptOptions = {
    N: 2 ** 17,
    r: 8,
    p: 1,
    maxmem: 256 * 1024 * 1024,
}

// Type-safe promisified scrypt with options support
const scryptAsync = promisify(scrypt) as (
    password: string | Buffer,
    salt: string | Buffer,
    keylen: number,
    options: ScryptOptions
) => Promise<Buffer>

const randomBytesAsync = promisify(randomBytes)

export async function hashPassword(password: string): Promise<string> {
    const salt = (await randomBytesAsync(16)).toString('hex')
    const derivedKey = await scryptAsync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS)

    return `${salt}:${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [salt, originalKey] = storedHash.split(':')

    if (!salt || !originalKey) {
        return false
    }

    const derivedKey = await scryptAsync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS)
    const originalBuffer = Buffer.from(originalKey, 'hex')

    if (derivedKey.length !== originalBuffer.length) {
        return false
    }

    return timingSafeEqual(derivedKey, originalBuffer)
}
