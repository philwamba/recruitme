import { notFound } from 'next/navigation'
import { requireCurrentUser } from '@/lib/auth'
import { getRankGradeById } from '@/lib/admin/queries/rank-grades'
import { AdminPageHeader } from '@/components/admin'
import { ROUTES } from '@/lib/constants/routes'
import { GradeForm } from '../../_components/grade-form'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditRankGradePage({ params }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { id } = await params
    const grade = await getRankGradeById(id)

    if (!grade) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title={`Edit: ${grade.name}`}
                description="Update rank grade details"
                backHref={ROUTES.ADMIN.MASTER_DATA.RANK_GRADES}
            />
            <GradeForm grade={grade} />
        </div>
    )
}
