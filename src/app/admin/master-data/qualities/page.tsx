import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getQualities } from '@/lib/admin/queries/qualities'
import { AdminPageHeader, TableSkeleton } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { QualitiesTable } from './_components/qualities-table'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{
        search?: string
        category?: string
    }>
}

export default async function QualitiesPage({ searchParams }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const params = await searchParams

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Qualities & Factors"
                description="Manage evaluation criteria and competencies"
                actions={
                    <Button asChild>
                        <Link href={`${ROUTES.ADMIN.MASTER_DATA.QUALITIES}/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Quality
                        </Link>
                    </Button>
                }
            />

            <Suspense fallback={<TableSkeleton columns={6} rows={10} />}>
                <QualitiesTableSection search={params.search} category={params.category} />
            </Suspense>
        </div>
    )
}

async function QualitiesTableSection({
    search,
    category,
}: {
    search?: string
    category?: string
}) {
    const { qualities } = await getQualities({ search, category })
    return <QualitiesTable qualities={qualities} />
}
