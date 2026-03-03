import { Suspense } from 'react'
import {
    Briefcase,
    Users,
    Calendar,
    Clock,
    CheckCircle,
    TrendingUp,
} from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { EmployerPageHeader } from '@/components/employer'
import { StatCard } from '@/components/ui/extended/stat-card'
import {
    getEmployerDashboardStats,
    getEmployerApplicationsOverTime,
    getEmployerPipelineDistribution,
    getEmployerRecentActivity,
    getEmployerUpcomingInterviews,
} from '@/lib/employer/queries/dashboard'
import {
    ApplicationsChart,
    PipelineChart,
    ActivityFeed,
    UpcomingInterviews,
} from '@/components/admin/charts'
import { ChartSkeleton, StatCardGridSkeleton } from '@/components/admin/skeletons'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export const dynamic = 'force-dynamic'

export default async function EmployerDashboardPage() {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    return (
        <div className="space-y-6">
            <EmployerPageHeader
                title="Dashboard"
                description="Overview of your recruitment activities"
            />

            <Suspense fallback={<StatCardGridSkeleton count={6} className="lg:grid-cols-6 sm:grid-cols-3" />}>
                <StatsSection userId={user.id} />
            </Suspense>

            <div className="grid gap-6 lg:grid-cols-2">
                <Suspense fallback={<ChartSkeleton />}>
                    <ApplicationsChartSection userId={user.id} />
                </Suspense>
                <Suspense fallback={<ChartSkeleton />}>
                    <PipelineChartSection userId={user.id} />
                </Suspense>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Suspense fallback={<ActivityFeedSkeleton />}>
                    <ActivitySection userId={user.id} />
                </Suspense>
                <Suspense fallback={<InterviewsSkeleton />}>
                    <InterviewsSection userId={user.id} />
                </Suspense>
            </div>
        </div>
    )
}

async function StatsSection({ userId }: { userId: string }) {
    const stats = await getEmployerDashboardStats(userId)

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
                title="Active Jobs"
                value={stats.activeJobs}
                icon={Briefcase}
                variant="primary"
                trend={stats.jobsTrend !== 0 ? {
                    value: Math.abs(stats.jobsTrend),
                    direction: stats.jobsTrend > 0 ? 'up' : 'down',
                } : undefined}
            />
            <StatCard
                title="Applications"
                value={stats.totalCandidates}
                icon={Users}
                variant="info"
                description="Last 30 days"
                trend={stats.candidatesTrend !== 0 ? {
                    value: Math.abs(stats.candidatesTrend),
                    direction: stats.candidatesTrend > 0 ? 'up' : 'down',
                } : undefined}
            />
            <StatCard
                title="Interviews"
                value={stats.interviewsThisWeek}
                icon={Calendar}
                variant="success"
                description="This week"
            />
            <StatCard
                title="Pending Review"
                value={stats.pendingReviews}
                icon={Clock}
                variant={stats.pendingReviews > 5 ? 'warning' : 'default'}
                description="Awaiting action"
            />
            <StatCard
                title="Hired"
                value={stats.hiredCount}
                icon={CheckCircle}
                variant="success"
                description="Last 30 days"
            />
            <StatCard
                title="Offer Rate"
                value={`${stats.offerAcceptanceRate}%`}
                icon={TrendingUp}
                variant="primary"
                description="Acceptance rate"
            />
        </div>
    )
}

async function ApplicationsChartSection({ userId }: { userId: string }) {
    const data = await getEmployerApplicationsOverTime(userId, 30)
    return <ApplicationsChart data={data} />
}

async function PipelineChartSection({ userId }: { userId: string }) {
    const data = await getEmployerPipelineDistribution(userId)
    return <PipelineChart data={data} />
}

async function ActivitySection({ userId }: { userId: string }) {
    const activities = await getEmployerRecentActivity(userId, 10)
    return <ActivityFeed activities={activities} />
}

async function InterviewsSection({ userId }: { userId: string }) {
    const interviews = await getEmployerUpcomingInterviews(userId, 5)
    return <UpcomingInterviews interviews={interviews} />
}

function ActivityFeedSkeleton() {
    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

function InterviewsSkeleton() {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                        <Skeleton className="h-10 w-10 rounded" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
