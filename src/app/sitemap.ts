import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
