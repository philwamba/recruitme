import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { reportError } from '@/lib/observability/error-reporting'

const MAX_EXPORT_RECORDS = 10000
const MAX_OFFSET = 100000

/**
 * Sanitize CSV value to prevent formula injection
 * Prefixes values starting with =, +, -, @ with a tab character
 */
function sanitizeCsvValue(value: string): string {
    const trimmed = value.trim()
    if (/^[=+\-@]/.test(trimmed)) {
        return `\t${trimmed}`
    }
    return trimmed
}

export async function GET(request: Request) {
    const user = await getCurrentUser()

    if (!user || (user.role !== 'EMPLOYER' && user.role !== 'ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const offsetParam = url.searchParams.get('offset')

    // Parse and sanitize pagination values
    const parsedLimit = limitParam ? parseInt(limitParam, 10) : MAX_EXPORT_RECORDS
    const limit = Number.isNaN(parsedLimit)
        ? MAX_EXPORT_RECORDS
        : Math.max(1, Math.min(parsedLimit, MAX_EXPORT_RECORDS))

    const parsedOffset = offsetParam ? parseInt(offsetParam, 10) : 0
    const offset = Number.isNaN(parsedOffset)
        ? 0
        : Math.max(0, Math.min(parsedOffset, MAX_OFFSET))

    try {
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
            orderBy: [
                { appliedAt: 'desc' },
                { id: 'desc' }, // Stable secondary key for deterministic ordering
            ],
            take: limit,
            skip: offset,
        })

        const csvRows = [
            ['trackingId', 'candidateEmail', 'jobTitle', 'company', 'status', 'stage', 'submittedAt'].join(','),
            ...applications.map(application =>
                [
                    sanitizeCsvValue(application.trackingId),
                    sanitizeCsvValue(application.user.email),
                    sanitizeCsvValue(application.job.title),
                    sanitizeCsvValue(application.job.company),
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
    } catch (error) {
        reportError(error, {
            scope: 'api.employer.candidates.export',
            userId: user.id,
        })
        return NextResponse.json(
            { error: 'Failed to export candidates' },
            { status: 500 },
        )
    }
}
