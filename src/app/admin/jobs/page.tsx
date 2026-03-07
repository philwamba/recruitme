import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { JobStatus } from '@prisma/client'
import { requireCurrentUser } from '@/lib/auth'
import { getJobs } from '@/lib/admin/queries/jobs'
import { AdminPageHeader, TableSkeleton } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { JobsTable } from './_components/jobs-table'
import { Pagination } from '@/components/ui/pagination'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{
        status?: string
        department?: string
        search?: string
        page?: string
    }>
}

export default async function AdminJobsPage({ searchParams }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const params = await searchParams

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Jobs"
                description="Manage job postings and recruitment pipelines"
                actions={
                    <Button asChild>
                        <Link href={`${ROUTES.ADMIN.JOBS}/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Job
                        </Link>
                    </Button>
                }
            />

            <Suspense fallback={<TableSkeleton columns={5} rows={10} />}>
                <JobsTableSection
                    status={params.status}
                    department={params.department}
                    search={params.search}
                    page={params.page}
                />
            </Suspense>
        </div>
    )
}

async function JobsTableSection({
    status,
    department,
    search,
    page,
}: {
    status?: string
    department?: string
    search?: string
    page?: string
}) {
    const validStatuses = Object.values(JobStatus)
    const validatedStatus: JobStatus | undefined =
        status && validStatuses.includes(status as JobStatus)
            ? (status as JobStatus)
            : undefined
    const pageNumber = page ? parseInt(page, 10) : 1
    const validatedPage = !isNaN(pageNumber) && pageNumber > 0 ? pageNumber : 1

    const { jobs, pageCount } = await getJobs({
        status: validatedStatus,
        departmentId: department,
        search,
        page: validatedPage,
    })

    return (
        <div className="space-y-4">
            <JobsTable jobs={jobs} />
            <Pagination page={validatedPage} totalPages={pageCount} />
        </div>
    )
}
