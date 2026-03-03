import { Suspense } from 'react'
import { ClipboardCheck, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminPageHeader, TableSkeleton, StatCardGridSkeleton } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AssessmentStatsCards } from './_components/stats-cards'

export const dynamic = 'force-dynamic'

export default async function AdminAssessmentsPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Assessments"
                description="Manage candidate assessments and evaluations"
                actions={
                    <Button disabled title="Action not yet implemented">
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Create Assessment
                    </Button>
                }
            />

            <Suspense fallback={<StatCardGridSkeleton count={4} />}>
                <StatsSection />
            </Suspense>

            <Suspense fallback={<TableSkeleton columns={6} rows={10} />}>
                <AssessmentsSection />
            </Suspense>
        </div>
    )
}

async function StatsSection() {
    const [assigned, pending, submitted, reviewed] = await Promise.all([
        prisma.assessment.count({
            where: { status: 'ASSIGNED' },
        }),
        prisma.assessmentSubmission.count({
            where: { submittedAt: null },
        }),
        prisma.assessmentSubmission.count({
            where: {
                submittedAt: { not: null },
                reviewedAt: null,
            },
        }),
        prisma.assessmentSubmission.count({
            where: { reviewedAt: { not: null } },
        }),
    ])

    return (
        <AssessmentStatsCards
            stats={{
                assigned,
                pending,
                submitted,
                reviewed,
            }}
        />
    )
}

async function AssessmentsSection() {
    const assessments = await prisma.assessment.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
            job: {
                select: {
                    title: true,
                },
            },
            application: {
                include: {
                    user: {
                        select: {
                            email: true,
                        },
                    },
                },
            },
            submissions: {
                select: {
                    id: true,
                    submittedAt: true,
                    reviewedAt: true,
                    score: true,
                },
            },
        },
    })

    if (assessments.length === 0) {
        return (
            <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                    No assessments have been created yet.
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Assessments</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {assessments.map(assessment => (
                        <div
                            key={assessment.id}
                            className="flex items-start justify-between rounded-lg border p-4"
                        >
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="font-medium">{assessment.title}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Job: {assessment.job?.title || 'N/A'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Candidate: {assessment.application.user.email}
                                </p>
                                {assessment.dueAt && (
                                    <p className="text-xs text-muted-foreground">
                                        Due: {new Date(assessment.dueAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium">
                                        {assessment.submissions.length} submission(s)
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Status: {assessment.status}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" disabled title="View details">
                                    View
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
