'use client'

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { IconArrowDownRight, IconArrowUpRight, IconChevronLeft, IconChevronRight, IconMinus } from '@tabler/icons-react'
import { BoardTeamBadge, ODDS_EDGE_ARROW } from '@/components/lumen/soccer-sport-page'
import { CHART_RANGES, type ChartRange, type MarketOutcome } from '@/lib/lumen/sports-markets'
import { cn } from '@/lib/utils'

export const MARKET_CARD =
  'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'

/**
 * Monochrome like the ML % bar — favourite solid foreground, others muted.
 * Secondary lines use dash patterns so each team stays readable without rainbow.
 */
export function outcomeColor(outcome: MarketOutcome, outcomes: MarketOutcome[]): string {
  const lead = outcomes.reduce((a, b) => (b.chance > a.chance ? b : a), outcomes[0]!)
  return outcome.id === lead.id ? 'var(--foreground)' : 'var(--muted-foreground)'
}

/** Stroke dash for non-favourite lines (index among outcomes). Lead = solid. */
export function outcomeDash(outcome: MarketOutcome, outcomes: MarketOutcome[]): string | undefined {
  const lead = outcomes.reduce((a, b) => (b.chance > a.chance ? b : a), outcomes[0]!)
  if (outcome.id === lead.id) return undefined
  const others = outcomes.filter((o) => o.id !== lead.id)
  const i = others.findIndex((o) => o.id === outcome.id)
  return i === 0 ? '5 4' : '2 3'
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export function fmtMoney(n: number, sign = false): string {
  const s = usd.format(Math.abs(n))
  if (!sign) return n < 0 ? `-${s}` : s
  return n > 0.004 ? `+${s}` : n < -0.004 ? `-${s}` : s
}

export function fmtChance(n: number): string {
  if (n > 0 && n < 1) return '<1%'
  if (n > 99 && n < 100) return '>99%'
  return `${Math.round(n)}%`
}

export function fmtCents(n: number): string {
  return `${Math.round(n)}¢`
}

/** Kalshi-style payout multiple from share price (¢). 50¢ → 2.00x */
export function fmtMultiplier(priceCents: number): string {
  if (priceCents <= 0) return '—'
  const x = 100 / priceCents
  return `${x >= 10 ? x.toFixed(1) : x.toFixed(2)}x`
}

export function fmtPct(n: number, sign = true): string {
  const v = Math.abs(n) >= 100 ? Math.round(n) : Math.round(n * 10) / 10
  return `${sign && v > 0 ? '+' : ''}${v}%`
}

export function fmtShares(n: number): string {
  return n >= 100 ? Math.round(n).toLocaleString('en-US') : n.toFixed(2)
}

export function fmtVolume(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M Vol.`
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K Vol.`
  return `$${Math.round(n)} Vol.`
}

export function ChangeChip({
  value,
  unit = 'pts',
  className,
}: {
  value: number
  /** `pts` for chance moves, `pct` for returns. */
  unit?: 'pts' | 'pct'
  className?: string
}) {
  const flat = Math.abs(value) < 0.05
  const up = value > 0
  const Icon = flat ? IconMinus : up ? IconArrowUpRight : IconArrowDownRight
  const text = unit === 'pct' ? fmtPct(Math.abs(value), false) : `${Math.abs(value).toFixed(1)}`
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-0.5 rounded px-1 text-[11px] font-medium tabular-nums leading-none',
        flat ? 'text-muted-foreground' : up ? 'text-success' : 'text-destructive',
        className,
      )}
    >
      <Icon className="size-3" stroke={2.25} aria-hidden />
      {text}
    </span>
  )
}

/**
 * Kalshi-style chance pill — % is the CTA, not “Buy 43¢”.
 * Optional label (Yes/No/short) sits left of the % when provided.
 */
export function PriceButton({
  outcome,
  selected = false,
  label,
  onSelect,
  className,
}: {
  outcome: MarketOutcome
  selected?: boolean
  /** When set, shows left of the % (e.g. Yes / No / SEA). Omit for % only. */
  label?: string
  onSelect: (outcome: MarketOutcome, el: HTMLElement) => void
  className?: string
}) {
  return (
    <button
      type="button"
      data-outcome-id={outcome.id}
      aria-label={`${label ?? outcome.short} ${fmtChance(outcome.chance)}`}
      aria-pressed={selected}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(outcome, e.currentTarget)
      }}
      className={cn(
        'relative z-10 inline-flex h-9 min-w-[52px] shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 text-sm font-semibold tabular-nums transition-colors',
        selected
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-secondary text-foreground hover:bg-accent',
        className,
      )}
    >
      {label ? <span className="truncate font-medium">{label}</span> : null}
      <span>{fmtChance(outcome.chance)}</span>
    </button>
  )
}

