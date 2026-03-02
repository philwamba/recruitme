import { TableSkeleton } from '@/components/admin'
import { Skeleton } from '@/components/ui/skeleton'

export default function OperationsLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-64" />
            <TableSkeleton columns={5} rows={15} />
        </div>
    )
}
