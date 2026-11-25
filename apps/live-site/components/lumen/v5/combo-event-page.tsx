'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import NumberFlow from '@number-flow/react'
import { IconChevronDown, IconChevronLeft, IconChevronRight, IconUsers } from '@tabler/icons-react'
import { Typography } from '@/components/ui/typography'
import { CasinoLiveWinsCarousel } from '@/components/lumen/casino-live-wins-carousel'
import { ChangeChip, LineChart, RangeTabs, outcomeColor, outcomeDash } from '@/components/lumen/markets/market-ui'
import { SoccerBetslip, type SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { ModePillTrack } from '@/components/lumen/soccer-sport-page'
import {
  EventBreadcrumbs,
  EventHeader,
  EventMissing,
  LiveStatsCard,
  MediaPanel,
  PreMatchCards,
  WinProbabilityCard,
  useIsDesktop,
} from '@/components/lumen/sports-event-view'
import { useShell } from '@/components/site/shell-context'
import { findNflEvent, nflEventModel } from '@/lib/lumen/nfl-sport'
import { findSoccerEvent, soccerEventModel } from '@/lib/lumen/soccer-event'
import type { SoccerOdds } from '@/lib/lumen/soccer-sport'
import { setSoccerSlip, useSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import type {
  EventMarket,
  PlayerLinesMarket,
  PlayersMarket,
  RowMarket,
  SportsEventModel,
} from '@/lib/lumen/sports-event'
import { CHART_RANGES, marketEvent, marketSeries, type ChartRange, type MarketSport } from '@/lib/lumen/sports-markets'
import { sportsReturnHref } from '@/lib/lumen/sports-return'
import {
  bettorsNow,
  eventLadders,
  leadOutcome,
  noCents,
  openComboBuilder,
  pickFor,
  teamRecord,
  yesCents,
  type Ladder,
} from '@/lib/lumen/v5-combos'
import { cn } from '@/lib/utils'
import { BetStackPopup, showBetStack } from './bet-stack-popup'
import { ChartBetStream } from './chart-bet-stream'
import { ComboBuilderOverlay } from './combo-builder'
import { Crest, DrawMark, V5_CARD, YesNoButton, chanceFromAmerican, fmtPctRound, useV5Pick } from './combo-ui'

type Tab = 'lines' | 'props' | 'players'
type OnPick = (pick: SoccerSlipPick, el?: HTMLElement | null) => void

/**
 * V5 · Combos event view — V1 event frame (breadcrumbs, scoreboard header, sticky rail with
 * stream, match tracker and stats) with the prediction-market layer in the main column:
 * chance chart with bets streaming up, then Yes / No rows with line steppers.
 */
export function ComboEventPage({ sport, eventId }: { sport: MarketSport; eventId: string }) {
  const router = useRouter()
  const { startNavigating } = useShell()
  const desktop = useIsDesktop()
  const ev = marketEvent(sport, eventId)
  const model = useMemo<SportsEventModel | null>(() => {
    if (sport === 'nfl') {
      const f = findNflEvent(eventId)
      return f ? nflEventModel(f.event, f.section) : null
    }
    const f = findSoccerEvent(eventId)
    return f ? soccerEventModel(f.event, f.section) : null
  }, [sport, eventId])
  const picks = useSoccerSlip()
  const selected = useMemo(() => new Set(picks.map((p) => p.id)), [picks])
  const onPick = useV5Pick()
  const [tab, setTab] = useState<Tab>('lines')

  const slip = (
    <SoccerBetslip
      picks={picks}
      onRemove={(id) => setSoccerSlip((prev) => prev.filter((p) => p.id !== id))}
      onClear={() => setSoccerSlip([])}
      onChange={setSoccerSlip}
      comboAction={{ label: 'Combo builder', onClick: () => openComboBuilder(sport) }}
      variant="v5"
      onClosedAfterPlace={showBetStack}
    />
  )

  const propMarkets = useMemo(
    () =>
      (model?.markets ?? [])
        .filter((m): m is RowMarket => m.kind === 'row')
        .filter((m) => !m.tabs.includes('lines') && !/^(3-way regulation|moneyline)$/i.test(m.name))
        .filter((m) => m.cells.length >= 2 && m.cells.length <= 4)
        .slice(0, 10),
    [model],
  )
  const playerMarkets = useMemo(
    () =>
      (model?.markets ?? []).filter(
        (m): m is PlayersMarket | PlayerLinesMarket => m.kind === 'players' || m.kind === 'player-lines',
      ),
    [model],
  )

  if (!ev || !model) {
    return (
      <>
        <EventMissing sportLabel={sport === 'nfl' ? 'Football' : 'Soccer'} href={sport === 'nfl' ? '/sports/football' : '/sports/soccer'} />
        {slip}
      </>
    )
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'lines', label: 'Game Lines' },
    ...(propMarkets.length ? [{ id: 'props' as const, label: 'Game Props' }] : []),
    ...(playerMarkets.length ? [{ id: 'players' as const, label: 'Player Props' }] : []),
  ]

  const goBack = () => {
    const href = sportsReturnHref(model.sportHref)
    startNavigating(href)
    router.push(href)
  }

  /** V1 cell → betslip pick. */
  const v1Pick = (cell: SoccerOdds, market: EventMarket, label?: string): SoccerSlipPick => ({
    id: cell.id,
    label: label ?? cell.slipLabel ?? cell.label,
    odds: cell.odds,
    eventLabel: model.eventLabel,
    market: market.slipMarket ?? market.name,
    eventId: model.event.id,
    eventHref: model.hrefFor(model.event.id),
    sport: model.sport,
    live: !!model.event.live,
  })

  return (
    <div
      data-name="v5-combo-event"
      data-live={model.event.live ? 'true' : 'false'}
      className="mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 md:py-6"
    >
      <EventBreadcrumbs model={model} onBack={goBack} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <EventHeader model={model} />

          {/* Below lg the stream / tracker sit in-flow; lg+ they live in the rail. */}
          <div className="mt-4 lg:hidden">
            {model.live ? (desktop === false ? <MediaPanel model={model} /> : null) : <WinProbabilityCard model={model} />}
          </div>

          <ChanceChart game={ev.game} />

          <ModePillTrack active={tab} onChange={setTab} modes={tabs} ariaLabel="Market groups" className="mb-4 mt-5" />

          <div className="flex flex-col gap-3">
            {tab === 'lines' ? <GameLines game={ev.game} selected={selected} onPick={onPick} /> : null}
            {tab === 'props' ? (
              <>
                <PropPairs markets={propMarkets.filter(isPair)} selected={selected} onPick={onPick} toPick={v1Pick} />
                {propMarkets
                  .filter((m) => !isPair(m))
                  .map((m) => (
                    <PropCard key={m.id} market={m} selected={selected} onPick={onPick} toPick={v1Pick} />
                  ))}
              </>
            ) : null}
            {tab === 'players'
              ? playerMarkets.map((m) =>
                  m.kind === 'players' ? (
                    <PlayersCard key={m.id} market={m} selected={selected} onPick={onPick} toPick={v1Pick} />
                  ) : (
                    <PlayerLinesCard key={m.id} market={m} selected={selected} onPick={onPick} toPick={v1Pick} />
                  ),
                )
              : null}
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:hidden">
            {model.live ? <LiveStatsCard model={model} /> : <PreMatchCards model={model} />}
          </div>
        </div>

        {/* Rail — stream, match tracker and stats: the part a prediction market can't give you. */}
        <aside
          aria-label={model.event.live ? 'Live stream and tracker' : 'Game stats'}
          className={cn(
            'scrollbar-hide hidden min-w-0 flex-col gap-4 lg:flex lg:self-start lg:overflow-y-auto',
            'lg:sticky lg:top-[calc(var(--shell-chrome-h,140px)+16px)]',
            'lg:max-h-[calc(100dvh-var(--shell-chrome-h,140px)-32px)]',
          )}
        >
          {model.live ? (
            <>
              {desktop ? <MediaPanel model={model} /> : null}
              <LiveStatsCard model={model} />
            </>
          ) : (
            <>
              <WinProbabilityCard model={model} />
              <PreMatchCards model={model} />
            </>
          )}
        </aside>
      </div>

      <div className="-mx-4 mt-8 md:-mx-6">
        <CasinoLiveWinsCarousel />
      </div>

      {slip}
      <ComboBuilderOverlay />
      <BetStackPopup />
    </div>
  )
}

// ─── Chance chart ──────────────────────────────────────────────

function ChanceChart({ game }: { game: NonNullable<ReturnType<typeof marketEvent>>['game'] }) {
  const [range, setRange] = useState<ChartRange>('1W')
  const [extraVolume, setExtraVolume] = useState(0)
  const lead = leadOutcome(game)
  const colorOf = (id: string) => {
    const o = game.outcomes.find((x) => x.id === id)
    return o ? outcomeColor(o, game.outcomes) : 'var(--foreground)'
  }
  const series = marketSeries(game, range)
  const lines = game.outcomes.map((o, i) => ({
    id: o.id,
    label: o.short || o.label,
    color: outcomeColor(o, game.outcomes),
    dash: outcomeDash(o, game.outcomes),
    values: series[i]!,
  }))
  return (
    <section data-name="v5-chance-chart" className={cn(V5_CARD, 'mt-4 p-4 md:p-5')}>
      <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
        {game.outcomes.map((o) => (
          <div key={o.id} className="min-w-0">
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-0.5 w-3 rounded-full" style={{ background: colorOf(o.id) }} aria-hidden />
              {o.short || o.label}
            </p>
            <p className="mt-0.5 flex items-baseline gap-1.5">
              <span
                className={cn(
                  'text-2xl font-semibold tabular-nums',
                  o.id === lead.id ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {fmtPctRound(o.chance)}
              </span>
              <ChangeChip value={o.change} />
            </p>
          </div>
        ))}
        <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
          <IconUsers className="size-3.5" stroke={1.5} aria-hidden /> {bettorsNow(game)} betting now
        </span>
      </div>
      <div className="relative mt-3">
        <LineChart lines={lines} height={240} showLegend={false} />
        <ChartBetStream game={game} colorOf={colorOf} onBet={(a) => setExtraVolume((v) => v + a)} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-xs tabular-nums text-muted-foreground">
          <span className="font-semibold text-foreground">
            $<NumberFlow value={game.volume + extraVolume} format={{ useGrouping: true }} />
          </span>{' '}
          vol
        </span>
        <RangeTabs value={range} onChange={setRange} ranges={CHART_RANGES} />
      </div>
    </section>
  )
}

// ─── Shared market frame + rows ────────────────────────────────

function MarketFrame({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section data-name="v5-market" className={cn(V5_CARD, 'overflow-hidden')}>
      <div className="flex h-11 items-center gap-2 border-b border-border px-4">
        <Typography as="h3" shape="small" weight="semibold" className="min-w-0 flex-1 truncate">
          {title}
        </Typography>
        {aside}
      </div>
      <div className="divide-y divide-border">{children}</div>
    </section>
  )
}

/** One question: label · chance · Yes / No (or a single Yes). */
function MarketRow({
  lead,
  label,
  sub,
  chance,
  change,
  yes,
  no,
  stepper,
}: {
  lead?: ReactNode
  label: ReactNode
  sub?: ReactNode
  chance: number
  change?: number
  yes: { value: number; selected: boolean; onClick: (el: HTMLElement) => void }
  no?: { value: number; selected: boolean; onClick: (el: HTMLElement) => void }
  stepper?: ReactNode
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 px-4 py-3 md:grid-cols-[minmax(0,1fr)_96px_auto]">
      <div className="flex min-w-0 items-center gap-3">
        {lead}
        <div className="min-w-0">
          <Typography as="p" shape="small" weight="medium" className="truncate">
            {label}
          </Typography>
          {sub ? <p className="truncate text-xs text-muted-foreground">{sub}</p> : null}
          {stepper ? <div className="mt-2">{stepper}</div> : null}
        </div>
      </div>
      <span className="flex items-center justify-end gap-1 md:justify-start">
        <span className="text-lg font-semibold tabular-nums text-foreground">{fmtPctRound(chance)}</span>
        {change !== undefined ? <ChangeChip value={change} /> : null}
      </span>
      <span className="col-span-2 flex gap-2 md:col-span-1">
        <YesNoButton side="yes" value={yes.value} selected={yes.selected} onClick={yes.onClick} className="flex-1 md:flex-none" />
        {no ? (
          <YesNoButton side="no" value={no.value} selected={no.selected} onClick={no.onClick} className="flex-1 md:flex-none" />
        ) : (
          <span className="hidden min-w-[108px] md:block" aria-hidden />
        )}
      </span>
    </div>
  )
}

/** ‹ 2.5 · 3.5 · 4.5 › — V1 chip track. */
function LineStepper({
  labels,
  index,
  onChange,
}: {
  labels: string[]
  index: number
  onChange: (i: number) => void
}) {
  const start = Math.min(Math.max(0, index - 2), Math.max(0, labels.length - 5))
  const visible = labels.slice(start, start + 5)
  const step = (d: 1 | -1) => onChange(Math.min(labels.length - 1, Math.max(0, index + d)))
  return (
    <div className="inline-flex h-8 items-center gap-0.5 rounded-lg border border-border bg-secondary px-0.5">
      <button
        type="button"
        aria-label="Lower line"
        onClick={() => step(-1)}
        disabled={index === 0}
        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
      >
        <IconChevronLeft className="size-4" stroke={1.5} />
      </button>
      {visible.map((l, k) => {
        const i = start + k
        return (
          <button
            key={`${l}-${i}`}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              'h-7 min-w-[44px] rounded-md px-1.5 text-xs tabular-nums transition-colors',
              i === index ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {l}
          </button>
        )
      })}
      <button
        type="button"
        aria-label="Higher line"
        onClick={() => step(1)}
        disabled={index === labels.length - 1}
        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
      >
        <IconChevronRight className="size-4" stroke={1.5} />
      </button>
    </div>
  )
}

// ─── Game lines ────────────────────────────────────────────────

function GameLines({
  game,
  selected,
  onPick,
}: {
  game: NonNullable<ReturnType<typeof marketEvent>>['game']
  selected: Set<string>
  onPick: OnPick
}) {
  const ladders = eventLadders(game)
  return (
    <>
      <MarketFrame title="Who wins?" aside={<span className="text-xs text-muted-foreground">Chance</span>}>
        {game.outcomes.map((o) => {
          const yes = pickFor(game, o, 'yes')
          const no = pickFor(game, o, 'no')
          const isDraw = o.label === 'Draw'
          return (
            <MarketRow
              key={o.id}
              lead={isDraw ? <DrawMark className="size-8" /> : <Crest name={o.team ?? o.label} className="size-8" />}
              label={o.label}
              sub={teamRecord(game, o) ?? undefined}
              chance={o.chance}
              change={o.change}
              yes={{ value: yesCents(o.chance), selected: selected.has(yes.id), onClick: (el) => onPick(yes, el) }}
              no={{ value: noCents(o.chance), selected: selected.has(no.id), onClick: (el) => onPick(no, el) }}
            />
          )
        })}
      </MarketFrame>
      {ladders.map((l) => (
        <LadderCard key={l.kind} ladder={l} selected={selected} onPick={onPick} />
      ))}
    </>
  )
}

function LadderCard({ ladder, selected, onPick }: { ladder: Ladder; selected: Set<string>; onPick: OnPick }) {
  const [index, setIndex] = useState(ladder.defaultIndex)
  const rung = ladder.rungs[index]!
  return (
    <MarketFrame title={ladder.kind === 'spread' ? 'Spread' : 'Total'}>
      <MarketRow
        label={
          <>
            {ladder.lead} <span className="text-primary">{rung.line}</span> {ladder.unit}
          </>
        }
        chance={rung.chance}
        change={rung.change}
        stepper={<LineStepper labels={ladder.rungs.map((r) => String(r.line))} index={index} onChange={setIndex} />}
        yes={{ value: yesCents(rung.chance), selected: selected.has(rung.yes.id), onClick: (el) => onPick(rung.yes, el) }}
        no={{ value: noCents(rung.chance), selected: selected.has(rung.no.id), onClick: (el) => onPick(rung.no, el) }}
      />
    </MarketFrame>
  )
}

// ─── Game props (V1 markets as Yes / No rows) ──────────────────

type ToPick = (cell: SoccerOdds, market: EventMarket, label?: string) => SoccerSlipPick

const YES_FIRST = /^(yes|over|odd)$/i
const NO_SECOND = /^(no|under|even)$/i

function isPair(m: RowMarket): boolean {
  const [a, b] = m.cells
  return m.cells.length === 2 && !!a && !!b && YES_FIRST.test(a.label) && NO_SECOND.test(b.label)
}

/** Yes / No pairs share one card — one question per row, Kalshi style. */
function PropPairs({
  markets,
  selected,
  onPick,
  toPick,
}: {
  markets: RowMarket[]
  selected: Set<string>
  onPick: OnPick
  toPick: ToPick
}) {
  if (!markets.length) return null
  return (
    <MarketFrame title="Yes or no" aside={<span className="text-xs text-muted-foreground">Chance</span>}>
      {markets.map((m) => {
        const [a, b] = m.cells as [SoccerOdds, SoccerOdds]
        const pa = chanceFromAmerican(a.odds)
        const pb = chanceFromAmerican(b.odds)
        const yes = toPick(a, m)
        const no = toPick(b, m)
        return (
          <MarketRow
            key={m.id}
            label={/^yes$/i.test(a.label) ? m.name : (a.slipLabel ?? `${m.name}: ${a.label}`)}
            chance={(100 * pa) / (pa + pb)}
            yes={{ value: Math.round(pa), selected: selected.has(yes.id), onClick: (el) => onPick(yes, el) }}
            no={{ value: Math.round(pb), selected: selected.has(no.id), onClick: (el) => onPick(no, el) }}
          />
        )
      })}
    </MarketFrame>
  )
}

/** Several outcomes → one row each, Yes only. */
function PropCard({
  market,
  selected,
  onPick,
  toPick,
}: {
  market: RowMarket
  selected: Set<string>
  onPick: OnPick
  toPick: ToPick
}) {
  const ps = market.cells.map((c) => chanceFromAmerican(c.odds))
  const sum = ps.reduce((s, p) => s + p, 0) || 1
  return (
    <MarketFrame title={market.name} aside={<span className="text-xs text-muted-foreground">Chance</span>}>
      {market.cells.map((c, i) => {
        const pick = toPick(c, market)
        return (
          <MarketRow
            key={c.id}
            label={c.slipLabel ?? c.label}
            chance={(100 * ps[i]!) / sum}
            yes={{ value: Math.round(ps[i]!), selected: selected.has(pick.id), onClick: (el) => onPick(pick, el) }}
          />
        )
      })}
    </MarketFrame>
  )
}

// ─── Player props ──────────────────────────────────────────────

const PLAYER_PREVIEW = 6

function ShowMore({ hidden, open, onClick }: { hidden: number; open: boolean; onClick: () => void }) {
  if (hidden <= 0 && !open) return null
  return (
    <div className="flex justify-center py-2">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        {open ? 'Show less' : `Show ${hidden} more`}
        <IconChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} stroke={1.5} />
      </button>
    </div>
  )
}

function PlayersCard({
  market,
  selected,
  onPick,
  toPick,
}: {
  market: PlayersMarket
  selected: Set<string>
  onPick: OnPick
  toPick: ToPick
}) {
  const [col, setCol] = useState(0)
  const [open, setOpen] = useState(false)
  const rows = market.teams
    .flatMap((t) =>
      t.players.map((p) => ({ player: p, abbr: t.abbr, cell: p.cells[col] })).filter((r) => r.cell),
    )
    .map((r) => ({ ...r, chance: chanceFromAmerican(r.cell!.odds) }))
    .sort((x, y) => y.chance - x.chance)
  const visible = open ? rows : rows.slice(0, PLAYER_PREVIEW)
  return (
    <MarketFrame
      title={market.name}
      aside={
        market.columns.length > 1 ? (
          <div role="tablist" className="flex gap-1">
            {market.columns.map((c, i) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={col === i}
                onClick={() => setCol(i)}
                className={cn(
                  'inline-flex h-7 items-center rounded-lg px-2.5 text-xs transition-colors',
                  col === i ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        ) : null
      }
    >
      {visible.map(({ player, abbr, cell, chance }) => {
        const pick = toPick(cell!, market, cell!.slipLabel ?? `${player.name} ${market.columns[col] ?? ''}`.trim())
        return (
          <MarketRow
            key={`${player.id}-${col}`}
            label={player.name}
            sub={[abbr, player.pos].filter(Boolean).join(' · ')}
            chance={chance}
            yes={{ value: Math.round(chance), selected: selected.has(pick.id), onClick: (el) => onPick(pick, el) }}
          />
        )
      })}
      <ShowMore hidden={rows.length - PLAYER_PREVIEW} open={open} onClick={() => setOpen((v) => !v)} />
    </MarketFrame>
  )
}

function PlayerLinesCard({
  market,
  selected,
  onPick,
  toPick,
}: {
  market: PlayerLinesMarket
  selected: Set<string>
  onPick: OnPick
  toPick: ToPick
}) {
  const [open, setOpen] = useState(false)
  const players = market.teams.flatMap((t) => t.players.map((p) => ({ player: p, abbr: t.abbr })))
  const visible = open ? players : players.slice(0, PLAYER_PREVIEW)
  return (
    <MarketFrame title={market.name}>
      {visible.map(({ player, abbr }) => (
        <PlayerLineRow key={player.id} player={player} abbr={abbr} market={market} selected={selected} onPick={onPick} toPick={toPick} />
      ))}
      <ShowMore hidden={players.length - PLAYER_PREVIEW} open={open} onClick={() => setOpen((v) => !v)} />
    </MarketFrame>
  )
}

function PlayerLineRow({
  player,
  abbr,
  market,
  selected,
  onPick,
  toPick,
}: {
  player: PlayerLinesMarket['teams'][number]['players'][number]
  abbr: string
  market: PlayerLinesMarket
  selected: Set<string>
  onPick: OnPick
  toPick: ToPick
}) {
  const main = Math.max(
    0,
    player.rows.findIndex((r) => r.line === player.mainLine),
  )
  const [index, setIndex] = useState(main)
  const row = player.rows[index]!
  const pa = chanceFromAmerican(row.a.odds)
  const pb = chanceFromAmerican(row.b.odds)
  const yes = toPick(row.a, market)
  const no = toPick(row.b, market)
  return (
    <MarketRow
      label={
        <>
          {player.name} <span className="text-muted-foreground">over</span> <span className="text-primary">{row.line}</span>
        </>
      }
      sub={[abbr, player.pos].filter(Boolean).join(' · ')}
      chance={(100 * pa) / (pa + pb)}
      stepper={
        player.rows.length > 1 ? (
          <LineStepper labels={player.rows.map((r) => String(r.line))} index={index} onChange={setIndex} />
        ) : undefined
      }
      yes={{ value: Math.round(pa), selected: selected.has(yes.id), onClick: (el) => onPick(yes, el) }}
      no={{ value: Math.round(pb), selected: selected.has(no.id), onClick: (el) => onPick(no, el) }}
    />
  )
}
