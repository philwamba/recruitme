'use client'

import * as React from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'destructive'
  isLoading?: boolean
  className?: string
}

const variantStyles = {
  default: {
    icon: 'bg-muted text-muted-foreground',
    accent: 'bg-muted/30',
    trend: {
      up: 'text-success',
      down: 'text-destructive',
    },
  },
  primary: {
    icon: 'bg-primary/10 text-primary',
    accent: 'bg-primary/5',
    trend: {
      up: 'text-success',
      down: 'text-destructive',
    },
  },
  success: {
    icon: 'bg-success/10 text-success',
    accent: 'bg-success/5',
    trend: {
      up: 'text-success',
      down: 'text-destructive',
    },
  },
  warning: {
    icon: 'bg-warning/10 text-warning',
    accent: 'bg-warning/5',
    trend: {
      up: 'text-success',
      down: 'text-destructive',
    },
  },
  info: {
    icon: 'bg-info/10 text-info',
    accent: 'bg-info/5',
    trend: {
      up: 'text-success',
      down: 'text-destructive',
    },
  },
  destructive: {
    icon: 'bg-destructive/10 text-destructive',
    accent: 'bg-destructive/5',
    trend: {
      up: 'text-success',
      down: 'text-destructive',
    },
  },
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  variant = 'default',
  isLoading = false,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant]

  if (isLoading) {
    return (
      <Card className={cn('relative overflow-hidden', className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl',
              styles.icon
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {trend && (
                <span
                  className={cn(
                    'flex items-center gap-0.5 text-xs font-semibold',
                    trend.direction === 'up' ? 'text-success' : 'text-destructive'
                  )}
                >
                  {trend.direction === 'up' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1.5">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
