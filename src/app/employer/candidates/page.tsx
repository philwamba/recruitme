import Link from 'next/link'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  addApplicationNote,
  addApplicationRating,
  addApplicationTag,
  moveApplicationStage,
} from '@/app/actions/applications'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/extended/status-badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

// Form action wrappers that discard return values
async function handleMoveStage(formData: FormData) {
  'use server'
  await moveApplicationStage(formData)
}

async function handleAddNote(formData: FormData) {
  'use server'
  await addApplicationNote(formData)
}

async function handleAddTag(formData: FormData) {
  'use server'
  await addApplicationTag(formData)
}

async function handleAddRating(formData: FormData) {
  'use server'
  await addApplicationRating(formData)
}

export default async function EmployerCandidatesPage() {
  const user = await requireCurrentUser({
    roles: ['EMPLOYER', 'ADMIN'],
    permission: 'MANAGE_APPLICATIONS',
  })

  const applications = await prisma.application.findMany({
    where:
      user.role === 'ADMIN'
        ? undefined
        : {
            job: {
              createdByUserId: user.id,
            },
          },
    include: {
      job: {
        include: {
          department: true,
          pipelineStages: {
            orderBy: { order: 'asc' },
          },
        },
      },
      user: true,
      currentStage: true,
      documents: true,
      notes: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { author: true },
      },
      tags: {
        include: { tag: true },
      },
      ratings: {
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
      stageEvents: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          fromStage: true,
          toStage: true,
          changedBy: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Candidate Management</h1>
          <p className="text-muted-foreground">
            Review applications, move candidates through the pipeline, and capture evaluation data.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/api/employer/candidates/export">Export CSV</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {applications.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No applications are available yet.
            </CardContent>
          </Card>
        ) : (
          applications.map((application) => (
            <Card key={application.id}>
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <CardTitle>{application.job.title}</CardTitle>
                  <CardDescription>
                    Candidate: {application.user.email} • Tracking ID: {application.trackingId}
                  </CardDescription>
                  <p className="text-sm text-muted-foreground">
                    {application.job.company} • {application.job.department?.name ?? 'General'}
                  </p>
                </div>
                <StatusBadge status={application.status} />
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <p className="text-sm font-medium">Cover Letter</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {application.coverLetter || 'No cover letter provided.'}
                    </p>
                  </div>

                  <div className="rounded-md border p-4">
                    <p className="text-sm font-medium">Candidate Timeline</p>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {application.stageEvents.map((event) => (
                        <div key={event.id} className="rounded-md border px-3 py-2">
                          <p>
                            {event.fromStage?.name ?? 'Start'} → {event.toStage?.name ?? 'Unassigned'}
                          </p>
                          <p>
                            {new Date(event.createdAt).toLocaleString()} by{' '}
                            {event.changedBy?.email ?? 'System'}
                          </p>
                          {event.note ? <p>{event.note}</p> : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <p className="text-sm font-medium">Recent Notes</p>
                    <div className="mt-3 space-y-2">
                      {application.notes.map((note) => (
                        <div key={note.id} className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
                          <p>{note.body}</p>
                          <p className="mt-1 text-xs">
                            {note.author.email} • {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-md border p-4">
                    <p className="text-sm font-medium">Current Stage</p>
                    <form action={handleMoveStage} className="mt-3 space-y-3">
                      <input type="hidden" name="applicationId" value={application.id} />
                      <select
                        name="stageId"
                        defaultValue={application.currentStageId ?? application.job.pipelineStages[0]?.id}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      >
                        {application.job.pipelineStages.map((stage) => (
                          <option key={stage.id} value={stage.id}>
                            {stage.order}. {stage.name}
                          </option>
                        ))}
                      </select>
                      <textarea
                        name="note"
                        placeholder="Optional stage movement note"
                        className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                      />
                      <Button type="submit" className="w-full">
                        Move Stage
                      </Button>
                    </form>
                  </div>

                  <div className="rounded-md border p-4">
                    <p className="text-sm font-medium">Add Note</p>
                    <form action={handleAddNote} className="mt-3 space-y-3">
                      <input type="hidden" name="applicationId" value={application.id} />
                      <textarea
                        name="body"
                        placeholder="Internal hiring note"
                        className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                      />
                      <Button type="submit" variant="outline" className="w-full">
                        Save Note
                      </Button>
                    </form>
                  </div>

                  <div className="rounded-md border p-4">
                    <p className="text-sm font-medium">Add Tag</p>
                    <form action={handleAddTag} className="mt-3 space-y-3">
                      <input type="hidden" name="applicationId" value={application.id} />
                      <input
                        name="tagName"
                        placeholder="Tag name"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                      <input
                        name="tagColor"
                        placeholder="Color (optional)"
                        className="w-full rounded-md border px-3 py-2 text-sm"
                      />
                      <Button type="submit" variant="outline" className="w-full">
                        Save Tag
                      </Button>
                    </form>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {application.tags.map(({ tag }) => (
                        <span key={tag.id} className="rounded-full border px-2 py-1">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <p className="text-sm font-medium">Rate Candidate</p>
                    <form action={handleAddRating} className="mt-3 space-y-3">
                      <input type="hidden" name="applicationId" value={application.id} />
                      <select name="score" defaultValue="3" className="w-full rounded-md border px-3 py-2 text-sm">
                        {[1, 2, 3, 4, 5].map((score) => (
                          <option key={score} value={score}>
                            {score} / 5
                          </option>
                        ))}
                      </select>
                      <textarea
                        name="comment"
                        placeholder="Optional rating comment"
                        className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                      />
                      <Button type="submit" variant="outline" className="w-full">
                        Save Rating
                      </Button>
                    </form>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {application.ratings.map((rating) => (
                        <div key={rating.id} className="rounded-md border px-3 py-2">
                          <p>Score: {rating.score} / 5</p>
                          {rating.comment ? <p>{rating.comment}</p> : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-md border p-4">
                    <p className="text-sm font-medium">Documents</p>
                    <div className="mt-3 space-y-2 text-sm">
                      {application.documents.map((document) => (
                        <a
                          key={document.id}
                          href={`/api/documents/${document.id}/download`}
                          className="block rounded-md border px-3 py-2 text-primary hover:underline"
                        >
                          {document.originalFileName}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
