import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface KanbanSkeletonProps {
    columns?: number
    cardsPerColumn?: number
    className?: string
}

export function KanbanSkeleton({
    columns = 5,
    cardsPerColumn = 3,
    className,
}: KanbanSkeletonProps) {
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

            {/* Kanban board */}
            <div className="flex gap-4 overflow-x-auto pb-4">
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <div
                        key={colIndex}
                        className="flex w-72 flex-shrink-0 flex-col rounded-lg border bg-muted/30"
                    >
                        {/* Column header */}
                        <div className="flex items-center justify-between border-b bg-card px-4 py-3 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-6 rounded-full" />
                            </div>
                            <Skeleton className="h-6 w-6" />
                        </div>

                        {/* Cards */}
                        <div className="flex-1 space-y-3 p-3">
                            {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
                                <div
                                    key={cardIndex}
                                    className="rounded-lg border bg-card p-3 space-y-3"
                                >
                                    <div className="flex items-start gap-3">
                                        <Skeleton className="h-9 w-9 rounded-full" />
                                        <div className="flex-1 space-y-1">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-3 w-24" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                        <Skeleton className="h-5 w-12 rounded-full" />
                                    </div>
                                    <div className="flex items-center justify-between pt-1">
                                        <Skeleton className="h-3 w-20" />
                                        <div className="flex -space-x-1">
                                            <Skeleton className="h-6 w-6 rounded-full" />
                                            <Skeleton className="h-6 w-6 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
