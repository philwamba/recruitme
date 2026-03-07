import { Suspense } from 'react'
import Link from 'next/link'
import { ApplicationStatus } from '@prisma/client'
import { Upload } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getCandidates, getCandidateFilterOptions } from '@/lib/admin/queries/candidates'
import { getSavedSearches } from '@/lib/admin/queries/saved-searches'
import { AdminPageHeader, TableSkeleton } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CandidatesTable } from './_components/candidates-table'
import { CandidateFilters } from './_components/candidate-filters'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{
        status?: string
        jobId?: string
        search?: string
        skills?: string | string[]
        tags?: string | string[]
        minRating?: string
        maxRating?: string
        location?: string
        appliedAfter?: string
        appliedBefore?: string
        hasDocuments?: string
        page?: string
    }>
}

export default async function AdminCandidatesPage({ searchParams }: PageProps) {
    const user = await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const params = await searchParams

    // Parse array parameters
    const skills = params.skills
        ? Array.isArray(params.skills)
            ? params.skills
            : [params.skills]
        : []
    const tags = params.tags
        ? Array.isArray(params.tags)
            ? params.tags
            : [params.tags]
        : []

    // Fetch filter options and saved searches
    const [filterOptions, rawSavedSearches] = await Promise.all([
        getCandidateFilterOptions(),
        getSavedSearches(user.id),
    ])

    // Map saved searches to ensure proper filter types
    const savedSearches = rawSavedSearches.map(search => ({
        id: search.id,
        name: search.name,
        filters: (search.filters ?? {}) as Record<string, unknown>,
        isPublic: search.isPublic,
        user: search.user,
    }))

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Candidates"
                description="View and manage all candidates across jobs"
                actions={
                    <Button asChild>
                        <Link href="/admin/candidates/import">
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                        </Link>
                    </Button>
                }
            />

            <Card>
                <CardContent className="pt-6">
                    <CandidateFilters
                        jobs={filterOptions.jobs}
                        tags={filterOptions.tags}
                        skills={filterOptions.skills}
                        savedSearches={savedSearches}
                        defaultValues={{
                            search: params.search ?? '',
                            status: params.status ?? '',
                            jobId: params.jobId ?? '',
                            skills,
                            tags,
                            minRating: params.minRating ?? '',
                            maxRating: params.maxRating ?? '',
                            location: params.location ?? '',
                            appliedAfter: params.appliedAfter ?? '',
                            appliedBefore: params.appliedBefore ?? '',
                            hasDocuments: params.hasDocuments ?? '',
                        }}
                    />
                </CardContent>
            </Card>

            <Suspense fallback={<TableSkeleton columns={6} rows={10} showAvatar />}>
                <CandidatesTableSection
                    status={params.status}
                    jobId={params.jobId}
                    search={params.search}
                    skills={skills}
                    tags={tags}
                    minRating={params.minRating}
                    maxRating={params.maxRating}
                    location={params.location}
                    appliedAfter={params.appliedAfter}
                    appliedBefore={params.appliedBefore}
                    hasDocuments={params.hasDocuments}
                    page={params.page}
                />
            </Suspense>
        </div>
    )
}

async function CandidatesTableSection({
    status,
    jobId,
    search,
    skills,
    tags,
    minRating,
    maxRating,
    location,
    appliedAfter,
    appliedBefore,
    hasDocuments,
    page,
}: {
    status?: string
    jobId?: string
    search?: string
    skills?: string[]
    tags?: string[]
    minRating?: string
    maxRating?: string
    location?: string
    appliedAfter?: string
    appliedBefore?: string
    hasDocuments?: string
    page?: string
}) {
    const validStatuses = Object.values(ApplicationStatus)
    const validatedStatus: ApplicationStatus | undefined =
        status && validStatuses.includes(status as ApplicationStatus)
            ? (status as ApplicationStatus)
            : undefined
    const pageNumber = page ? parseInt(page, 10) : 1
    const validatedPage = !isNaN(pageNumber) && pageNumber > 0 ? pageNumber : 1

    const { applications } = await getCandidates({
        status: validatedStatus,
        jobId,
        search,
        skills,
        tags,
        minRating: minRating ? Number(minRating) : undefined,
        maxRating: maxRating ? Number(maxRating) : undefined,
        location,
        appliedAfter,
        appliedBefore,
        hasDocuments: hasDocuments ? hasDocuments === 'true' : undefined,
        page: validatedPage,
    })

    return <CandidatesTable candidates={applications} />
}
