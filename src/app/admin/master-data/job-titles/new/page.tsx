import { requireCurrentUser } from '@/lib/auth'
import { getActiveJobCategories } from '@/lib/admin/queries/job-categories'
import { getActiveRankGrades } from '@/lib/admin/queries/rank-grades'
import { AdminPageHeader } from '@/components/admin'
import { ROUTES } from '@/lib/constants/routes'
import { TitleForm } from '../_components/title-form'

export default async function NewJobTitlePage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const [categories, rankGrades] = await Promise.all([
        getActiveJobCategories(),
        getActiveRankGrades(),
    ])

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="New Job Title"
                description="Create a new job title"
                backHref={ROUTES.ADMIN.MASTER_DATA.JOB_TITLES}
            />
            <TitleForm categories={categories} rankGrades={rankGrades} />
        </div>
    )
}
