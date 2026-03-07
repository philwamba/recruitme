'use client'

import { Briefcase, ClipboardList, CalendarCheck } from 'lucide-react'
import { EmptyState } from '@/components/ui/extended/empty-state'

export function NoJobsEmptyState() {
    return (
        <EmptyState
            icon={Briefcase}
            title="No jobs yet"
            description="Create your first job posting to start receiving applications."
        />
    )
}

export function NoApplicationsForAssessmentsEmptyState() {
    return (
        <EmptyState
            icon={ClipboardList}
            title="No applications yet"
            description="Once candidates apply to your jobs, you can assign and manage assessments here."
        />
    )
}

export function NoApplicationsForInterviewsEmptyState() {
    return (
        <EmptyState
            icon={CalendarCheck}
            title="No applications yet"
            description="Once candidates apply to your jobs, you can schedule and manage interviews here."
        />
    )
}
