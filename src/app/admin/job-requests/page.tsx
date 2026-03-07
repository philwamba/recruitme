import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { JobRequestStatus } from '@prisma/client'
import { requireCurrentUser } from '@/lib/auth'
import { getJobRequests } from '@/lib/admin/queries/job-requests'
import { AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { JobRequestsTable } from './_components/job-requests-table'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{
        status?: string
        page?: string
    }>
}

export default async function JobRequestsPage({ searchParams }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN', 'EMPLOYER'],
        permission: 'MANAGE_JOBS',
    })

    const params = await searchParams
    const { jobRequests } = await getJobRequests({
        status: params.status as JobRequestStatus | undefined,
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Job Requests"
                description="Manage job position requests and approvals"
                actions={
                    <Button asChild>
                        <Link href={`${ROUTES.ADMIN.JOB_REQUESTS}/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Request
                        </Link>
                    </Button>
                }
            />

            <JobRequestsTable jobRequests={jobRequests} />
        </div>
    )
}
