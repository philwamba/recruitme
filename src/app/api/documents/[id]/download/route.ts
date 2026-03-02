import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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

  const file = await readPrivateFile(document.storageKey)

  return new NextResponse(file, {
    status: 200,
    headers: {
      'Content-Type': document.mimeType,
      'Content-Disposition': `attachment; filename="${document.originalFileName}"`,
    },
  })
}
