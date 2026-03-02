import { AdminPageHeader, TableSkeleton } from '@/components/admin'
import { Skeleton } from '@/components/ui/skeleton'

export default function JobsLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <TableSkeleton columns={5} rows={10} />
        </div>
    )
}
