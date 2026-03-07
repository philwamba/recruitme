import { Briefcase, Plus } from 'lucide-react'
import { EmploymentType, JobStatus, WorkplaceType } from '@prisma/client'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getEmployerJobs } from '@/lib/services/jobs'
import { createJob } from '@/app/actions/jobs'
import { EmployerPageHeader } from '@/components/employer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/admin'

export const dynamic = 'force-dynamic'

export default async function EmployerJobsPage() {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    // Fetch data in parallel
    const [jobs, departments, existingJobs] = await Promise.all([
        getEmployerJobs(user.id),
        prisma.department.findMany({ orderBy: { name: 'asc' } }),
        prisma.job.findMany({
            where: { createdByUserId: user.id },
            select: { company: true, location: true },
        }),
    ])

    // Get distinct companies and locations
    const companies = [...new Set(existingJobs.map(j => j.company).filter(Boolean))]
    const locations = [...new Set(existingJobs.map(j => j.location).filter(Boolean))] as string[]

    return (
        <div className="space-y-6">
            <EmployerPageHeader
                title="Job Management"
                description="Create roles, publish them to the public job board, and monitor application volume"
            />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Create Job
                    </CardTitle>
                    <CardDescription>
                        Publishing a job automatically exposes it on the public jobs board.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={createJob} className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="title">Job Title *</Label>
                            <Input id="title" name="title" placeholder="e.g., Senior Software Engineer" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company">Company *</Label>
                            <Input
                                id="company"
                                name="company"
                                list="companies-list"
                                placeholder="Enter or select company"
                                required
                            />
                            <datalist id="companies-list">
                                {companies.map(company => (
                                    <option key={company} value={company} />
                                ))}
                            </datalist>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location *</Label>
                            <Input
                                id="location"
                                name="location"
                                list="locations-list"
                                placeholder="Enter or select location"
                                required
                            />
                            <datalist id="locations-list">
                                {locations.map(location => (
                                    <option key={location} value={location} />
                                ))}
                            </datalist>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="departmentName">Department *</Label>
                            <Input
                                id="departmentName"
                                name="departmentName"
                                list="departments-list"
                                placeholder="Enter or select department"
                                required
                            />
                            <datalist id="departments-list">
                                {departments.map(department => (
                                    <option key={department.id} value={department.name} />
                                ))}
                            </datalist>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Role Overview *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe the role, responsibilities, and what makes it exciting..."
                                className="min-h-32"
                                required
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="requirements">Requirements *</Label>
                            <Textarea
                                id="requirements"
                                name="requirements"
                                placeholder="List the required skills, experience, and qualifications..."
                                className="min-h-28"
                                required
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="benefits">Benefits</Label>
                            <Textarea
                                id="benefits"
                                name="benefits"
                                placeholder="Describe the benefits, perks, and what you offer..."
                                className="min-h-24"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="salaryMin">Salary Min</Label>
                            <Input id="salaryMin" name="salaryMin" type="number" placeholder="e.g., 50000" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="salaryMax">Salary Max</Label>
                            <Input id="salaryMax" name="salaryMax" type="number" placeholder="e.g., 80000" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="salaryCurrency">Currency</Label>
                            <Input id="salaryCurrency" name="salaryCurrency" defaultValue="USD" placeholder="USD" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expiresAt">Expires At</Label>
                            <Input id="expiresAt" name="expiresAt" type="date" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="employmentType">Employment Type</Label>
                            <select
                                id="employmentType"
                                name="employmentType"
                                defaultValue={EmploymentType.FULL_TIME}
                                className="h-9 w-full cursor-pointer rounded-md border bg-background px-3 py-2 text-sm"
                            >
                                {Object.values(EmploymentType).map(option => (
                                    <option key={option} value={option}>
                                        {option.replaceAll('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="workplaceType">Workplace Type</Label>
                            <select
                                id="workplaceType"
                                name="workplaceType"
                                defaultValue={WorkplaceType.ONSITE}
                                className="h-9 w-full cursor-pointer rounded-md border bg-background px-3 py-2 text-sm"
                            >
                                {Object.values(WorkplaceType).map(option => (
                                    <option key={option} value={option}>
                                        {option.replaceAll('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                name="status"
                                defaultValue={JobStatus.DRAFT}
                                className="h-9 w-full cursor-pointer rounded-md border bg-background px-3 py-2 text-sm"
                            >
                                {Object.values(JobStatus).map(option => (
                                    <option key={option} value={option}>
                                        {option.replaceAll('_', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <Button type="submit">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Job
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {jobs.length === 0 ? (
                <EmptyState
                    icon={Briefcase}
                    title="No jobs yet"
                    description="Create your first job posting to start receiving applications."
                />
            ) : (
                <div className="grid gap-4">
                    {jobs.map(job => (
                        <Card key={job.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle>{job.title}</CardTitle>
                                        <CardDescription>
                                            {job.department?.name ?? 'General'} • {job._count.applications} applications
                                        </CardDescription>
                                    </div>
                                    <Badge variant={job.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                        {job.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>{job.company} • {job.location}</p>
                                <p>{job.employmentType.replaceAll('_', ' ')} • {job.workplaceType.replaceAll('_', ' ')}</p>
                                <p className="text-xs">Slug: /jobs/{job.slug}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
