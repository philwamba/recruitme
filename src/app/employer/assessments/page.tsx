import { createAssessment, reviewAssessment } from '@/app/actions/enterprise'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function EmployerAssessmentsPage() {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const applications = await prisma.application.findMany({
        where:
      user.role === 'ADMIN'
          ? { status: { not: 'DRAFT' } }
          : {
              status: { not: 'DRAFT' },
              job: { createdByUserId: user.id },
          },
        include: {
            user: true,
            job: true,
            assessments: {
                include: { submissions: true },
                orderBy: { createdAt: 'desc' },
            },
        },
        orderBy: { updatedAt: 'desc' },
        take: 100,
    })

    return (
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Assessment Management</h1>
                <p className="text-muted-foreground">
          Assign candidate work, review submissions, and record structured scoring.
                </p>
            </div>
            <div className="grid gap-6">
                {applications.map(application => (
                    <Card key={application.id}>
                        <CardHeader>
                            <CardTitle>{application.job.title}</CardTitle>
                            <CardDescription>
                Candidate {application.user.email} • {application.trackingId}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 lg:grid-cols-2">
                            <form action={createAssessment} className="space-y-3 rounded-md border p-4">
                                <input type="hidden" name="applicationId" value={application.id} />
                                <p className="text-sm font-medium">Assign Assessment</p>
                                <input name="title" placeholder="Assessment title" className="w-full rounded-md border px-3 py-2 text-sm" />
                                <textarea name="instructions" placeholder="Instructions" className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" />
                                <input name="dueAt" type="datetime-local" className="w-full rounded-md border px-3 py-2 text-sm" />
                                <Button type="submit">Assign Assessment</Button>
                            </form>

                            <div className="space-y-4">
                                {application.assessments.map(assessment => (
                                    <div key={assessment.id} className="rounded-md border p-4">
                                        <p className="font-medium">{assessment.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {assessment.status} • Due{' '}
                                            {assessment.dueAt ? new Date(assessment.dueAt).toLocaleString() : 'Not set'}
                                        </p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                                            {assessment.instructions}
                                        </p>
                                        {assessment.submissions.map(submission => (
                                            <form key={submission.id} action={reviewAssessment} className="mt-4 space-y-3 rounded-md border p-3">
                                                <input type="hidden" name="submissionId" value={submission.id} />
                                                <p className="text-sm text-muted-foreground">
                          Submitted:{' '}
                                                    {submission.submittedAt
                                                        ? new Date(submission.submittedAt).toLocaleString()
                                                        : 'Awaiting response'}
                                                </p>
                                                <textarea
                                                    readOnly
                                                    value={submission.responseText ?? ''}
                                                    className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                                                />
                                                <input
                                                    name="score"
                                                    type="number"
                                                    min="1"
                                                    max="100"
                                                    defaultValue={submission.score ?? 75}
                                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                                />
                                                <textarea name="reviewerNotes" defaultValue={submission.reviewerNotes ?? ''} className="min-h-20 w-full rounded-md border px-3 py-2 text-sm" placeholder="Reviewer notes" />
                                                <Button type="submit" variant="outline">
                          Save Review
                                                </Button>
                                            </form>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
