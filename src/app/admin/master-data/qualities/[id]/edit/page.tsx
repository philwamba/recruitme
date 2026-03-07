import { notFound } from 'next/navigation'
import { requireCurrentUser } from '@/lib/auth'
import { getQualityById } from '@/lib/admin/queries/qualities'
import { AdminPageHeader } from '@/components/admin'
import { ROUTES } from '@/lib/constants/routes'
import { QualityForm } from '../../_components/quality-form'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditQualityPage({ params }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { id } = await params
    const quality = await getQualityById(id)

    if (!quality) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title={`Edit: ${quality.name}`}
                description="Update quality factor details"
                backHref={ROUTES.ADMIN.MASTER_DATA.QUALITIES}
            />
            <QualityForm quality={quality} />
        </div>
    )
}
