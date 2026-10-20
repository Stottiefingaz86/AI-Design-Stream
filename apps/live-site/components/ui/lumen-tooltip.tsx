'use client'

import React from 'react'
import { cn } from '@/lib/utils'

/** Marks a hover target for the official Lumen tip (`#lumen-tip` + `--foreground` / `--background`). */
export function LumenTooltip({
  label,
  side = 'bottom',
  className,
  children,
}: {
  label: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
  tone?: 'default' | 'inverted'
  className?: string
  children: React.ReactNode
}) {
  return (
    <span className={cn('inline-flex', className)} data-tip={label} data-tip-side={side}>
      {children}
    </span>
  )
}
