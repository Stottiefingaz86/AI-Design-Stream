'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  MARKET_CARD,
  RangeTabs,
  fmtMoney,
  fmtPct,
} from '@/components/lumen/markets/market-ui'
import { useShell } from '@/components/site/shell-context'
import { useSportsBets } from '@/lib/lumen/sports-bets-store'
import { portfolioSeries, portfolioSummary, type ChartRange } from '@/lib/lumen/sports-markets'
import { cn } from '@/lib/utils'

const RANGES: ChartRange[] = ['1D', '1W', 'ALL']

/** V3 My Bets → Portfolio: account value over time above the traditional bet list. */
export function PortfolioHero() {
  const { loggedIn, balance, setCashierOpen } = useShell()
  const bets = useSportsBets()
  const summary = useMemo(() => portfolioSummary(bets), [bets])
  const [range, setRange] = useState<ChartRange>('1W')

  const total = balance + summary.positionsValue
  const series = useMemo(() => portfolioSeries(total, range), [total, range])
  if (!loggedIn) return null

  const move = total - (series[0] ?? total)
  const movePct = series[0] ? (move / series[0]) * 100 : 0
  const openPct = summary.openCost > 0 ? (summary.openPnl / summary.openCost) * 100 : 0

  return (
    <div data-name="portfolio-hero" className={cn(MARKET_CARD, 'mb-4 flex flex-col gap-4 p-4 md:p-5')}>
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs text-muted-foreground">Account value</div>
          <div className="text-3xl font-bold tabular-nums tracking-tight text-foreground md:text-4xl">
            {fmtMoney(total)}
          </div>
          <div
            className={cn(
              'mt-1 text-sm font-medium tabular-nums',
              move >= 0 ? 'text-success' : 'text-destructive',
            )}
          >
            {fmtMoney(move, true)} ({fmtPct(movePct)}){' '}
            <span className="font-normal text-muted-foreground">
              {range === 'ALL' ? 'all time' : range === '1D' ? 'today' : 'this week'}
            </span>
          </div>
        </div>
        <dl className="flex gap-6 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Cash</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-foreground">{fmtMoney(balance)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Open bets ({summary.open.length})</dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
              {fmtMoney(summary.positionsValue)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Open P/L</dt>
            <dd
              className={cn(
                'mt-0.5 font-semibold tabular-nums',
                summary.openPnl >= 0 ? 'text-success' : 'text-destructive',
              )}
            >
              {fmtMoney(summary.openPnl, true)} ({fmtPct(openPct)})
            </dd>
          </div>
        </dl>
        <Button
          type="button"
          onClick={() => setCashierOpen(true)}
          className="h-9 rounded-lg px-4 max-sm:w-full"
        >
          Deposit
        </Button>
      </div>
      <LineChart
        height={160}
        showLegend={false}
        format={(n) => fmtMoney(n).replace(/\.\d+$/, '')}
        lines={[{ id: 'value', label: 'Value', color: 'var(--foreground)', values: series }]}
      />
      <RangeTabs value={range} onChange={setRange} ranges={RANGES} />
    </div>
  )
}
