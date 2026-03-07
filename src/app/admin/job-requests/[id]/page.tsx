import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
    Building2,
    Calendar,
    DollarSign,
    MapPin,
    Briefcase,
    Users,
    Edit,
    Send,
    X,
    ArrowRight,
} from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { getJobRequestById } from '@/lib/admin/queries/job-requests'
import { getAdminUsers } from '@/lib/admin/queries/organizations'
import { AdminPageHeader } from '@/components/admin'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ROUTES } from '@/lib/constants/routes'
import { jobRequestStatuses, employmentTypes, workplaceTypes } from '@/lib/admin/validations/job-request'
import { SubmitForApprovalButton } from './_components/submit-for-approval-button'
import { ApprovalActions } from './_components/approval-actions'
import { ConvertToJobButton } from './_components/convert-to-job-button'
import { CancelRequestButton } from './_components/cancel-request-button'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function JobRequestDetailPage({ params }: PageProps) {
    const user = await requireCurrentUser({
        roles: ['ADMIN', 'EMPLOYER'],
        permission: 'MANAGE_JOBS',
    })

    const { id } = await params
    const [jobRequest, adminUsers] = await Promise.all([
        getJobRequestById(id),
        getAdminUsers(),
    ])

    if (!jobRequest) {
        notFound()
    }

    const statusConfig = jobRequestStatuses.find(s => s.value === jobRequest.status)
    const employmentLabel = employmentTypes.find(t => t.value === jobRequest.employmentType)?.label
    const workplaceLabel = workplaceTypes.find(t => t.value === jobRequest.workplaceType)?.label

    const canEdit = jobRequest.status === 'DRAFT' || jobRequest.status === 'REJECTED'
    const canSubmit = jobRequest.status === 'DRAFT' || jobRequest.status === 'REJECTED'
    const canCancel = jobRequest.status !== 'CONVERTED' && jobRequest.status !== 'CANCELLED'
    const canConvert = jobRequest.status === 'APPROVED'

    const userPendingApproval = jobRequest.approvals.find(
        a => a.approverUserId === user.id && a.status === 'PENDING'
    )

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title={jobRequest.title}
                description={`Request ${jobRequest.requestNumber}`}
                backHref={ROUTES.ADMIN.JOB_REQUESTS}
                backLabel="Back to Job Requests"
                actions={
                    <div className="flex items-center gap-2">
                        {canEdit && (
                            <Button variant="outline" asChild>
                                <Link href={`${ROUTES.ADMIN.JOB_REQUESTS}/${id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        )}
                        {canSubmit && (
                            <SubmitForApprovalButton
                                requestId={id}
                                approvers={adminUsers.filter(u => u.id !== user.id)}
                            />
                        )}
                        {canConvert && (
                            <ConvertToJobButton requestId={id} />
                        )}
                        {canCancel && (
                            <CancelRequestButton requestId={id} />
                        )}
                    </div>
                }
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    {/* Request Details */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Request Details</CardTitle>
                                <Badge className={statusConfig?.className}>
                                    {statusConfig?.label}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Organization:</span>
                                    <span className="font-medium">{jobRequest.organization.name}</span>
                                </div>
                                {jobRequest.category && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Category:</span>
                                        <span className="font-medium">{jobRequest.category.name}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Positions:</span>
                                    <span className="font-medium">{jobRequest.headcount}</span>
                                </div>
                                {jobRequest.location && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Location:</span>
                                        <span className="font-medium">{jobRequest.location}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Employment:</span>
                                    <span className="font-medium">{employmentLabel}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Workplace:</span>
                                    <span className="font-medium">{workplaceLabel}</span>
                                </div>
                                {(jobRequest.salaryMin || jobRequest.salaryMax) && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Salary:</span>
                                        <span className="font-medium">
                                            {jobRequest.salaryMin && `${jobRequest.salaryMin.toLocaleString()}`}
                                            {jobRequest.salaryMin && jobRequest.salaryMax && ' - '}
                                            {jobRequest.salaryMax && `${jobRequest.salaryMax.toLocaleString()}`}
                                            {jobRequest.salaryCurrency && ` ${jobRequest.salaryCurrency}`}
                                        </span>
                                    </div>
                                )}
                                {jobRequest.targetStartDate && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Target Start:</span>
                                        <span className="font-medium">
                                            {new Date(jobRequest.targetStartDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-medium mb-2">Justification</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {jobRequest.justification}
                                </p>
                            </div>

                            {jobRequest.requirements && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="font-medium mb-2">Requirements</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {jobRequest.requirements}
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Your Pending Approval */}
                    {userPendingApproval && (
                        <Card className="border-yellow-200 bg-yellow-50/50">
                            <CardHeader>
                                <CardTitle className="text-yellow-800">Your Approval Required</CardTitle>
                                <CardDescription>
                                    This request is waiting for your approval decision
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ApprovalActions approvalId={userPendingApproval.id} />
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Requester Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Requested By</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium">{jobRequest.requestedBy.email}</p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(jobRequest.createdAt).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Approval Status */}
                    {jobRequest.approvals.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Approval Progress</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {jobRequest.approvals.map((approval, index) => (
                                        <div key={approval.id} className="flex items-start gap-3">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                                approval.status === 'APPROVED'
                                                    ? 'bg-green-100 text-green-700'
                                                    : approval.status === 'REJECTED'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {approval.approver.email}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {approval.status === 'PENDING' && 'Pending'}
                                                    {approval.status === 'APPROVED' && `Approved${approval.decidedAt ? ` on ${new Date(approval.decidedAt).toLocaleDateString()}` : ''}`}
                                                    {approval.status === 'REJECTED' && `Rejected${approval.decidedAt ? ` on ${new Date(approval.decidedAt).toLocaleDateString()}` : ''}`}
                                                </p>
                                                {approval.comments && (
                                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                                        &ldquo;{approval.comments}&rdquo;
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Linked Job */}
                    {jobRequest.job && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Linked Job</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`${ROUTES.ADMIN.JOBS}/${jobRequest.job.id}`}>
                                        View Job
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
