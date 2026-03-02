import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { reportError } from '@/lib/observability/error-reporting'
import { readPrivateFile } from '@/lib/services/private-files'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
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
    (user.role === 'EMPLOYER' || user.role === 'ADMIN') &&
    (!!document.application?.job.createdByUserId
      ? document.application.job.createdByUserId === user.id || user.role === 'ADMIN'
      : false)

  if (!ownsDocument && !canRecruiterAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Sanitize filename for Content-Disposition header
  function sanitizeFilename(filename: string, fallbackId: string): string {
    // Remove CRLF characters and double quotes
    let sanitized = filename.replace(/[\r\n"]/g, '')
    // If empty after sanitization, use a fallback
    if (!sanitized.trim()) {
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
