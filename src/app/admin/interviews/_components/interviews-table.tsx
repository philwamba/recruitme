'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { MoreHorizontal, Eye, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { InterviewStatus, Recommendation } from '@prisma/client'
import { DataTable, DataTableColumnHeader } from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'

interface InterviewRow {
    id: string
    title: string
    scheduledAt: Date
    durationMinutes: number
    status: InterviewStatus
    application: {
        id: string
        user: {
            id: string
            email: string
            applicantProfile: {
                firstName: string | null
                lastName: string | null
                avatarUrl: string | null
            } | null
        }
        job: {
            id: string
            title: string
            company: string
        }
    }
    participants: Array<{
        user: { email: string } | null
        email: string
    }>
    feedbacks: Array<{
        score: number
        recommendation: Recommendation
    }>
}

const statusStyles: Record<InterviewStatus, { label: string; className: string; icon: typeof Clock }> = {
    SCHEDULED: { label: 'Scheduled', className: 'bg-info/10 text-info', icon: Clock },
    COMPLETED: { label: 'Completed', className: 'bg-success/10 text-success', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive', icon: XCircle },
}

function getCandidateName(interview: InterviewRow): string {
    const profile = interview.application.user.applicantProfile
    if (profile?.firstName || profile?.lastName) {
        return `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    }
    return interview.application.user.email
}

function getInitials(interview: InterviewRow): string {
    const profile = interview.application.user.applicantProfile
    if (profile?.firstName && profile?.lastName) {
        return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    }
    return interview.application.user.email.slice(0, 2).toUpperCase()
}

const columns: ColumnDef<InterviewRow>[] = [
    {
        accessorKey: 'scheduledAt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Date & Time" />
        ),
        cell: ({ row }) => {
            const interview = row.original
            const date = new Date(interview.scheduledAt)
            const isPast = date < new Date()

            return (
                <div className={cn(isPast && interview.status === 'SCHEDULED' && 'text-warning')}>
                    <p className="font-medium">{format(date, 'MMM d, yyyy')}</p>
                    <p className="text-sm text-muted-foreground">
                        {format(date, 'h:mm a')} ({interview.durationMinutes} min)
                    </p>
                </div>
            )
        },
    },
    {
        accessorKey: 'candidate',
        header: 'Candidate',
        cell: ({ row }) => {
            const interview = row.original
            const name = getCandidateName(interview)
            const profile = interview.application.user.applicantProfile

            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={profile?.avatarUrl || ''} alt={name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(interview)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <Link
                            href={`${ROUTES.ADMIN.CANDIDATES}/${interview.application.id}`}
                            className="font-medium hover:underline"
                        >
                            {name}
                        </Link>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: 'title',
        header: 'Interview',
        cell: ({ row }) => {
            const interview = row.original
            return (
                <div>
                    <p className="font-medium">{interview.title}</p>
                    <p className="text-xs text-muted-foreground">
                        {interview.application.job.title}
                    </p>
                </div>
            )
        },
    },
    {
        accessorKey: 'participants',
        header: 'Interviewers',
        cell: ({ row }) => {
            const participants = row.original.participants
            if (participants.length === 0) {
                return <span className="text-muted-foreground">-</span>
            }
            return (
                <span className="text-sm text-muted-foreground">
                    {participants.slice(0, 2).map(p => p.user?.email || p.email).join(', ')}
                    {participants.length > 2 && ` +${participants.length - 2}`}
                </span>
            )
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status
            const style = statusStyles[status]
            const Icon = style.icon

            return (
                <Badge className={cn('gap-1 font-medium', style.className)}>
                    <Icon className="h-3 w-3" />
                    {style.label}
                </Badge>
            )
        },
    },
    {
        accessorKey: 'feedback',
        header: 'Feedback',
        cell: ({ row }) => {
            const feedbacks = row.original.feedbacks
            if (feedbacks.length === 0) {
                return (
                    <span className="text-muted-foreground text-sm">
                        {row.original.status === 'COMPLETED' ? 'Pending' : '-'}
                    </span>
                )
            }
            const avgScore = feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length
            return (
                <div className="flex items-center gap-2">
                    <Badge variant="secondary">{avgScore.toFixed(1)}/5</Badge>
                    <span className="text-xs text-muted-foreground">
                        {feedbacks.length} review{feedbacks.length > 1 ? 's' : ''}
                    </span>
                </div>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const interview = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`${ROUTES.ADMIN.INTERVIEWS}/${interview.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit Interview</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {interview.status === 'SCHEDULED' && (
                            <>
                                <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                    Cancel Interview
                                </DropdownMenuItem>
                            </>
                        )}
                        {interview.status === 'COMPLETED' && (
                            <DropdownMenuItem>Add Feedback</DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

interface InterviewsTableProps {
    interviews: InterviewRow[]
}

export function InterviewsTable({ interviews }: InterviewsTableProps) {
    return (
        <DataTable
            columns={columns}
            data={interviews}
            searchKey="title"
            searchPlaceholder="Search interviews..."
        />
    )
}
