'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  ChangeChip,
  LineChart,
  LineSwatch,
  MARKET_CARD,
  OutcomeTilesRail,
  PriceButton,
  RangeTabs,
  TeamMark,
  fmtChance,
  fmtMultiplier,
  fmtVolume,
  outcomeColor,
  outcomeDash,
} from '@/components/lumen/markets/market-ui'
import { revealShellDock } from '@/components/site/shell-scroll'
import { setSoccerSlip, useSoccerSlip, withOneLegPerMarket } from '@/lib/lumen/soccer-slip-store'
import {
  marketEvent,
  marketSeries,
  marketToSlipPick,
  type ChartRange,
  type MarketOutcome,
  type MarketSport,
  type SportsMarket,
} from '@/lib/lumen/sports-markets'
import { flyBetDotToSlip } from '@/lib/lumen/vip-celebrate'
import { cn } from '@/lib/utils'

/** V3 event addition — chance chart + Yes/No questions above the traditional markets. */
export function EventMarketsCard({ sport, eventId }: { sport: MarketSport; eventId: string }) {
  const data = useMemo(() => marketEvent(sport, eventId), [sport, eventId])
  const [range, setRange] = useState<ChartRange>('1D')
  const series = useMemo(() => (data ? marketSeries(data.game, range) : []), [data, range])
  const picks = useSoccerSlip()
  const selectedIds = useMemo(() => new Set(picks.map((p) => p.id)), [picks])

  const buy = useCallback(
    (market: SportsMarket, outcome: MarketOutcome, el?: HTMLElement | null) => {
      if (selectedIds.has(outcome.id)) {
        setSoccerSlip((prev) => prev.filter((p) => p.id !== outcome.id))
        return
      }
      const next = marketToSlipPick(market, outcome)
      setSoccerSlip((prev) => (next.outright ? [next, ...prev] : withOneLegPerMarket(prev, next)))
      revealShellDock()
      flyBetDotToSlip(el ?? null, next.id)
    },
    [selectedIds],
  )

  if (!data) return null
  const { game, lines } = data
  return (
    <section
      data-name="event-markets"
      className={cn(MARKET_CARD, 'mt-4 flex flex-col overflow-hidden')}
    >
      <div className="flex flex-col gap-5 p-5 md:gap-6 md:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="whitespace-nowrap text-base font-semibold text-foreground">Who wins?</h2>
          <span className="hidden whitespace-nowrap text-xs tabular-nums text-muted-foreground sm:inline">
            {fmtVolume(game.volume)}
          </span>
          <RangeTabs value={range} onChange={setRange} className="sm:ml-auto" />
        </div>
        <LineChart
          height={172}
          lines={game.outcomes.map((o, i) => ({
            id: o.id,
            label: o.short,
            color: outcomeColor(o, game.outcomes),
            dash: outcomeDash(o, game.outcomes),
            values: series[i]!,
          }))}
        />

        <OutcomeTilesRail label={`${game.eventLabel} outcomes`} count={game.outcomes.length}>
          {game.outcomes.map((o) => (
            <li
              key={o.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-3.5"
            >
              <div className="flex items-center gap-2.5">
                <LineSwatch
                  color={outcomeColor(o, game.outcomes)}
                  dash={outcomeDash(o, game.outcomes)}
                />
                <TeamMark outcome={o} />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                  {o.label}
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xl font-bold tabular-nums text-foreground">
                    {fmtChance(o.chance)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {fmtMultiplier(o.price)}
                    </span>
                    <ChangeChip value={o.change} className="h-4 px-0" />
                  </span>
                </div>
                <PriceButton
                  outcome={o}
                  selected={selectedIds.has(o.id)}
                  onSelect={(out, el) => buy(game, out, el)}
                  className="h-10 min-w-[64px]"
                />
              </div>
            </li>
          ))}
        </OutcomeTilesRail>

        {lines.length ? (
          <div className="border-t border-border pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              More markets
            </p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {lines.map((m) => {
                const yes = m.outcomes[0]!
                return (
                  <li
                    key={m.id}
                    className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/30 p-3.5"
                  >
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-5 text-foreground">{m.title}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <span className="text-base font-semibold tabular-nums text-foreground">
                          {fmtChance(yes.chance)}
                        </span>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {fmtMultiplier(yes.price)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {m.outcomes.map((o) => (
                        <PriceButton
                          key={o.id}
                          outcome={o}
                          label={o.short}
                          selected={selectedIds.has(o.id)}
                          onSelect={(out, el) => buy(m, out, el)}
                          className="h-10 min-w-0"
                        />
                      ))}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
