'use client'

import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconChevronRight, IconDots } from '@tabler/icons-react'
import { LineChart, Sparkline, outcomeColor, outcomeDash } from '@/components/lumen/markets/market-ui'
import { LiveClock } from '@/components/lumen/sports-home-page'
import { useShell } from '@/components/site/shell-context'
import { ShellIcon } from '@/components/site/shell-icons'
import {
  JACKPOT_GAMES,
  LIVE_BACCARAT_GAMES,
  LIVE_BLACKJACK_GAMES,
  LIVE_GAMES,
  LIVE_OTHER_GAMES,
  LIVE_ROULETTE_GAMES,
  LIVE_VIP_TABLES,
  ORIGINALS_GAMES,
  SLOTS_GAMES,
  TOP10_GAMES,
  type CasinoLobbyGame,
} from '@/lib/lumen/casino-lobby-catalog'
import { useSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import { marketFutures, marketSeries, type SportsMarket } from '@/lib/lumen/sports-markets'
import {
  bettorsNow,
  kickoffTime,
  leadOutcome,
  leagueLogo,
  leaguePageHref,
  openComboBuilder,
  v5Games,
  v5Leagues,
  type V5Sport,
} from '@/lib/lumen/v5-combos'
import { browseCards, matchesWhen, sortItems, type BrowseWhen, type KCard, type SortMode } from '@/lib/lumen/v5-markets'
import { topicCards, topicMix } from '@/lib/lumen/v5-topics'
import { genFutures, leagueHref, sportHref, v5SportOf, type V5SportId } from '@/lib/lumen/v5-sportsbook'
import { cn } from '@/lib/utils'
import { BoostMark, ComboMark } from './combo-mark'
import { LeagueLink, LiveDot, TopicGlyph, fmtUsd, V5_CARD, V5_HEADING, V5_LIGHT_UP, V5_NUM, fmtPctRound, fmtVol, useV5Pick, PendingVeil, V5_PRESS, usePending } from './combo-ui'
import { openMiniPlayer } from './casino-mini-player'
import { FadeScroll } from './v5-fade-scroll'
import { KMarketCard, RadioMenu, SortMenu } from './v5-market-cards'
import { SHELF_BOX, V5Shelf } from './v5-shelves'

/**
 * Two columns that never leave a hole: 1 col on narrow, 2 on wide, a lone card spans the row,
 * and a single card fills the column.
 */
export const AUTO_GRID =
  'grid gap-3 grid-cols-[repeat(auto-fit,minmax(max(min(100%,360px),calc(50%_-_6px)),1fr))] [&>*:last-child:nth-child(odd)]:col-span-full'

const EYEBROW = 'text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground'

export function SectionHead({ title, onSeeAll, children }: { title: string; onSeeAll?: () => void; children?: ReactNode }) {
  return (
    <header className="mb-3 flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <h2 className={cn(V5_HEADING, 'min-w-0 truncate')}>{title}</h2>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {children}
        {onSeeAll ? (
          <button type="button" onClick={onSeeAll} className={cn(SHELF_BOX, 'px-3 text-xs font-medium text-muted-foreground hover:text-foreground')}>
            See All
          </button>
        ) : null}
      </div>
    </header>
  )
}

function changeText(v: number) {
  const flat = Math.abs(v) < 0.05
  return (
    <span className={cn('text-xs font-bold tabular-nums', flat ? 'text-muted-foreground' : v > 0 ? 'text-success' : 'text-destructive')}>
      {flat ? '0.0' : `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}`}
    </span>
  )
}

function whenLabel(game: SportsMarket) {
  return game.live ? null : `${game.when.split(',')[0]} · ${kickoffTime(game)}`
}

// ─── Trending — Kalshi "Markets to watch", sports first ────────

export function TrendingHero({ sport, league, title = 'Trending' }: { sport: V5Sport; league?: string; title?: string }) {
  const games = useMemo(
    () =>
      [...v5Games(sport)]
        .filter((g) => !league || g.leagueName === league)
        .sort((a, b) => Number(b.live) - Number(a.live) || b.volume - a.volume)
        .slice(0, 3),
    [sport, league],
  )
  if (!games.length) return null
  return (
    <section data-name="v5-trending" className="mb-10">
      <SectionHead title={title} />
      {/* Phone: swipe rail with the next card peeking. md+: three across. */}
      <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden scroll-px-4 px-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
        {games.map((g) => (
          <HeroCard key={g.id} game={g} />
        ))}
      </div>
    </section>
  )
}

function HeroCard({ game }: { game: SportsMarket }) {
  const lead = leadOutcome(game)
  const series = useMemo(() => marketSeries(game, '1W', 48), [game])
  /* Races and fields: the top three only — the card stays the same height as a game. */
  const shown = game.outcomes
    .map((o, i) => ({ o, i }))
    .sort((a, b) => b.o.chance - a.o.chance)
    .slice(0, 3)
    .sort((a, b) => a.i - b.i)
  const lines = shown.map(({ o, i }) => ({
    id: o.id,
    label: o.short || o.label,
    color: outcomeColor(o, game.outcomes),
    dash: outcomeDash(o, game.outcomes),
    values: series[i]!,
  }))
  const more = game.outcomes.length - shown.length
  const [pending, startPending] = usePending()
  return (
    <article
      data-name="v5-hero-card"
      className={cn(
        V5_CARD,
        V5_LIGHT_UP,
        V5_PRESS,
        'relative flex w-[86%] min-w-0 shrink-0 snap-start flex-col gap-4 rounded-[14px] p-5 md:w-auto [&>span]:pointer-events-none [&>span]:relative',
      )}
    >
      <Link href={game.href} aria-label={game.title} onClick={startPending} className="absolute inset-0 rounded-[14px]" />
      <PendingVeil on={pending} />
      <span className="flex items-center gap-2">
        <LeagueLink sport={v5SportOf(game)} league={game.leagueName} className="flex min-w-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={leagueLogo(game.leagueName, game.leagueIcon)} alt="" className="size-6 shrink-0 object-contain" />
          <span className={cn(EYEBROW, 'truncate')}>{game.leagueName}</span>
        </LeagueLink>
        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
          {game.live ? <LiveClock when={game.when} /> : whenLabel(game)}
        </span>
      </span>
      <span className="line-clamp-2 min-h-[56px] text-[22px] font-bold leading-7 tracking-tight text-foreground">{game.title}</span>
      <span className="flex flex-col gap-1.5">
        {shown.map(({ o }) => (
          <span key={o.id} className="flex items-center gap-2 text-sm">
            <span
              className="h-0.5 w-3 shrink-0 rounded-full"
              style={{ background: outcomeColor(o, game.outcomes), opacity: o.id === lead.id ? 1 : 0.7 }}
              aria-hidden
            />
            <span className="min-w-0 truncate text-muted-foreground">{o.label}</span>
            <span className={cn('ml-auto', V5_NUM, o.id === lead.id ? 'text-foreground' : 'text-muted-foreground')}>
              {fmtPctRound(o.chance)}
            </span>
          </span>
        ))}
        {more > 0 ? <span className="text-xs text-muted-foreground">+{more} more runners</span> : null}
      </span>
      <span className="pointer-events-none -mx-1 block">
        <LineChart lines={lines} height={96} showLegend={false} endLabels={false} />
      </span>
      <span className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
        {fmtVol(game.volume)}
        <span aria-hidden>·</span>
        {bettorsNow(game)} betting
      </span>
    </article>
  )
}

// ─── Upcoming — date cards (Kalshi "Upcoming") ────────────────

export function UpcomingShelf({ sport }: { sport: V5Sport }) {
  const games = useMemo(
    () => [...v5Games(sport)].filter((g) => !g.live).sort((a, b) => b.volume - a.volume).slice(0, 12),
    [sport],
  )
  if (!games.length) return null
  return (
    <V5Shelf title="Upcoming" fill={5} minCard={176}>
      {games.map((g) => (
        <UpcomingCard key={g.id} g={g} />
      ))}
    </V5Shelf>
  )
}

function UpcomingCard({ g }: { g: SportsMarket }) {
  const [pending, startPending] = usePending()
  return (
        <article
          className={cn(
            V5_CARD,
            V5_LIGHT_UP,
            V5_PRESS,
            'relative flex min-h-[208px] flex-col gap-3 rounded-[14px] p-4 [&>span]:pointer-events-none [&>span]:relative',
          )}
        >
          <Link href={g.href} aria-label={g.title} onClick={startPending} className="absolute inset-0 rounded-[14px]" />
          <PendingVeil on={pending} />
          <span className="flex">
            <LeagueLink sport={v5SportOf(g)} league={g.leagueName} className="flex size-11 items-center justify-center rounded-xl bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={leagueLogo(g.leagueName, g.leagueIcon)} alt="" className="size-7 object-contain" />
            </LeagueLink>
          </span>
          <span className={EYEBROW}>{whenLabel(g)}</span>
          <span className="line-clamp-2 text-base font-bold leading-5 tracking-tight text-foreground">{g.title}</span>
          <span className="mt-auto flex">
            <LeagueLink
              sport={v5SportOf(g)}
              league={g.leagueName}
              className="inline-flex h-9 w-full min-w-0 items-center justify-center rounded-full border border-border px-3 text-sm font-semibold text-foreground hover:bg-accent"
            >
              <span className="truncate">{g.leagueName}</span>
            </LeagueLink>
          </span>
        </article>
  )
}

// ─── Market sections (Football · Soccer · Politics & Entertainment) ───

export function MarketSection({
  title,
  cards,
  onSeeAll,
  limit = 4,
}: {
  title: string
  cards: KCard[]
  onSeeAll?: () => void
  limit?: number
}) {
  const picks = useSoccerSlip()
  const selected = useMemo(() => new Set(picks.map((p) => p.id)), [picks])
  const onPick = useV5Pick()
  if (!cards.length) return null
  return (
    <section className="mb-10">
      <SectionHead title={title} onSeeAll={onSeeAll} />
      <div className={AUTO_GRID}>
        {cards.slice(0, limit).map((c) => (
          <KMarketCard key={c.id} card={c} selected={selected} onPick={onPick} />
        ))}
      </div>
    </section>
  )
}

// ─── Browse markets — Kalshi filters, sports first ─────────────

type BrowseCategory = 'all' | 'nfl' | 'soccer' | 'politics' | 'entertainment'

const WHEN_OPTIONS: { id: BrowseWhen; label: string }[] = [
  { id: 'all', label: 'Any time' },
  { id: 'live', label: 'Live now' },
  { id: 'upcoming', label: 'Upcoming games' },
  { id: 'season', label: 'Season-long' },
]

const CATEGORY_OPTIONS: { id: BrowseCategory; label: string }[] = [
  { id: 'all', label: 'All sports' },
  { id: 'nfl', label: 'Football' },
  { id: 'soccer', label: 'Soccer' },
  { id: 'politics', label: 'Politics' },
  { id: 'entertainment', label: 'Entertainment' },
]

export function BrowseMarkets({ sport }: { sport: V5Sport }) {
  const picks = useSoccerSlip()
  const selected = useMemo(() => new Set(picks.map((p) => p.id)), [picks])
  const onPick = useV5Pick()
  const [sort, setSort] = useState<SortMode>('trending')
  const [reverse, setReverse] = useState(false)
  const [when, setWhen] = useState<BrowseWhen>('all')
  const [category, setCategory] = useState<BrowseCategory>('all')
  const [list, setList] = useState(false)
  const [withTopics, setWithTopics] = useState(true)
  const [count, setCount] = useState(6)
  const home = sport === 'all'

  const pool = useMemo<KCard[]>(
    () => [...browseCards(sport), ...(home ? topicCards() : [])],
    [sport, home],
  )
  const cards = sortItems(
    pool.filter((c) => {
      if (!matchesWhen(c, when)) return false
      if (category === 'politics' || category === 'entertainment') return c.category === category
      if (c.category && (!withTopics || category !== 'all')) return false
      if (category === 'nfl' || category === 'soccer') return c.sport === category
      return true
    }),
    sort,
    reverse,
  )
  return (
    <section data-name="v5-browse-markets" className="mb-10">
      <SectionHead title="Browse markets">
        <SortMenu value={sort} reverse={reverse} onChange={setSort} onReverse={setReverse} />
        <RadioMenu label="When" options={WHEN_OPTIONS} value={when} onChange={setWhen} />
        {home ? <RadioMenu label="Category" options={CATEGORY_OPTIONS} value={category} onChange={setCategory} /> : null}
        <RadioMenu
          label="More filters"
          icon={<IconDots className="size-4" stroke={2} />}
          switches={[
            { label: 'List view', on: list, onToggle: setList },
            ...(home ? [{ label: 'Politics & Entertainment', on: withTopics, onToggle: setWithTopics }] : []),
          ]}
        />
      </SectionHead>
      {cards.length ? (
        <>
          <div className={list ? 'grid gap-3' : AUTO_GRID}>
            {cards.slice(0, count).map((c) => (
              <KMarketCard key={c.id} card={c} selected={selected} onPick={onPick} />
            ))}
          </div>
          {cards.length > count ? (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setCount((n) => n + 6)}
                className={cn(SHELF_BOX, 'h-10 px-5 text-sm font-bold text-foreground')}
              >
                Show more markets
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <p className={cn(V5_CARD, 'rounded-[14px] py-12 text-center text-sm text-muted-foreground')}>No markets match these filters.</p>
      )}
    </section>
  )
}

// ─── Right rail ────────────────────────────────────────────────

/** Rail section header — title left, a boxed text CTA right (same box as the shelves' See All). */
function RailHead({ title, cta, onCta }: { title: string; cta?: string; onCta?: () => void }) {
  return (
    <header className="mb-3 flex h-9 items-center justify-between gap-3">
      <h2 className={cn(V5_HEADING, 'min-w-0 truncate')}>{title}</h2>
      {cta && onCta ? (
        <button
          type="button"
          onClick={onCta}
          className={cn(SHELF_BOX, 'shrink-0 px-3 text-xs font-medium text-muted-foreground hover:text-foreground')}
        >
          {cta}
        </button>
      ) : null}
    </header>
  )
}

/** Promo stack — Kalshi's side cards, pointed at our own products. */
export function RailPromos({ sport, onBoosts, onLive }: { sport: V5Sport; onBoosts: () => void; onLive: () => void }) {
  const live = v5Games(sport).filter((g) => g.live)
  const liveVolume = live.reduce((s, g) => s + g.volume, 0)
  const items = [
    {
      eyebrow: 'Odds Boosts',
      title: 'Boosted prices on today’s big games',
      onClick: onBoosts,
      art: <BoostMark className="size-7" />,
    },
    {
      eyebrow: 'Combos',
      title: 'Build a combo in two taps',
      onClick: () => openComboBuilder(sport),
      art: <ComboMark className="size-8" />,
    },
    ...(live.length
      ? [
          {
            eyebrow: 'Live hub',
            title: `${live.length} game${live.length === 1 ? '' : 's'} live now`,
            sub: `${fmtUsd(liveVolume, 0)} traded live`,
            onClick: onLive,
            art: <ShellIcon name="broadcast" tone="token" className="size-7 text-foreground" />,
          },
        ]
      : []),
  ]
  return (
    <div className="flex flex-col gap-3">
      {items.map((it) => (
        <button
          key={it.eyebrow}
          type="button"
          onClick={it.onClick}
          className={cn(V5_CARD, V5_LIGHT_UP, 'flex items-center gap-3 rounded-[14px] p-4 text-left')}
        >
          <span className="min-w-0 flex-1">
            <span className={cn(EYEBROW, 'flex items-center gap-1.5')}>
              {it.eyebrow === 'Live hub' ? <LiveDot /> : null}
              {it.eyebrow}
            </span>
            <span className="mt-1 block text-base font-bold leading-5 tracking-tight text-foreground">{it.title}</span>
            {'sub' in it && it.sub ? <span className="mt-0.5 block text-xs text-muted-foreground">{it.sub}</span> : null}
          </span>
          <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-secondary">{it.art}</span>
          <IconChevronRight className="size-4 shrink-0 text-muted-foreground" stroke={2} />
        </button>
      ))}
    </div>
  )
}

/** Top movers — biggest 24h moves on the board, sport first. */
export function RailMovers({ sport, league }: { sport: V5Sport; league?: string }) {
  const movers = useMemo(
    () =>
      v5Games(sport)
        .filter((g) => !league || g.leagueName === league)
        .flatMap((market) => market.outcomes.filter((o) => o.label !== 'Draw').map((outcome) => ({ market, outcome })))
        .sort((a, b) => Math.abs(b.outcome.change) - Math.abs(a.outcome.change))
        .filter((m, i, all) => all.findIndex((x) => x.market.id === m.market.id) === i)
        .slice(0, 5),
    [sport, league],
  )
  if (!movers.length) return null
  return (
    <section>
      <RailHead title="Top movers" />
      <div className={cn(V5_CARD, 'divide-y divide-border overflow-hidden rounded-[14px]')}>
        {movers.map(({ market, outcome }) => (
          <Link
            key={`${market.id}-${outcome.id}`}
            href={market.href}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--v5-hover)]"
          >
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">{market.title}</span>
              <span className="block truncate text-xs text-muted-foreground">{outcome.label}</span>
            </span>
            <span className="flex shrink-0 flex-col items-end">
              <span className={cn('text-base', V5_NUM)}>{fmtPctRound(outcome.chance)}</span>
              {changeText(outcome.change)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/** Team futures only — player awards carry real names. */
const TEAM_FUTURE = (f: SportsMarket) => !/mvp|boot|scorer|player|rookie|award/i.test(f.title)

/** Season forecasts — futures leaders with a week of movement. */
export function RailForecasts({ sport, league, onMore }: { sport: V5Sport; league?: string; onMore?: () => void }) {
  const futures = useMemo(
    () =>
      [...marketFutures(), ...genFutures()]
        .filter((f) => (sport === 'all' || v5SportOf(f) === sport) && (!league || f.leagueName === league) && TEAM_FUTURE(f))
        .sort((a, b) => b.volume - a.volume)
        .slice(0, 3),
    [sport, league],
  )
  if (!futures.length) return null
  return (
    <section>
      <RailHead title="Season forecasts" cta="See more" onCta={onMore} />
      <div className="flex flex-col gap-3">
        {futures.map((f) => {
          const i = f.outcomes.reduce((best, o, k) => (o.chance > f.outcomes[best]!.chance ? k : best), 0)
          const lead = f.outcomes[i]!
          const values = marketSeries(f, '1W', 40)[i]!
          return (
            <Link
              key={f.id}
              href={`${leaguePageHref(v5SportOf(f), f.leagueName) ?? sportHref(v5SportOf(f))}?view=futures`}
              className={cn(V5_CARD, V5_LIGHT_UP, 'flex flex-col gap-2 rounded-[14px] p-4 text-left')}
            >
              <span className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={leagueLogo(f.leagueName, f.leagueIcon)} alt="" className="size-5 shrink-0 object-contain" />
                <span className="min-w-0 truncate text-sm font-bold text-foreground">{f.title}</span>
              </span>
              <span className="flex items-baseline gap-2">
                <span className={cn('text-2xl tracking-tight', V5_NUM)}>{fmtPctRound(lead.chance)}</span>
                <span className="min-w-0 truncate text-sm text-muted-foreground">{lead.label}</span>
                <span className="ml-auto">{changeText(lead.change)}</span>
              </span>
              <Sparkline values={values} color="var(--foreground)" className="h-10" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}

/** Politics & Entertainment — compact, for the sport-page rail. */
export function RailTopics() {
  const cards = topicMix().slice(0, 4)
  return (
    <section>
      <RailHead title="Politics & Entertainment" />
      <div className={cn(V5_CARD, 'divide-y divide-border overflow-hidden rounded-[14px]')}>
        {cards.map((c) => {
          const lead = c.rows.reduce((a, b) => (b.chance > a.chance ? b : a), c.rows[0]!)
          return (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <TopicGlyph name={c.glyph ?? ''} className="size-8" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">{c.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{lead.label}</span>
              </span>
              <span className={cn('shrink-0 text-base', V5_NUM)}>{fmtPctRound(lead.chance)}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

type CasinoTab = 'top10' | 'slots' | 'blackjack' | 'live' | 'originals'

const CASINO_TABS: { id: CasinoTab; label: string }[] = [
  { id: 'top10', label: 'Top 10' },
  { id: 'slots', label: 'Slots' },
  { id: 'blackjack', label: 'Blackjack' },
  { id: 'live', label: 'Live casino' },
  { id: 'originals', label: 'Originals' },
]

const uniq = (games: CasinoLobbyGame[]) => {
  const seen = new Set<string>()
  return games.filter((g) => (seen.has(g.id) ? false : (seen.add(g.id), true)))
}

/** Sixteen games per menu item, from the casino lobby catalogue. */
const CASINO_GAMES: Record<CasinoTab, CasinoLobbyGame[]> = {
  top10: TOP10_GAMES.slice(0, 10),
  slots: uniq([...SLOTS_GAMES, ...JACKPOT_GAMES]).slice(0, 16),
  blackjack: uniq([
    ...ORIGINALS_GAMES.filter((g) => /blackjack/i.test(g.title)),
    ...LIVE_BLACKJACK_GAMES,
    ...LIVE_VIP_TABLES,
    ...LIVE_OTHER_GAMES.filter((g) => g.live?.kind === 'blackjack'),
  ]).slice(0, 16),
  live: uniq([...LIVE_GAMES, ...LIVE_OTHER_GAMES, ...LIVE_ROULETTE_GAMES, ...LIVE_BACCARAT_GAMES]).slice(0, 16),
  originals: ORIGINALS_GAMES.slice(0, 16),
}

/** Casino in the rail — Slots · Blackjack · Live casino · Originals, 16 each, scroll inside; opens the mini player. */
export function RailCasino() {
  const router = useRouter()
  const { startNavigating } = useShell()
  const [tab, setTab] = useState<CasinoTab>('top10')
  const [showAll, setShowAll] = useState(false)
  const games = CASINO_GAMES[tab]
  const toCasino = () => {
    startNavigating('/casino')
    router.push('/casino')
  }
  return (
    <section data-name="v5-rail-casino">
      <RailHead title="Casino" cta="Go to Casino" onCta={toCasino} />
      <div className={cn(V5_CARD, 'overflow-hidden rounded-[14px]')}>
        <FadeScroll axis="x" role="tablist" className="scrollbar-hide flex gap-1 overflow-x-auto overflow-y-hidden border-b border-border p-2">
          {CASINO_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-colors',
                tab === t.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {t.id === 'live' ? <LiveDot /> : null}
              {t.label}
            </button>
          ))}
        </FadeScroll>
        {/* Desktop rail: scrolls inside and hands the wheel back to the page at the end. Phone: no inner scroll. */}
        <FadeScroll key={tab} className="scrollbar-hide p-3 md:max-h-[392px] md:overflow-y-auto">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-x-2 gap-y-3">
            {games.map((g, i) => (
              <button
                key={g.id}
                type="button"
                onClick={() => openMiniPlayer(g)}
                className={cn('group flex min-w-0 flex-col gap-1.5 text-left', !showAll && i >= 9 && 'hidden md:flex')}
              >
                <span className="relative block aspect-[3/4] overflow-hidden rounded-lg bg-secondary">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.imageSrc}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {tab === 'top10' ? (
                    <span className="absolute left-1.5 top-1 text-2xl font-black italic leading-none text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
                      {games.indexOf(g) + 1}
                    </span>
                  ) : null}
                  {g.live?.seats ? (
                    <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] font-bold tabular-nums text-white">
                      {g.live.seats.occupied}/{g.live.seats.total}
                    </span>
                  ) : null}
                </span>
                <span className="truncate text-xs font-bold text-foreground">{g.live?.title ?? g.title}</span>
              </button>
            ))}
          </div>
          {games.length > 9 && !showAll ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg border border-border bg-secondary text-sm font-bold text-foreground md:hidden"
            >
              Show all {games.length}
            </button>
          ) : null}
        </FadeScroll>
      </div>
    </section>
  )
}

/** Popular leagues — logo tiles straight into a sport page filtered to that league. */
export function PopularLeagues() {
  const router = useRouter()
  const { startNavigating } = useShell()
  const leagues = useMemo(() => {
    const games = v5Games('all')
    return v5Leagues('all')
      .map((l) => ({
        ...l,
        live: games.filter((g) => g.leagueName === l.name && g.live).length,
        volume: games.filter((g) => g.leagueName === l.name).reduce((s, g) => s + g.volume, 0),
      }))
      .sort((a, b) => b.volume - a.volume)
  }, [])
  const open = (sport: V5SportId, name: string) => {
    const href = leagueHref(sport, name)
    startNavigating(href)
    router.push(href)
  }
  return (
    <V5Shelf title="Popular leagues" fill={6} minCard={148}>
      {leagues.map((l) => (
        <button
          key={l.name}
          type="button"
          onClick={() => open(l.sport, l.name)}
          className={cn(V5_CARD, V5_LIGHT_UP, 'flex flex-col items-start gap-3 rounded-[14px] p-4 text-left')}
        >
          <span className="flex size-12 items-center justify-center rounded-xl bg-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={l.logo} alt="" className="size-8 object-contain" />
          </span>
          <span className="w-full min-w-0">
            <span className="block truncate text-base font-bold leading-5 tracking-tight text-foreground">{l.name}</span>
            <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              {l.live ? (
                <>
                  <LiveDot /> {l.live} live ·
                </>
              ) : null}
              {l.count} game{l.count === 1 ? '' : 's'}
            </span>
          </span>
        </button>
      ))}
    </V5Shelf>
  )
}

export { FadeScroll } from './v5-fade-scroll'
