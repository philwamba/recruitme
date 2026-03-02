import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface TableSkeletonProps {
    columns?: number
    rows?: number
    showCheckbox?: boolean
    showAvatar?: boolean
    className?: string
}

export function TableSkeleton({
    columns = 5,
    rows = 10,
    showCheckbox = false,
    showAvatar = false,
    className,
}: TableSkeletonProps) {
    const totalColumns = columns + (showCheckbox ? 1 : 0)

    return (
        <div className={cn('rounded-lg border bg-card', className)}>
            {/* Header */}
            <div className="flex items-center gap-4 border-b px-4 py-3">
                {showCheckbox && <Skeleton className="h-4 w-4" />}
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton
                        key={`header-${i}`}
                        className={cn(
                            'h-4',
                            i === 0 && showAvatar ? 'w-32' : 'w-24',
                            i === 0 ? 'flex-shrink-0' : 'flex-1',
                        )}
                    />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={`row-${rowIndex}`}
                    className={cn(
                        'flex items-center gap-4 px-4 py-3',
                        rowIndex !== rows - 1 && 'border-b',
                    )}
                >
                    {showCheckbox && <Skeleton className="h-4 w-4" />}
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <div
                            key={`cell-${rowIndex}-${colIndex}`}
                            className={cn(
                                'flex items-center gap-3',
                                colIndex === 0 ? 'flex-shrink-0' : 'flex-1',
                            )}
                        >
                            {colIndex === 0 && showAvatar && (
                                <Skeleton className="h-9 w-9 rounded-full" />
                            )}
                            <Skeleton
                                className={cn(
                                    'h-4',
                                    colIndex === 0 ? 'w-32' : 'w-full max-w-[120px]',
                                )}
                            />
                        </div>
                    ))}
                </div>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between border-t px-4 py-3">
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    )
}
