import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getBaseUrl } from '@/lib/url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getBaseUrl()
    if (!baseUrl) {
        return []
    }

    const jobs = await prisma.job.findMany({
        where: { status: 'PUBLISHED' },
        select: { slug: true, updatedAt: true },
    })

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
