'use client'

import * as React from 'react'
import {
  Briefcase,
  Clock,
  Eye,
  Star,
  XCircle,
  CheckCircle2,
} from 'lucide-react'
import { StatCard } from '@/components/ui/extended/stat-card'
import type { DashboardStats } from '@/types/profile'

interface StatsGridProps {
  stats: DashboardStats
  isLoading?: boolean
}

export function StatsGrid({ stats, isLoading = false }: StatsGridProps) {
  const statItems = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: Briefcase,
      variant: 'primary' as const,
    },
    {
      title: 'Pending',
      value: stats.pendingApplications,
      icon: Clock,
      variant: 'default' as const,
    },
    {
      title: 'Reviewing',
      value: stats.reviewingApplications,
      icon: Eye,
      variant: 'default' as const,
    },
    {
      title: 'Shortlisted',
      value: stats.shortlistedApplications,
      icon: Star,
      variant: 'warning' as const,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <StatCard
          key={item.title}
          title={item.title}
          value={item.value}
          icon={item.icon}
          variant={item.variant}
          isLoading={isLoading}
        />
      ))}
    </div>
  )
}
