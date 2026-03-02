import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getPublishedJobBySlug } from '@/lib/services/jobs'
import { saveApplicationDraft, submitApplication } from '@/app/actions/applications'
import { GoogleAuthButton } from '@/components/auth/google-auth-button'
import { LinkedInAuthButton } from '@/components/auth/linkedin-auth-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export const dynamic = 'force-dynamic'

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const job = await getPublishedJobBySlug(slug)

  if (!job) {
    notFound()
  }

  const user = await getCurrentUser()

  if (!user) {
    const nextPath = `/jobs/${job.slug}/apply`

    return (
      <div className="min-h-screen bg-muted/20">
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
          <div className="space-y-2">
            <Link href={`/jobs/${job.slug}`} className="text-sm text-primary hover:underline">
              Back to role
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">Apply for {job.title}</h1>
            <p className="text-muted-foreground">
              Sign in first to start your application. LinkedIn sign-in will return you directly to this role.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Start your application</CardTitle>
              <CardDescription>
                Use LinkedIn for a faster application entry, or continue with your RecruitMe account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <GoogleAuthButton nextPath={nextPath} label="Apply with Google" />
                <LinkedInAuthButton nextPath={nextPath} label="Apply with LinkedIn" />
              </div>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/sign-in?next=${encodeURIComponent(nextPath)}`}>Sign in with email</Link>
              </Button>
              <Button asChild className="w-full">
                <Link href={`/sign-up?next=${encodeURIComponent(nextPath)}`}>Create account to apply</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (user.role !== 'APPLICANT') {
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
                <Label htmlFor="coverLetter">Cover letter</Label>
                <Textarea
                  id="coverLetter"
                  name="coverLetter"
                  rows={8}
                  defaultValue={existingApplication?.coverLetter ?? ''}
                  placeholder="Summarize why you are a strong fit for this role."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Application source</Label>
                <input
                  id="source"
                  name="source"
                  defaultValue={existingApplication?.source ?? 'Website'}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvFile" required>CV</Label>
                <input id="cvFile" name="cvFile" type="file" accept=".pdf,.doc,.docx" className="w-full text-sm" />
                <p className="text-xs text-muted-foreground">Required for final submission, optional for drafts.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportingDocuments">Supporting documents</Label>
                <input
                  id="supportingDocuments"
                  name="supportingDocuments"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="w-full text-sm"
                />
              </div>

              <label className="flex items-start gap-3 rounded-md border p-3 text-sm text-muted-foreground">
                <input name="consentAccepted" type="checkbox" value="true" defaultChecked={Boolean(existingApplication?.consentAcceptedAt)} required />
                <span>
                  I consent to RecruitMe storing and processing my candidate data for this application. <span className="text-destructive">*</span>
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
