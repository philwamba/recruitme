import { requireCurrentUser } from '@/lib/auth'
import { AdminPageHeader } from '@/components/admin'
import { ROUTES } from '@/lib/constants/routes'
import { CategoryForm } from '../_components/category-form'

export default async function NewJobCategoryPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="New Job Category"
                description="Create a new job classification category"
                backHref={ROUTES.ADMIN.MASTER_DATA.JOB_CATEGORIES}
            />
            <CategoryForm />
        </div>
    )
}
