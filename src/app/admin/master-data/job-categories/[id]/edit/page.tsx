import { notFound } from 'next/navigation'
import { requireCurrentUser } from '@/lib/auth'
import { getJobCategoryById } from '@/lib/admin/queries/job-categories'
import { AdminPageHeader } from '@/components/admin'
import { ROUTES } from '@/lib/constants/routes'
import { CategoryForm } from '../../_components/category-form'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditJobCategoryPage({ params }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { id } = await params
    const category = await getJobCategoryById(id)

    if (!category) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title={`Edit: ${category.name}`}
                description="Update job category details"
                backHref={ROUTES.ADMIN.MASTER_DATA.JOB_CATEGORIES}
            />
            <CategoryForm category={category} />
        </div>
    )
}
