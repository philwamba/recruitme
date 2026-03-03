import { Suspense } from 'react'
import { format } from 'date-fns'
import { Activity, Mail, Shield, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { retryFailedOutboxJob } from '@/app/actions/admin'
import { AdminPageHeader, CardSkeleton } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    NoOutboxJobsEmptyState,
    NoDeliveryLogsEmptyState,
    NoAuditLogsEmptyState,
    NoActivityLogsEmptyState,
} from './_components/empty-states'

export const dynamic = 'force-dynamic'

async function handleRetryOutboxJob(formData: FormData) {
    'use server'
    await retryFailedOutboxJob(formData)
}

const statusStyles: Record<string, { className: string; icon: typeof Clock }> = {
    PENDING: { className: 'bg-warning/10 text-warning', icon: Clock },
    PROCESSING: { className: 'bg-info/10 text-info', icon: RefreshCw },
    COMPLETED: { className: 'bg-success/10 text-success', icon: CheckCircle },
    FAILED: { className: 'bg-destructive/10 text-destructive', icon: AlertCircle },
    DELIVERED: { className: 'bg-success/10 text-success', icon: CheckCircle },
    BOUNCED: { className: 'bg-destructive/10 text-destructive', icon: AlertCircle },
}

export default async function AdminOperationsPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'VIEW_AUDIT_LOGS',
    })

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Operations"
                description="Review audit history, recent activity, delivery attempts, and outbox failures"
            />

            <div className="grid gap-6 lg:grid-cols-2">
                <Suspense fallback={<CardSkeleton />}>
                    <OutboxJobsSection />
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    <DeliveryLogsSection />
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    <AuditLogsSection />
                </Suspense>
                <Suspense fallback={<CardSkeleton />}>
                    <ActivityLogsSection />
                </Suspense>
            </div>
        </div>
    )
}

async function OutboxJobsSection() {
    const outboxJobs = await prisma.outboxJob.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 20,
    })

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    <CardTitle>Outbox Jobs</CardTitle>
                </div>
                <CardDescription>Queued, retried, and failed background messaging work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {outboxJobs.length === 0 ? (
                    <NoOutboxJobsEmptyState />
                ) : (
                    outboxJobs.map(job => {
                        const style = statusStyles[job.status] ?? statusStyles.PENDING
                        const Icon = style.icon
                        return (
                            <div key={job.id} className="rounded-lg border p-3 text-sm space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-medium">{job.type}</p>
                                    <Badge className={style.className}>
                                        <Icon className="mr-1 h-3 w-3" />
                                        {job.status}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Attempts: {job.attempts} • Updated {format(new Date(job.updatedAt), 'MMM d, h:mm a')}
                                </p>
                                {job.lastError && (
                                    <p className="text-xs text-destructive bg-destructive/5 rounded p-2">{job.lastError}</p>
                                )}
                                {job.status === 'FAILED' && (
                                    <form action={handleRetryOutboxJob} className="pt-1">
                                        <input type="hidden" name="jobId" value={job.id} />
                                        <Button type="submit" variant="outline" size="sm">
                                            <RefreshCw className="mr-2 h-3 w-3" />
                                            Requeue Job
                                        </Button>
                                    </form>
                                )}
                            </div>
                        )
                    })
                )}
            </CardContent>
        </Card>
    )
}

async function DeliveryLogsSection() {
    const deliveryLogs = await prisma.deliveryLog.findMany({
        orderBy: { attemptedAt: 'desc' },
        take: 20,
        include: {
            notification: {
                select: {
                    subject: true,
                },
            },
        },
    })

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <CardTitle>Delivery Logs</CardTitle>
                </div>
                <CardDescription>Latest message delivery outcomes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {deliveryLogs.length === 0 ? (
                    <NoDeliveryLogsEmptyState />
                ) : (
                    deliveryLogs.map(log => {
                        const style = statusStyles[log.status] ?? statusStyles.PENDING
                        const Icon = style.icon
                        return (
                            <div key={log.id} className="rounded-lg border p-3 text-sm space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="font-medium">{log.provider}</p>
                                    <Badge className={style.className}>
                                        <Icon className="mr-1 h-3 w-3" />
                                        {log.status}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(log.attemptedAt), 'MMM d, yyyy h:mm a')}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {log.notification?.subject ?? 'Notification deleted'}
                                </p>
                            </div>
                        )
                    })
                )}
            </CardContent>
        </Card>
    )
}

async function AuditLogsSection() {
    const auditLogs = await prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
            actor: {
                select: {
                    email: true,
                },
            },
        },
    })

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <CardTitle>Audit Logs</CardTitle>
                </div>
                <CardDescription>Recent sensitive platform actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {auditLogs.length === 0 ? (
                    <NoAuditLogsEmptyState />
                ) : (
                    auditLogs.map(log => (
                        <div key={log.id} className="rounded-lg border p-3 text-sm space-y-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-medium">{log.action}</p>
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {log.actor?.email ?? 'System'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {log.targetType}{log.targetId ? ` • ${log.targetId.slice(0, 8)}...` : ''}
                            </p>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}

async function ActivityLogsSection() {
    const activityLogs = await prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
            actor: {
                select: {
                    email: true,
                },
            },
        },
    })

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <CardTitle>Activity Logs</CardTitle>
                </div>
                <CardDescription>Recent user activity feed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {activityLogs.length === 0 ? (
                    <NoActivityLogsEmptyState />
                ) : (
                    activityLogs.map(log => (
                        <div key={log.id} className="rounded-lg border p-3 text-sm space-y-1">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-medium truncate max-w-[200px]">{log.description}</p>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {log.actor?.email ?? 'System'}
                            </p>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}
