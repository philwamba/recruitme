import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getJobs } from '@/lib/admin/queries/jobs'
import { AdminPageHeader, TableSkeleton } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { JobsTable } from './_components/jobs-table'

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
    const { jobs } = await getJobs({
        status: status as any,
        departmentId: department,
        search,
        page: page ? parseInt(page) : 1,
    })

    return <JobsTable jobs={jobs} />
}
