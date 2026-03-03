'use client'

import { Shield } from 'lucide-react'
import { EmptyState } from '@/components/ui/extended/empty-state'

export function NoRequestsEmptyState() {
    return (
        <EmptyState
            icon={Shield}
            title="No deletion requests"
            description="No data deletion requests have been submitted yet"
        />
    )
}
