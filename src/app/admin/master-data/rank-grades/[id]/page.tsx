import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function RankGradeDetailPage({ params }: PageProps) {
    const { id } = await params
    redirect(`${ROUTES.ADMIN.MASTER_DATA.RANK_GRADES}/${id}/edit`)
}
