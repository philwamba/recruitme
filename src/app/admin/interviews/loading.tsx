import { StatCardGridSkeleton, TableSkeleton } from '@/components/admin'
import { Skeleton } from '@/components/ui/skeleton'

export default function InterviewsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-40" />
            </div>
            <StatCardGridSkeleton count={4} />
            <Skeleton className="h-10 w-64" />
            <TableSkeleton columns={6} rows={10} showAvatar />
        </div>
    )
}
