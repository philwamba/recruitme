'use client'

import { Briefcase, Users, Clock, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/ui/extended/stat-card'

interface AnalyticsStats {
    jobs: number
    totalApplications: number
    avgTimeToHireDays: number
    conversionRate: string
}

interface StatsCardsProps {
    stats: AnalyticsStats
}

export function AnalyticsStatsCards({ stats }: StatsCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total Jobs"
                value={stats.jobs}
                icon={Briefcase}
                variant="primary"
            />
            <StatCard
                title="Total Applications"
                value={stats.totalApplications}
                icon={Users}
                variant="info"
            />
            <StatCard
                title="Avg Time to Hire"
                value={`${stats.avgTimeToHireDays} days`}
                icon={Clock}
                variant="success"
            />
            <StatCard
                title="Conversion Rate"
                value={stats.conversionRate}
                icon={TrendingUp}
                variant="primary"
                description="Applications to hire"
            />
        </div>
    )
}
