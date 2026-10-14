import type { ComponentProps, ReactNode } from 'react'
import { cn } from 'cn'
import { Badge, badgeVariants } from '@/components/ui/badge'
import type { VariantProps } from 'class-variance-authority'

const TONE = {
  default: 'bg-primary',
  live: 'bg-live',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  destructive: 'bg-destructive',
  muted: 'bg-muted-foreground',
} as const

function DotBadge({
  className,
  tone = 'default',
  children,
  ...props
}: ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    tone?: keyof typeof TONE
  }) {
  return (
    <Badge variant="secondary" data-slot="dot-badge" className={cn('gap-1.5', className)} {...props}>
      <span className={cn('size-1.5 rounded-full', TONE[tone])} aria-hidden />
      {children}
    </Badge>
  )
}

function NumberBadge({
  className,
  children = 0,
  ...props
}: ComponentProps<'span'> & { children?: ReactNode }) {
  return (
    <Badge
      data-slot="number-badge"
      className={cn('min-w-5 justify-center px-1 tabular-nums', className)}
      {...props}
    >
      {children}
    </Badge>
  )
}

export { DotBadge, NumberBadge }
