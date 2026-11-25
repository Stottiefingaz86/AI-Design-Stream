'use client'

import { useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { IconStack2 } from '@tabler/icons-react'
import { soccerTeamLogo } from '@/lib/lumen/soccer-sport'
import { cn } from '@/lib/utils'

/**
 * V5 · Combos building blocks. Lumen tokens only — the combo glow is a conic sweep of
 * Lumen brand tokens, never raw colours.
 */

export const V5_CARD = 'rounded-2xl border border-border bg-card'

/** Conic sweep used for the combo glow (button, slip, builder). */
export const COMBO_SWEEP =
  'bg-[conic-gradient(from_0deg,var(--brand-superpurple-400),var(--brand-highblue-400),var(--brand-wildneongreen-400),var(--brand-superyellow-400),var(--brand-superorange-400),var(--brand-superpurple-400))]'

/** Rotating gradient border around any content. */
export function ComboGlow({
  children,
  className,
  innerClassName,
  active = true,
  rounded = 'rounded-2xl',
}: {
  children: ReactNode
  className?: string
  innerClassName?: string
  active?: boolean
  rounded?: string
}) {
  return (
    <div className={cn('relative isolate overflow-hidden', active ? 'p-[2px]' : 'p-px', rounded, className)}>
      <div
        aria-hidden
        className={cn(
          'absolute left-1/2 top-1/2 -z-10 aspect-square w-[220%] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500',
          COMBO_SWEEP,
          active ? 'animate-[spin_6s_linear_infinite] opacity-100' : 'opacity-0',
        )}
      />
      {!active ? <div aria-hidden className={cn('absolute inset-0 -z-10 bg-border', rounded)} /> : null}
      {/* Card is translucent in dark — sit it on the page colour so the sweep only shows at the edge. */}
      <div className={cn('relative h-full bg-background', rounded)}>
        <div className={cn('h-full bg-card', rounded, innerClassName)}>{children}</div>
      </div>
    </div>
  )
}

/** The COMBO entry point — glow pill like the exchange's. */
export function ComboButton({
  onClick,
  size = 'md',
  label = 'Combo',
  className,
}: {
  onClick: () => void
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}) {
  return (
    <ComboGlow rounded="rounded-full" className={cn('shrink-0', className)}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-accent',
          size === 'sm' && 'h-8 px-3 text-[11px]',
          size === 'md' && 'h-10 px-5 text-xs',
          size === 'lg' && 'h-12 px-6 text-sm',
        )}
      >
        <IconStack2 className={size === 'lg' ? 'size-5' : 'size-4'} stroke={2} aria-hidden />
        {label}
      </button>
    </ComboGlow>
  )
}

export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex size-2 shrink-0', className)} aria-hidden>
      <span className="absolute inset-0 animate-ping rounded-full bg-[var(--live)] opacity-60" />
      <span className="relative inline-flex size-2 rounded-full bg-[var(--live)]" />
    </span>
  )
}

export function LeagueTile({
  src,
  size = 'md',
  className,
}: {
  src: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center border border-border bg-secondary',
        size === 'sm' && 'size-7 rounded-lg p-1',
        size === 'md' && 'size-10 rounded-xl p-1.5',
        size === 'lg' && 'size-14 rounded-2xl p-2 md:size-16',
        className,
      )}
    >
      <img src={src} alt="" className="size-full object-contain" />
    </span>
  )
}

export function Crest({ name, className }: { name: string; className?: string }) {
  const src = soccerTeamLogo(name)
  const [failed, setFailed] = useState(!src)
  if (failed || !src) {
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('')
    return (
      <span
        className={cn(
          'inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-muted-3 text-[10px] font-semibold text-muted-foreground',
          className,
        )}
        aria-hidden
      >
        {initials}
      </span>
    )
  }
  return (
    <img
      src={src}
      alt=""
      className={cn('size-7 shrink-0 object-contain', className)}
      onError={() => setFailed(true)}
    />
  )
}

