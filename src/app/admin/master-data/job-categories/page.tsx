import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getJobCategories } from '@/lib/admin/queries/job-categories'
import { AdminPageHeader, TableSkeleton } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { CategoriesTable } from './_components/categories-table'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{
        search?: string
    }>
}

export default async function JobCategoriesPage({ searchParams }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const params = await searchParams

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Job Categories"
                description="Manage job classification categories"
                actions={
                    <Button asChild>
                        <Link href={`${ROUTES.ADMIN.MASTER_DATA.JOB_CATEGORIES}/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Link>
                    </Button>
                }
            />

            <Suspense fallback={<TableSkeleton columns={6} rows={10} />}>
                <CategoriesTableSection search={params.search} />
            </Suspense>
        </div>
    )
}

async function CategoriesTableSection({ search }: { search?: string }) {
    const { categories } = await getJobCategories({ search })
    return <CategoriesTable categories={categories} />
}
