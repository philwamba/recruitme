import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import {
    Pencil,
    Users,
    Calendar,
    MapPin,
    Building,
    Clock,
    DollarSign,
    ExternalLink,
    MoreHorizontal,
} from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getJobById, getJobStats } from '@/lib/admin/queries/jobs'
import { AdminPageHeader, DetailSkeleton, StatCardGridSkeleton } from '@/components/admin'
import { StatCard } from '@/components/ui/extended/stat-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ jobId: string }>
}

const statusStyles = {
    DRAFT: 'bg-muted text-muted-foreground',
    PUBLISHED: 'bg-success/10 text-success',
    CLOSED: 'bg-warning/10 text-warning',
    ARCHIVED: 'bg-muted text-muted-foreground',
}

const employmentTypeLabels = {
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
    TEMPORARY: 'Temporary',
}

const workplaceTypeLabels = {
    REMOTE: 'Remote',
    HYBRID: 'Hybrid',
    ONSITE: 'On-site',
}

export default async function JobDetailPage({ params }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_JOBS',
    })

    const { jobId } = await params
    const job = await getJobById(jobId)

    if (!job) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title={job.title}
                description={job.company}
                backHref={ROUTES.ADMIN.JOBS}
                backLabel="Back to Jobs"
                actions={
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link href={`${ROUTES.ADMIN.JOBS}/${job.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href={`${ROUTES.ADMIN.PIPELINE}/${job.id}`}>
                                View Pipeline
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem disabled title="Action not yet implemented">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    View Public Page
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled title="Action not yet implemented">Duplicate Job</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {job.status === 'PUBLISHED' && (
                                    <DropdownMenuItem disabled title="Action not yet implemented">Close Job</DropdownMenuItem>
                                )}
                                {job.status === 'DRAFT' && (
                                    <DropdownMenuItem disabled title="Action not yet implemented">Publish Job</DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-destructive" disabled title="Action not yet implemented">
                                    Delete Job
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                }
            />

            {/* Status badges */}
            <div className="flex flex-wrap items-center gap-2">
                <Badge className={cn('font-medium', statusStyles[job.status])}>
                    {job.status}
                </Badge>
                <Badge variant="outline">{employmentTypeLabels[job.employmentType]}</Badge>
                <Badge variant="outline">{workplaceTypeLabels[job.workplaceType]}</Badge>
                {job.department && (
                    <Badge variant="secondary">{job.department.name}</Badge>
                )}
            </div>

            {/* Stats */}
            <Suspense fallback={<StatCardGridSkeleton count={4} />}>
                <JobStatsSection jobId={job.id} />
            </Suspense>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="applications">
                        Applications ({job._count.applications})
                    </TabsTrigger>
                    <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Job details */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Job Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="prose prose-sm max-w-none dark:prose-invert"
                                    dangerouslySetInnerHTML={{ __html: job.description }}
                                />
                            </CardContent>
                        </Card>

                        <div className="space-y-6">
                            {/* Quick info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Job Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {job.location && (
                                        <div className="flex items-start gap-3">
                                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Location</p>
                                                <p className="text-sm text-muted-foreground">{job.location}</p>
                                            </div>
                                        </div>
                                    )}
                                    {(job.salaryMin || job.salaryMax) && (
                                        <div className="flex items-start gap-3">
                                            <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Salary</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {job.salaryMin && job.salaryMax
                                                        ? `${job.salaryCurrency || '$'}${job.salaryMin.toLocaleString()} - ${job.salaryCurrency || '$'}${job.salaryMax.toLocaleString()}`
                                                        : job.salaryMin
                                                            ? `From ${job.salaryCurrency || '$'}${job.salaryMin.toLocaleString()}`
                                                            : `Up to ${job.salaryCurrency || '$'}${job.salaryMax?.toLocaleString()}`
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Type</p>
                                            <p className="text-sm text-muted-foreground">
                                                {employmentTypeLabels[job.employmentType]}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Workplace</p>
                                            <p className="text-sm text-muted-foreground">
                                                {workplaceTypeLabels[job.workplaceType]}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Created</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(job.createdAt), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Requirements */}
                            {job.requirements && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Requirements</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div
                                            className="prose prose-sm max-w-none dark:prose-invert"
                                            dangerouslySetInnerHTML={{ __html: job.requirements }}
                                        />
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="applications">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground">
                                Applications list will be shown here. Click &quot;View Pipeline&quot; for the kanban view.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pipeline">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pipeline Stages</CardTitle>
                            <CardDescription>
                                Configure the recruitment stages for this job
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {job.pipelineStages.length > 0 ? (
                                <div className="space-y-2">
                                    {job.pipelineStages.map((stage, index) => (
                                        <div
                                            key={stage.id}
                                            className="flex items-center gap-3 rounded-lg border p-3"
                                        >
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                                                {index + 1}
                                            </span>
                                            <span className="font-medium">{stage.name}</span>
                                            {stage.isDefault && (
                                                <Badge variant="secondary" className="ml-auto">
                                                    Default
                                                </Badge>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">
                                    No pipeline stages configured yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground">
                                Job settings and configuration will be shown here.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

async function JobStatsSection({ jobId }: { jobId: string }) {
    const stats = await getJobStats(jobId)

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total Applications"
                value={stats.totalApplications}
                icon={Users}
                variant="primary"
            />
            <StatCard
                title="New"
                value={stats.newApplications}
                icon={Clock}
                variant={stats.newApplications > 0 ? 'warning' : 'default'}
                description="Awaiting review"
            />
            <StatCard
                title="In Interview"
                value={stats.interviewed}
                icon={Calendar}
                variant="info"
            />
            <StatCard
                title="Hired"
                value={stats.hired}
                icon={Users}
                variant="success"
            />
        </div>
    )
}
