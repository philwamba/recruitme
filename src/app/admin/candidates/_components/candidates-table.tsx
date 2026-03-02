'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { MoreHorizontal, Eye, Calendar, Star, MessageSquare } from 'lucide-react'
import type { ApplicationStatus, Tag } from '@prisma/client'
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

interface CandidateApplication {
    id: string
    trackingId: string
    status: ApplicationStatus
    submittedAt: Date | null
    avgRating: number | null
    user: {
        id: string
        email: string
        applicantProfile: {
            firstName: string | null
            lastName: string | null
            avatarUrl: string | null
            headline: string | null
            skills: string[]
        } | null
    }
    job: {
        id: string
        title: string
        company: string
    }
    currentStage: {
        id: string
        name: string
        order: number
    } | null
    tags: Array<{
        tag: Tag
    }>
}

const statusStyles: Record<ApplicationStatus, { label: string; className: string }> = {
    DRAFT: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
    SUBMITTED: { label: 'New', className: 'bg-info/10 text-info' },
    UNDER_REVIEW: { label: 'Review', className: 'bg-warning/10 text-warning' },
    SHORTLISTED: { label: 'Shortlisted', className: 'bg-success/10 text-success' },
    INTERVIEW_PHASE_1: { label: 'Interview 1', className: 'bg-primary/10 text-primary' },
    INTERVIEW_PHASE_2: { label: 'Interview 2', className: 'bg-primary/10 text-primary' },
    ASSESSMENT: { label: 'Assessment', className: 'bg-info/10 text-info' },
    OFFER: { label: 'Offer', className: 'bg-success/10 text-success' },
    REJECTED: { label: 'Rejected', className: 'bg-destructive/10 text-destructive' },
    HIRED: { label: 'Hired', className: 'bg-success/10 text-success' },
    WITHDRAWN: { label: 'Withdrawn', className: 'bg-muted text-muted-foreground' },
}

function getCandidateName(candidate: CandidateApplication): string {
    const profile = candidate.user.applicantProfile
    if (profile?.firstName || profile?.lastName) {
        return `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    }
    return candidate.user.email
}

function getInitials(candidate: CandidateApplication): string {
    const profile = candidate.user.applicantProfile
    if (profile?.firstName && profile?.lastName) {
        return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    }
    return candidate.user.email.slice(0, 2).toUpperCase()
}

const columns: ColumnDef<CandidateApplication>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Candidate" />
        ),
        cell: ({ row }) => {
            const candidate = row.original
            const name = getCandidateName(candidate)
            const profile = candidate.user.applicantProfile

            return (
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={profile?.avatarUrl || ''} alt={name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(candidate)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <Link
                            href={`${ROUTES.ADMIN.CANDIDATES}/${candidate.id}`}
                            className="font-medium hover:underline"
                        >
                            {name}
                        </Link>
                        {profile?.headline && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {profile.headline}
                            </p>
                        )}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: 'job.title',
        header: 'Position',
        cell: ({ row }) => {
            const job = row.original.job
            return (
                <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground">{job.company}</p>
                </div>
            )
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.status
            const style = statusStyles[status]
            const stage = row.original.currentStage

            return (
                <div className="space-y-1">
                    <Badge className={cn('font-medium', style.className)}>
                        {style.label}
                    </Badge>
                    {stage && (
                        <p className="text-xs text-muted-foreground">{stage.name}</p>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'avgRating',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Rating" />
        ),
        cell: ({ row }) => {
            const rating = row.original.avgRating
            if (!rating) {
                return <span className="text-muted-foreground">-</span>
            }
            return (
                <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
            )
        },
    },
    {
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ row }) => {
            const tags = row.original.tags
            if (tags.length === 0) {
                return <span className="text-muted-foreground">-</span>
            }
            return (
                <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 2).map(({ tag }) => (
                        <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs"
                            style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                        >
                            {tag.name}
                        </Badge>
                    ))}
                    {tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                            +{tags.length - 2}
                        </Badge>
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: 'submittedAt',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Applied" />
        ),
        cell: ({ row }) => {
            const submittedAt = row.original.submittedAt
            return submittedAt ? (
                <span className="text-sm text-muted-foreground">
                    {format(new Date(submittedAt), 'MMM d, yyyy')}
                </span>
            ) : (
                <span className="text-muted-foreground">-</span>
            )
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const candidate = row.original

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
                            <Link href={`${ROUTES.ADMIN.CANDIDATES}/${candidate.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`${ROUTES.ADMIN.PIPELINE}/${candidate.job.id}`}>
                                View Pipeline
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Interview
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Add Note
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

interface CandidatesTableProps {
    candidates: CandidateApplication[]
}

export function CandidatesTable({ candidates }: CandidatesTableProps) {
    return (
        <DataTable
            columns={columns}
            data={candidates}
            searchKey="name"
            searchPlaceholder="Search candidates..."
        />
    )
}
