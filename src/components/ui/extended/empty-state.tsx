'use client'

import * as React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'compact'
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
  className,
}: EmptyStateProps) {
  const isCompact = variant === 'compact'

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        isCompact ? 'py-8' : 'py-16',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted',
          isCompact ? 'h-12 w-12' : 'h-16 w-16'
        )}
      >
        <Icon
          className={cn(
            'text-muted-foreground',
            isCompact ? 'h-5 w-5' : 'h-7 w-7'
          )}
        />
      </div>

      <h3
        className={cn(
          'font-semibold text-foreground',
          isCompact ? 'mt-3 text-sm' : 'mt-4 text-base'
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          'text-muted-foreground max-w-sm',
          isCompact ? 'mt-1 text-xs' : 'mt-2 text-sm'
        )}
      >
        {description}
      </p>

      {(action || secondaryAction) && (
        <div
          className={cn(
            'flex items-center gap-3',
            isCompact ? 'mt-4' : 'mt-6'
          )}
        >
          {action && (
            <Button
              onClick={action.onClick}
              size={isCompact ? 'sm' : 'default'}
              className="gap-1.5"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              size={isCompact ? 'sm' : 'default'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
