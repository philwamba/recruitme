import { AdminPageHeader, TableSkeleton } from '@/components/admin'
import { Skeleton } from '@/components/ui/skeleton'

export default function CandidatesLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-64" />
            </div>
            <TableSkeleton columns={6} rows={10} showAvatar />
        </div>
    )
}
