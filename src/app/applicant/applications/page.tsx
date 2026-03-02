import Link from 'next/link'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StatusBadge } from '@/components/ui/extended/status-badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function ApplicantApplicationsPage() {
    const user = await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'VIEW_APPLICANT_DASHBOARD',
    })

    const applications = await prisma.application.findMany({
        where: { userId: user.id },
        include: {
            job: {
                include: {
                    department: true,
                },
            },
            currentStage: true,
            documents: true,
        },
        orderBy: { updatedAt: 'desc' },
        take: 50,
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">My Applications</h1>
                <p className="text-muted-foreground">
          Track draft and submitted applications, document uploads, and current pipeline stage.
                </p>
            </div>

            <div className="grid gap-4">
                {applications.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-sm text-muted-foreground">
              You have not started any applications yet.
                        </CardContent>
                    </Card>
                ) : (
                    applications.map(application => (
                        <Card key={application.id}>
                            <CardHeader className="flex flex-row items-start justify-between gap-4">
                                <div>
                                    <CardTitle>{application.job.title}</CardTitle>
                                    <CardDescription>
                                        {application.job.company} • {application.job.location} • {application.trackingId}
                                    </CardDescription>
                                </div>
                                <StatusBadge status={application.status} />
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <p>Current stage: {application.currentStage?.name ?? 'Not assigned yet'}</p>
                                <p>Documents attached: {application.documents.length}</p>
                                <p>Last updated: {new Date(application.updatedAt).toLocaleString()}</p>
                                <div className="flex gap-3">
                                    <Button asChild variant="outline">
                                        <Link href={`/jobs/${application.job.slug}`}>View Job</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href={`/jobs/${application.job.slug}/apply`}>
                                            {application.status === 'DRAFT' ? 'Continue Draft' : 'View Submission'}
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
