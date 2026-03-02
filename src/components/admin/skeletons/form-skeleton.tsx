import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FormSkeletonProps {
    sections?: number
    fieldsPerSection?: number
    className?: string
}

export function FormSkeleton({
    sections = 2,
    fieldsPerSection = 4,
    className,
}: FormSkeletonProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {/* Page header with back button */}
            <div className="space-y-4">
                <Skeleton className="h-8 w-16" />
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-24" />
                    </div>
                </div>
            </div>

            {/* Form sections */}
            {Array.from({ length: sections }).map((_, sectionIndex) => (
                <Card key={sectionIndex}>
                    <CardHeader>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                            {Array.from({ length: fieldsPerSection }).map((_, fieldIndex) => (
                                <div key={fieldIndex} className="space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Bottom actions */}
            <div className="flex items-center justify-end gap-2 pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    )
}
