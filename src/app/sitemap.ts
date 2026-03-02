import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await prisma.job.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true },
  })

  return [
    {
      url: 'http://localhost:3000/',
      lastModified: new Date(),
    },
    {
      url: 'http://localhost:3000/jobs',
      lastModified: new Date(),
    },
    ...jobs.map((job) => ({
      url: `http://localhost:3000/jobs/${job.slug}`,
      lastModified: job.updatedAt,
    })),
  ]
}
