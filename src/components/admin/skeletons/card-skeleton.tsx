import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CardSkeletonProps {
    className?: string
}

export function CardSkeleton({ className }: CardSkeletonProps) {
    return (
        <Card className={cn('h-32', className)}>
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-20" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

interface StatCardGridSkeletonProps {
    count?: number
    className?: string
}

export function StatCardGridSkeleton({ count = 4, className }: StatCardGridSkeletonProps) {
    return (
        <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    )
}
