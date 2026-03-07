import { requireCurrentUser } from '@/lib/auth'
import { AdminPageHeader } from '@/components/admin'
import { ROUTES } from '@/lib/constants/routes'
import { QualityForm } from '../_components/quality-form'

export default async function NewQualityPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="New Quality"
                description="Create a new evaluation quality factor"
                backHref={ROUTES.ADMIN.MASTER_DATA.QUALITIES}
            />
            <QualityForm />
        </div>
    )
}
