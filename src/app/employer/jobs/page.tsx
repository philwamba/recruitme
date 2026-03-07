import { Plus } from 'lucide-react'
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
import { NoJobsEmptyState } from '../_components/empty-states'

export const dynamic = 'force-dynamic'

export default async function EmployerJobsPage() {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    // Fetch data in parallel
    const [jobs, departments, companies, locations] = await Promise.all([
        getEmployerJobs(user.id),
        prisma.department.findMany({ orderBy: { name: 'asc' } }),
        prisma.company.findMany({ orderBy: { name: 'asc' } }),
        prisma.location.findMany({ orderBy: { name: 'asc' } }),
    ])

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
                            <Label htmlFor="title">Job Title<span className="text-destructive ml-1">*</span></Label>
                            <Input id="title" name="title" placeholder="e.g., Senior Software Engineer" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company">Company<span className="text-destructive ml-1">*</span></Label>
                            {companies.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No companies yet.{' '}
                                    <a href="/employer/settings/companies" className="text-primary hover:underline">
                                        Create one first
                                    </a>
                                </p>
                            ) : (
                                <select
                                    id="company"
                                    name="company"
                                    required
                                    className="h-9 w-full cursor-pointer rounded-md border bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Select a company</option>
                                    {companies.map(company => (
                                        <option key={company.id} value={company.name}>
                                            {company.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location<span className="text-destructive ml-1">*</span></Label>
                            {locations.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No locations yet.{' '}
                                    <a href="/employer/settings/locations" className="text-primary hover:underline">
                                        Create one first
                                    </a>
                                </p>
                            ) : (
                                <select
                                    id="location"
                                    name="location"
                                    required
                                    className="h-9 w-full cursor-pointer rounded-md border bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Select a location</option>
                                    {locations.map(location => (
                                        <option key={location.id} value={location.name}>
                                            {location.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="departmentName">Department<span className="text-destructive ml-1">*</span></Label>
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
                            <Label htmlFor="description">Role Overview<span className="text-destructive ml-1">*</span></Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe the role, responsibilities, and what makes it exciting..."
                                className="min-h-32"
                                required
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="requirements">Requirements<span className="text-destructive ml-1">*</span></Label>
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
                <NoJobsEmptyState />
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
