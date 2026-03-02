'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/extended/empty-state'
import { ROUTES } from '@/lib/constants/routes'

interface Interview {
    id: string
    title: string
    scheduledAt: Date
    durationMinutes: number
    candidateName: string
    jobTitle: string
}

interface UpcomingInterviewsProps {
    interviews: Interview[]
}

export function UpcomingInterviews({ interviews }: UpcomingInterviewsProps) {
    if (interviews.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Interviews</CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={Calendar}
                        title="No interviews scheduled"
                        description="Schedule interviews with candidates to see them here"
                        variant="compact"
                    />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Interviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {interviews.map((interview) => (
                    <Link
                        key={interview.id}
                        href={`${ROUTES.ADMIN.INTERVIEWS}/${interview.id}`}
                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    >
                        <div className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center rounded bg-primary/10 text-primary">
                            <span className="text-xs font-medium">
                                {format(new Date(interview.scheduledAt), 'MMM')}
                            </span>
                            <span className="text-sm font-bold">
                                {format(new Date(interview.scheduledAt), 'd')}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {interview.candidateName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {interview.jobTitle}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(interview.scheduledAt), 'h:mm a')} ({interview.durationMinutes}min)
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </CardContent>
        </Card>
    )
}
