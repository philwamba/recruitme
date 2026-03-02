import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CalendarSkeletonProps {
    className?: string
}

export function CalendarSkeleton({ className }: CalendarSkeletonProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-32" />
                    <Skeleton className="h-9 w-9" />
                </div>
            </div>

            {/* Calendar controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <div className="flex items-center gap-1">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                </div>
            </div>

            {/* Calendar grid */}
            <Card>
                <CardContent className="p-0">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 border-b">
                        {Array.from({ length: 7 }).map((_, i) => (
                            <div
                                key={i}
                                className="border-r last:border-r-0 px-3 py-2 text-center"
                            >
                                <Skeleton className="mx-auto h-4 w-8" />
                            </div>
                        ))}
                    </div>

                    {/* Calendar weeks */}
                    {Array.from({ length: 5 }).map((_, weekIndex) => (
                        <div key={weekIndex} className="grid grid-cols-7">
                            {Array.from({ length: 7 }).map((_, dayIndex) => (
                                <div
                                    key={dayIndex}
                                    className="border-b border-r last:border-r-0 min-h-[120px] p-2"
                                >
                                    <Skeleton className="h-5 w-5 mb-2" />
                                    {/* Random events */}
                                    {Math.random() > 0.6 && (
                                        <div className="space-y-1">
                                            <Skeleton className="h-6 w-full rounded" />
                                            {Math.random() > 0.5 && (
                                                <Skeleton className="h-6 w-full rounded" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
