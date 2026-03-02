import { Recommendation } from '@prisma/client'
import { createInterview, submitInterviewFeedback } from '@/app/actions/enterprise'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function EmployerInterviewsPage() {
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
            interviews: {
                include: {
                    participants: true,
                    feedbacks: true,
                },
                orderBy: { scheduledAt: 'asc' },
            },
        },
        orderBy: { updatedAt: 'desc' },
    })

    return (
        <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Interview Management</h1>
                <p className="text-muted-foreground">
          Schedule interviews, add panelists, and capture structured interviewer feedback.
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
                            <form action={createInterview} className="space-y-3 rounded-md border p-4">
                                <input type="hidden" name="applicationId" value={application.id} />
                                <p className="text-sm font-medium">Schedule Interview</p>
                                <input name="title" placeholder="Interview title" className="w-full rounded-md border px-3 py-2 text-sm" />
                                <input name="scheduledAt" type="datetime-local" className="w-full rounded-md border px-3 py-2 text-sm" />
                                <input name="durationMinutes" type="number" defaultValue={60} className="w-full rounded-md border px-3 py-2 text-sm" />
                                <input name="timezone" defaultValue="UTC" className="w-full rounded-md border px-3 py-2 text-sm" />
                                <input name="location" placeholder="Location" className="w-full rounded-md border px-3 py-2 text-sm" />
                                <input name="meetingUrl" placeholder="Meeting URL" className="w-full rounded-md border px-3 py-2 text-sm" />
                                <input name="participantEmails" placeholder="panel1@example.com, panel2@example.com" className="w-full rounded-md border px-3 py-2 text-sm" />
                                <textarea name="notes" placeholder="Scheduling notes" className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" />
                                <Button type="submit">Create Interview</Button>
                            </form>

                            <div className="space-y-4">
                                {application.interviews.map(interview => (
                                    <div key={interview.id} className="rounded-md border p-4">
                                        <p className="font-medium">{interview.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(interview.scheduledAt).toLocaleString()} • {interview.timezone} •{' '}
                                            {interview.status}
                                        </p>
                                        <p className="mt-2 text-sm text-muted-foreground">
                      Participants: {interview.participants.map(participant => participant.email).join(', ') || 'None'}
                                        </p>
                                        <form action={submitInterviewFeedback} className="mt-4 space-y-3">
                                            <input type="hidden" name="interviewId" value={interview.id} />
                                            <input type="hidden" name="applicationId" value={application.id} />
                                            <select name="score" defaultValue="3" className="w-full rounded-md border px-3 py-2 text-sm">
                                                {[1, 2, 3, 4, 5].map(score => (
                                                    <option key={score} value={score}>
                                                        {score} / 5
                                                    </option>
                                                ))}
                                            </select>
                                            <select name="recommendation" defaultValue={Recommendation.MAYBE} className="w-full rounded-md border px-3 py-2 text-sm">
                                                {Object.values(Recommendation).map(option => (
                                                    <option key={option} value={option}>
                                                        {option.replaceAll('_', ' ')}
                                                    </option>
                                                ))}
                                            </select>
                                            <textarea name="comments" placeholder="Feedback comments" className="min-h-24 w-full rounded-md border px-3 py-2 text-sm" />
                                            <Button type="submit" variant="outline">
                        Save Feedback
                                            </Button>
                                        </form>
                                        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                            {interview.feedbacks.map(feedback => (
                                                <div key={feedback.id} className="rounded-md border px-3 py-2">
                          Score {feedback.score}/5 • {feedback.recommendation.replaceAll('_', ' ')}
                                                </div>
                                            ))}
                                        </div>
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
