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
        icon: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        iconRing: 'ring-slate-200/50 dark:ring-slate-700/50',
        gradient: 'from-slate-500/5 via-transparent to-transparent',
        glow: '',
    },
    primary: {
        icon: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25',
        iconRing: 'ring-violet-400/20',
        gradient: 'from-violet-500/10 via-purple-500/5 to-transparent',
        glow: 'after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-br after:from-violet-500/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity',
    },
    success: {
        icon: 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25',
        iconRing: 'ring-emerald-400/20',
        gradient: 'from-emerald-500/10 via-green-500/5 to-transparent',
        glow: 'after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-br after:from-emerald-500/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity',
    },
    warning: {
        icon: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25',
        iconRing: 'ring-amber-400/20',
        gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
        glow: 'after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-br after:from-amber-500/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity',
    },
    info: {
        icon: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/25',
        iconRing: 'ring-blue-400/20',
        gradient: 'from-blue-500/10 via-cyan-500/5 to-transparent',
        glow: 'after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-br after:from-blue-500/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity',
    },
    destructive: {
        icon: 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25',
        iconRing: 'ring-red-400/20',
        gradient: 'from-red-500/10 via-rose-500/5 to-transparent',
        glow: 'after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-br after:from-red-500/10 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity',
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
                <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-11 w-11 rounded-xl" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-3.5 w-20" />
                            <Skeleton className="h-7 w-16" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card
            className={cn(
                'group relative overflow-hidden transition-all duration-300',
                'hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20',
                'hover:-translate-y-0.5',
                'border-border/50',
                styles.glow,
                className,
            )}
        >
            {/* Background gradient decoration */}
            <div
                className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-60',
                    styles.gradient,
                )}
            />

            <CardContent className="relative p-5">
                <div className="flex items-start gap-4">
                    {/* Icon container with enhanced styling */}
                    <div
                        className={cn(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                            'ring-1 transition-transform duration-300',
                            'group-hover:scale-110',
                            styles.icon,
                            styles.iconRing,
                        )}
                    >
                        <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                        {/* Title */}
                        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                            {title}
                        </p>

                        {/* Value and trend */}
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <p className="text-2xl font-bold tracking-tight">{value}</p>
                            {trend && (
                                <span
                                    className={cn(
                                        'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                        trend.direction === 'up'
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                            : 'bg-red-500/10 text-red-600 dark:text-red-400',
                                    )}
                                >
                                    {trend.direction === 'up' ? (
                                        <TrendingUp className="h-2.5 w-2.5" />
                                    ) : (
                                        <TrendingDown className="h-2.5 w-2.5" />
                                    )}
                                    {trend.value}%
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        {description && (
                            <p className="text-[11px] text-muted-foreground/70">{description}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
