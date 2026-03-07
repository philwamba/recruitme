'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
    page: number
    totalPages: number
    className?: string
}

export function Pagination({ page, totalPages, className }: PaginationProps) {
    const searchParams = useSearchParams()

    const createPageHref = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', pageNumber.toString())
        return `?${params.toString()}`
    }

    if (totalPages <= 1) return null

    return (
        <div className={cn('flex items-center justify-between px-2 py-4', className)}>
            <p className="text-sm text-muted-foreground">
                Showing page {page} of {totalPages}
            </p>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    asChild={page > 1}
                    disabled={page <= 1}
                >
                    {page > 1 ? (
                        <Link href={createPageHref(page - 1)}>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                        </Link>
                    ) : (
                        <>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                        </>
                    )}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    asChild={page < totalPages}
                    disabled={page >= totalPages}
                >
                    {page < totalPages ? (
                        <Link href={createPageHref(page + 1)}>
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Link>
                    ) : (
                        <>
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
