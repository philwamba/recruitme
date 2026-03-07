import Link from 'next/link'
import type { Metadata } from 'next'
import { getPublishedJobs } from '@/lib/services/jobs'
import { jobSearchSchema, type JobSearchInput } from '@/lib/validations/jobs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { JobFilters } from './_components/job-filters'

export const metadata: Metadata = {
    title: 'Jobs | RecruitMe',
    description: 'Browse open roles across departments, locations, and workplace types.',
}

export const dynamic = 'force-dynamic'

function buildPageHref(search: Record<string, string>, page: number) {
    const params = new URLSearchParams(search)
    params.set('page', String(page))
    return `/jobs?${params.toString()}`
}

export default async function JobsPage({
    searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
    const raw = await searchParams
    const normalized = {
        q: typeof raw.q === 'string' ? raw.q : '',
        department: typeof raw.department === 'string' ? raw.department : '',
        employmentType: typeof raw.employmentType === 'string' ? raw.employmentType : undefined,
        workplaceType: typeof raw.workplaceType === 'string' ? raw.workplaceType : undefined,
        location: typeof raw.location === 'string' ? raw.location : '',
        page: typeof raw.page === 'string' ? raw.page : '1',
    }

    const parsed = jobSearchSchema.safeParse(normalized)
    const search: JobSearchInput = parsed.success
        ? parsed.data
        : {
            q: '',
            department: '',
            employmentType: undefined,
            workplaceType: undefined,
            location: '',
            page: 1,
        }
    const result = await getPublishedJobs(search)

    return (
        <div className="min-h-screen bg-muted/20">
            <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold tracking-tight">Open Roles</h1>
                    <p className="text-muted-foreground">
            Search published positions by keyword, department, location, and work style.
                    </p>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <JobFilters
                            departments={result.departments}
                            locations={result.locations.filter((loc): loc is string => loc !== null)}
                            defaultValues={{
                                q: search.q,
                                department: search.department,
                                employmentType: search.employmentType ?? '',
                                workplaceType: search.workplaceType ?? '',
                                location: search.location,
                            }}
                        />
                    </CardContent>
                </Card>

                <div className="grid gap-4">
                    {result.jobs.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No published jobs matched the current filters.
                            </CardContent>
                        </Card>
                    ) : (
                        result.jobs.map(job => (
                            <Card key={job.id}>
                                <CardHeader>
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                        <div className="space-y-1">
                                            <CardTitle>{job.title}</CardTitle>
                                            <CardDescription>
                                                {job.company} • {job.location} • {job.workplaceType.replaceAll('_', ' ')}
                                            </CardDescription>
                                        </div>
                                        <Button asChild>
                                            <Link href={`/jobs/${job.slug}`}>View Role</Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                        <span className="rounded-full border px-2 py-1">
                                            {job.department?.name ?? 'General'}
                                        </span>
                                        <span className="rounded-full border px-2 py-1">
                                            {job.employmentType.replaceAll('_', ' ')}
                                        </span>
                                        {job.salaryMin || job.salaryMax ? (
                                            <span className="rounded-full border px-2 py-1">
                                                {job.salaryCurrency} {job.salaryMin ?? 0} - {job.salaryMax ?? 'Open'}
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="line-clamp-3 text-sm text-muted-foreground">{job.description}</p>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {result.totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Showing page {result.page} of {result.totalPages}
                        </p>
                        <div className="flex gap-2">
                            {result.page <= 1 ? (
                                <Button variant="outline" disabled>
                                    Previous
                                </Button>
                            ) : (
                                <Button asChild variant="outline">
                                    <Link
                                        href={buildPageHref(
                                            {
                                                ...normalized,
                                                employmentType: normalized.employmentType ?? '',
                                                workplaceType: normalized.workplaceType ?? '',
                                            },
                                            Math.max(1, result.page - 1),
                                        )}
                                    >
                                        Previous
                                    </Link>
                                </Button>
                            )}
                            {result.page >= result.totalPages ? (
                                <Button variant="outline" disabled>
                                    Next
                                </Button>
                            ) : (
                                <Button asChild variant="outline">
                                    <Link
                                        href={buildPageHref(
                                            {
                                                ...normalized,
                                                employmentType: normalized.employmentType ?? '',
                                                workplaceType: normalized.workplaceType ?? '',
                                            },
                                            Math.min(result.totalPages, result.page + 1),
                                        )}
                                    >
                                        Next
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
