'use client'

import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { StatCard } from '@/components/ui/extended/stat-card'

interface InterviewStats {
    thisWeek: number
    scheduled: number
    completed: number
    pendingFeedback: number
}

interface StatsCardsProps {
    stats: InterviewStats
}

export function InterviewStatsCards({ stats }: StatsCardsProps) {
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
