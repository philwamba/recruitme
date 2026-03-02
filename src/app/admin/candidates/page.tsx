import { Suspense } from 'react'
import { requireCurrentUser } from '@/lib/auth'
import { getCandidates } from '@/lib/admin/queries/candidates'
import { AdminPageHeader, TableSkeleton } from '@/components/admin'
import { CandidatesTable } from './_components/candidates-table'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{
        status?: string
        job?: string
        search?: string
        page?: string
    }>
}

export default async function AdminCandidatesPage({ searchParams }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const params = await searchParams

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Candidates"
                description="View and manage all candidates across jobs"
            />

            <Suspense fallback={<TableSkeleton columns={6} rows={10} showAvatar />}>
                <CandidatesTableSection
                    status={params.status}
                    jobId={params.job}
                    search={params.search}
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
    page,
}: {
    status?: string
    jobId?: string
    search?: string
    page?: string
}) {
    const validStatuses = [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'SHORTLISTED',
        'INTERVIEW_PHASE_1',
        'INTERVIEW_PHASE_2',
        'ASSESSMENT',
        'OFFER',
        'REJECTED',
        'HIRED',
        'WITHDRAWN',
    ]
    const validatedStatus = status && validStatuses.includes(status) ? status : undefined
    const pageNumber = page ? parseInt(page, 10) : 1
    const validatedPage = !isNaN(pageNumber) && pageNumber > 0 ? pageNumber : 1

    const { applications } = await getCandidates({
        status: validatedStatus as any,
        jobId,
        search,
        page: validatedPage,
    })

    return <CandidatesTable candidates={applications} />
}
