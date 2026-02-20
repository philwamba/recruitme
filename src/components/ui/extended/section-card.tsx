'use client'

import * as React from 'react'
import { LucideIcon, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface SectionCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: {
    label: string
    icon?: LucideIcon
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
  }
  children: React.ReactNode
  isLoading?: boolean
  className?: string
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  children,
  isLoading = false,
  className,
}: SectionCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
        </div>
        {action && (
          <Button
            variant={action.variant || 'outline'}
            size="sm"
            onClick={action.onClick}
            className="gap-1.5"
          >
            {action.icon ? (
              <action.icon className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{action.label}</span>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? <SectionCardSkeleton /> : children}
      </CardContent>
    </Card>
  )
}

function SectionCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

// Empty state for sections
interface SectionEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function SectionEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: SectionEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick} className="mt-4">
          <Plus className="mr-1.5 h-4 w-4" />
          {action.label}
        </Button>
      )}
    </div>
  )
}
