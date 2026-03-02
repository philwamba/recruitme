import { requireCurrentUser } from '@/lib/auth'
import { getRecruitmentAnalytics } from '@/lib/services/analytics'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
    await requireCurrentUser({
        roles: ['ADMIN', 'EMPLOYER'],
        permission: 'VIEW_ANALYTICS',
    })

    const analytics = await getRecruitmentAnalytics()

    return (
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Recruitment Analytics</h1>
                <p className="text-muted-foreground">
          Monitor application volume, stage conversion, and average time-to-hire.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Jobs</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">{analytics.jobs}</CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Total Applications</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">{analytics.totalApplications}</CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Average Time To Hire</CardTitle>
                    </CardHeader>
                    <CardContent className="text-3xl font-semibold">{analytics.avgTimeToHireDays} days</CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Applications Per Job</CardTitle>
                    <CardDescription>Latest job volume snapshot</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    {analytics.applicationsPerJob.map(job => (
                        <div key={job.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                            <span>{job.title} ({job.company})</span>
                            <span>{job.count}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Stage Conversion</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 md:grid-cols-2">
                    {Object.entries(analytics.conversionByStage).map(([stage, count]) => (
                        <div key={stage} className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
                            {stage}: {count}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
