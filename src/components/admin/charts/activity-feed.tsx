'use client'

import { formatDistanceToNow } from 'date-fns'
import { Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EmptyState } from '@/components/ui/extended/empty-state'

interface ActivityItem {
    id: string
    description: string
    actorEmail?: string // For backward compatibility
    actorDisplayName?: string // Privacy-friendly display name
    createdAt: Date
}

interface ActivityFeedProps {
    activities: ActivityItem[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    if (activities.length === 0) {
        return (
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={Activity}
                        title="No activity yet"
                        description="Activity will appear here as team members take actions"
                        variant="compact"
                    />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[320px] pr-4">
                    <div className="space-y-4">
                        {activities.map((activity) => {
                            const displayName = activity.actorDisplayName || activity.actorEmail || 'System'
                            return (
                                <div key={activity.id} className="flex items-start gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {displayName.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-0.5">
                                        <p className="text-sm">{activity.description}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {displayName} &middot;{' '}
                                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
