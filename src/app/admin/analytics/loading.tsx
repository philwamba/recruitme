import { StatCardGridSkeleton, ChartGridSkeleton } from '@/components/admin'
import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyticsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-64" />
            </div>
            <StatCardGridSkeleton count={4} />
            <ChartGridSkeleton count={2} columns={2} />
        </div>
    )
}
