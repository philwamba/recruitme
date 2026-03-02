import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireCurrentUser } from '@/lib/auth'
import { getPublishedJobBySlug } from '@/lib/services/jobs'
import { saveApplicationDraft, submitApplication } from '@/app/actions/applications'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

export const dynamic = 'force-dynamic'

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const user = await requireCurrentUser({
    roles: ['APPLICANT'],
    permission: 'MANAGE_SELF_PROFILE',
  })
  const job = await getPublishedJobBySlug(slug)

  if (!job) {
    notFound()
  }

  const existingApplication = await prisma.application.findUnique({
    where: {
      userId_jobId: {
        userId: user.id,
        jobId: job.id,
      },
    },
    include: {
      documents: true,
    },
  })

  const saveDraftAction = saveApplicationDraft.bind(null, job.id)
  const submitAction = submitApplication.bind(null, job.id)

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="space-y-2">
          <Link href={`/jobs/${job.slug}`} className="text-sm text-primary hover:underline">
            Back to role
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">Apply for {job.title}</h1>
          <p className="text-muted-foreground">
            Complete your application, upload your CV, and save a draft if you need to come back.
          </p>
          {existingApplication ? (
            <p className="text-sm text-muted-foreground">
              Existing application: {existingApplication.trackingId} ({existingApplication.status})
            </p>
          ) : null}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Form</CardTitle>
            <CardDescription>
              CV upload is required for a complete submission. Supporting documents are optional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cover letter</label>
                <Textarea
                  name="coverLetter"
                  rows={8}
                  defaultValue={existingApplication?.coverLetter ?? ''}
                  placeholder="Summarize why you are a strong fit for this role."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Application source</label>
                <input
                  name="source"
                  defaultValue={existingApplication?.source ?? 'Website'}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">CV</label>
                <input name="cvFile" type="file" accept=".pdf,.doc,.docx" className="w-full text-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Supporting documents</label>
                <input
                  name="supportingDocuments"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="w-full text-sm"
                />
              </div>

              <label className="flex items-start gap-3 rounded-md border p-3 text-sm text-muted-foreground">
                <input name="consentAccepted" type="checkbox" value="true" defaultChecked={Boolean(existingApplication?.consentAcceptedAt)} />
                <span>
                  I consent to RecruitMe storing and processing my candidate data for this application.
                </span>
              </label>

              <div className="flex flex-wrap gap-3">
                <Button formAction={saveDraftAction} type="submit" variant="outline">
                  Save Draft
                </Button>
                <Button formAction={submitAction} type="submit">
                  Submit Application
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
