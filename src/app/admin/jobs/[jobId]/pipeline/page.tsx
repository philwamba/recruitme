import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'
import { JobPipelineForm } from './_components/job-pipeline-form'

interface PageProps {
    params: Promise<{ jobId: string }>
}

export default async function EditJobPipelinePage({ params }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { jobId } = await params

    const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: {
            id: true,
            title: true,
            pipelineStages: {
                orderBy: { order: 'asc' },
            },
        },
    })

    if (!job) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Edit Pipeline"
                description={`Customize hiring stages for "${job.title}"`}
                actions={
                    <Button variant="ghost" asChild>
                        <Link href={`${ROUTES.ADMIN.PIPELINE}/${jobId}`}>
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Pipeline Board
                        </Link>
                    </Button>
                }
            />

            <JobPipelineForm
                jobId={job.id}
                jobTitle={job.title}
                stages={job.pipelineStages}
            />
        </div>
    )
}
