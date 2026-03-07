import { Bell } from 'lucide-react'
import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function ApplicantNotificationsPage() {
    const user = await requireCurrentUser({
        roles: ['APPLICANT'],
        permission: 'VIEW_APPLICANT_DASHBOARD',
    })

    const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
                <p className="text-muted-foreground">
          Review in-app and queued communication about your applications, interviews, and assessments.
                </p>
            </div>
            {notifications.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium">No notifications yet</h3>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                            When you receive updates about your applications, interviews, or assessments, they&apos;ll appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {notifications.map(notification => (
                        <Card key={notification.id}>
                            <CardHeader>
                                <CardTitle className="text-base">{notification.subject}</CardTitle>
                                <CardDescription>
                                    {notification.channel} • {notification.status} •{' '}
                                    {new Date(notification.createdAt).toLocaleString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
                                {notification.body}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
