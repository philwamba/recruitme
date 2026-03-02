import { Suspense } from 'react'
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getInterviews, getInterviewStats } from '@/lib/admin/queries/interviews'
import { AdminPageHeader, TableSkeleton, StatCardGridSkeleton } from '@/components/admin'
import { StatCard } from '@/components/ui/extended/stat-card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InterviewsTable } from './_components/interviews-table'
import { InterviewsCalendar } from './_components/interviews-calendar'

export const dynamic = 'force-dynamic'

export default async function AdminInterviewsPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Interviews"
                description="Manage scheduled interviews and feedback"
                actions={
                    <Button>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Interview
                    </Button>
                }
            />

            <Suspense fallback={<StatCardGridSkeleton count={4} />}>
                <StatsSection />
            </Suspense>

            <Tabs defaultValue="list" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">List View</TabsTrigger>
                    <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    <Suspense fallback={<TableSkeleton columns={6} rows={10} showAvatar />}>
                        <InterviewsTableSection />
                    </Suspense>
                </TabsContent>

                <TabsContent value="calendar">
                    <Suspense fallback={<div className="h-[600px] bg-muted/30 animate-pulse rounded-lg" />}>
                        <InterviewsCalendarSection />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}

async function StatsSection() {
    const stats = await getInterviewStats()

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="This Week"
                value={stats.thisWeek}
                icon={Calendar}
                variant="primary"
                description="Scheduled"
            />
            <StatCard
                title="Upcoming"
                value={stats.scheduled}
                icon={Clock}
                variant="info"
                description="Total scheduled"
            />
            <StatCard
                title="Completed"
                value={stats.completed}
                icon={CheckCircle}
                variant="success"
            />
            <StatCard
                title="Pending Feedback"
                value={stats.pendingFeedback}
                icon={AlertCircle}
                variant={stats.pendingFeedback > 0 ? 'warning' : 'default'}
                description="Awaiting review"
            />
        </div>
    )
}

async function InterviewsTableSection() {
    const { interviews } = await getInterviews()
    return <InterviewsTable interviews={interviews} />
}

async function InterviewsCalendarSection() {
    const now = new Date()
    const { interviews } = await getInterviews({
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    })
    return <InterviewsCalendar interviews={interviews} />
}
