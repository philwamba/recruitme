import { Socket } from 'node:net'
import { env } from '@/lib/env'
import { prisma } from '@/lib/prisma'
import { reportError, reportOperationalEvent } from '@/lib/observability/error-reporting'
import { readPrivateFile } from '@/lib/services/private-files'

const CLAMAV_TIMEOUT_MS = 30000
const MAX_SCAN_SIZE_BYTES = 25 * 1024 * 1024 // 25MB ClamAV default limit

export type ScanResult = {
    status: 'CLEAN' | 'REJECTED' | 'ERROR'
    details?: string
}

/**
 * Check if ClamAV scanning is configured
 */
export function isScanningEnabled(): boolean {
    return Boolean(env.clamavHost)
}

/**
 * Scan a buffer using ClamAV's INSTREAM protocol
 * https://linux.die.net/man/8/clamd
 */
async function scanWithClamAV(buffer: Buffer): Promise<ScanResult> {
    if (!env.clamavHost) {
        // ClamAV not configured - skip scanning
        return { status: 'CLEAN', details: 'Scanning disabled' }
    }

    if (buffer.length > MAX_SCAN_SIZE_BYTES) {
        return { status: 'ERROR', details: 'File exceeds maximum scan size' }
    }

    return new Promise<ScanResult>((resolve) => {
        const socket = new Socket()
        const chunks: Buffer[] = []
        let resolved = false

        const cleanup = () => {
            if (!resolved) {
                resolved = true
                socket.destroy()
            }
        }

        const timeout = setTimeout(() => {
            cleanup()
            resolve({ status: 'ERROR', details: 'ClamAV scan timed out' })
        }, CLAMAV_TIMEOUT_MS)

        socket.on('data', (chunk) => {
            chunks.push(chunk)
        })

        socket.on('end', () => {
            clearTimeout(timeout)
            if (resolved) return

            resolved = true
            const response = Buffer.concat(chunks).toString('utf-8').trim()

            // ClamAV INSTREAM responses:
            // - "stream: OK" = clean
            // - "stream: <virus_name> FOUND" = infected
            // - "INSTREAM size limit exceeded" = too large
            if (response.includes('OK')) {
                resolve({ status: 'CLEAN', details: response })
            } else if (response.includes('FOUND')) {
                const match = response.match(/stream:\s*(.+)\s*FOUND/)
                const virusName = match?.[1]?.trim() ?? 'Unknown threat'
                resolve({ status: 'REJECTED', details: virusName })
            } else {
                resolve({ status: 'ERROR', details: response })
            }
        })

        socket.on('error', (err) => {
            clearTimeout(timeout)
            cleanup()
            resolve({ status: 'ERROR', details: `ClamAV connection error: ${err.message}` })
        })

        socket.connect(
            parseInt(env.clamavPort!, 10),
            env.clamavHost!,
            () => {
                // Send INSTREAM command
                socket.write('zINSTREAM\0')

                // Send file data in chunks
                // ClamAV expects: 4-byte length (big-endian) + data, repeated
                // Terminate with 4 zero bytes
                const CHUNK_SIZE = 2048
                for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
                    const chunk = buffer.subarray(i, i + CHUNK_SIZE)
                    const lengthBuffer = Buffer.alloc(4)
                    lengthBuffer.writeUInt32BE(chunk.length, 0)
                    socket.write(lengthBuffer)
                    socket.write(chunk)
                }

                // Send terminator (zero-length chunk)
                const terminator = Buffer.alloc(4, 0)
                socket.write(terminator)
            }
        )
    })
}

/**
 * Scan a file buffer for malware
 */
export async function scanBuffer(buffer: Buffer): Promise<ScanResult> {
    if (!isScanningEnabled()) {
        // If scanning is not configured, allow the file
        // In production, you should configure ClamAV
        if (process.env.NODE_ENV === 'production') {
            reportOperationalEvent('Document scanning disabled in production', {
                warning: 'CLAMAV_HOST not configured',
            })
        }
        return { status: 'CLEAN', details: 'Scanning disabled' }
    }

    return scanWithClamAV(buffer)
}

/**
 * Scan a document by its storage key and update the database
 */
export async function scanDocument(documentId: string): Promise<ScanResult> {
    const document = await prisma.candidateDocument.findUnique({
        where: { id: documentId },
    })

    if (!document) {
        return { status: 'ERROR', details: 'Document not found' }
    }

    try {
        const buffer = await readPrivateFile(document.storageKey)
        const result = await scanBuffer(buffer)

        // Update document scan status
        await prisma.candidateDocument.update({
            where: { id: documentId },
            data: {
                scanStatus: result.status === 'CLEAN' ? 'CLEAN' : 'REJECTED',
            },
        })

        if (result.status === 'REJECTED') {
            reportOperationalEvent('Malware detected in document', {
                documentId,
                storageKey: document.storageKey,
                threat: result.details,
            })
        }

        return result
    } catch (error) {
        reportError(error, {
            scope: 'security.document-scan',
            metadata: { documentId },
        })
        return { status: 'ERROR', details: String(error) }
    }
}

/**
 * Scan all pending documents (for background job processing)
 */
export async function scanPendingDocuments(limit = 10): Promise<void> {
    if (!isScanningEnabled()) {
        return
    }

    const pendingDocs = await prisma.candidateDocument.findMany({
        where: { scanStatus: 'PENDING' },
        take: limit,
        orderBy: { createdAt: 'asc' },
    })

    for (const doc of pendingDocs) {
        await scanDocument(doc.id)
    }
}
