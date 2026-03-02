import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const STORAGE_ROOT = '/tmp/recruitme-private-files'
const ALLOWED_FILE_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
])
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

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
  const hash = createHash('sha256').update(buffer).digest('hex')
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const storageKey = `${randomUUID()}-${safeName}`

  await mkdir(STORAGE_ROOT, { recursive: true })
  await writeFile(join(STORAGE_ROOT, storageKey), buffer)

  return {
    storageKey,
    sha256: hash,
    sizeBytes: buffer.byteLength,
    mimeType: file.type || 'application/octet-stream',
    originalFileName: file.name,
  }
}

export async function readPrivateFile(storageKey: string) {
  return readFile(join(STORAGE_ROOT, storageKey))
}

export async function getPrivateFileStats(storageKey: string) {
  return stat(join(STORAGE_ROOT, storageKey))
}

export async function removePrivateFile(storageKey: string) {
  await unlink(join(STORAGE_ROOT, storageKey)).catch(() => undefined)
}
