import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/url'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = getBaseUrl()

    return {
        rules: {
            userAgent: '*',
            allow: ['/jobs', '/'],
            disallow: ['/applicant', '/employer', '/admin', '/api'],
        },
        ...(baseUrl && { sitemap: `${baseUrl}/sitemap.xml` }),
    }
}
