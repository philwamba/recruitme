import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()

  if (!user || (user.role !== 'EMPLOYER' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const applications = await prisma.application.findMany({
    where:
      user.role === 'ADMIN'
        ? undefined
        : {
            job: {
              createdByUserId: user.id,
            },
          },
    include: {
      job: true,
      currentStage: true,
      user: true,
    },
    orderBy: { appliedAt: 'desc' },
  })

  const csvRows = [
    ['trackingId', 'candidateEmail', 'jobTitle', 'company', 'status', 'stage', 'submittedAt'].join(','),
    ...applications.map((application) =>
      [
        application.trackingId,
        application.user.email,
        application.job.title,
        application.job.company,
        application.status,
        application.currentStage?.name ?? '',
        application.submittedAt?.toISOString() ?? '',
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(',')
    ),
  ]

  return new NextResponse(csvRows.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="candidates-export.csv"',
    },
  })
}
