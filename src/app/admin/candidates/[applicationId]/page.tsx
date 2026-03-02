import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import {
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Github,
    Globe,
    Calendar,
    FileText,
    Star,
    MessageSquare,
    MoreHorizontal,
    Briefcase,
    GraduationCap,
    Award,
    Clock,
} from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getCandidateById } from '@/lib/admin/queries/candidates'
import { AdminPageHeader, DetailSkeleton } from '@/components/admin'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'
import type { ApplicationStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

interface PageProps {
    params: Promise<{ applicationId: string }>
}

const statusStyles: Record<ApplicationStatus, { label: string; className: string }> = {
    DRAFT: { label: 'Draft', className: 'bg-muted text-muted-foreground' },
    SUBMITTED: { label: 'New', className: 'bg-info/10 text-info' },
    UNDER_REVIEW: { label: 'Under Review', className: 'bg-warning/10 text-warning' },
    SHORTLISTED: { label: 'Shortlisted', className: 'bg-success/10 text-success' },
    INTERVIEW_PHASE_1: { label: 'Interview Phase 1', className: 'bg-primary/10 text-primary' },
    INTERVIEW_PHASE_2: { label: 'Interview Phase 2', className: 'bg-primary/10 text-primary' },
    ASSESSMENT: { label: 'Assessment', className: 'bg-info/10 text-info' },
    OFFER: { label: 'Offer Extended', className: 'bg-success/10 text-success' },
    REJECTED: { label: 'Rejected', className: 'bg-destructive/10 text-destructive' },
    HIRED: { label: 'Hired', className: 'bg-success/10 text-success' },
    WITHDRAWN: { label: 'Withdrawn', className: 'bg-muted text-muted-foreground' },
}

export default async function CandidateDetailPage({ params }: PageProps) {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_APPLICATIONS',
    })

    const { applicationId } = await params
    const application = await getCandidateById(applicationId)

    if (!application) {
        notFound()
    }

    const profile = application.user.applicantProfile
    const candidateName = profile?.firstName && profile?.lastName
        ? `${profile.firstName} ${profile.lastName}`
        : application.user.email
    const initials = profile?.firstName && profile?.lastName
        ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
        : application.user.email.slice(0, 2).toUpperCase()

    const avgRating = application.ratings.length > 0
        ? application.ratings.reduce((sum, r) => sum + r.score, 0) / application.ratings.length
        : null

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title={candidateName}
                description={`Application for ${application.job.title} at ${application.job.company}`}
                backHref={ROUTES.ADMIN.CANDIDATES}
                backLabel="Back to Candidates"
                actions={
                    <div className="flex items-center gap-2">
                        <Select defaultValue={application.status}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(statusStyles).map(([status, { label }]) => (
                                    <SelectItem key={status} value={status}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Interview
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Send Email</DropdownMenuItem>
                                <DropdownMenuItem>Download CV</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                    Reject Application
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                }
            />

            {/* Candidate Header Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={profile?.avatarUrl || ''} alt={candidateName} />
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                            <div>
                                <h2 className="text-xl font-semibold">{candidateName}</h2>
                                {profile?.headline && (
                                    <p className="text-muted-foreground">{profile.headline}</p>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge className={cn('font-medium', statusStyles[application.status].className)}>
                                    {statusStyles[application.status].label}
                                </Badge>
                                {application.currentStage && (
                                    <Badge variant="outline">{application.currentStage.name}</Badge>
                                )}
                                {avgRating && (
                                    <Badge variant="secondary" className="gap-1">
                                        <Star className="h-3 w-3 fill-warning text-warning" />
                                        {avgRating.toFixed(1)}
                                    </Badge>
                                )}
                                {application.tags.map(({ tag }) => (
                                    <Badge
                                        key={tag.id}
                                        variant="outline"
                                        style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {application.user.email}
                                </div>
                                {profile?.phone && (
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        {profile.phone}
                                    </div>
                                )}
                                {(profile?.city || profile?.country) && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {[profile.city, profile.country].filter(Boolean).join(', ')}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profile?.linkedinUrl && (
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                            <Linkedin className="mr-1 h-4 w-4" />
                                            LinkedIn
                                        </a>
                                    </Button>
                                )}
                                {profile?.githubUrl && (
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                                            <Github className="mr-1 h-4 w-4" />
                                            GitHub
                                        </a>
                                    </Button>
                                )}
                                {profile?.portfolioUrl && (
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer">
                                            <Globe className="mr-1 h-4 w-4" />
                                            Portfolio
                                        </a>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Main Content */}
            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="documents">Documents ({application.documents.length})</TabsTrigger>
                    <TabsTrigger value="notes">Notes ({application.notes.length})</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="interviews">Interviews ({application.interviews.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Bio */}
                            {profile?.bio && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>About</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {profile.bio}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Work Experience */}
                            {profile?.workExperiences && profile.workExperiences.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Briefcase className="h-5 w-5" />
                                            Work Experience
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {profile.workExperiences.map((exp, index) => (
                                            <div key={exp.id}>
                                                {index > 0 && <Separator className="mb-4" />}
                                                <div className="space-y-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h4 className="font-medium">{exp.role}</h4>
                                                            <p className="text-sm text-muted-foreground">
                                                                {exp.company}
                                                                {exp.location && ` · ${exp.location}`}
                                                            </p>
                                                        </div>
                                                        {exp.isCurrent && (
                                                            <Badge variant="secondary">Current</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(exp.startDate), 'MMM yyyy')} -{' '}
                                                        {exp.endDate
                                                            ? format(new Date(exp.endDate), 'MMM yyyy')
                                                            : 'Present'}
                                                    </p>
                                                    {exp.description && (
                                                        <p className="text-sm text-muted-foreground mt-2">
                                                            {exp.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Education */}
                            {profile?.educations && profile.educations.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <GraduationCap className="h-5 w-5" />
                                            Education
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {profile.educations.map((edu, index) => (
                                            <div key={edu.id}>
                                                {index > 0 && <Separator className="mb-4" />}
                                                <div className="space-y-1">
                                                    <h4 className="font-medium">{edu.degree}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {edu.institution}
                                                        {edu.fieldOfStudy && ` · ${edu.fieldOfStudy}`}
                                                    </p>
                                                    {(edu.startDate || edu.endDate) && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {edu.startDate && format(new Date(edu.startDate), 'yyyy')}
                                                            {edu.startDate && edu.endDate && ' - '}
                                                            {edu.endDate && format(new Date(edu.endDate), 'yyyy')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Skills */}
                            {profile?.skills && profile.skills.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Skills</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.skills.map((skill, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Certifications */}
                            {profile?.certifications && profile.certifications.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5" />
                                            Certifications
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {profile.certifications.map((cert) => (
                                            <div key={cert.id} className="space-y-0.5">
                                                <p className="font-medium text-sm">{cert.name}</p>
                                                {cert.issuingOrg && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {cert.issuingOrg}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Application Info */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Application Info</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tracking ID</span>
                                        <span className="font-mono">{application.trackingId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Applied</span>
                                        <span>
                                            {application.submittedAt
                                                ? format(new Date(application.submittedAt), 'MMM d, yyyy')
                                                : '-'}
                                        </span>
                                    </div>
                                    {application.source && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Source</span>
                                            <span>{application.source}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                            <CardDescription>
                                CV and other uploaded documents
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {application.documents.length > 0 ? (
                                <div className="space-y-3">
                                    {application.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="flex items-center gap-3 rounded-lg border p-3"
                                        >
                                            <FileText className="h-8 w-8 text-muted-foreground" />
                                            <div className="flex-1">
                                                <p className="font-medium">{doc.originalFileName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(doc.sizeBytes / 1024).toFixed(1)} KB · Uploaded{' '}
                                                    {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <Badge variant={doc.scanStatus === 'CLEAN' ? 'secondary' : 'outline'}>
                                                {doc.scanStatus}
                                            </Badge>
                                            <Button variant="outline" size="sm">
                                                Download
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No documents uploaded</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notes">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Notes</CardTitle>
                                <CardDescription>
                                    Internal notes about this candidate
                                </CardDescription>
                            </div>
                            <Button>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Add Note
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {application.notes.length > 0 ? (
                                <div className="space-y-4">
                                    {application.notes.map((note) => (
                                        <div key={note.id} className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm">
                                                    {note.author.email}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                                {note.body}
                                            </p>
                                            <Separator />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No notes yet</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="timeline">
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Timeline</CardTitle>
                            <CardDescription>
                                History of stage changes and events
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {application.stageEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {application.stageEvents.map((event, index) => (
                                        <div key={event.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                    <Clock className="h-4 w-4 text-primary" />
                                                </div>
                                                {index < application.stageEvents.length - 1 && (
                                                    <div className="w-px flex-1 bg-border" />
                                                )}
                                            </div>
                                            <div className="pb-4">
                                                <p className="font-medium text-sm">
                                                    {event.fromStage?.name || 'New'} → {event.toStage?.name || 'Unknown'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    by {event.changedBy?.email || 'System'} ·{' '}
                                                    {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                                                </p>
                                                {event.note && (
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        {event.note}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No timeline events yet</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="interviews">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Interviews</CardTitle>
                                <CardDescription>
                                    Scheduled and completed interviews
                                </CardDescription>
                            </div>
                            <Button>
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule Interview
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {application.interviews.length > 0 ? (
                                <div className="space-y-4">
                                    {application.interviews.map((interview) => (
                                        <div
                                            key={interview.id}
                                            className="flex items-start gap-4 rounded-lg border p-4"
                                        >
                                            <div className="flex h-12 w-12 flex-col items-center justify-center rounded bg-primary/10 text-primary">
                                                <span className="text-xs font-medium">
                                                    {format(new Date(interview.scheduledAt), 'MMM')}
                                                </span>
                                                <span className="text-lg font-bold">
                                                    {format(new Date(interview.scheduledAt), 'd')}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium">{interview.title}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {format(new Date(interview.scheduledAt), 'h:mm a')} ·{' '}
                                                    {interview.durationMinutes} min
                                                </p>
                                                {interview.participants.length > 0 && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        With: {interview.participants.map(p => p.user?.email || p.email).join(', ')}
                                                    </p>
                                                )}
                                            </div>
                                            <Badge variant={interview.status === 'COMPLETED' ? 'secondary' : 'outline'}>
                                                {interview.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No interviews scheduled</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
