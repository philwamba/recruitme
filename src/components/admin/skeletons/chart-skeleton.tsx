import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ChartSkeletonProps {
    title?: boolean
    height?: number
    className?: string
}

export function ChartSkeleton({
    title = true,
    height = 300,
    className,
}: ChartSkeletonProps) {
    return (
        <Card className={className}>
            {title && (
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
            )}
            <CardContent>
                <Skeleton className={cn('w-full')} style={{ height: `${height}px` }} />
            </CardContent>
        </Card>
    )
}

interface ChartGridSkeletonProps {
    count?: number
    columns?: number
    height?: number
    className?: string
}

export function ChartGridSkeleton({
    count = 4,
    columns = 2,
    height = 300,
    className,
}: ChartGridSkeletonProps) {
    return (
        <div
            className={cn('grid gap-6', className)}
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
            {Array.from({ length: count }).map((_, i) => (
                <ChartSkeleton key={i} height={height} />
            ))}
        </div>
    )
}
