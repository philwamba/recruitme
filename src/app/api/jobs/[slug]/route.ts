import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params

    const job = await prisma.job.findFirst({
        where: {
            slug,
            status: 'PUBLISHED',
        },
        select: {
            id: true,
            slug: true,
            title: true,
            company: true,
            location: true,
            description: true,
            requirements: true,
            benefits: true,
            salaryMin: true,
            salaryMax: true,
            salaryCurrency: true,
            employmentType: true,
            workplaceType: true,
            department: {
                select: {
                    name: true,
                    slug: true,
                },
            },
            publishedAt: true,
            expiresAt: true,
        },
    })

    if (!job) {
        return NextResponse.json(
            { error: 'Job not found' },
            { status: 404 }
        )
    }

    return NextResponse.json(job)
}
