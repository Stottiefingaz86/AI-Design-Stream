'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { revealShellDock } from '@/components/site/shell-scroll'
import { setSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import { soccerTeamLogo } from '@/lib/lumen/soccer-sport'
import { toggleLeg } from '@/lib/lumen/v5-combos'
import { flyBetDotToSlip } from '@/lib/lumen/vip-celebrate'
import { cn } from '@/lib/utils'

/**
 * V5 · Combos building blocks — V1 sportsbook grammar (same card, chip and type scale),
 * with the prediction-market layer on top: chance %, multipliers, Yes / No.
 * Hover lights the surface up; borders never change on hover.
 */

/** Same card as the V1 boards. */
export const V5_CARD = 'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'

/** Light-up on hover — surface brightens, no stroke. */
export const V5_LIGHT_UP = 'transition-colors duration-150 hover:bg-surface-muted-2'

/** Live marker — steady, never pulsing. */
export function LiveDot({ className }: { className?: string }) {
  return <span className={cn('inline-block size-2 shrink-0 rounded-full bg-[var(--live)]', className)} aria-hidden />
}

/** League mark on a white plate — same plate as the V1 league tiles. */
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
        'inline-flex shrink-0 items-center justify-center rounded-md bg-white',
        size === 'sm' && 'size-7 p-1',
        size === 'md' && 'size-9 p-1.5',
        size === 'lg' && 'size-12 p-2',
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
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
          'inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted-3 text-[9px] font-semibold text-muted-foreground',
          className,
        )}
        aria-hidden
      >
        {initials}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={cn('size-6 shrink-0 object-contain', className)}
      onError={() => setFailed(true)}
    />
  )
}

/** Draw row mark. */
export function DrawMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-muted-3 text-[10px] font-semibold text-muted-foreground',
        className,
      )}
      aria-hidden
    >
      X
    </span>
  )
}

/** Chance bar under a team name — length is the chance (V1 popular-card bar). */
export function ProbBar({ value, lead, className }: { value: number; lead: boolean; className?: string }) {
  return (
    <span className={cn('block h-1 w-full overflow-hidden rounded-full bg-secondary', className)} aria-hidden>
      <motion.span
        className={cn('block h-full rounded-full', lead ? 'bg-foreground' : 'bg-muted-foreground')}
        initial={false}
        animate={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        transition={{ type: 'spring', stiffness: 140, damping: 24 }}
      />
    </span>
  )
}

const CHIP =
  'inline-flex shrink-0 items-center justify-center rounded-lg border tabular-nums transition-colors'
const CHIP_IDLE = 'border-border bg-secondary text-foreground hover:bg-accent'
const CHIP_ON = 'border-primary bg-primary text-primary-foreground'

function stop(e: React.MouseEvent) {
  e.stopPropagation()
  e.preventDefault()
}

/** Odds chip with the chance — V1 OddsButton shape: small top line, value below. */
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
  /** Small top line, e.g. the multiplier "1.69x". */
  label?: string
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={(e) => {
        stop(e)
        onClick(e.currentTarget)
      }}
      className={cn(CHIP, 'h-11 min-w-[76px] flex-col gap-0.5 px-2', selected ? CHIP_ON : CHIP_IDLE, className)}
    >
      {label ? (
        <span className={cn('text-[10px] font-medium leading-3.5', selected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
          {label}
        </span>
      ) : null}
      <span className="text-sm font-semibold leading-5">{fmtPctRound(chance)}</span>
    </button>
  )
}

/** Yes / No price chip — V1 odds-chip grammar, primary when picked. */
export function YesNoButton({
  side,
  value,
  unit = 'cents',
  selected,
  onClick,
  compact = false,
  className,
}: {
  side: 'yes' | 'no'
  /** ¢ price, or % chance when `unit="percent"`. */
  value: number
  unit?: 'cents' | 'percent'
  selected: boolean
  onClick: (el: HTMLElement) => void
  compact?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={(e) => {
        stop(e)
        onClick(e.currentTarget)
      }}
      className={cn(
        CHIP,
        'gap-1.5 text-sm',
        compact ? 'h-9 min-w-[76px] px-2.5' : 'h-10 min-w-[108px] px-3',
        selected ? CHIP_ON : CHIP_IDLE,
        className,
      )}
    >
      <span className={cn('font-medium', selected ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
        {side === 'yes' ? 'Yes' : 'No'}
      </span>
      <span className="font-semibold">{unit === 'percent' ? `${Math.round(value)}%` : `${Math.round(value)}¢`}</span>
    </button>
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

/** American odds → implied chance (0–100). "EVEN" counts as 50. */
export function chanceFromAmerican(odds: string): number {
  const t = odds.trim().toUpperCase()
  if (t === 'EVEN' || t === 'EV') return 50
  const n = Number.parseFloat(t.replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(n) || n === 0) return 50
  const p = t.startsWith('-') ? Math.abs(n) / (Math.abs(n) + 100) : 100 / (n + 100)
  return Math.min(99, Math.max(1, p * 100))
}

/** Pick → existing betslip, with the V1 fly-to-slip beat. */
export function useV5Pick() {
  return (pick: SoccerSlipPick, el?: HTMLElement | null) => {
    let added = false
    setSoccerSlip((prev) => {
      added = !prev.some((p) => p.id === pick.id)
      return toggleLeg(prev, pick)
    })
    if (added) {
      revealShellDock()
      flyBetDotToSlip(el ?? null, pick.id)
    }
  }
}
