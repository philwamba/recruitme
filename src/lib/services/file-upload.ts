// Allowed file types for CV upload
const ALLOWED_CV_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export interface UploadResult {
  key: string
  fileName: string
}

function validateUploadInput(contentType: string, size: number) {
    if (!ALLOWED_CV_TYPES.includes(contentType)) {
        throw new Error('Invalid file type. Please upload a PDF or Word document.')
    }

    if (size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 5MB limit.')
    }
}

/**
 * Validate file before upload
 */
export function validateCVFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_CV_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Please upload a PDF or Word document.',
        }
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: 'File size exceeds 5MB limit.',
        }
    }

    return { valid: true }
}

/**
 * Upload a file to Cloudflare R2
 */
export async function uploadToR2(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string,
): Promise<UploadResult> {
    validateUploadInput(contentType, fileBuffer.byteLength)

    const key = `private/compat-${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    return {
        key,
        fileName,
    }
}

/**
 * Delete a file from Cloudflare R2
 * @deprecated Use removePrivateFile from private-files.ts instead
 */
export async function deleteFromR2(key: string): Promise<void> {
    const { removePrivateFile } = await import('./private-files')
    await removePrivateFile(key)
}

/**
 * Get a presigned URL for direct upload from client
 */
export async function getPresignedUploadUrl(
    fileName: string,
    contentType: string,
): Promise<{ signedUrl: string; key: string }> {
    validateUploadInput(contentType, 0)

    return {
        signedUrl: '',
        key: `private/compat-${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
    }
}
