'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  value: number // 0-100
  size?: 'sm' | 'md' | 'lg' | 'xl'
  strokeWidth?: number
  showValue?: boolean
  className?: string
  children?: React.ReactNode
}

const sizes = {
  sm: { size: 64, stroke: 6, textSize: 'text-sm' },
  md: { size: 96, stroke: 8, textSize: 'text-lg' },
  lg: { size: 128, stroke: 10, textSize: 'text-2xl' },
  xl: { size: 160, stroke: 12, textSize: 'text-3xl' },
}

export function ProgressRing({
  value,
  size = 'md',
  strokeWidth,
  showValue = true,
  className,
  children,
}: ProgressRingProps) {
  const config = sizes[size]
  const effectiveStroke = strokeWidth ?? config.stroke
  const radius = (config.size - effectiveStroke) / 2
  const circumference = radius * 2 * Math.PI
  const normalizedValue = Math.min(100, Math.max(0, value))
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference

  // Determine color based on value
  const getColor = (val: number) => {
    if (val < 30) return 'stroke-red-500'
    if (val < 60) return 'stroke-yellow-500'
    if (val < 80) return 'stroke-blue-500'
    return 'stroke-green-500'
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.size}
        height={config.size}
        viewBox={`0 0 ${config.size} ${config.size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          strokeWidth={effectiveStroke}
          className="stroke-muted"
        />
        {/* Progress circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          strokeWidth={effectiveStroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn('transition-all duration-500 ease-out', getColor(normalizedValue))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ? (
          children
        ) : showValue ? (
          <>
            <span className={cn('font-bold', config.textSize)}>
              {Math.round(normalizedValue)}%
            </span>
            <span className="text-xs text-muted-foreground">Complete</span>
          </>
        ) : null}
      </div>
    </div>
  )
}
