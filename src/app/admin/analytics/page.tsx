import { Suspense } from 'react'
import { Briefcase, Users, Clock, TrendingUp } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getRecruitmentAnalytics } from '@/lib/services/analytics'
import { AdminPageHeader, StatCardGridSkeleton, ChartSkeleton } from '@/components/admin'
import { StatCard } from '@/components/ui/extended/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const dynamic = 'force-dynamic'

type Analytics = Awaited<ReturnType<typeof getRecruitmentAnalytics>>

export default async function AdminAnalyticsPage() {
    await requireCurrentUser({
        roles: ['ADMIN', 'EMPLOYER'],
        permission: 'VIEW_ANALYTICS',
    })

    const analytics = await getRecruitmentAnalytics()

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Analytics"
                description="Monitor recruitment performance and conversion metrics"
            />

            <StatsSection analytics={analytics} />

            <div className="grid gap-6 lg:grid-cols-2">
                <ApplicationsPerJobSection analytics={analytics} />
                <StageConversionSection analytics={analytics} />
            </div>
        </div>
    )
}

function StatsSection({ analytics }: { analytics: Analytics }) {

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total Jobs"
                value={analytics.jobs}
                icon={Briefcase}
                variant="primary"
            />
            <StatCard
                title="Total Applications"
                value={analytics.totalApplications}
                icon={Users}
                variant="info"
            />
            <StatCard
                title="Avg Time to Hire"
                value={`${analytics.avgTimeToHireDays} days`}
                icon={Clock}
                variant="success"
            />
            <StatCard
                title="Conversion Rate"
                value={analytics.totalApplications > 0
                    ? `${Math.round((analytics.conversionByStage.HIRED || 0) / analytics.totalApplications * 100)}%`
                    : '0%'
                }
                icon={TrendingUp}
                variant="primary"
                description="Applications to hire"
            />
        </div>
    )
}

function ApplicationsPerJobSection({ analytics }: { analytics: Analytics }) {

    const maxCount = Math.max(...analytics.applicationsPerJob.map(j => j.count), 1)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Applications Per Job</CardTitle>
                <CardDescription>Distribution of applications across active jobs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {analytics.applicationsPerJob.length === 0 ? (
                    <p className="text-muted-foreground">No jobs with applications yet.</p>
                ) : (
                    analytics.applicationsPerJob.slice(0, 10).map(job => (
                        <div key={job.id} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium truncate max-w-[200px]">{job.title}</span>
                                <span className="text-muted-foreground">{job.count}</span>
                            </div>
                            <Progress value={(job.count / maxCount) * 100} className="h-2" />
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}

function StageConversionSection({ analytics }: { analytics: Analytics }) {

    const stageLabels: Record<string, string> = {
        SUBMITTED: 'Submitted',
        UNDER_REVIEW: 'Under Review',
        SHORTLISTED: 'Shortlisted',
        INTERVIEW_PHASE_1: 'Interview 1',
        INTERVIEW_PHASE_2: 'Interview 2',
        ASSESSMENT: 'Assessment',
        OFFER: 'Offer',
        HIRED: 'Hired',
        REJECTED: 'Rejected',
    }

    const stages = Object.entries(analytics.conversionByStage)
        .filter(([stage]) => stage !== 'DRAFT' && stage !== 'WITHDRAWN')
        .sort((a, b) => {
            const order = Object.keys(stageLabels)
            return order.indexOf(a[0]) - order.indexOf(b[0])
        })

    const maxCount = Math.max(...stages.map(([, count]) => count as number), 1)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pipeline Stages</CardTitle>
                <CardDescription>Applications by current stage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {stages.map(([stage, count]) => (
                    <div key={stage} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{stageLabels[stage] || stage}</span>
                            <span className="text-muted-foreground">{count as number}</span>
                        </div>
                        <Progress
                            value={((count as number) / maxCount) * 100}
                            className="h-2"
                        />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
