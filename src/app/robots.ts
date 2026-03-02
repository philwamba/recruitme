import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/url'

const baseUrl = getBaseUrl() || 'http://localhost:3000'

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
