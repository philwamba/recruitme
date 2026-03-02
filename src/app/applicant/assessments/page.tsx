import { submitAssessment } from '@/app/actions/enterprise'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function ApplicantAssessmentsPage() {
    const user = await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'MANAGE_SELF_PROFILE',
    })

    const submissions = await prisma.assessmentSubmission.findMany({
        where: { applicantUserId: user.id },
        include: {
            assessment: {
                include: {
                    application: {
                        include: { job: true },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Assessments</h1>
                <p className="text-muted-foreground">
          Complete assigned assessments and review submitted work and scoring history.
                </p>
            </div>
            <div className="grid gap-4">
                {submissions.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No assessments assigned yet.
                        </CardContent>
                    </Card>
                ) : (
                    submissions.map(submission => (
                        <Card key={submission.id}>
                            <CardHeader>
                                <CardTitle>{submission.assessment.title}</CardTitle>
                                <CardDescription>
                                    {submission.assessment.application.job.title} • {submission.assessment.status}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                    {submission.assessment.instructions}
                                </p>
                                <form action={submitAssessment} className="space-y-3">
                                    <input type="hidden" name="assessmentId" value={submission.assessmentId} />
                                    <label htmlFor={`response-${submission.id}`} className="sr-only">
                    Assessment response
                                    </label>
                                    <textarea
                                        id={`response-${submission.id}`}
                                        name="responseText"
                                        defaultValue={submission.responseText ?? ''}
                                        className="min-h-40 w-full rounded-md border px-3 py-2 text-sm"
                                        placeholder="Add your assessment response"
                                        aria-label="Assessment response"
                                    />
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>
                      Submitted:{' '}
                                            {submission.submittedAt
                                                ? new Date(submission.submittedAt).toLocaleString()
                                                : 'Not yet'}
                                        </span>
                                        <span>Score: {submission.score ?? 'Pending review'}</span>
                                    </div>
                                    <Button type="submit">Submit Response</Button>
                                </form>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
