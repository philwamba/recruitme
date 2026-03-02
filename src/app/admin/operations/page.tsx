import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { retryFailedOutboxJob } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

async function handleRetryOutboxJob(formData: FormData) {
    'use server'
    await retryFailedOutboxJob(formData)
}

export default async function AdminOperationsPage() {
    await requireCurrentUser({
        roles: ['ADMIN'],
        permission: 'VIEW_AUDIT_LOGS',
    })

    const [auditLogs, activityLogs, deliveryLogs, outboxJobs] = await Promise.all([
        prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: { actor: true },
        }),
        prisma.activityLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: { actor: true },
        }),
        prisma.deliveryLog.findMany({
            orderBy: { attemptedAt: 'desc' },
            take: 20,
            include: { notification: true },
        }),
        prisma.outboxJob.findMany({
            orderBy: { updatedAt: 'desc' },
            take: 20,
        }),
    ])

    return (
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Operations Console</h1>
                <p className="text-muted-foreground">
          Review audit history, recent activity, delivery attempts, and outbox failures.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Outbox Jobs</CardTitle>
                        <CardDescription>Queued, retried, and failed background messaging work.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {outboxJobs.map(job => (
                            <div key={job.id} className="rounded-md border p-3 text-sm">
                                <p className="font-medium">{job.type}</p>
                                <p className="text-muted-foreground">
                                    {job.status} • attempts {job.attempts} • updated {new Date(job.updatedAt).toLocaleString()}
                                </p>
                                {job.lastError ? (
                                    <p className="mt-2 text-xs text-destructive">{job.lastError}</p>
                                ) : null}
                                {job.status === 'FAILED' ? (
                                    <form action={handleRetryOutboxJob} className="mt-3">
                                        <input type="hidden" name="jobId" value={job.id} />
                                        <Button type="submit" variant="outline" size="sm">
                      Requeue Job
                                        </Button>
                                    </form>
                                ) : null}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Delivery Logs</CardTitle>
                        <CardDescription>Latest message delivery outcomes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {deliveryLogs.map(log => (
                            <div key={log.id} className="rounded-md border p-3 text-sm">
                                <p className="font-medium">{log.provider}</p>
                                <p className="text-muted-foreground">
                                    {log.status} • {new Date(log.attemptedAt).toLocaleString()}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                  Notification: {log.notification?.subject ?? 'Notification deleted'}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Audit Logs</CardTitle>
                        <CardDescription>Recent sensitive platform actions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {auditLogs.map(log => (
                            <div key={log.id} className="rounded-md border p-3 text-sm">
                                <p className="font-medium">{log.action}</p>
                                <p className="text-muted-foreground">
                                    {log.actor?.email ?? 'System'} • {new Date(log.createdAt).toLocaleString()}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {log.targetType}{log.targetId ? ` • ${log.targetId}` : ''}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Activity Logs</CardTitle>
                        <CardDescription>Recent user activity feed.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {activityLogs.map(log => (
                            <div key={log.id} className="rounded-md border p-3 text-sm">
                                <p className="font-medium">{log.description}</p>
                                <p className="text-muted-foreground">
                                    {log.actor?.email ?? 'System'} • {new Date(log.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
