import Link from 'next/link'
import { requireCurrentUser } from '@/lib/auth'
import { getJobsForPipelineSelect } from '@/lib/admin/queries/pipeline'
import { AdminPageHeader } from '@/components/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ROUTES } from '@/lib/constants/routes'

export const dynamic = 'force-dynamic'

export default async function PipelineSelectPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const jobs = await getJobsForPipelineSelect()

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Pipeline"
                description="Select a job to view its recruitment pipeline"
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                    <Link key={job.id} href={`${ROUTES.ADMIN.PIPELINE}/${job.id}`}>
                        <Card className="h-full transition-colors hover:bg-muted/50">
                            <CardHeader>
                                <CardTitle className="line-clamp-1">{job.title}</CardTitle>
                                <CardDescription>{job.company}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Badge variant="secondary">
                                    {job._count.applications} candidates
                                </Badge>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
                {jobs.length === 0 && (
                    <Card className="col-span-full">
                        <CardContent className="pt-6 text-center text-muted-foreground">
                            No jobs with candidates yet. Create and publish a job first.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
