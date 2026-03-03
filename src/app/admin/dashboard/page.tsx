import { Suspense } from 'react'
import { requireCurrentUser } from '@/lib/auth'
import { AdminPageHeader, StatCardGridSkeleton, ChartSkeleton } from '@/components/admin'
import {
    getDashboardStats,
    getApplicationsOverTime,
    getPipelineDistribution,
    getRecentActivity,
    getUpcomingInterviews,
} from '@/lib/admin/queries/dashboard'
import {
    ApplicationsChart,
    PipelineChart,
    ActivityFeed,
    UpcomingInterviews,
} from '@/components/admin/charts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatsCards } from './_components/stats-cards'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'VIEW_ANALYTICS',
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Dashboard"
                description="Overview of your recruitment platform performance"
            />

            <Suspense fallback={<StatCardGridSkeleton count={6} className="lg:grid-cols-6 sm:grid-cols-3" />}>
                <StatsSection />
            </Suspense>

            <div className="grid gap-6 lg:grid-cols-2">
                <Suspense fallback={<ChartSkeleton />}>
                    <ApplicationsChartSection />
                </Suspense>
                <Suspense fallback={<ChartSkeleton />}>
                    <PipelineChartSection />
                </Suspense>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Suspense fallback={<ActivityFeedSkeleton />}>
                    <ActivitySection />
                </Suspense>
                <Suspense fallback={<InterviewsSkeleton />}>
                    <InterviewsSection />
                </Suspense>
            </div>
        </div>
    )
}

async function StatsSection() {
    const stats = await getDashboardStats()
    return <StatsCards stats={stats} />
}

async function ApplicationsChartSection() {
    const data = await getApplicationsOverTime(30)
    return <ApplicationsChart data={data} />
}

async function PipelineChartSection() {
    const data = await getPipelineDistribution()
    return <PipelineChart data={data} />
}

async function ActivitySection() {
    const activities = await getRecentActivity(10)
    return <ActivityFeed activities={activities} />
}

async function InterviewsSection() {
    const interviews = await getUpcomingInterviews(5)
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
