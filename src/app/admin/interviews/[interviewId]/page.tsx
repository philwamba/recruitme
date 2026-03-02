import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import {
    Calendar,
    Clock,
    MapPin,
    Video,
    Users,
    Star,
    MessageSquare,
    MoreHorizontal,
    Mail,
    Phone,
    CheckCircle,
    XCircle,
} from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getInterviewById } from '@/lib/admin/queries/interviews'
import { AdminPageHeader } from '@/components/admin'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'
import type { InterviewStatus, Recommendation } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ interviewId: string }>
}

const statusStyles: Record<InterviewStatus, { label: string; className: string }> = {
    SCHEDULED: { label: 'Scheduled', className: 'bg-info/10 text-info' },
    COMPLETED: { label: 'Completed', className: 'bg-success/10 text-success' },
    CANCELLED: { label: 'Cancelled', className: 'bg-destructive/10 text-destructive' },
}

const recommendationStyles: Record<Recommendation, { label: string; className: string }> = {
    STRONG_YES: { label: 'Strong Yes', className: 'bg-success/10 text-success' },
    YES: { label: 'Yes', className: 'bg-success/10 text-success' },
    MAYBE: { label: 'Maybe', className: 'bg-warning/10 text-warning' },
    NO: { label: 'No', className: 'bg-destructive/10 text-destructive' },
    STRONG_NO: { label: 'Strong No', className: 'bg-destructive/10 text-destructive' },
}

export default async function InterviewDetailPage({ params }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const { interviewId } = await params
    const interview = await getInterviewById(interviewId)

    if (!interview) {
        notFound()
    }

    const profile = interview.application.user.applicantProfile
    const candidateName = profile?.firstName && profile?.lastName
        ? `${profile.firstName} ${profile.lastName}`
        : interview.application.user.email
    const initials = profile?.firstName && profile?.lastName
        ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
        : interview.application.user.email.slice(0, 2).toUpperCase()

    const isPast = new Date(interview.scheduledAt) < new Date()
    const avgScore = interview.feedbacks.length > 0
        ? interview.feedbacks.reduce((sum, f) => sum + f.score, 0) / interview.feedbacks.length
        : null

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title={interview.title}
                description={`Interview for ${interview.application.job.title}`}
                backHref={ROUTES.ADMIN.INTERVIEWS}
                backLabel="Back to Interviews"
                actions={
                    <div className="flex items-center gap-2">
                        {interview.status === 'SCHEDULED' && (
                            <>
                                <Button variant="outline">Reschedule</Button>
                                <Button>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Mark Complete
                                </Button>
                            </>
                        )}
                        {interview.status === 'COMPLETED' && interview.feedbacks.length === 0 && (
                            <Button>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Add Feedback
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit Interview</DropdownMenuItem>
                                <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                    Cancel Interview
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                }
            />

            {/* Status and time info */}
            <div className="flex flex-wrap items-center gap-3">
                <Badge className={cn('font-medium', statusStyles[interview.status].className)}>
                    {statusStyles[interview.status].label}
                </Badge>
                {isPast && interview.status === 'SCHEDULED' && (
                    <Badge variant="destructive">Overdue</Badge>
                )}
                {avgScore && (
                    <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        {avgScore.toFixed(1)}/5
                    </Badge>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Interview details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Interview Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Date</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(interview.scheduledAt), 'EEEE, MMMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Time</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(interview.scheduledAt), 'h:mm a')} ({interview.durationMinutes} min)
                                        </p>
                                    </div>
                                </div>
                                {interview.location && (
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Location</p>
                                            <p className="text-sm text-muted-foreground">{interview.location}</p>
                                        </div>
                                    </div>
                                )}
                                {interview.meetingUrl && (
                                    <div className="flex items-start gap-3">
                                        <Video className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Meeting Link</p>
                                            <a
                                                href={interview.meetingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                Join Meeting
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {interview.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="font-medium mb-2">Notes</p>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {interview.notes}
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Participants */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Participants
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {interview.participants.length > 0 ? (
                                <div className="space-y-3">
                                    {interview.participants.map((participant) => (
                                        <div
                                            key={participant.id}
                                            className="flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs">
                                                        {(participant.user?.email || participant.email).slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {participant.user?.email || participant.email}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        {participant.role.toLowerCase().replace('_', ' ')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No participants assigned</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Feedback */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Feedback</CardTitle>
                                <CardDescription>
                                    {interview.feedbacks.length} feedback{interview.feedbacks.length !== 1 ? 's' : ''} submitted
                                </CardDescription>
                            </div>
                            {interview.status === 'COMPLETED' && (
                                <Button variant="outline" size="sm">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Add Feedback
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {interview.feedbacks.length > 0 ? (
                                <div className="space-y-4">
                                    {interview.feedbacks.map((feedback) => (
                                        <div key={feedback.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">
                                                        {feedback.author.email}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(feedback.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Star className="h-3 w-3 fill-warning text-warning" />
                                                        {feedback.score}/5
                                                    </Badge>
                                                    <Badge className={cn('font-medium', recommendationStyles[feedback.recommendation].className)}>
                                                        {recommendationStyles[feedback.recommendation].label}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {feedback.comments && (
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                    {feedback.comments}
                                                </p>
                                            )}
                                            <Separator />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">
                                    {interview.status === 'COMPLETED'
                                        ? 'No feedback submitted yet'
                                        : 'Feedback can be added after the interview is completed'}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar - Candidate info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Candidate</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={profile?.avatarUrl || ''} alt={candidateName} />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <Link
                                        href={`${ROUTES.ADMIN.CANDIDATES}/${interview.application.id}`}
                                        className="font-medium hover:underline"
                                    >
                                        {candidateName}
                                    </Link>
                                    {profile?.headline && (
                                        <p className="text-sm text-muted-foreground">{profile.headline}</p>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                        {interview.application.user.email}
                                    </span>
                                </div>
                                {profile?.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{profile.phone}</span>
                                    </div>
                                )}
                            </div>

                            <Button variant="outline" className="w-full" asChild>
                                <Link href={`${ROUTES.ADMIN.CANDIDATES}/${interview.application.id}`}>
                                    View Full Profile
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Position</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-medium">{interview.application.job.title}</p>
                            <p className="text-sm text-muted-foreground">
                                {interview.application.job.company}
                            </p>
                            <Button variant="outline" className="w-full mt-4" asChild>
                                <Link href={`${ROUTES.ADMIN.JOBS}/${interview.application.job.id}`}>
                                    View Job
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
