'use client'

import * as React from 'react'
import Link from 'next/link'
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { InterviewStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'

interface Interview {
    id: string
    title: string
    scheduledAt: Date
    durationMinutes: number
    status: InterviewStatus
    application: {
        user: {
            email: string
            applicantProfile: {
                firstName: string | null
                lastName: string | null
            } | null
        }
        job: {
            title: string
        }
    }
}

interface InterviewsCalendarProps {
    interviews: Interview[]
}

export function InterviewsCalendar({ interviews }: InterviewsCalendarProps) {
    const [currentDate, setCurrentDate] = React.useState(new Date())

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    const interviewsByDate = React.useMemo(() => {
        const map = new Map<string, Interview[]>()
        for (const interview of interviews) {
            const dateKey = format(new Date(interview.scheduledAt), 'yyyy-MM-dd')
            const existing = map.get(dateKey) || []
            existing.push(interview)
            map.set(dateKey, existing)
        }
        return map
    }, [interviews])

    const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const goToToday = () => setCurrentDate(new Date())

    return (
        <Card>
            <CardContent className="p-0">
                {/* Calendar Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={goToPreviousMonth} aria-label="Previous month">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={goToNextMonth} aria-label="Next month">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <h2 className="text-lg font-semibold ml-2">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                    </div>
                    <Button variant="outline" size="sm" onClick={goToToday}>
                        Today
                    </Button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 border-b">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div
                            key={day}
                            className="border-r last:border-r-0 px-2 py-2 text-center text-sm font-medium text-muted-foreground"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                    {days.map((day, index) => {
                        const dateKey = format(day, 'yyyy-MM-dd')
                        const dayInterviews = interviewsByDate.get(dateKey) || []
                        const isCurrentMonth = isSameMonth(day, currentDate)
                        const isCurrentDay = isToday(day)

                        return (
                            <div
                                key={day.toString()}
                                className={cn(
                                    'min-h-[120px] border-b border-r p-2',
                                    index % 7 === 6 && 'border-r-0',
                                    !isCurrentMonth && 'bg-muted/30',
                                )}
                            >
                                <div
                                    className={cn(
                                        'flex h-7 w-7 items-center justify-center rounded-full text-sm',
                                        isCurrentDay && 'bg-primary text-primary-foreground font-semibold',
                                        !isCurrentMonth && 'text-muted-foreground',
                                    )}
                                >
                                    {format(day, 'd')}
                                </div>
                                <ScrollArea className="h-[80px] mt-1">
                                    <div className="space-y-1">
                                        {dayInterviews.map(interview => {
                                            const candidateName =
                                                interview.application.user.applicantProfile?.firstName ||
                                                interview.application.user.email.split('@')[0]

                                            return (
                                                <Link
                                                    key={interview.id}
                                                    href={`${ROUTES.ADMIN.INTERVIEWS}/${interview.id}`}
                                                    className={cn(
                                                        'block rounded px-1.5 py-1 text-xs truncate transition-colors',
                                                        interview.status === 'SCHEDULED' && 'bg-primary/10 text-primary hover:bg-primary/20',
                                                        interview.status === 'COMPLETED' && 'bg-success/10 text-success hover:bg-success/20',
                                                        interview.status === 'CANCELLED' && 'bg-muted text-muted-foreground line-through',
                                                    )}
                                                >
                                                    <span className="font-medium">
                                                        {format(new Date(interview.scheduledAt), 'h:mm a')}
                                                    </span>{' '}
                                                    {candidateName}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </ScrollArea>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
