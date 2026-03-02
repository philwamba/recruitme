import { EmploymentType, JobStatus, WorkplaceType } from '@prisma/client'
import { requireCurrentUser } from '@/lib/auth'
import { getEmployerJobs } from '@/lib/services/jobs'
import { createJob } from '@/app/actions/jobs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function EmployerJobsPage() {
  const user = await requireCurrentUser({
    roles: ['EMPLOYER', 'ADMIN'],
    permission: 'MANAGE_JOBS',
  })
  const jobs = await getEmployerJobs(user.id)

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Job Management</h1>
        <p className="text-muted-foreground">
          Create roles, publish them to the public job board, and monitor application volume.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Job</CardTitle>
          <CardDescription>
            Publishing a job automatically exposes it on the public jobs board.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createJob} className="grid gap-4 md:grid-cols-2">
            <input name="title" placeholder="Job title" className="rounded-md border px-3 py-2 text-sm" required />
            <input name="company" placeholder="Company" className="rounded-md border px-3 py-2 text-sm" required />
            <input name="location" placeholder="Location" className="rounded-md border px-3 py-2 text-sm" required />
            <input
              name="departmentName"
              placeholder="Department"
              className="rounded-md border px-3 py-2 text-sm"
              required
            />
            <textarea
              name="description"
              placeholder="Role overview"
              className="min-h-32 rounded-md border px-3 py-2 text-sm md:col-span-2"
              required
            />
            <textarea
              name="requirements"
              placeholder="Requirements"
              className="min-h-28 rounded-md border px-3 py-2 text-sm md:col-span-2"
              required
            />
            <textarea
              name="benefits"
              placeholder="Benefits"
              className="min-h-24 rounded-md border px-3 py-2 text-sm md:col-span-2"
            />
            <input name="salaryMin" type="number" placeholder="Salary min" className="rounded-md border px-3 py-2 text-sm" />
            <input name="salaryMax" type="number" placeholder="Salary max" className="rounded-md border px-3 py-2 text-sm" />
            <input
              name="salaryCurrency"
              defaultValue="USD"
              placeholder="Currency"
              className="rounded-md border px-3 py-2 text-sm"
            />
            <input name="expiresAt" type="date" className="rounded-md border px-3 py-2 text-sm" />
            <select name="employmentType" defaultValue={EmploymentType.FULL_TIME} className="rounded-md border px-3 py-2 text-sm">
              {Object.values(EmploymentType).map((option) => (
                <option key={option} value={option}>
                  {option.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
            <select name="workplaceType" defaultValue={WorkplaceType.ONSITE} className="rounded-md border px-3 py-2 text-sm">
              {Object.values(WorkplaceType).map((option) => (
                <option key={option} value={option}>
                  {option.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
            <select name="status" defaultValue={JobStatus.DRAFT} className="rounded-md border px-3 py-2 text-sm">
              {Object.values(JobStatus).map((option) => (
                <option key={option} value={option}>
                  {option.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
            <div className="md:col-span-2">
              <Button type="submit">Create Job</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle>{job.title}</CardTitle>
              <CardDescription>
                {job.department?.name ?? 'General'} • {job.status} • {job._count.applications} applications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{job.company} • {job.location}</p>
              <p>{job.employmentType.replaceAll('_', ' ')} • {job.workplaceType.replaceAll('_', ' ')}</p>
              <p>Slug: /jobs/{job.slug}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
