import type { MetadataRoute } from 'next'

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/jobs', '/'],
      disallow: ['/applicant', '/employer', '/admin', '/api'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