export function TeamMark({ outcome }: { outcome: MarketOutcome }) {
  if (outcome.team) return <BoardTeamBadge name={outcome.team} />
  return (
    <span
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground"
      aria-hidden
    >
      <IconMinus className="size-3" stroke={2} />
    </span>
  )
}

export function RangeTabs({
  value,
  onChange,
  ranges = CHART_RANGES,
  className,
}: {
  value: ChartRange
  onChange: (r: ChartRange) => void
  ranges?: ChartRange[]
  className?: string
}) {
  return (
    <div role="tablist" aria-label="Chart range" className={cn('flex gap-1', className)}>
      {ranges.map((r) => {
        const on = r === value
        return (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(r)}
            className={cn(
              'h-7 rounded-md px-2.5 text-xs font-medium transition-colors',
              on
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {r}
          </button>
        )
      })}
    </div>
  )
}

export type ChartLine = {
  id: string
  label: string
  color: string
  values: number[]
  /** SVG stroke-dasharray — solid when omitted. */
  dash?: string
}

const VIEW_W = 600

/**
 * Finance-style line chart. Drag / hover to scrub; the legend follows the cursor.
 * End of each line carries the short label so teams stay readable in monochrome.
 */
export function LineChart({
  lines,
  height = 200,
  format = fmtChance,
  domain,
  showLegend = true,
  endLabels = true,
  className,
}: {
  lines: ChartLine[]
  height?: number
  format?: (n: number) => string
  /** Fixed y range; auto-fits with padding when omitted. */
  domain?: [number, number]
  showLegend?: boolean
  /** Short name next to each line’s end dot. */
  endLabels?: boolean
  className?: string
}) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [scrub, setScrub] = useState<number | null>(null)
  const count = lines[0]?.values.length ?? 0

  const [lo, hi] = useMemo(() => {
    if (domain) return domain
    const all = lines.flatMap((l) => l.values)
    const min = Math.min(...all)
    const max = Math.max(...all)
    const pad = Math.max((max - min) * 0.18, Math.abs(max) * 0.02, 1)
    return [Math.max(0, min - pad), max + pad]
  }, [lines, domain])

  const y = (v: number) => (1 - (v - lo) / (hi - lo || 1)) * height
  const x = (i: number) => (count > 1 ? (i / (count - 1)) * VIEW_W : 0)
  const ticks = [0.2, 0.5, 0.8].map((t) => hi - (hi - lo) * t)
  const at = scrub ?? count - 1

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const box = boxRef.current?.getBoundingClientRect()
    if (!box || count < 2) return
    const t = Math.min(1, Math.max(0, (e.clientX - box.left) / box.width))
    setScrub(Math.round(t * (count - 1)))
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {showLegend ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {lines.map((l) => (
            <span key={l.id} className="inline-flex items-center gap-1.5 text-xs">
              <span
                className="inline-block h-0.5 w-3.5 rounded-full"
                style={{
                  background: l.dash
                    ? `repeating-linear-gradient(90deg, ${l.color} 0 3px, transparent 3px 5px)`
                    : l.color,
                }}
                aria-hidden
              />
              <span className="font-medium text-foreground">{l.label}</span>
              <span className="tabular-nums text-muted-foreground">{format(l.values[at] ?? 0)}</span>
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex gap-2">
        <div
          ref={boxRef}
          className="relative min-w-0 flex-1 touch-pan-y select-none"
          style={{ height }}
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setScrub(null)}
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${height}`}
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
            aria-hidden
          >
            {ticks.map((t) => (
              <line
                key={t}
                x1={0}
                x2={VIEW_W}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--border)"
                strokeDasharray="3 5"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {lines.map((l) => (
              <polyline
                key={l.id}
                fill="none"
                stroke={l.color}
                strokeWidth={l.dash ? 1.75 : 2.25}
                strokeDasharray={l.dash}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                points={l.values.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
              />
            ))}
          </svg>
          {scrub != null ? (
            <span
              className="pointer-events-none absolute inset-y-0 w-px bg-muted-foreground/40"
              style={{ left: `${(at / Math.max(1, count - 1)) * 100}%` }}
              aria-hidden
            />
          ) : null}
          {lines.map((l) => (
            <span
              key={l.id}
              className={cn(
                'pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card',
                scrub == null && 'animate-pulse',
              )}
              style={{
                left: `${(at / Math.max(1, count - 1)) * 100}%`,
                top: y(l.values[at] ?? 0),
                background: l.color,
              }}
              aria-hidden
            />
          ))}
        </div>
        <div
          className={cn(
            'relative shrink-0 text-[10px] font-semibold tabular-nums',
            endLabels ? 'w-14' : 'w-10 text-muted-foreground',
          )}
          style={{ height }}
        >
          {endLabels
            ? lines.map((l) => (
                <span
                  key={l.id}
                  className="absolute left-0 -translate-y-1/2 whitespace-nowrap"
                  style={{ top: y(l.values[at] ?? 0), color: l.color }}
                >
                  {l.label} {format(l.values[at] ?? 0)}
                </span>
              ))
            : ticks.map((t) => (
                <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: y(t) }}>
                  {format(t)}
                </span>
              ))}
        </div>
      </div>
    </div>
  )
}

/** Tiny stroke sample — matches chart line (solid or dashed). */
export function LineSwatch({
  color,
  dash,
  className,
}: {
  color: string
  dash?: string
  className?: string
}) {
  return (
    <span
      className={cn('inline-block h-0.5 w-3.5 shrink-0 rounded-full', className)}
      style={{
        background: dash
          ? `repeating-linear-gradient(90deg, ${color} 0 3px, transparent 3px 5px)`
          : color,
      }}
      aria-hidden
    />
  )
}

/** Row grammar: crest · name · multiplier · chance pill (Kalshi list). */
export function OutcomeRow({
  outcome,
  outcomes,
  selected,
  onSelect,
  showSwatch = true,
  className,
}: {
  outcome: MarketOutcome
  outcomes: MarketOutcome[]
  selected: boolean
  onSelect: (outcome: MarketOutcome, el: HTMLElement) => void
  showSwatch?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex h-11 items-center gap-2.5', className)}>
      {showSwatch ? (
        <LineSwatch color={outcomeColor(outcome, outcomes)} dash={outcomeDash(outcome, outcomes)} />
      ) : null}
      <TeamMark outcome={outcome} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {outcome.label}
      </span>
      <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
        {fmtMultiplier(outcome.price)}
      </span>
      <PriceButton outcome={outcome} selected={selected} onSelect={onSelect} />
    </div>
  )
}

/** Tiny trend line — no axes, no scrub. */
export function Sparkline({
  values,
  color,
  className,
}: {
  values: number[]
  color: string
  className?: string
}) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const h = 32
  const pts = values
    .map((v, i) => {
      const px = (i / Math.max(1, values.length - 1)) * 120
      const py = h - ((v - min) / (max - min || 1)) * (h - 4) - 2
      return `${px},${py}`
    })
    .join(' ')
  return (
    <svg viewBox={`0 0 120 ${h}`} preserveAspectRatio="none" className={cn('h-8 w-full', className)} aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        points={pts}
      />
    </svg>
  )
}

/**
 * Who wins? / featured outcome tiles.
 * ≤2 → equal grid. More → one-row carousel (swipe; glass arrows on fine pointer) like Odds Boosts / Market questions.
 */
export function OutcomeTilesRail({
  label,
  count,
  children,
  className,
}: {
  label: string
  count: number
  children: ReactNode
  className?: string
}) {
  const scrollRef = useRef<HTMLUListElement>(null)
  const [canBack, setCanBack] = useState(false)
  const [canMore, setCanMore] = useState(false)
  const [showArrows, setShowArrows] = useState(false)

  const measure = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanBack(el.scrollLeft > 8)
    setCanMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  useLayoutEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setShowArrows(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useLayoutEffect(() => {
    if (count <= 2) return
    const el = scrollRef.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure, count, children])

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>(':scope > *')
    const step = card ? card.offsetWidth + 12 : Math.min(220, el.clientWidth * 0.7)
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  if (count <= 2) {
    return (
      <ul className={cn('grid grid-cols-2 gap-3', className)} data-name="market-outcome-tiles">
        {children}
      </ul>
    )
  }

  return (
    <div className={cn('relative min-w-0', className)} data-name="market-outcome-rail">
      <ul
        ref={scrollRef}
        aria-label={label}
        className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain [&>*]:w-[min(11.5rem,calc(50%-0.375rem))] [&>*]:shrink-0 [&>*]:snap-start"
        onScroll={measure}
      >
        {children}
      </ul>
      {showArrows && canBack ? (
        <button
          type="button"
          aria-label={`Scroll ${label} back`}
          className={cn(ODDS_EDGE_ARROW, 'left-0')}
          onClick={() => scrollBy(-1)}
        >
          <IconChevronLeft className="size-4" strokeWidth={2} />
        </button>
      ) : null}
      {showArrows && canMore ? (
        <button
          type="button"
          aria-label={`Scroll ${label} forward`}
          className={cn(ODDS_EDGE_ARROW, 'right-0')}
          onClick={() => scrollBy(1)}
        >
          <IconChevronRight className="size-4" strokeWidth={2} />
        </button>
      ) : null}
    </div>
  )
}
