import { notFound, redirect } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

interface PageProps {
    params: Promise<{ id: string }>
}

// For now, redirect detail view to edit page
// Can be expanded later to show category details with associated job titles
export default async function JobCategoryDetailPage({ params }: PageProps) {
    const { id } = await params
    redirect(`${ROUTES.ADMIN.MASTER_DATA.JOB_CATEGORIES}/${id}/edit`)
}
