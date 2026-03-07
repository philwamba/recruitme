import { requireCurrentUser } from '@/lib/auth'
import { AdminPageHeader } from '@/components/admin'
import { ROUTES } from '@/lib/constants/routes'
import { GradeForm } from '../_components/grade-form'

export default async function NewRankGradePage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="New Rank Grade"
                description="Create a new salary grade level"
                backHref={ROUTES.ADMIN.MASTER_DATA.RANK_GRADES}
            />
            <GradeForm />
        </div>
    )
}
