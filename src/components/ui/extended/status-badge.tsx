'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
    Clock,
    Eye,
    Star,
    XCircle,
    CheckCircle2,
    FileEdit,
    CalendarClock,
    ClipboardCheck,
    Handshake,
    Ban,
    LucideIcon,
} from 'lucide-react'
import type { ApplicationStatus } from '@/types/profile'

interface StatusConfig {
  label: string
  icon: LucideIcon
  className: string
}

const statusConfigs: Record<ApplicationStatus, StatusConfig> = {
    DRAFT: {
        label: 'Draft',
        icon: FileEdit,
        className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    },
    SUBMITTED: {
        label: 'Submitted',
        icon: Clock,
        className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    },
    UNDER_REVIEW: {
        label: 'Under Review',
        icon: Eye,
        className: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    },
    SHORTLISTED: {
        label: 'Shortlisted',
        icon: Star,
        className: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
    },
    INTERVIEW_PHASE_1: {
        label: 'Interview 1',
        icon: CalendarClock,
        className: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800',
    },
    INTERVIEW_PHASE_2: {
        label: 'Interview 2',
        icon: CalendarClock,
        className: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800',
    },
    ASSESSMENT: {
        label: 'Assessment',
        icon: ClipboardCheck,
        className: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800',
    },
    OFFER: {
        label: 'Offer',
        icon: Handshake,
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    },
    REJECTED: {
        label: 'Rejected',
        icon: XCircle,
        className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    },
    HIRED: {
        label: 'Hired',
        icon: CheckCircle2,
        className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    },
    WITHDRAWN: {
        label: 'Withdrawn',
        icon: Ban,
        className: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800',
    },
}

interface StatusBadgeProps {
  status: ApplicationStatus
  showIcon?: boolean
  size?: 'sm' | 'default'
  className?: string
}

export function StatusBadge({
    status,
    showIcon = true,
    size = 'default',
    className,
}: StatusBadgeProps) {
    const config = statusConfigs[status]
    const Icon = config.icon

    return (
        <Badge
            variant="outline"
            className={cn(
                'inline-flex items-center gap-1 font-medium',
                config.className,
                size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1',
                className,
            )}
        >
            {showIcon && (
                <Icon className={cn('flex-shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
            )}
            {config.label}
        </Badge>
    )
}

// Helper function to get status label
export function getStatusLabel(status: ApplicationStatus): string {
    return statusConfigs[status].label
}

// Helper function to get status color class
export function getStatusColorClass(status: ApplicationStatus): string {
    return statusConfigs[status].className
}
