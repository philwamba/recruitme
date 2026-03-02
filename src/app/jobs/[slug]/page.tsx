import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublishedJobBySlug } from '@/lib/services/jobs'
import { getNonce } from '@/lib/security/csp-nonce'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export async function generateMetadata({
    params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const job = await getPublishedJobBySlug(slug)

    if (!job) {
        return {
            title: 'Job Not Found | RecruitMe',
        }
    }

    return {
        title: `${job.title} at ${job.company} | RecruitMe`,
        description: job.description.slice(0, 160),
        openGraph: {
            title: `${job.title} at ${job.company}`,
            description: job.description.slice(0, 160),
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${job.title} at ${job.company}`,
            description: job.description.slice(0, 160),
        },
    }
}

export const dynamic = 'force-dynamic'

export default async function JobDetailPage({
    params,
}: {
  params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const job = await getPublishedJobBySlug(slug)

    if (!job) {
        notFound()
    }

    const nonce = await getNonce()

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: job.description,
        hiringOrganization: {
            '@type': 'Organization',
            name: job.company,
        },
        jobLocationType: job.workplaceType,
        employmentType: job.employmentType,
        datePosted: job.publishedAt?.toISOString() ?? job.createdAt.toISOString(),
        validThrough: job.expiresAt?.toISOString(),
        jobLocation: {
            '@type': 'Place',
            address: job.location,
        },
    }

    // Escape < to prevent XSS via </script> injection
    const safeJsonLd = JSON.stringify(jsonLd).replace(/</g, '\\u003c')

    return (
        <div className="min-h-screen bg-muted/20">
            <script
                type="application/ld+json"
                nonce={nonce}
                dangerouslySetInnerHTML={{ __html: safeJsonLd }}
            />
            <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
                <div className="space-y-3">
                    <Link href="/jobs" className="text-sm text-primary hover:underline">
            Back to jobs
                    </Link>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight">{job.title}</h1>
                        <p className="text-muted-foreground">
                            {job.company} • {job.location} • {job.department?.name ?? 'General'} •{' '}
                            {job.employmentType.replaceAll('_', ' ')} • {job.workplaceType.replaceAll('_', ' ')}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {job.salaryMin || job.salaryMax ? (
                            <span className="rounded-full border px-3 py-1">
                Compensation: {job.salaryCurrency} {job.salaryMin ?? 0} - {job.salaryMax ?? 'Open'}
                            </span>
                        ) : null}
                        {job.expiresAt ? (
                            <span className="rounded-full border px-3 py-1">
                Apply by {new Date(job.expiresAt).toLocaleDateString()}
                            </span>
                        ) : null}
                    </div>
                    <Button asChild>
                        <Link href={`/jobs/${job.slug}/apply`}>Apply Now</Link>
                    </Button>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
                            {job.description}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Requirements</CardTitle>
                        </CardHeader>
                        <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
                            {job.requirements ?? 'Requirements will be shared during screening.'}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Benefits</CardTitle>
                        </CardHeader>
                        <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
                            {job.benefits ?? 'Benefits will be discussed during the process.'}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recruitment Pipeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                                {job.pipelineStages.map(stage => (
                                    <li key={stage.id} className="rounded-md border px-3 py-2">
                                        {stage.order}. {stage.name}
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
