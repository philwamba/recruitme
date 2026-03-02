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
    const { applications } = await getCandidates({
        status: status as any,
        jobId,
        search,
        page: page ? parseInt(page) : 1,
    })

    return <CandidatesTable candidates={applications} />
}