/** Chance bar under a team name — length is the chance. */
export function ProbBar({ value, lead, className }: { value: number; lead: boolean; className?: string }) {
  return (
    <span className={cn('block h-[3px] w-full overflow-hidden rounded-full', className)} aria-hidden>
      <motion.span
        className={cn('block h-full rounded-full', lead ? 'bg-foreground' : 'bg-muted-foreground opacity-50')}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 22 }}
      />
    </span>
  )
}

/** % pill CTA — filled when the pick is in the combo. */
export function ChancePill({
  chance,
  selected,
  onClick,
  label,
  className,
}: {
  chance: number
  selected: boolean
  onClick: (el: HTMLElement) => void
  label?: string
  className?: string
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      aria-pressed={selected}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onClick(e.currentTarget)
      }}
      className={cn(
        'relative z-10 inline-flex h-9 min-w-[60px] shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 text-sm font-semibold tabular-nums transition-colors',
        selected
          ? 'border-success bg-success text-success-foreground'
          : 'border-border bg-secondary text-success hover:border-[var(--opacity-success-60)]',
        className,
      )}
    >
      {label ? <span className="font-medium">{label}</span> : null}
      {fmtPctRound(chance)}
    </motion.button>
  )
}

/** Yes ¢ / No ¢ — exchange colours: success for Yes, destructive for No (V5 only). */
export function YesNoButton({
  side,
  cents,
  selected,
  onClick,
  compact = false,
  showPercent = false,
  className,
}: {
  side: 'yes' | 'no'
  cents: number
  selected: boolean
  onClick: (el: HTMLElement) => void
  compact?: boolean
  /** Show the chance (%) instead of the price (¢). */
  showPercent?: boolean
  className?: string
}) {
  const yes = side === 'yes'
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      aria-pressed={selected}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onClick(e.currentTarget)
      }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1 rounded-full border font-semibold tabular-nums transition-colors',
        compact ? 'h-9 min-w-[64px] px-3 text-sm' : 'h-11 min-w-[96px] px-4 text-[15px] md:min-w-[120px]',
        yes
          ? selected
            ? 'border-success bg-success text-success-foreground'
            : 'border-border text-success hover:border-[var(--opacity-success-60)] hover:bg-[var(--opacity-success-10)]'
          : selected
            ? 'border-destructive bg-destructive text-destructive-foreground'
            : 'border-border text-destructive hover:border-[var(--opacity-destructive-60)] hover:bg-[var(--opacity-destructive-10)]',
        className,
      )}
    >
      {showPercent ? null : <span className="font-medium">{yes ? 'Yes' : 'No'}</span>}
      <span>{showPercent ? `${Math.round(cents)}%` : `${Math.round(cents)}¢`}</span>
    </motion.button>
  )
}

export function fmtPctRound(n: number): string {
  if (n > 0 && n < 1) return '<1%'
  if (n > 99 && n < 100) return '>99%'
  return `${Math.round(n)}%`
}

export function fmtUsd(n: number, digits = 2): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function fmtVol(n: number): string {
  return `${fmtUsd(n, 0)} vol`
}

/** Stack of demo avatar initials for "N people on this". */
export function AvatarStack({ names, className }: { names: string[]; className?: string }) {
  const tones = [
    'bg-[var(--brand-superpurple-500)]',
    'bg-[var(--brand-highblue-500)]',
    'bg-[var(--brand-wildgreen-500)]',
    'bg-[var(--brand-superorange-500)]',
  ]
  return (
    <span className={cn('flex -space-x-1.5', className)} aria-hidden>
      {names.slice(0, 4).map((n, i) => (
        <span
          key={`${n}-${i}`}
          className={cn(
            'inline-flex size-5 items-center justify-center rounded-full border-2 border-card text-[9px] font-bold text-primary-foreground',
            tones[i % tones.length],
          )}
        >
          {n[0]!.toUpperCase()}
        </span>
      ))}
    </span>
  )
}

export function avatarTone(name: string): string {
  const tones = [
    'bg-[var(--brand-superpurple-500)]',
    'bg-[var(--brand-highblue-500)]',
    'bg-[var(--brand-wildgreen-500)]',
    'bg-[var(--brand-superorange-500)]',
    'bg-[var(--brand-queenpink-500)]',
    'bg-[var(--brand-lowcyan-500)]',
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return tones[h % tones.length]!
}
