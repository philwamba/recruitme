import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getPipelineTemplates } from '@/lib/admin/queries/pipeline-templates'
import { AdminPageHeader, TableSkeleton } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { PipelineTemplatesTable } from './_components/pipeline-templates-table'

export const dynamic = 'force-dynamic'

interface PageProps {
    searchParams: Promise<{
        search?: string | string[]
    }>
}

export default async function PipelineTemplatesPage({ searchParams }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const params = await searchParams
    const search = Array.isArray(params.search) ? params.search[0] : params.search

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Pipeline Templates"
                description="Manage reusable hiring pipeline configurations"
                actions={
                    <Button asChild>
                        <Link href={`${ROUTES.ADMIN.CONFIG.PIPELINE_TEMPLATES}/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Template
                        </Link>
                    </Button>
                }
            />

            <Suspense fallback={<TableSkeleton columns={6} rows={10} />}>
                <TemplatesTableSection search={search} />
            </Suspense>
        </div>
    )
}

async function TemplatesTableSection({ search }: { search?: string }) {
    const { templates } = await getPipelineTemplates({ search })
    return <PipelineTemplatesTable templates={templates} />
}
