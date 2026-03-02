import Link from 'next/link'
import type { Metadata } from 'next'
import { EmploymentType, WorkplaceType } from '@prisma/client'
import { getPublishedJobs } from '@/lib/services/jobs'
import { jobSearchSchema } from '@/lib/validations/jobs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

  const search = jobSearchSchema.parse(normalized)
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
            <form className="grid gap-4 md:grid-cols-5">
              <input
                name="q"
                defaultValue={search.q}
                placeholder="Search roles or companies"
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
              <select
                name="department"
                defaultValue={search.department}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">All departments</option>
                {result.departments.map((department) => (
                  <option key={department.id} value={department.slug}>
                    {department.name}
                  </option>
                ))}
              </select>
              <select
                name="employmentType"
                defaultValue={search.employmentType ?? ''}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">All job types</option>
                {Object.values(EmploymentType).map((option) => (
                  <option key={option} value={option}>
                    {option.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
              <select
                name="workplaceType"
                defaultValue={search.workplaceType ?? ''}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">All workplace types</option>
                {Object.values(WorkplaceType).map((option) => (
                  <option key={option} value={option}>
                    {option.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  name="location"
                  defaultValue={search.location}
                  placeholder="Location"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
                <Button type="submit">Filter</Button>
              </div>
            </form>
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
            result.jobs.map((job) => (
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
                    Math.max(1, result.page - 1)
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
                    Math.min(result.totalPages, result.page + 1)
                  )}
                >
                  Next
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
