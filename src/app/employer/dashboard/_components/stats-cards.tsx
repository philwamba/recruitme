'use client'

import {
    Briefcase,
    Users,
    Calendar,
    Clock,
    CheckCircle,
    TrendingUp,
} from 'lucide-react'
import { StatCard } from '@/components/ui/extended/stat-card'

interface DashboardStats {
    activeJobs: number
    jobsTrend: number
    totalCandidates: number
    candidatesTrend: number
    interviewsThisWeek: number
    pendingReviews: number
    hiredCount: number
    offerAcceptanceRate: number
}

interface StatsCardsProps {
    stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
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
