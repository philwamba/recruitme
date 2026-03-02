import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { StatCardGridSkeleton } from './card-skeleton'
import { cn } from '@/lib/utils'

interface DashboardSkeletonProps {
    className?: string
}

export function DashboardSkeleton({ className }: DashboardSkeletonProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {/* Page header */}
            <div className="space-y-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>

            {/* Stats grid */}
            <StatCardGridSkeleton count={6} className="lg:grid-cols-6 sm:grid-cols-3" />

            {/* Charts row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Applications chart */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>

                {/* Pipeline chart */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full" />
                    </CardContent>
                </Card>
            </div>

            {/* Bottom row */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Recent activity */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-5 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Upcoming interviews */}
                <Card>
                    <CardHeader>
                        <Skeleton className="h-5 w-40" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                                <Skeleton className="h-10 w-10 rounded" />
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
