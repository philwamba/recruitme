import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3'
import { env } from '@/lib/env'

// Configurable storage root with fallback for development
const STORAGE_ROOT = env.privateFilesRoot
const STORAGE_DRIVER = env.privateStorageDriver.toLowerCase()
const OBJECT_STORAGE_CONFIGURED =
  Boolean(env.cloudflareAccountId) &&
  Boolean(env.cloudflareR2AccessKeyId) &&
  Boolean(env.cloudflareR2SecretAccessKey) &&
  Boolean(env.cloudflareR2BucketName)

const s3Client =
  STORAGE_DRIVER === 'r2' && OBJECT_STORAGE_CONFIGURED
      ? new S3Client({
          region: 'auto',
          endpoint: `https://${env.cloudflareAccountId}.r2.cloudflarestorage.com`,
          credentials: {
              accessKeyId: env.cloudflareR2AccessKeyId!,
              secretAccessKey: env.cloudflareR2SecretAccessKey!,
          },
      })
      : null

if (process.env.NODE_ENV === 'production' && STORAGE_DRIVER === 'local' && STORAGE_ROOT.startsWith('/tmp')) {
    console.warn('WARNING: Using ephemeral /tmp storage in production. Set PRIVATE_FILES_ROOT to a persistent path.')
}

const ALLOWED_FILE_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
])
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

// Magic bytes for file type validation
const MAGIC_BYTES: Record<string, number[]> = {
    'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
    'image/png': [0x89, 0x50, 0x4e, 0x47], // PNG
    'image/jpeg': [0xff, 0xd8, 0xff], // JPEG
    // DOC/DOCX use compound/ZIP formats with variable headers - skip magic check for those
}

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
    const expectedMagic = MAGIC_BYTES[mimeType]
    if (!expectedMagic) {
    // No magic bytes defined for this type, skip validation
        return true
    }
    if (buffer.length < expectedMagic.length) {
        return false
    }
    return expectedMagic.every((byte, index) => buffer[index] === byte)
}

function getSecurePath(storageKey: string): string {
    // Prevent path traversal by resolving and validating the path
    const resolvedRoot = resolve(STORAGE_ROOT)
    const resolvedPath = resolve(resolvedRoot, storageKey)

    if (!resolvedPath.startsWith(resolvedRoot + '/') && resolvedPath !== resolvedRoot) {
        throw new Error('Invalid storage key: path traversal detected')
    }

    return resolvedPath
}

function isObjectStorageEnabled() {
    return STORAGE_DRIVER === 'r2' && Boolean(s3Client)
}

export function validatePrivateUpload(file: File) {
    if (!ALLOWED_FILE_TYPES.has(file.type)) {
        throw new Error('Unsupported file type. Use PDF, DOC, DOCX, PNG, or JPEG.')
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error('File size exceeds the 5MB upload limit.')
    }
}

export async function savePrivateFile(file: File) {
    validatePrivateUpload(file)
    const buffer = Buffer.from(await file.arrayBuffer())

    // Validate magic bytes for defense-in-depth
    if (!validateMagicBytes(buffer, file.type)) {
        throw new Error('File content does not match declared type')
    }

    const hash = createHash('sha256').update(buffer).digest('hex')
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storageKey = `private/${randomUUID()}-${safeName}`

    if (isObjectStorageEnabled()) {
        await s3Client!.send(
            new PutObjectCommand({
                Bucket: env.cloudflareR2BucketName!,
                Key: storageKey,
                Body: buffer,
                ContentType: file.type || 'application/octet-stream',
            }),
        )
    } else {
        await mkdir(STORAGE_ROOT, { recursive: true })
        const securePath = getSecurePath(storageKey)
        await writeFile(securePath, buffer)
    }

    return {
        storageKey,
        sha256: hash,
        sizeBytes: buffer.byteLength,
        mimeType: file.type || 'application/octet-stream',
        originalFileName: file.name,
    }
}

export async function readPrivateFile(storageKey: string) {
    if (isObjectStorageEnabled()) {
        const response = await s3Client!.send(
            new GetObjectCommand({
                Bucket: env.cloudflareR2BucketName!,
                Key: storageKey,
            }),
        )

        if (!response.Body) {
            const error = new Error('Object body missing')
      ;(error as NodeJS.ErrnoException).code = 'ENOENT'
            throw error
        }

        const bytes = await response.Body.transformToByteArray()
        return Buffer.from(bytes)
    }

    const securePath = getSecurePath(storageKey)
    return readFile(securePath)
}

export async function getPrivateFileStats(storageKey: string) {
    if (isObjectStorageEnabled()) {
        const file = await readPrivateFile(storageKey)
        return {
            size: file.byteLength,
        }
    }

    const securePath = getSecurePath(storageKey)
    return stat(securePath)
}

export async function removePrivateFile(storageKey: string) {
    if (isObjectStorageEnabled()) {
        await s3Client!.send(
            new DeleteObjectCommand({
                Bucket: env.cloudflareR2BucketName!,
                Key: storageKey,
            }),
        ).catch(() => undefined)
        return
    }

    const securePath = getSecurePath(storageKey)
    await unlink(securePath).catch(() => undefined)
}

export function getPrivateStorageHealth() {
    const persistentLocalStorage =
    STORAGE_DRIVER === 'local' && !STORAGE_ROOT.startsWith('/tmp')

    const ok =
    isObjectStorageEnabled() ||
    process.env.NODE_ENV !== 'production' ||
    persistentLocalStorage

    return {
        ok,
        driver: isObjectStorageEnabled() ? 'r2' : 'local',
        persistent: isObjectStorageEnabled() || persistentLocalStorage,
        root: isObjectStorageEnabled() ? null : STORAGE_ROOT,
    }
}
