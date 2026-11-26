'use client'

import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { decimalOf } from '@/lib/lumen/v5-combos'
import { cn } from '@/lib/utils'
import { ComboMark } from './combo-mark'

/** Combo boost ladder — legs at or above the minimum price earn a multiplier on winnings. */
export const COMBO_BOOST_TIERS = [
  { legs: 4, mult: 1.05 },
  { legs: 6, mult: 1.15 },
  { legs: 8, mult: 1.25 },
  { legs: 12, mult: 1.5 },
] as const
/** -200 American. */
export const COMBO_BOOST_MIN_DECIMAL = 1.5
const SEGMENTS = 12

export function qualifyingLegs(picks: SoccerSlipPick[]): number {
  return picks.filter((p) => !p.outright && decimalOf(p.odds) >= COMBO_BOOST_MIN_DECIMAL).length
}

export function comboBoostFor(legs: number): number {
  return [...COMBO_BOOST_TIERS].reverse().find((t) => legs >= t.legs)?.mult ?? 1
}

const x = (m: number) => `x${m.toFixed(m * 100 % 10 === 0 ? 1 : 2)}`


/**
 * Combo boost meter — 12 segments, tier markers above (x1.05 · x1.15 · x1.25 · x1.5).
 * Builder shows it full size; the betslip uses `compact`.
 */
export function ComboBoostMeter({
  picks,
  compact = false,
  footer,
  className,
}: {
  picks: SoccerSlipPick[]
  compact?: boolean
  /** Extra line under the bar (builder: what $10 pays). */
  footer?: React.ReactNode
  className?: string
}) {
  const n = Math.min(SEGMENTS, qualifyingLegs(picks))
  const boost = comboBoostFor(n)
  const next = COMBO_BOOST_TIERS.find((t) => n < t.legs)
  const left = next ? next.legs - n : 0
  /* One short status, numbers in bold: "3 legs to x1.05" · "x1.15 on · 1 to x1.25" · "Max x1.5". */
  const status = (
    <>
      {boost > 1 ? <span className="font-bold text-success">{x(boost)} on</span> : null}
      {boost > 1 && next ? <span className="text-muted-foreground"> · </span> : null}
      {next ? (
        <span className="text-muted-foreground">
          <span className="font-bold text-foreground">{left}</span> leg{left === 1 ? '' : 's'} to{' '}
          <span className="font-bold text-foreground">{x(next.mult)}</span>
        </span>
      ) : (
        <span className="font-bold text-success"> · max</span>
      )}
    </>
  )
  return (
    <section
      data-name="v5-combo-boost"
      aria-label="Combo boost"
      className={cn(
        'rounded-[14px] border bg-card',
        boost > 1 ? 'border-success' : 'border-border',
        compact ? 'px-3 pb-2.5 pt-2.5' : 'px-4 pb-3.5 pt-3.5',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <ComboMark className={compact ? 'size-4' : 'size-6'} />
        <span className={cn('font-bold tracking-tight text-foreground', compact ? 'text-[13px]' : 'text-base')}>Combo boost</span>
        <span className={cn('ml-auto truncate text-right', compact ? 'text-xs' : 'text-sm')}>{status}</span>
      </div>
      {compact ? null : (
        <p className="mt-0.5 pl-8 text-xs text-muted-foreground">Legs at 1.50x or more count toward a boost on your winnings.</p>
      )}

      {/* Bar, then the tier under the segment where it kicks in — no floating carets. */}
      <div
        className={cn('grid gap-1', compact ? 'mt-2.5' : 'mt-3.5')}
        style={{ gridTemplateColumns: `repeat(${SEGMENTS}, minmax(0, 1fr))` }}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={SEGMENTS}
        aria-valuenow={n}
        aria-valuetext={`${n} qualifying legs, ${x(boost)} boost`}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span
            key={i}
            className={cn(
              compact ? 'h-1.5' : 'h-2',
              'transition-colors duration-300',
              i === 0 && 'rounded-l-full',
              i === SEGMENTS - 1 && 'rounded-r-full',
              i < n ? 'bg-success' : 'bg-secondary',
            )}
          />
        ))}
      </div>
      <div
        className="mt-1 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${SEGMENTS}, minmax(0, 1fr))` }}
        aria-hidden
      >
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const tier = COMBO_BOOST_TIERS.find((t) => t.legs === i + 1)
          return (
            <span
              key={i}
              className={cn(
                'whitespace-nowrap text-center font-semibold tabular-nums leading-4',
                compact ? 'text-[10px]' : 'text-xs',
                tier && n >= tier.legs ? 'text-success' : 'text-muted-foreground',
              )}
            >
              {tier ? x(tier.mult) : ''}
            </span>
          )
        })}
      </div>
      {footer ? <p className="mt-3 text-sm text-muted-foreground">{footer}</p> : null}
    </section>
  )
}
