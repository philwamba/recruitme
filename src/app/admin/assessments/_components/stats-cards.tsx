'use client'

import { ClipboardCheck, Clock, FileCheck, CheckCircle } from 'lucide-react'
import { StatCard } from '@/components/ui/extended/stat-card'

interface AssessmentStats {
    assigned: number
    pending: number
    submitted: number
    reviewed: number
}

interface StatsCardsProps {
    stats: AssessmentStats
}

export function AssessmentStatsCards({ stats }: StatsCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Assigned"
                value={stats.assigned}
                icon={ClipboardCheck}
                variant="primary"
                description="Total active"
            />
            <StatCard
                title="Pending"
                value={stats.pending}
                icon={Clock}
                variant="warning"
                description="Awaiting submission"
            />
            <StatCard
                title="Submitted"
                value={stats.submitted}
                icon={FileCheck}
                variant="info"
                description="Pending review"
            />
            <StatCard
                title="Reviewed"
                value={stats.reviewed}
                icon={CheckCircle}
                variant="success"
                description="Completed"
            />
        </div>
    )
}
