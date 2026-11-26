'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FadeScroll } from './v5-fade-scroll'
import {
  IconBuildingBank,
  IconBuildingMonument,
  IconChartLine,
  IconDeviceTv,
  IconLock,
  IconMovie,
  IconMusic,
  IconTicket,
  type Icon,
} from '@tabler/icons-react'
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { revealShellDock } from '@/components/site/shell-scroll'
import { setSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import { soccerTeamLogo } from '@/lib/lumen/soccer-sport'
import { leaguePageHref, toggleLeg } from '@/lib/lumen/v5-combos'
import type { V5SportId } from '@/lib/lumen/v5-sportsbook'
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
export const V5_LIGHT_UP = 'transition-colors duration-200 hover:bg-[var(--v5-hover)]'

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

// ─── V5 type scale — bold display (Figtree 800/900, tight tracking) ───

/** Page title — "Football", "NFL". */
export const V5_TITLE = 'text-3xl font-bold leading-9 tracking-tight text-foreground'
/** Section heading — "Popular", "Later today". */
export const V5_HEADING = 'text-xl font-bold leading-7 text-foreground'
/** Big numbers — chances, payouts. */
export const V5_NUM = 'font-bold tabular-nums'

/** Section heading row with an optional action on the right. */
export function V5Heading({
  children,
  action,
  className,
}: {
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-3 flex items-end justify-between gap-3', className)}>
      <h2 className={V5_HEADING}>{children}</h2>
      {action}
    </div>
  )
}

/** Text tabs — uppercase, bold, tracked. Active = foreground. */
export function V5Tabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: T; label: string }[]
  active: T
  onChange: (id: T) => void
  className?: string
}) {
  return (
    <div role="tablist" className={cn('scrollbar-hide flex gap-7 overflow-x-auto overflow-y-hidden', className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'shrink-0 py-1 text-[13px] font-bold uppercase tracking-[0.14em] transition-colors',
            active === t.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

/** League filter pills — logo + short name; active fills, hover lights up. */
export function LeaguePills({
  items,
  active,
  onChange,
  className,
}: {
  items: { id: string; label: string; logo?: string; icon?: React.ReactNode }[]
  active: string
  onChange: (id: string) => void
  className?: string
}) {
  return (
    <FadeScroll axis="x" className={cn('scrollbar-hide -mx-4 flex gap-2.5 overflow-x-auto overflow-y-hidden px-4 md:-mx-6 md:px-6', className)}>
      {items.map((it) => {
        const on = it.id === active
        return (
          <button
            key={it.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(it.id)}
            className={cn(
              'inline-flex h-12 shrink-0 items-center gap-2.5 rounded-full border px-5 text-[15px] font-bold tracking-tight transition-colors',
              on
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-card text-foreground hover:bg-accent',
            )}
          >
            {it.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={it.logo} alt="" className="size-6 object-contain" />
            ) : (
              it.icon
            )}
            {it.label}
          </button>
        )
      })}
    </FadeScroll>
  )
}

/** Big % pill — rounded, bold. Neutral idle, primary when picked. */
export function PctPill({
  chance,
  selected,
  onClick,
  className,
}: {
  chance: number
  selected: boolean
  onClick: (el: HTMLElement) => void
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
        'inline-flex h-11 min-w-[78px] shrink-0 items-center justify-center rounded-full border px-3 text-base tabular-nums transition-colors',
        V5_NUM,
        selected ? CHIP_ON : CHIP_IDLE,
        className,
      )}
    >
      {fmtPctRound(chance)}
    </button>
  )
}

const GLYPHS: Record<string, Icon> = {
  bank: IconBuildingBank,
  monument: IconBuildingMonument,
  lock: IconLock,
  chart: IconChartLine,
  movie: IconMovie,
  music: IconMusic,
  ticket: IconTicket,
  tv: IconDeviceTv,
}

/** Neutral icon tile for Politics / Entertainment markets — Lumen surface, foreground glyph, never a colour. */
export function TopicGlyph({ name, className }: { name: string; className?: string }) {
  const G = GLYPHS[name] ?? IconChartLine
  return (
    <span className={cn('inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground', className)} aria-hidden>
      <G className="size-[55%]" stroke={1.75} />
    </span>
  )
}

/** League logo / name → that league's page. Stops the card underneath from opening. */
export function LeagueLink({
  sport,
  league,
  className,
  children,
}: {
  sport: V5SportId | 'topic' | 'all' | undefined
  league: string
  className?: string
  children: ReactNode
}) {
  const href = leaguePageHref(sport, league)
  if (!href) return <span className={className}>{children}</span>
  return (
    <Link
      href={href}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      className={cn('pointer-events-auto relative z-[1] transition-opacity hover:opacity-70', className)}
    >
      {children}
    </Link>
  )
}

/** Card press — a small squeeze while pressed, a springy release (see `.v5-press` in globals). */
export const V5_PRESS = 'v5-press'

/** "I heard you" while the next page loads — set on tap, cleared by navigation (or 8s). */
export function usePending(): [boolean, () => void] {
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!on) return
    const t = window.setTimeout(() => setOn(false), 8000)
    return () => window.clearTimeout(t)
  }, [on])
  return [on, () => setOn(true)]
}

export function PendingVeil({ on }: { on: boolean }) {
  if (!on) return null
  /* A div with !absolute: cards that style their direct <span> children (relative) can't pull it into
   * the flow. Covers the whole card — content softly blurred, spinner dead centre. */
  return (
    <div
      aria-hidden
      className="pointer-events-none !absolute inset-0 z-[3] flex items-center justify-center rounded-[inherit] bg-[color-mix(in_srgb,var(--background)_45%,transparent)] backdrop-blur-[3px]"
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-popover shadow-md">
        <span className="size-6 animate-spin rounded-full border-[2.5px] border-[color-mix(in_srgb,var(--foreground)_18%,transparent)] border-t-foreground" />
      </span>
    </div>
  )
}
