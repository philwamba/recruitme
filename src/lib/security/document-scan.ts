import { Socket } from 'node:net'
import { env } from '@/lib/env'
import { prisma } from '@/lib/prisma'
import { reportError, reportOperationalEvent } from '@/lib/observability/error-reporting'
import { readPrivateFile } from '@/lib/services/private-files'

const CLAMAV_TIMEOUT_MS = 30000
const MAX_SCAN_SIZE_BYTES = 25 * 1024 * 1024

export type ScanResult = {
    status: 'CLEAN' | 'REJECTED' | 'ERROR'
    details?: string
}

/**
 * Validate that the ClamAV port is a valid TCP port number
 */
function isValidPort(port: string | undefined): boolean {
    if (!port) return false
    const portNum = parseInt(port, 10)
    return Number.isInteger(portNum) && portNum >= 1 && portNum <= 65535
}

/**
 * Check if ClamAV scanning is configured with valid host and port
 */
export function isScanningEnabled(): boolean {
    return Boolean(env.clamavHost) && isValidPort(env.clamavPort)
}

/**
 * Scan a buffer using ClamAV's INSTREAM protocol
 * https://linux.die.net/man/8/clamd
 */
async function scanWithClamAV(buffer: Buffer): Promise<ScanResult> {
    if (!isScanningEnabled()) {
        return { status: 'CLEAN', details: 'Scanning disabled' }
    }

    if (buffer.length > MAX_SCAN_SIZE_BYTES) {
        return { status: 'ERROR', details: 'File exceeds maximum scan size' }
    }

    const port = parseInt(env.clamavPort!, 10)

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

        socket.connect(port, env.clamavHost!, () => {
            socket.write('zINSTREAM\0')

            const CHUNK_SIZE = 2048
            for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
                const chunk = buffer.subarray(i, i + CHUNK_SIZE)
                const lengthBuffer = Buffer.alloc(4)
                lengthBuffer.writeUInt32BE(chunk.length, 0)
                socket.write(lengthBuffer)
                socket.write(chunk)
            }

            const terminator = Buffer.alloc(4, 0)
            socket.write(terminator)
        })
    })
}

/**
 * Scan a file buffer for malware
 */
export async function scanBuffer(buffer: Buffer): Promise<ScanResult> {
    if (!isScanningEnabled()) {
        if (process.env.NODE_ENV === 'production') {
            reportOperationalEvent('Document scanning disabled in production', {
                warning: 'CLAMAV_HOST or CLAMAV_PORT not configured properly',
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

        // Only update status for definitive results
        // ERROR results leave status unchanged for retry
        if (result.status === 'CLEAN') {
            await prisma.candidateDocument.update({
                where: { id: documentId },
                data: { scanStatus: 'CLEAN' },
            })
        } else if (result.status === 'REJECTED') {
            await prisma.candidateDocument.update({
                where: { id: documentId },
                data: { scanStatus: 'REJECTED' },
            })

            reportOperationalEvent('Malware detected in document', {
                documentId,
                storageKey: document.storageKey,
                threat: result.details,
            })
        }
        // ERROR status: leave as PENDING for background retry

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
