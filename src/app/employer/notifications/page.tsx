import { requireCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EmployerPageHeader } from '@/components/employer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function EmployerNotificationsPage() {
    const user = await requireCurrentUser({
        roles: ['EMPLOYER', 'ADMIN'],
    })

    const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
    })

    return (
        <div className="space-y-6">
            <EmployerPageHeader
                title="Notifications"
                description="Review communications about candidates, interviews, and your job postings"
            />

            <div className="grid gap-4">
                {notifications.length === 0 ? (
                    <Card>
                        <CardContent className="flex min-h-[200px] items-center justify-center">
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                        </CardContent>
                    </Card>
                ) : (
                    notifications.map(notification => (
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
                    ))
                )}
            </div>
        </div>
    )
}
