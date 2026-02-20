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
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive'
  isLoading?: boolean
  className?: string
}

const variantStyles = {
  default: {
    icon: 'bg-muted text-muted-foreground',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600',
    },
  },
  primary: {
    icon: 'bg-primary/10 text-primary',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600',
    },
  },
  success: {
    icon: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600',
    },
  },
  warning: {
    icon: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600',
    },
  },
  destructive: {
    icon: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600',
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
      <Card className={cn('', className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-lg',
              styles.icon
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {trend && (
                <span
                  className={cn(
                    'flex items-center text-xs font-medium',
                    styles.trend[trend.direction]
                  )}
                >
                  {trend.direction === 'up' ? (
                    <TrendingUp className="mr-0.5 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-0.5 h-3 w-3" />
                  )}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
