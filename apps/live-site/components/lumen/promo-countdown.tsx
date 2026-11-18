'use client'

import { useEffect, useState } from 'react'
import { countdownParts } from '@/lib/lumen/daily-races'
import { cn } from '@/lib/utils'

/** Ticks down from `seconds`, looping back to the start at zero (demo clock). */
export function useCountdown(seconds: number) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
    const id = window.setInterval(() => {
      setRemaining((s) => (s <= 0 ? seconds : s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [seconds])

  return remaining
}

/** Days / Hours / Min / Sec cells — races + raffle heroes. */
export function PromoCountdown({
  seconds,
  label,
  onPrimary = false,
  className,
}: {
  seconds: number
  label: string
  /** White-on-primary cells for the promo hero banner. */
  onPrimary?: boolean
  className?: string
}) {
  const remaining = useCountdown(seconds)
  const parts = countdownParts(remaining)

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      <p className={cn('text-xs', onPrimary ? 'text-white/70' : 'text-muted-foreground')}>
        {label}
      </p>
      <div
        className="flex items-start gap-1.5"
        role="timer"
        aria-label={`${label} ${parts.map((p) => `${p.value} ${p.label}`).join(' ')}`}
      >
        {parts.map((part) => (
          <div
            key={part.label}
            className={cn(
              'flex w-14 flex-col items-center rounded-[10px] py-2',
              onPrimary ? 'bg-black/20' : 'border border-input bg-popover',
            )}
          >
            <span
              className={cn(
                'text-xl font-semibold leading-6 tabular-nums',
                onPrimary ? 'text-white' : 'text-foreground',
              )}
            >
              {part.value}
            </span>
            <span
              className={cn(
                'text-[10px] leading-3',
                onPrimary ? 'text-white/70' : 'text-muted-foreground',
              )}
            >
              {part.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
