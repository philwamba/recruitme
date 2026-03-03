'use client'

import { RefreshCw, Mail, Activity, Shield } from 'lucide-react'
import { EmptyState } from '@/components/ui/extended/empty-state'

export function NoOutboxJobsEmptyState() {
    return (
        <EmptyState
            icon={RefreshCw}
            title="No outbox jobs"
            description="No background jobs in the queue"
            variant="compact"
        />
    )
}

export function NoDeliveryLogsEmptyState() {
    return (
        <EmptyState
            icon={Mail}
            title="No delivery logs"
            description="No email delivery attempts yet"
            variant="compact"
        />
    )
}

export function NoAuditLogsEmptyState() {
    return (
        <EmptyState
            icon={Shield}
            title="No audit logs"
            description="No audit events recorded"
            variant="compact"
        />
    )
}

export function NoActivityLogsEmptyState() {
    return (
        <EmptyState
            icon={Activity}
            title="No activity logs"
            description="No user activity recorded"
            variant="compact"
        />
    )
}
