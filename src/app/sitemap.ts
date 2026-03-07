import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getBaseUrl } from '@/lib/url'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseUrl()
    if (!baseUrl) {
        return []
    }

    // Wrap in try-catch to handle cases where database is unavailable (e.g., CI builds)
    let jobs: { slug: string; updatedAt: Date }[] = []
    try {
        jobs = await prisma.job.findMany({
            where: { status: 'PUBLISHED' },
            select: { slug: true, updatedAt: true },
        })
    } catch {
        // Database unavailable, return sitemap without job entries
    }

    return [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
        },
        {
            url: `${baseUrl}/jobs`,
            lastModified: new Date(),
        },
        ...jobs.map(job => ({
            url: `${baseUrl}/jobs/${job.slug}`,
            lastModified: job.updatedAt,
        })),
    ]
}
