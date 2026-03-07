import { notFound } from 'next/navigation'
import { requireCurrentUser } from '@/lib/auth'
import { getJobTitleById } from '@/lib/admin/queries/job-titles'
import { getActiveJobCategories } from '@/lib/admin/queries/job-categories'
import { getActiveRankGrades } from '@/lib/admin/queries/rank-grades'
import { AdminPageHeader } from '@/components/admin'
import { ROUTES } from '@/lib/constants/routes'
import { TitleForm } from '../../_components/title-form'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditJobTitlePage({ params }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { id } = await params
    const [title, categories, rankGrades] = await Promise.all([
        getJobTitleById(id),
        getActiveJobCategories(),
        getActiveRankGrades(),
    ])

    if (!title) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title={`Edit: ${title.name}`}
                description="Update job title details"
                backHref={ROUTES.ADMIN.MASTER_DATA.JOB_TITLES}
            />
            <TitleForm title={title} categories={categories} rankGrades={rankGrades} />
        </div>
    )
}
