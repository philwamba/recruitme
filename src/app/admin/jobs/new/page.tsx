import { requireCurrentUser } from '@/lib/auth'
import { getDepartments } from '@/lib/admin/queries/jobs'
import { getActivePipelineTemplates } from '@/lib/admin/queries/pipeline-templates'
import { AdminPageHeader } from '@/components/admin'
import { ROUTES } from '@/lib/constants/routes'
import { JobForm } from '../_components/job-form'

export const dynamic = 'force-dynamic'

export default async function NewJobPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const [departments, pipelineTemplates] = await Promise.all([
        getDepartments(),
        getActivePipelineTemplates(),
    ])

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Create Job"
                description="Create a new job posting"
                backHref={ROUTES.ADMIN.JOBS}
                backLabel="Back to Jobs"
            />

            <JobForm departments={departments} pipelineTemplates={pipelineTemplates} />
        </div>
    )
}
