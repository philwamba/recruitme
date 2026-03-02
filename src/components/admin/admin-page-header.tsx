'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AdminPageHeaderProps {
    title: string
    description?: string
    backHref?: string
    backLabel?: string
    actions?: React.ReactNode
    tabs?: React.ReactNode
    className?: string
}

export function AdminPageHeader({
    title,
    description,
    backHref,
    backLabel = 'Back',
    actions,
    tabs,
    className,
}: AdminPageHeaderProps) {
    return (
        <div className={cn('mb-6 space-y-4', className)}>
            {/* Back button */}
            {backHref && (
                <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" asChild>
                    <Link href={backHref}>
                        <ArrowLeft className="h-4 w-4" />
                        {backLabel}
                    </Link>
                </Button>
            )}

            {/* Title row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-muted-foreground">{description}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex items-center gap-2">{actions}</div>
                )}
            </div>

            {/* Tabs */}
            {tabs && <div className="border-b">{tabs}</div>}
        </div>
    )
}
