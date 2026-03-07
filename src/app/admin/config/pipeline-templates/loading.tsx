import { AdminPageHeader, TableSkeleton } from '@/components/admin'

export default function Loading() {
    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Pipeline Templates"
                description="Manage reusable hiring pipeline configurations"
            />
            <TableSkeleton columns={6} rows={10} />
        </div>
    )
}
