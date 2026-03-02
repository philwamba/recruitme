import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DetailSkeletonProps {
    showAvatar?: boolean
    showTabs?: boolean
    sections?: number
    className?: string
}

export function DetailSkeleton({
    showAvatar = true,
    showTabs = true,
    sections = 3,
    className,
}: DetailSkeletonProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                    {showAvatar && <Skeleton className="h-16 w-16 rounded-full" />}
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <div className="flex items-center gap-2 pt-1">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-9" />
                </div>
            </div>

            {/* Tabs */}
            {showTabs && (
                <div className="flex items-center gap-4 border-b pb-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-28" />
                </div>
            )}

            {/* Content sections */}
            {Array.from({ length: sections }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j} className="space-y-1.5">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-5 w-full max-w-[200px]" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
