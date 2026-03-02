import { notFound } from 'next/navigation'
import { requireCurrentUser } from '@/lib/auth'
import { getJobById, getDepartments } from '@/lib/admin/queries/jobs'
import { AdminPageHeader } from '@/components/admin'
import { ROUTES } from '@/lib/constants/routes'
import { JobForm } from '../../_components/job-form'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ jobId: string }>
}

export default async function EditJobPage({ params }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { jobId } = await params
    const [job, departments] = await Promise.all([
        getJobById(jobId),
        getDepartments(),
    ])

    if (!job) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Edit Job"
                description={`Editing "${job.title}"`}
                backHref={`${ROUTES.ADMIN.JOBS}/${job.id}`}
                backLabel="Back to Job"
            />

            <JobForm job={job} departments={departments} />
        </div>
    )
}
