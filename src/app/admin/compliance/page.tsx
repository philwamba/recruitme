import { Suspense } from 'react'
import { format } from 'date-fns'
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { processDeletionRequestAction } from '@/app/actions/enterprise'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AdminPageHeader, TableSkeleton } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/extended/empty-state'
import type { DataDeletionRequestStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

const statusStyles: Record<DataDeletionRequestStatus, { label: string; className: string; icon: typeof Clock }> = {
    REQUESTED: { label: 'Pending', className: 'bg-warning/10 text-warning', icon: Clock },
    IN_PROGRESS: { label: 'Processing', className: 'bg-info/10 text-info', icon: Clock },
    COMPLETED: { label: 'Completed', className: 'bg-success/10 text-success', icon: CheckCircle },
    FAILED: { label: 'Failed', className: 'bg-destructive/10 text-destructive', icon: XCircle },
    REJECTED: { label: 'Rejected', className: 'bg-muted text-muted-foreground', icon: XCircle },
}

export default async function AdminCompliancePage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'MANAGE_COMPLIANCE',
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Compliance"
                description="Review and process data deletion requests (GDPR)"
            />

            <Suspense fallback={<TableSkeleton columns={5} rows={10} />}>
                <DeletionRequestsSection />
            </Suspense>
        </div>
    )
}

async function DeletionRequestsSection() {
    const requests = await prisma.dataDeletionRequest.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
    })

    if (requests.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <EmptyState
                        icon={Shield}
                        title="No deletion requests"
                        description="No data deletion requests have been submitted yet"
                    />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Data Deletion Requests</CardTitle>
                <CardDescription>
                    {requests.filter(r => r.status === 'REQUESTED').length} pending requests
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {requests.map(request => {
                    const style = statusStyles[request.status]
                    const Icon = style.icon

                    return (
                        <div key={request.id} className="rounded-lg border p-4 space-y-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium">{request.user.email}</p>
                                        <Badge className={style.className}>
                                            <Icon className="mr-1 h-3 w-3" />
                                            {style.label}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Requested {format(new Date(request.requestedAt), 'MMM d, yyyy h:mm a')}
                                        {request.processedAt && (
                                            <> • Processed {format(new Date(request.processedAt), 'MMM d, yyyy')}</>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {request.reason && (
                                <div className="rounded-md bg-muted/50 p-3">
                                    <p className="text-sm font-medium text-muted-foreground">Reason</p>
                                    <p className="text-sm mt-1">{request.reason}</p>
                                </div>
                            )}

                            {request.notes && (
                                <div className="rounded-md bg-muted/50 p-3">
                                    <p className="text-sm font-medium text-muted-foreground">Admin Notes</p>
                                    <p className="text-sm mt-1">{request.notes}</p>
                                </div>
                            )}

                            {request.status === 'REQUESTED' && (
                                <form action={processDeletionRequestAction} className="space-y-3 pt-2 border-t">
                                    <input type="hidden" name="requestId" value={request.id} />
                                    <Textarea
                                        name="notes"
                                        placeholder="Processing notes (optional)"
                                        className="min-h-[80px]"
                                    />
                                    <div className="flex gap-2">
                                        <Button type="submit" name="action" value="approve" variant="destructive">
                                            <AlertTriangle className="mr-2 h-4 w-4" />
                                            Approve Deletion
                                        </Button>
                                        <Button type="submit" name="action" value="reject" variant="outline">
                                            Reject
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
