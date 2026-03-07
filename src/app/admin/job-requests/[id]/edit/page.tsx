import { notFound } from 'next/navigation'
import { requireCurrentUser } from '@/lib/auth'
import { getJobRequestById } from '@/lib/admin/queries/job-requests'
import { getOrganizationsForSelect } from '@/lib/admin/queries/organizations'
import { getJobCategoriesForSelect } from '@/lib/admin/queries/job-categories'
import { AdminPageHeader } from '@/components/admin'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'
import { JobRequestForm } from '../../_components/job-request-form'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditJobRequestPage({ params }: PageProps) {
    const user = await requireCurrentUser({
        roles: ['ADMIN', 'EMPLOYER'],
        permission: 'MANAGE_JOBS',
    })

    const { id } = await params
    const [jobRequest, organizations, categories] = await Promise.all([
        getJobRequestById(id),
        getOrganizationsForSelect(),
        getJobCategoriesForSelect(),
    ])

    if (!jobRequest) {
        notFound()
    }

    // Employers can only edit their own job requests
    if (user.role !== 'ADMIN' && jobRequest.requestedById !== user.id) {
        notFound()
    }

    if (jobRequest.status !== 'DRAFT' && jobRequest.status !== 'REJECTED') {
        notFound()
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Edit Job Request"
                description={`Update ${jobRequest.requestNumber}`}
                backHref={`${ROUTES.ADMIN.JOB_REQUESTS}/${id}`}
                backLabel="Back to Request"
            />

            <Card>
                <CardContent className="pt-6">
                    <JobRequestForm
                        jobRequest={jobRequest}
                        organizations={organizations}
                        categories={categories}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
