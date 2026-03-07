import { requireCurrentUser } from '@/lib/auth'
import { getOrganizationsForSelect } from '@/lib/admin/queries/organizations'
import { getJobCategoriesForSelect } from '@/lib/admin/queries/job-categories'
import { AdminPageHeader } from '@/components/admin'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'
import { JobRequestForm } from '../_components/job-request-form'

export default async function NewJobRequestPage() {
    await requireCurrentUser({
        roles: ['ADMIN', 'EMPLOYER'],
        permission: 'MANAGE_JOBS',
    })

    const [organizations, categories] = await Promise.all([
        getOrganizationsForSelect(),
        getJobCategoriesForSelect(),
    ])

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="New Job Request"
                description="Create a new job position request"
                backHref={ROUTES.ADMIN.JOB_REQUESTS}
                backLabel="Back to Job Requests"
            />

            <Card>
                <CardContent className="pt-6">
                    <JobRequestForm
                        organizations={organizations}
                        categories={categories}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
