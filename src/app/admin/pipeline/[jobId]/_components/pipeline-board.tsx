'use client'

import * as React from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
    Star,
    MessageSquare,
    Calendar,
    MoreHorizontal,
    GripVertical,
} from 'lucide-react'
import type { Tag } from '@prisma/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'

interface CandidateCard {
    id: string
    avgRating: number | null
    user: {
        id: string
        email: string
        applicantProfile: {
            firstName: string | null
            lastName: string | null
            avatarUrl: string | null
            headline: string | null
        } | null
    }
    tags: Array<{ tag: Tag }>
    _count: {
        notes: number
        interviews: number
    }
    submittedAt: Date | null
}

interface PipelineStage {
    id: string
    name: string
    order: number
    applications: CandidateCard[]
}

interface PipelineBoardProps {
    stages: PipelineStage[]
    jobId: string
}

export function PipelineBoard({ stages, jobId }: PipelineBoardProps) {
    return (
        <ScrollArea className="w-full whitespace-nowrap pb-4">
            <div className="flex gap-4">
                {stages.map((stage) => (
                    <PipelineColumn key={stage.id} stage={stage} />
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}

function PipelineColumn({ stage }: { stage: PipelineStage }) {
    return (
        <div className="flex w-80 flex-shrink-0 flex-col rounded-lg border bg-muted/30">
            {/* Column Header */}
            <div className="flex items-center justify-between rounded-t-lg border-b bg-card px-4 py-3">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{stage.name}</h3>
                    <Badge variant="secondary" className="rounded-full">
                        {stage.applications.length}
                    </Badge>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Stage actions">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Move all to...</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit stage</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Cards */}
            <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                    {stage.applications.length === 0 ? (
                        <div className="rounded-lg border border-dashed bg-card/50 p-4 text-center text-sm text-muted-foreground">
                            No candidates in this stage
                        </div>
                    ) : (
                        stage.applications.map((candidate) => (
                            <CandidateKanbanCard key={candidate.id} candidate={candidate} />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}

function CandidateKanbanCard({ candidate }: { candidate: CandidateCard }) {
    const profile = candidate.user.applicantProfile
    const name = profile?.firstName && profile?.lastName
        ? `${profile.firstName} ${profile.lastName}`
        : candidate.user.email
    const initials = profile?.firstName && profile?.lastName
        ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
        : candidate.user.email.slice(0, 2).toUpperCase()

    return (
        <div className="group rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start gap-3">
                <div className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatarUrl || ''} alt={name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <Link
                        href={`${ROUTES.ADMIN.CANDIDATES}/${candidate.id}`}
                        className="font-medium text-sm hover:underline line-clamp-1"
                    >
                        {name}
                    </Link>
                    {profile?.headline && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {profile.headline}
                        </p>
                    )}
                </div>
            </div>

            {/* Tags */}
            {candidate.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {candidate.tags.slice(0, 2).map(({ tag }) => (
                        <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                            style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                        >
                            {tag.name}
                        </Badge>
                    ))}
                    {candidate.tags.length > 2 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            +{candidate.tags.length - 2}
                        </Badge>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                    {candidate.submittedAt
                        ? formatDistanceToNow(new Date(candidate.submittedAt), { addSuffix: true })
                        : '-'}
                </span>
                <div className="flex items-center gap-2">
                    {candidate.avgRating && (
                        <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-warning text-warning" />
                            {candidate.avgRating.toFixed(1)}
                        </span>
                    )}
                    {candidate._count.notes > 0 && (
                        <span className="flex items-center gap-0.5">
                            <MessageSquare className="h-3 w-3" />
                            {candidate._count.notes}
                        </span>
                    )}
                    {candidate._count.interviews > 0 && (
                        <span className="flex items-center gap-0.5">
                            <Calendar className="h-3 w-3" />
                            {candidate._count.interviews}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
