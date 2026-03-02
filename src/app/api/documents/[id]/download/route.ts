import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { reportError } from '@/lib/observability/error-reporting'
import { readPrivateFile } from '@/lib/services/private-files'

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const user = await getCurrentUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const document = await prisma.candidateDocument.findUnique({
        where: { id },
        include: {
            application: {
                include: {
                    job: true,
                },
            },
            applicantProfile: true,
        },
    })

    if (!document) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const ownsDocument =
    document.uploadedByUserId === user.id ||
    document.applicantProfile?.userId === user.id

    const canRecruiterAccess =
        user.role === 'ADMIN' ||
        (user.role === 'EMPLOYER' &&
            document.application?.job.createdByUserId === user.id)

    if (!ownsDocument && !canRecruiterAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    function sanitizeFilename(filename: string, fallbackId: string): string {
        let sanitized = filename
            .replace(/[\x00-\x1f\x7f]/g, '') // Control characters
            .replace(/["\\/:<>|?*]/g, '-') // Filesystem-sensitive characters
            .replace(/\s+/g, '_') // Collapse whitespace
            .trim()

        if (sanitized.length > 200) {
            const ext = sanitized.lastIndexOf('.')
            if (ext > 0 && ext > sanitized.length - 10) {
                sanitized = sanitized.slice(0, 190) + sanitized.slice(ext)
            } else {
                sanitized = sanitized.slice(0, 200)
            }
        }

        if (!sanitized) {
            sanitized = `document-${fallbackId}`
        }
        return sanitized
    }

    try {
        const file = await readPrivateFile(document.storageKey)
        const safeFilename = sanitizeFilename(document.originalFileName, document.id)

        return new NextResponse(file, {
            status: 200,
            headers: {
                'Content-Type': document.mimeType,
                'Content-Disposition': `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`,
                'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
            },
        })
    } catch (error) {
        const err = error as NodeJS.ErrnoException
        if (err.code === 'ENOENT') {
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }
        reportError(error, {
            scope: 'documents.download',
            userId: user.id,
            metadata: { documentId: document.id },
        })
        return NextResponse.json({ error: 'Failed to read file' }, { status: 500 })
    }
}
