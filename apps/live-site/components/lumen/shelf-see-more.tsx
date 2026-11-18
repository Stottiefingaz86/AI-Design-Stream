'use client'

import Link from 'next/link'
import { useShell } from '@/components/site/shell-context'
import { cn } from '@/lib/utils'

/**
 * Casino shelf “See More” control — bordered pill (not a card, not text+chevron).
 * Sports reuses the same control as “See All”.
 */
export function ShelfSeeMore({
  href,
  label = 'See More',
  onClick,
  className,
}: {
  href?: string
  label?: string
  onClick?: () => void
  className?: string
}) {
  const { startNavigating } = useShell()
  const classes = cn(
    'inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-border bg-secondary px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
    className,
  )

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        onClick={() => {
          startNavigating(href)
          onClick?.()
        }}
      >
        {label}
      </Link>
    )
  }

  return (
    <button type="button" className={classes} onClick={onClick}>
      {label}
    </button>
  )
}
