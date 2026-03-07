import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getRankGrades } from '@/lib/admin/queries/rank-grades'
import { AdminPageHeader, TableSkeleton } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { GradesTable } from './_components/grades-table'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{
        search?: string
    }>
}

export default async function RankGradesPage({ searchParams }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const params = await searchParams

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Rank Grades"
                description="Manage salary grades and levels"
                actions={
                    <Button asChild>
                        <Link href={`${ROUTES.ADMIN.MASTER_DATA.RANK_GRADES}/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Grade
                        </Link>
                    </Button>
                }
            />

            <Suspense fallback={<TableSkeleton columns={7} rows={10} />}>
                <GradesTableSection search={params.search} />
            </Suspense>
        </div>
    )
}

async function GradesTableSection({ search }: { search?: string }) {
    const { grades } = await getRankGrades({ search })
    return <GradesTable grades={grades} />
}
