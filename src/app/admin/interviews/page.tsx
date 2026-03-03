import { Suspense } from 'react'
import { endOfMonth } from 'date-fns'
import { Calendar } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getInterviews, getInterviewStats } from '@/lib/admin/queries/interviews'
import { AdminPageHeader, TableSkeleton, StatCardGridSkeleton } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InterviewsTable } from './_components/interviews-table'
import { InterviewsCalendar } from './_components/interviews-calendar'
import { InterviewStatsCards } from './_components/stats-cards'

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
                    <Button disabled title="Action not yet implemented">
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
    return <InterviewStatsCards stats={stats} />
}

async function InterviewsTableSection() {
    const { interviews } = await getInterviews()
    return <InterviewsTable interviews={interviews} />
}

async function InterviewsCalendarSection() {
    const now = new Date()
    const { interviews } = await getInterviews({
        startDate: new Date(now.getFullYear(), now.getMonth(), 1),
        endDate: endOfMonth(new Date(now.getFullYear(), now.getMonth())),
    })
    return <InterviewsCalendar interviews={interviews} />
}
