import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Settings2 } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getPipelineData } from '@/lib/admin/queries/pipeline'
import { AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/lib/constants/routes'
import { PipelineBoard } from './_components/pipeline-board'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ jobId: string }>
}

export default async function PipelineKanbanPage({ params }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const { jobId } = await params
    const data = await getPipelineData(jobId)

    if (!data) {
        notFound()
    }

    const totalCandidates = data.stages.reduce(
        (sum, stage) => sum + stage.applications.length,
        0,
    ) + data.unassigned.length

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title={data.job.title}
                description={`Pipeline for ${data.job.company}`}
                backHref={ROUTES.ADMIN.PIPELINE}
                backLabel="Back to Jobs"
                actions={
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            {totalCandidates} candidates
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`${ROUTES.ADMIN.JOBS}/${data.job.id}/edit`}>
                                <Settings2 className="mr-2 h-4 w-4" />
                                Edit Pipeline
                            </Link>
                        </Button>
                    </div>
                }
            />

            <PipelineBoard stages={data.stages} jobId={data.job.id} />
        </div>
    )
}
