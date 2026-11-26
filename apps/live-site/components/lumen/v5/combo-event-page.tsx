'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import NumberFlow from '@number-flow/react'
import {
  IconBan,
  IconCalendarEvent,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheckFilled,
  IconUsers,
} from '@tabler/icons-react'
import { V5PillTrack } from './v5-pill-track'
import { ChangeChip, LineChart, RangeTabs, outcomeColor, outcomeDash } from '@/components/lumen/markets/market-ui'
import { SoccerBetslip, type SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import {
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
  EventColumnHead,
  EventMarket,
  GridMarket,
  LadderMarket,
  LinesMarket,
  ListMarket,
  PlayerLinesMarket,
  PlayersMarket,
  RowMarket,
  ScoreMarket,
  SportsEventModel,
} from '@/lib/lumen/sports-event'
import { CHART_RANGES, marketEvent, marketSeries, type ChartRange, type SportsMarket } from '@/lib/lumen/sports-markets'
import { genEventModel, genGame, sportDef, sportHref, v5SportOf, type V5SportId } from '@/lib/lumen/v5-sportsbook'
import {
  bettorsNow,
  eventLadders,
  leadOutcome,
  leagueLogo,
  leaguePageHref,
  noCents,
  openComboBuilder,
  pickFor,
  teamRecord,
  v5Games,
  yesCents,
  type Ladder,
} from '@/lib/lumen/v5-combos'
import { cn } from '@/lib/utils'
import { BetStackPopup, showBetStack } from './bet-stack-popup'
import { CasinoMiniPlayer } from './casino-mini-player'
import { ChartBetStream } from './chart-bet-stream'
import { ComboBuilderOverlay } from './combo-builder'
import { SportsActivity } from './v5-activity'
import { V5EventCrumbs } from './v5-event-crumbs'
import { FadeScroll } from './v5-fade-scroll'
import { GenTracker, hasGenTracker } from './v5-tracker'
import { Crest, DrawMark, V5_CARD, V5_LIGHT_UP, YesNoButton, chanceFromAmerican, fmtPctRound, useV5Pick } from './combo-ui'

type OnPick = (pick: SoccerSlipPick, el?: HTMLElement | null) => void

/**
 * V5 · Combos event view — V1 event frame (breadcrumbs, scoreboard header, sticky rail with
 * stream, match tracker and stats) with the prediction-market layer in the main column:
 * chance chart with bets streaming up, then Yes / No rows with line steppers.
 */
export function ComboEventPage({ sport, eventId }: { sport: V5SportId; eventId: string }) {
  const router = useRouter()
  const { startNavigating } = useShell()
  const desktop = useIsDesktop()
  /* Generated sports (and the extra soccer leagues) come from the V5 sportsbook; V1 boards from V1. */
  const gen = genGame(eventId)
  const v1 = gen ? null : sport === 'nfl' || sport === 'soccer' ? marketEvent(sport, eventId) : null
  const ev = gen ? { game: gen as SportsMarket } : v1
  const field = !!gen?.field
  /* Sports V1 has no tracker for (basketball, hockey, tennis…) get the V5 one while live. */
  const genLive = !!gen && !field && !!gen.live && hasGenTracker(gen as SportsMarket)
  const model = useMemo<SportsEventModel | null>(() => {
    if (gen) return genEventModel(eventId)
    if (sport === 'nfl') {
      const f = findNflEvent(eventId)
      return f ? nflEventModel(f.event, f.section) : null
    }
    if (sport !== 'soccer') return null
    const f = findSoccerEvent(eventId)
    return f ? soccerEventModel(f.event, f.section) : null
  }, [sport, eventId, gen])
  const picks = useSoccerSlip()
  const selected = useMemo(() => new Set(picks.map((p) => p.id)), [picks])
  const onPick = useV5Pick()
  const [tab, setTab] = useState('popular')

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

  /* Every V1 market, in V1's own groups (Popular · Goals · Halves · Corners · Cards · Players …). */
  const tabs = useMemo(
    () =>
      (model?.tabs ?? []).filter(
        (t) => t.id === 'popular' || (model?.markets ?? []).some((m) => m.tabs.includes(t.id)),
      ),
    [model],
  )
  const activeTab = tabs.some((t) => t.id === tab) ? tab : (tabs[0]?.id ?? 'popular')
  const tabMarkets = (model?.markets ?? []).filter(
    (m) => m.tabs.includes(activeTab) && !(activeTab === 'popular' && MAIN_LINES.test(m.name)),
  )

  if (!ev || !model) {
    return (
      <>
        <EventMissing sportLabel={sportDef(sport).label} href={sportHref(sport)} />
        {slip}
      </>
    )
  }

  /* Back = wherever the player came from; a direct visit falls back to this game's league page. */
  const goBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    const href = leaguePageHref(sport, model.league.name) ?? model.sportHref
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
      <V5EventCrumbs model={model} sport={sport} onBack={goBack} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          {field ? <FieldHeader game={ev.game} /> : <EventHeader model={model} />}

          {/* Below lg the stream / tracker sit in-flow; lg+ they live in the rail. */}
          <div className="mt-4 lg:hidden">
            {field ? null : genLive ? (
              <GenTracker game={ev.game} />
            ) : model.live ? (
              desktop === false ? <MediaPanel model={model} statsSlot={<LiveStatsCard model={model} bare />} /> : null
            ) : (
              <WinProbabilityCard model={model} />
            )}
          </div>

          <ChanceChart game={ev.game} />

          {/* Market groups — V1 pill track */}
          <V5PillTrack active={activeTab} onChange={setTab} modes={tabs} ariaLabel="Market groups" className="mb-4 mt-6" />

          <div className="flex flex-col gap-3">
            {activeTab === 'popular' ? <GameLines game={ev.game} selected={selected} onPick={onPick} /> : null}
            <V1Markets
              markets={tabMarkets}
              teams={[model.event.home, model.event.away]}
              selected={selected}
              onPick={onPick}
              toPick={v1Pick}
            />
          </div>

          <MarketRules game={ev.game} />
          <AlsoBetting game={ev.game} sport={v5SportOf(ev.game)} />
          <div className="mt-12">
            <SportsActivity sport={v5SportOf(ev.game)} league={ev.game.leagueName} />
          </div>

          <div className="mt-6 flex flex-col gap-4 lg:hidden">
            {/* Phones: live stats are a tab on the stream / tracker card, not at the bottom. */}
            {model.live ? null : <PreMatchCards model={model} />}
          </div>
        </div>

        {/* Rail — stream, match tracker and stats: the part a prediction market can't give you. */}
        {/* Sticky rail — fades at the edge it scrolls under, never a hard clip. */}
        <FadeScroll
          role="complementary"
          label={model.event.live ? 'Live stream and tracker' : 'Game stats'}
          className={cn(
            'scrollbar-hide hidden min-w-0 flex-col gap-4 lg:flex lg:self-start lg:overflow-y-auto [&>*]:shrink-0',
            'lg:sticky lg:top-[calc(var(--shell-chrome-h,140px)+16px)]',
            'lg:max-h-[calc(100dvh-var(--shell-chrome-h,140px)-32px)]',
          )}
        >
          {field ? (
            <FieldCard game={ev.game} />
          ) : genLive ? (
            <>
              <GenTracker game={ev.game} />
              <WinProbabilityCard model={model} />
              <PreMatchCards model={model} />
            </>
          ) : model.live ? (
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
        </FadeScroll>
      </div>

      {slip}
      <ComboBuilderOverlay />
      <BetStackPopup />
      <CasinoMiniPlayer />
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
                  'text-3xl font-bold leading-none tabular-nums tracking-tight',
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
      <div className="flex h-12 items-center gap-2 border-b border-border px-4">
        <h3 className="min-w-0 flex-1 truncate text-lg font-bold tracking-tight text-foreground">{title}</h3>
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
          <p className="truncate text-base font-bold tracking-tight text-foreground">{label}</p>
          {sub ? <p className="truncate text-xs text-muted-foreground">{sub}</p> : null}
        </div>
      </div>
      <span className="flex items-center justify-end gap-1 md:justify-start">
        <span className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{fmtPctRound(chance)}</span>
        {change !== undefined ? <ChangeChip value={change} /> : null}
      </span>
      {/* Line stepper — its own full-width row on phones (never under the %), under the label from md. */}
      {stepper ? <div className="col-span-2 min-w-0 md:col-span-1 md:col-start-1 md:row-start-2 md:-mt-1">{stepper}</div> : null}
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

/** ‹ 2.5 · 3.5 · 4.5 › — V1 chip track. Phones: every line in one swipeable row, picked one centred, no arrows. */
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
  const step = (d: 1 | -1) => onChange(Math.min(labels.length - 1, Math.max(0, index + d)))
  const rowRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const row = rowRef.current
    const chip = row?.querySelector<HTMLElement>('[data-on="true"]')
    if (!row || !chip || row.scrollWidth <= row.clientWidth) return
    row.scrollTo({ left: chip.offsetLeft - row.clientWidth / 2 + chip.offsetWidth / 2, behavior: 'smooth' })
  }, [index])
  const chip = (l: string, i: number, extra?: string) => (
    <button
      key={`${l}-${i}`}
      type="button"
      data-on={i === index}
      onClick={() => onChange(i)}
      className={cn(
        'h-8 min-w-[52px] shrink-0 rounded-md px-2 text-sm tabular-nums transition-colors md:h-7 md:min-w-[44px] md:px-1.5 md:text-xs',
        i === index ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
        extra,
      )}
    >
      {l}
    </button>
  )
  return (
    <>
      <div
        ref={rowRef}
        className="scrollbar-hide flex h-10 w-full items-center gap-1 overflow-x-auto rounded-lg border border-border bg-secondary px-1 md:hidden"
      >
        {labels.map((l, i) => chip(l, i))}
      </div>
      <div className="hidden h-8 items-center gap-0.5 rounded-lg border border-border bg-secondary px-0.5 md:inline-flex">
        <button
          type="button"
          aria-label="Lower line"
          onClick={() => step(-1)}
          disabled={index === 0}
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
        >
          <IconChevronLeft className="size-4" stroke={1.5} />
        </button>
        {labels.slice(start, start + 5).map((l, k) => chip(l, start + k))}
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
    </>
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
            {ladder.lead} <span className="font-bold">{rung.line}</span> {ladder.unit}
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
  title = 'Yes or no',
}: {
  title?: string
  markets: RowMarket[]
  selected: Set<string>
  onPick: OnPick
  toPick: ToPick
}) {
  if (!markets.length) return null
  return (
    <MarketFrame title={title} aside={<span className="text-xs text-muted-foreground">Chance</span>}>
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
  teams,
  selected,
  onPick,
  toPick,
}: {
  market: RowMarket
  teams: string[]
  selected: Set<string>
  onPick: OnPick
  toPick: ToPick
}) {
  return (
    <OutcomesCard
      title={market.name}
      market={market}
      items={market.cells.map((c) => ({ cell: countLabel(c, market.name), lead: leadFor(c.label, teams) }))}
      selected={selected}
      onPick={onPick}
      toPick={toPick}
    />
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
          {player.name} <span className="text-muted-foreground">over</span> <span className="font-bold">{row.line}</span>
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

// ─── Races (many runners) ──────────────────────────────────────

function FieldHeader({ game }: { game: SportsMarket }) {
  const [venue, race, dist] = game.title.split(' · ')
  return (
    <section data-name="v5-field-header" className={cn(V5_CARD, 'rounded-[14px] px-4 pb-5 pt-4 md:px-6')}>
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={game.leagueIcon} alt="" className="size-4 shrink-0 object-contain" />
          <span className="truncate">{venue}</span>
        </span>
        <span className={cn('font-semibold', game.live ? 'text-destructive' : '')}>{game.live ? `Live · ${game.when}` : game.when}</span>
      </div>
      <h1 className="mt-3 text-3xl font-bold leading-9 tracking-tight text-foreground">{race}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {dist} · {game.outcomes.length} runners · {fmtPctRound(game.outcomes[0]!.chance)} favourite
      </p>
    </section>
  )
}

/** Rail for races — every runner's chance, form string and number. */
function FieldCard({ game }: { game: SportsMarket }) {
  return (
    <section className={cn(V5_CARD, 'rounded-[14px] p-4')}>
      <h3 className="mb-3 text-base font-bold text-foreground">Runners</h3>
      <ol className="flex flex-col gap-3">
        {game.outcomes.map((o, i) => (
          <li key={o.id} className="flex items-center gap-3">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold tabular-nums text-foreground">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">{o.label}</span>
              <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-secondary">
                <span className="block h-full rounded-full bg-foreground" style={{ width: `${Math.max(4, o.chance)}%` }} />
              </span>
            </span>
            <span className="w-10 shrink-0 text-right text-sm font-bold tabular-nums text-foreground">{fmtPctRound(o.chance)}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

// ─── Every V1 market as Kalshi rows ────────────────────────────

/** The chance-chart Game Lines already cover these on Popular. */
const MAIN_LINES = /^(3-way regulation|spread|total|game lines|alternate spread|alternate total|moneyline)$/i
const PREVIEW = 6

function leadFor(name: string | undefined, teams: string[]): ReactNode {
  if (!name) return undefined
  if (/^draw$/i.test(name)) return <DrawMark className="size-8" />
  return teams.includes(name) ? <Crest name={name} className="size-8" /> : undefined
}

/** "2" → "2 goals", "5+" → "5+ goals" on count markets (Exact Total Goals, Total Touchdowns…). */
function countLabel(cell: SoccerOdds, marketName: string): SoccerOdds {
  if (cell.slipLabel || !/^\d+\+?$/.test(cell.label.trim())) return cell
  const unit = marketName.match(/(goals|corners|cards|points|touchdowns)\b/i)?.[1]?.toLowerCase()
  return unit ? { ...cell, label: `${cell.label} ${unit}` } : cell
}

/** "Over 2.5" / "Sevilla +1.5" — the slip label, or the column head + chip label. */
function cellLabel(cell: SoccerOdds, head?: string): string {
  if (cell.slipLabel) return cell.slipLabel
  if (!head || /[a-z]/i.test(cell.label)) return cell.label
  return `${head} ${cell.label}`
}

function V1Markets({
  markets,
  teams,
  selected,
  onPick,
  toPick,
}: {
  markets: EventMarket[]
  teams: string[]
  selected: Set<string>
  onPick: OnPick
  toPick: ToPick
}) {
  const pairs = markets.filter((m): m is RowMarket => m.kind === 'row' && isPair(m))
  const firstPair = markets.findIndex((m) => m.kind === 'row' && isPair(m))
  return (
    <>
      {markets.map((m, i) => {
        if (m.kind === 'row' && isPair(m)) {
          return i === firstPair ? (
            <PropPairs key="pairs" markets={pairs} selected={selected} onPick={onPick} toPick={toPick} />
          ) : null
        }
        const common = { selected, onPick, toPick }
        switch (m.kind) {
          case 'row':
            return <PropCard key={m.id} market={m} teams={teams} {...common} />
          case 'ladder':
            return <V1LadderCard key={m.id} market={m} {...common} />
          case 'list':
            return <ListCard key={m.id} market={m} teams={teams} {...common} />
          case 'grid':
            return <GridCard key={m.id} title={m.name} market={m} columns={m.columns} {...common} />
          case 'score':
            return <GridCard key={m.id} title={m.name} market={m} columns={m.grid} other={m.other} {...common} />
          case 'lines':
            return <LinesCard key={m.id} market={m} {...common} />
          case 'players':
            return <PlayersCard key={m.id} market={m} {...common} />
          case 'player-lines':
            return <PlayerLinesCard key={m.id} market={m} {...common} />
          default:
            return null
        }
      })}
    </>
  )
}

/** Multi-outcome market — one Yes row per outcome, chances normalised, top six then Show more. */
function OutcomesCard({
  title,
  market,
  items,
  sort = false,
  selected,
  onPick,
  toPick,
}: {
  title: string
  market: EventMarket
  items: { cell: SoccerOdds; sub?: string; lead?: ReactNode }[]
  sort?: boolean
  selected: Set<string>
  onPick: OnPick
  toPick: ToPick
}) {
  const [open, setOpen] = useState(false)
  const ps = items.map((it) => chanceFromAmerican(it.cell.odds))
  const sum = ps.reduce((s, p) => s + p, 0) || 1
  const rows = items.map((it, i) => ({ ...it, chance: (100 * ps[i]!) / sum, price: ps[i]! }))
  if (sort) rows.sort((x, y) => y.chance - x.chance)
  const visible = open ? rows : rows.slice(0, PREVIEW)
  return (
    <MarketFrame title={title} aside={<span className="text-xs text-muted-foreground">Chance</span>}>
      {visible.map((r) => {
        const pick = toPick(r.cell, market)
        return (
          <MarketRow
            key={r.cell.id}
            lead={r.lead}
            label={r.cell.slipLabel ?? r.cell.label}
            sub={r.sub}
            chance={r.chance}
            yes={{ value: Math.round(r.price), selected: selected.has(pick.id), onClick: (el) => onPick(pick, el) }}
          />
        )
      })}
      <ShowMore hidden={rows.length - PREVIEW} open={open} onClick={() => setOpen((v) => !v)} />
    </MarketFrame>
  )
}

/** V1 line ladder (totals, corners, cards, alt spreads) — one Yes / No row with the line stepper. */
function V1LadderCard({
  market,
  selected,
  onPick,
  toPick,
}: {
  market: LadderMarket
  selected: Set<string>
  onPick: OnPick
  toPick: ToPick
}) {
  const main = Math.max(
    0,
    market.rows.findIndex((r) => r.line === market.mainLine),
  )
  const [index, setIndex] = useState(main)
  const row = market.rows[index] ?? market.rows[0]
  if (!row) return null
  const [ca] = market.columns
  const pa = chanceFromAmerican(row.a.odds)
  const pb = chanceFromAmerican(row.b.odds)
  const yes = toPick(row.a, market)
  const no = toPick(row.b, market)
  return (
    <MarketFrame title={market.name} aside={<span className="text-xs text-muted-foreground">Chance</span>}>
      <MarketRow
        lead={ca.team ? <Crest name={ca.team} className="size-8" /> : undefined}
        label={cellLabel(row.a, ca.label)}
        chance={(100 * pa) / (pa + pb)}
        stepper={
          market.rows.length > 1 ? (
            <LineStepper labels={market.rows.map((r) => String(r.line))} index={index} onChange={setIndex} />
          ) : undefined
        }
        yes={{ value: Math.round(pa), selected: selected.has(yes.id), onClick: (el) => onPick(yes, el) }}
        no={{ value: Math.round(pb), selected: selected.has(no.id), onClick: (el) => onPick(no, el) }}
      />
    </MarketFrame>
  )
}

/** Every line at once (Asian handicap, team totals, 3-way spreads) — two columns → Yes / No rows. */
function ListCard({
  market,
  teams,
  selected,
  onPick,
  toPick,
}: {
  market: ListMarket
  teams: string[]
  selected: Set<string>
  onPick: OnPick
  toPick: ToPick
}) {
  const [open, setOpen] = useState(false)
  type Item = { key: string; a: SoccerOdds; b?: SoccerOdds; label: string; sub?: string; lead?: ReactNode; chance: number }
  const head = (cols: EventColumnHead[], i: number) => cols[i]?.label
  const items: Item[] = market.groups.flatMap((g, gi) =>
    g.rows.flatMap((cells, ri): Item[] => {
      const sub = g.title ?? g.team
      const live = cells.filter((c): c is SoccerOdds => !!c)
      const rowSum = live.reduce((s, c) => s + chanceFromAmerican(c.odds), 0) || 1
      const [a, b] = cells
      if (g.columns.length === 2 && a && b) {
        const pa = chanceFromAmerican(a.odds)
        return [
          {
            key: `${gi}-${ri}`,
            a,
            b,
            label: cellLabel(a, head(g.columns, 0)),
            sub,
            lead: leadFor(g.team ?? g.columns[0]?.team, teams),
            chance: (100 * pa) / rowSum,
          },
        ]
      }
      return cells.flatMap((c, ci): Item[] =>
        c
          ? [
              {
                key: `${gi}-${ri}-${ci}`,
                a: c,
                label: cellLabel(c, head(g.columns, ci)),
                sub,
                lead: leadFor(g.columns[ci]?.team ?? g.columns[ci]?.label, teams),
                chance: (100 * chanceFromAmerican(c.odds)) / rowSum,
              },
            ]
          : [],
      )
    }),
  )
  const preview = Math.max(PREVIEW, market.preview ?? 0)
  const visible = open ? items : items.slice(0, preview)
  return (
    <MarketFrame title={market.name} aside={<span className="text-xs text-muted-foreground">Chance</span>}>
      {visible.map((it) => {
        const yes = toPick(it.a, market)
        const no = it.b ? toPick(it.b, market) : null
        return (
          <MarketRow
            key={it.key}
            lead={it.lead}
            label={it.label}
            sub={it.sub}
            chance={it.chance}
            yes={{ value: Math.round(chanceFromAmerican(it.a.odds)), selected: selected.has(yes.id), onClick: (el) => onPick(yes, el) }}
            no={
              no && it.b
                ? { value: Math.round(chanceFromAmerican(it.b.odds)), selected: selected.has(no.id), onClick: (el) => onPick(no, el) }
                : undefined
            }
          />
        )
      })}
      <ShowMore hidden={items.length - preview} open={open} onClick={() => setOpen((v) => !v)} />
    </MarketFrame>
  )
}

/** Correct score, HT / FT, winning margin — most likely first. */
function GridCard({
  title,
  market,
  columns,
  other,
  selected,
  onPick,
  toPick,
}: {
  title: string
  market: GridMarket | ScoreMarket
  columns: GridMarket['columns']
  other?: SoccerOdds
  selected: Set<string>
  onPick: OnPick
  toPick: ToPick
}) {
  const items = [
    ...columns.flatMap((c) => c.cells.map((cell) => ({ cell, sub: c.label, lead: c.team ? <Crest name={c.team} className="size-8" /> : undefined }))),
    ...(other ? [{ cell: other }] : []),
  ]
  return <OutcomesCard title={title} market={market} items={items} sort selected={selected} onPick={onPick} toPick={toPick} />
}

/** US game lines (halves, quarters) — Spread · Total · Moneyline as Yes / No rows. */
function LinesCard({
  market,
  selected,
  onPick,
  toPick,
}: {
  market: LinesMarket
  selected: Set<string>
  onPick: OnPick
  toPick: ToPick
}) {
  const [r0, r1] = market.rows
  if (!r0 || !r1) return null
  return (
    <MarketFrame title={market.name} aside={<span className="text-xs text-muted-foreground">Chance</span>}>
      {market.columns.map((col, ci) => {
        const a = r0.cells[ci]
        const b = r1.cells[ci]
        if (!a || !b) return null
        const m: LinesMarket = { ...market, slipMarket: col.slipMarket }
        const pa = chanceFromAmerican(a.odds)
        const pb = chanceFromAmerican(b.odds)
        const yes = toPick(a, m)
        const no = toPick(b, m)
        return (
          <MarketRow
            key={col.label}
            lead={/total/i.test(col.label) ? undefined : <Crest name={r0.team} className="size-8" />}
            label={cellLabel(a, /total/i.test(col.label) ? undefined : r0.team)}
            sub={col.label}
            chance={(100 * pa) / (pa + pb)}
            yes={{ value: Math.round(pa), selected: selected.has(yes.id), onClick: (el) => onPick(yes, el) }}
            no={{ value: Math.round(pb), selected: selected.has(no.id), onClick: (el) => onPick(no, el) }}
          />
        )
      })}
    </MarketFrame>
  )
}

// ─── Market rules + People are also betting ─────────────────────

function MarketRules({ game }: { game: NonNullable<ReturnType<typeof marketEvent>>['game'] }) {
  const [open, setOpen] = useState(true)
  const [section, setSection] = useState<'timeline' | 'integrity' | null>('timeline')
  const sportWord = game.sport === 'nfl' ? 'final play' : 'final whistle'
  const series = `${game.sport === 'nfl' ? 'FB' : 'SC'}-${game.leagueName.replace(/[^A-Za-z]/g, '').slice(0, 6).toUpperCase()}`
  const steps = [
    {
      id: 'open',
      title: 'Market open',
      sub: game.live ? 'Live now · in-play betting is on' : `Open now · kicks off ${game.when}`,
      done: true,
    },
    { id: 'close', title: 'Market closes', sub: 'When the result is in', done: false },
    { id: 'payout', title: 'Projected payout', sub: `Within 1 minute of the ${sportWord}`, done: false },
  ]
  return (
    <section data-name="v5-market-rules" className="mt-12">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground">Market rules</h2>
        <IconChevronDown className={cn('size-6 text-muted-foreground transition-transform', open && 'rotate-180')} stroke={2} />
      </button>
      {open ? (
        <div className="mt-4">
          <div className={cn(V5_CARD, 'overflow-hidden')}>
            <button
              type="button"
              onClick={() => setSection((v) => (v === 'timeline' ? null : 'timeline'))}
              className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-accent"
            >
              <IconCalendarEvent className="size-6 shrink-0 text-foreground" stroke={1.75} />
              <span className="flex-1 text-base font-bold tracking-tight text-foreground">Timeline and payout</span>
              <IconChevronDown
                className={cn('size-5 text-muted-foreground transition-transform', section === 'timeline' && 'rotate-180')}
                stroke={2}
              />
            </button>
            {section === 'timeline' ? (
              <div className="border-t border-border px-4 pb-5 pt-4">
                <ol className="flex flex-col">
                  {steps.map((st, i) => {
                    const last = i === steps.length - 1
                    return (
                      <li key={st.id} className={cn('relative flex gap-4', !last && 'pb-6')}>
                        {!last ? (
                          <span
                            className={cn('absolute bottom-0 left-[11px] top-7 w-0.5', st.done ? 'bg-success' : 'bg-border')}
                            aria-hidden
                          />
                        ) : null}
                        {st.done ? (
                          <IconCircleCheckFilled className="relative size-6 shrink-0 text-success" aria-hidden />
                        ) : (
                          <span className="relative flex size-6 shrink-0 items-center justify-center" aria-hidden>
                            <span className="size-3 rounded-full bg-muted-foreground/60" />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block text-base font-bold text-foreground">{st.title}</span>
                          <span className="block text-sm text-muted-foreground">{st.sub}</span>
                        </span>
                      </li>
                    )
                  })}
                </ol>
                <p className="mt-5 text-sm leading-6 text-muted-foreground">{game.rules}</p>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Series <span className="font-bold text-foreground">{series}</span>
                  </span>
                  <span>
                    Event <span className="font-bold text-foreground">{(game.eventId ?? game.id).toUpperCase()}</span>
                  </span>
                  <span>
                    Market <span className="font-bold text-foreground">{game.id.toUpperCase()}</span>
                  </span>
                </p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => setSection((v) => (v === 'integrity' ? null : 'integrity'))}
              className="flex w-full items-center gap-3 border-t border-border px-4 py-4 text-left transition-colors hover:bg-accent"
            >
              <IconBan className="size-6 shrink-0 text-foreground" stroke={1.75} />
              <span className="flex-1 text-base font-bold tracking-tight text-foreground">Insider betting is prohibited</span>
              <IconChevronDown
                className={cn('size-5 text-muted-foreground transition-transform', section === 'integrity' && 'rotate-180')}
                stroke={2}
              />
            </button>
            {section === 'integrity' ? (
              <p className="border-t border-border px-4 pb-5 pt-4 text-sm leading-6 text-muted-foreground">
                Players, coaches, officials and anyone with inside information about this game can&apos;t bet on it.
                Bets placed with inside information are void and the account may be closed.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function AlsoBetting({ game, sport }: { game: NonNullable<ReturnType<typeof marketEvent>>['game']; sport: V5SportId }) {
  const others = v5Games(sport)
    .filter((g) => g.id !== game.id)
    .sort((a, b) => Number(b.live) - Number(a.live) || b.volume - a.volume)
    .slice(0, 5)
  if (!others.length) return null
  return (
    <section data-name="v5-also-betting" className="mt-12">
      <h2 className="mb-4 text-2xl font-bold leading-tight tracking-tight text-foreground">People are also betting</h2>
      <div className="flex flex-col gap-2">
        {others.map((g) => {
          const lead = leadOutcome(g)
          return (
            <Link
              key={g.id}
              href={g.href}
              className={cn(V5_CARD, V5_LIGHT_UP, 'flex items-center gap-4 px-4 py-3.5')}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={leagueLogo(g.leagueName, g.leagueIcon)} alt="" className="size-10 shrink-0 object-contain" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[17px] font-bold tracking-tight text-foreground">{g.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {g.live ? `Live · ${g.when}` : g.when} · {g.leagueName}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-xs text-muted-foreground">{lead.short || lead.label}</span>
                <span className="block text-xl font-bold tabular-nums tracking-tight text-foreground">{fmtPctRound(lead.chance)}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
