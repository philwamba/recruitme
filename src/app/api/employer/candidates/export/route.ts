import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const MAX_EXPORT_RECORDS = 10000

export async function GET(request: Request) {
    const user = await getCurrentUser()

    if (!user || (user.role !== 'EMPLOYER' && user.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const offsetParam = url.searchParams.get('offset')

    const limit = Math.min(
        limitParam ? parseInt(limitParam, 10) || MAX_EXPORT_RECORDS : MAX_EXPORT_RECORDS,
        MAX_EXPORT_RECORDS,
    )
    const offset = offsetParam ? parseInt(offsetParam, 10) || 0 : 0

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
        take: limit,
        skip: offset,
    })

    const csvRows = [
        ['trackingId', 'candidateEmail', 'jobTitle', 'company', 'status', 'stage', 'submittedAt'].join(','),
        ...applications.map(application =>
            [
                application.trackingId,
                application.user.email,
                application.job.title,
                application.job.company,
                application.status,
                application.currentStage?.name ?? '',
                application.submittedAt?.toISOString() ?? '',
            ]
                .map(value => `"${String(value).replaceAll('"', '""')}"`)
                .join(','),
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
