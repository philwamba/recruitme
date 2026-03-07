import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function PipelineTemplateDetailPage({ params }: PageProps) {
    const { id } = await params
    redirect(`${ROUTES.ADMIN.CONFIG.PIPELINE_TEMPLATES}/${id}/edit`)
}
