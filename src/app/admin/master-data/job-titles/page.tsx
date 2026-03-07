import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getJobTitles } from '@/lib/admin/queries/job-titles'
import { AdminPageHeader, TableSkeleton } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { TitlesTable } from './_components/titles-table'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{
        search?: string
        category?: string
    }>
}

export default async function JobTitlesPage({ searchParams }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const params = await searchParams

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Job Titles"
                description="Manage job title definitions"
                actions={
                    <Button asChild>
                        <Link href={`${ROUTES.ADMIN.MASTER_DATA.JOB_TITLES}/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Job Title
                        </Link>
                    </Button>
                }
            />

            <Suspense fallback={<TableSkeleton columns={7} rows={10} />}>
                <TitlesTableSection search={params.search} categoryId={params.category} />
            </Suspense>
        </div>
    )
}

async function TitlesTableSection({
    search,
    categoryId,
}: {
    search?: string
    categoryId?: string
}) {
    const { titles } = await getJobTitles({ search, categoryId })
    return <TitlesTable titles={titles} />
}
