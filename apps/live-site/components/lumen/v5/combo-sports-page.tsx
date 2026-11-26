'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconChevronLeft, IconChevronRight, IconSearch, IconUsers, IconX } from '@tabler/icons-react'
import { CasinoLobbyBannerRow } from '@/components/lumen/casino-lobby-banners'
import { SoccerBetslip, type SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { LiveClock } from '@/components/lumen/sports-home-page'
import { AlternateLinePicker, LIVE_ROW_STYLE, OddsButton } from '@/components/lumen/soccer-sport-page'
import { V5PillTrack } from './v5-pill-track'
import { useShell } from '@/components/site/shell-context'
import { CASINO_LOBBY_PROMO_BANNERS } from '@/lib/lumen/casino-lobby-promos'
import { setSoccerSlip, useSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import type { SoccerLinePair, SoccerOdds } from '@/lib/lumen/soccer-sport'
import type { SportsMarket } from '@/lib/lumen/sports-markets'
import {
  bettorsNow,
  eventLadders,
  featuredCombos,
  groupByDay,
  kickoffTime,
  leadOutcome,
  leagueBySlug,
  leagueLogo,
  openComboBuilder,
  pickFor,
  teamOutcomes,
  teamRecord,
  v5Games,
  v5Leagues,
  yesCents,
  type Ladder,
  type V5Sport,
} from '@/lib/lumen/v5-combos'
import {
  SORT_MODES,
  futureCards,
  gameCardOf,
  gameCards,
  gamePropCards,
  gameSortable,
  ladderCards,
  playerPropCards,
  sortItems,
  winTotalCards,
  type KCard,
  type SortMode,
  type V5View,
} from '@/lib/lumen/v5-markets'
import { cn } from '@/lib/utils'
import { BetStackPopup, showBetStack } from './bet-stack-popup'
import { CasinoMiniPlayer } from './casino-mini-player'
import { BuildOwnCard, ComboBuilderOverlay } from './combo-builder'
import {
  Crest,
  DrawMark,
  LeagueLink,
  PctPill,
  ProbBar,
  V5Heading,
  V5Tabs,
  V5_CARD,
  V5_LIGHT_UP,
  V5_NUM,
  V5_TITLE,
  fmtVol,
  useV5Pick,
} from './combo-ui'
import { KMarketCard, SortMenu } from './v5-market-cards'
import { LeagueMenu } from './v5-league-menu'
import { SportsActivity } from './v5-activity'
import {
  AUTO_GRID,
  BrowseMarkets,
  FadeScroll,
  MarketSection,
  PopularLeagues,
  RailCasino,
  RailForecasts,
  RailMovers,
  RailPromos,
  RailTopics,
  TrendingHero,
  UpcomingShelf,
} from './v5-widgets'
import { topicMix } from '@/lib/lumen/v5-topics'
import { isGenerated, leagueHref, sportDef, sportHref, v5SportOf, type V5SportId } from '@/lib/lumen/v5-sportsbook'
import {
  BoostsGrid,
  BoostsShelf,
  ComboPackCard,
  CombosShelf,
  MegaCombosShelf,
  PopularCarousel,
  SameGameCombosShelf,
  ShelfBleed,
  megaCombos,
  sameGameCombos,
} from './v5-shelves'

const labelOf = (sport: V5Sport) => (sport === 'all' ? 'Sports' : sportDef(sport).label)

/** Home sport sections — the biggest games of each. */
const HOME_SECTIONS: V5SportId[] = ['nfl', 'basketball', 'soccer', 'hockey', 'tennis', 'mma']

const VIEW_LABEL: Record<V5View, string> = {
  games: 'Games',
  live: 'Live',
  spreads: 'Spreads',
  totals: 'Totals',
  'game-props': 'Game props',
  'player-props': 'Player props',
  'win-totals': 'Win totals',
  futures: 'Futures',
  combos: 'Combos',
  boosts: 'Odds Boosts',
}

const shortLeague = (name: string) => (name === 'NCAA Football' ? 'NCAA' : name)

/** Combo cards are tall — up to three a row, a lone card never strands. */
const AUTO_GRID_3 =
  'grid gap-3 grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))]'

/**
 * V5 · Combos sport page — title + sort, league tabs, market sub-nav (Games default · Live ·
 * Spreads · Totals · Game props · Player props · Win totals · Futures · Combos · Odds Boosts),
 * casino-style shelves on Games, uniform market cards everywhere else. Home gets the banners.
 */
export function ComboSportsPage({ sport = 'all', leagueSlug }: { sport?: V5Sport; leagueSlug?: string }) {
  const router = useRouter()
  const { startNavigating, setCashierOpen, setVipHubOpen } = useShell()
  /* League pages are routes (/sports/soccer/premier-league) — the slug picks the league. */
  const leagueDef = sport !== 'all' && leagueSlug ? leagueBySlug(sport, leagueSlug) : undefined
  const league = leagueDef?.name ?? 'all'
  const leaguePage = Boolean(leagueDef)
  const [view, setView] = useState<V5View>('games')
  const [sort, setSort] = useState<SortMode>('trending')
  const [reverse, setReverse] = useState(false)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [propGroup, setPropGroup] = useState('')
  const picks = useSoccerSlip()
  const selected = useMemo(() => new Set(picks.map((p) => p.id)), [picks])
  const onPick = useV5Pick()
  const [pageRef, wide] = useWide(1120)

  const leagues = v5Leagues(sport)
  /* League menu — popular few as tabs, every league by country in the menu. */
  const leagueMenu = useMemo(() => {
    const games = v5Games(sport)
    return leagues.map((l) => ({
      ...l,
      live: games.filter((g) => g.leagueName === l.name && g.live).length,
      volume: games.filter((g) => g.leagueName === l.name).reduce((a, g) => a + g.volume, 0),
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sport])
  const inLeague = <T extends { league?: string; leagueName?: string }>(x: T) =>
    league === 'all' || (x.league ?? x.leagueName) === league
  const q = query.trim().toLowerCase()
  const matches = (text: string) => !q || text.toLowerCase().includes(q)

  /* All market views, built once per sport. */
  const data = useMemo(
    () => ({
      games: v5Games(sport),
      spreads: ladderCards(sport, 'spread'),
      totals: ladderCards(sport, 'total'),
      gameProps: gamePropCards(sport),
      playerProps: playerPropCards(sport),
      winTotals: winTotalCards(sport),
      futures: futureCards(sport),
      combos: featuredCombos(sport),
      sections:
        sport === 'all'
          ? Object.fromEntries(HOME_SECTIONS.map((id) => [id, sortItems(gameCards(id), 'volume')]))
          : ({} as Record<string, KCard[]>),
    }),
    [sport],
  )

  const games = data.games.filter((g) => inLeague(g) && matches(`${g.title} ${g.leagueName}`))
  const cardsFor = (cards: KCard[]) => sortItems(cards.filter((c) => inLeague(c) && matches(`${c.title} ${c.league}`)), sort, reverse)
  const spreads = cardsFor(data.spreads)
  const totals = cardsFor(data.totals)
  const gameProps = cardsFor(data.gameProps)
  const playerAll = cardsFor(data.playerProps)
  const winTotals = cardsFor(data.winTotals)
  const futures = cardsFor(data.futures)
  const liveCount = games.filter((g) => g.live).length

  const propGroups = useMemo(() => [...new Set(playerAll.map((c) => c.group ?? ''))].filter(Boolean), [playerAll])
  const activeGroup = propGroups.includes(propGroup) ? propGroup : (propGroups[0] ?? '')
  const playerProps = playerAll.filter((c) => !activeGroup || c.group === activeGroup)

  const pills: { id: V5View; label: string; count?: number }[] = [
    { id: 'games', label: 'Games', count: games.length },
    ...(liveCount ? [{ id: 'live' as const, label: 'Live', count: liveCount }] : []),
    ...(spreads.length ? [{ id: 'spreads' as const, label: 'Spreads', count: spreads.length }] : []),
    ...(totals.length ? [{ id: 'totals' as const, label: 'Totals', count: totals.length }] : []),
    ...(gameProps.length ? [{ id: 'game-props' as const, label: 'Game props', count: gameProps.length }] : []),
    ...(playerAll.length ? [{ id: 'player-props' as const, label: 'Player props', count: playerAll.length }] : []),
    ...(winTotals.length ? [{ id: 'win-totals' as const, label: 'Win totals', count: winTotals.length }] : []),
    ...(futures.length ? [{ id: 'futures' as const, label: 'Futures', count: futures.length }] : []),
    { id: 'combos', label: 'Combos', count: data.combos.length + sameGameCombos(sport).length + megaCombos(sport).length },
    { id: 'boosts', label: 'Odds Boosts' },
  ]

  useEffect(() => {
    if (!pills.some((p) => p.id === view)) setView('games')
  }, [pills, view])

  /* Old ?league= links land on the league page; ?view=futures opens a market view. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const want = params.get('league')
    if (want && sport !== 'all' && leagues.some((l) => l.name === want)) {
      router.replace(leagueHref(sport, want))
      return
    }
    const v = params.get('view') as V5View | null
    if (v && v in VIEW_LABEL) setView(v)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sport, leagueSlug])

  /* Changing view scrolls back to the top of the page so the switch is visible. */
  const showView = (v: V5View) => {
    setView(v)
    document.getElementById('shell-scroll')?.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const pickLeague = (id: string) => go(id === 'all' || sport === 'all' ? sportHref(sport as V5SportId) : leagueHref(sport, id))

  const banners = useMemo(
    () =>
      CASINO_LOBBY_PROMO_BANNERS.map((promo) => {
        if (promo.id === '100-free-spins') return { ...promo, onAction: () => setCashierOpen(true) }
        if (promo.id === 'casino-rakeback') return { ...promo, onAction: () => setVipHubOpen(true) }
        return promo
      }),
    [setCashierOpen, setVipHubOpen],
  )

  const go = (href: string) => {
    startNavigating(href)
    router.push(href)
  }

  /* Games / Live — day groups for Trending + Start time, one sorted list for the rest. */
  const gameList = sortItems(
    games.filter((g) => view !== 'live' || g.live).map(gameSortable),
    sort,
    reverse,
  ).map((x) => x.game)
  const grouped = sort === 'trending' || sort === 'start'
  const gameGroups = grouped
    ? groupByDay(gameList)
    : [{ label: SORT_MODES.find((m) => m.id === sort)?.label ?? 'Games', games: gameList }]

  const grid = (cards: KCard[]) =>
    cards.length ? (
      <div className={AUTO_GRID}>
        {cards.map((c) => (
          <KMarketCard key={c.id} card={c} selected={selected} onPick={onPick} />
        ))}
      </div>
    ) : (
      <p className="py-16 text-center text-sm text-muted-foreground">Nothing here right now.</p>
    )

  const title = league === 'all' ? labelOf(sport) : league
  const home = sport === 'all'
  const mixed = home || new Set(games.map((g) => g.sport)).size > 1
  const canBack = view !== 'games' || league !== 'all' || !home
  const back = () => {
    if (view !== 'games') setView('games')
    else if (leaguePage && sport !== 'all') go(sportHref(sport))
    else go('/sports')
  }

  const dayGroup = (d: { label: string; games: SportsMarket[] }) =>
    d.games.length ? (
      <section key={d.label} className="mb-10">
        <V5Heading>{d.label}</V5Heading>
        <div className={AUTO_GRID}>
          {d.games.map((g) =>
            isGenerated(g) && g.field ? (
              <KMarketCard key={g.id} card={gameCardOf(g)} selected={selected} onPick={onPick} />
            ) : (
              <GameCard key={g.id} game={g} padDraw={mixed} selected={selected} onPick={onPick} onOpen={() => go(g.href)} />
            ),
          )}
        </div>
      </section>
    ) : null

  /* Games view — curated widgets between the day groups, never three combo shelves in a row. */
  const curated = view === 'games' && !q
  const toCombos = () => showView('combos')
  const toBoosts = () => showView('boosts')
  const gamesView = (() => {
    if (!curated) return gameGroups.map(dayGroup)
    if (leaguePage) {
      /* League page — trending, the odds by day, that league's futures, then the rest. */
      const [l0, l1, ...lrest] = gameGroups
      return (
        <>
          <TrendingHero sport={sport} league={league} />
          {l0 ? dayGroup(l0) : null}
          <MarketSection title="Futures" cards={futures} onSeeAll={() => showView('futures')} />
          {l1 ? dayGroup(l1) : null}
          {lrest.map(dayGroup)}
          <SportsActivity sport={sport} league={league} />
        </>
      )
    }
    if (home) {
      const live = gameList.filter((g) => g.live)
      return (
        <>
          <TrendingHero sport={sport} />
          <PopularLeagues />
          <BrowseMarkets sport={sport} />
          <PopularCarousel sport={sport} />
          {live.length ? dayGroup({ label: 'Live now', games: live.filter((g) => !(isGenerated(g) && g.field)).slice(0, 6) }) : null}
          <CombosShelf sport={sport} onSeeAll={toCombos} lead={<BuildOwnCard sport={sport} />} />
          <SportSection id="nfl" cards={data.sections.nfl} go={go} />
          <SportSection id="basketball" cards={data.sections.basketball} go={go} />
          <BoostsShelf sport={sport} onSeeAll={toBoosts} />
          <UpcomingShelf sport={sport} />
          <SportSection id="soccer" cards={data.sections.soccer} go={go} />
          <SameGameCombosShelf sport={sport} onSeeAll={toCombos} />
          <SportSection id="hockey" cards={data.sections.hockey} go={go} />
          <SportSection id="tennis" cards={data.sections.tennis} go={go} />
          <MarketSection title="Politics & Entertainment" cards={topicMix()} />
          <MegaCombosShelf sport={sport} onSeeAll={toCombos} />
          <SportSection id="mma" cards={data.sections.mma} go={go} />
          <SportsActivity sport={sport} />
        </>
      )
    }
    const [g0, g1, g2, ...rest] = gameGroups
    return (
      <>
        <TrendingHero sport={sport} />
        {g0 ? dayGroup(g0) : null}
        <CombosShelf sport={sport} onSeeAll={toCombos} lead={<BuildOwnCard sport={sport} />} />
        {g1 ? dayGroup(g1) : null}
        <BoostsShelf sport={sport} onSeeAll={toBoosts} />
        <PopularCarousel sport={sport} />
        {g2 ? dayGroup(g2) : null}
        <SameGameCombosShelf sport={sport} onSeeAll={toCombos} />
        {rest.map(dayGroup)}
        <MegaCombosShelf sport={sport} onSeeAll={toCombos} />
        <MarketSection title="Futures" cards={futures} onSeeAll={() => showView('futures')} />
        <SportsActivity sport={sport} />
      </>
    )
  })()

  const rail = (
    <>
      <RailPromos sport={sport} onBoosts={toBoosts} onLive={() => showView(liveCount ? 'live' : 'games')} />
      <RailMovers sport={sport} league={leaguePage ? league : undefined} />
      <RailCasino />
      <RailForecasts
        sport={sport}
        league={leaguePage ? league : undefined}
        onMore={futures.length ? () => showView('futures') : undefined}
      />
      {!home ? <RailTopics /> : null}
    </>
  )

  return (
    <div ref={pageRef} data-name="v5-combo-sports" className="mx-auto w-full max-w-[1600px] px-4 pb-8 pt-4 md:px-6 md:pt-6">
      {home && view === 'games' && league === 'all' ? (
        <div className="-mx-4 mb-8 md:-mx-6">
          <CasinoLobbyBannerRow promos={banners} />
        </div>
      ) : null}

      {/* Main column (title, sub-navs, content) + sticky Kalshi rail from the top once there is room for both. */}
      <div className={cn(wide ? 'flex items-start gap-8' : 'flex flex-col')}>
        <div className="min-w-0 flex-1">
          {/* Back · title · view, sort, search */}
          <header className="flex items-center gap-3">
            {canBack ? (
              <button
                type="button"
                aria-label="Back"
                onClick={back}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent"
              >
                <IconChevronLeft className="size-5" stroke={2} />
              </button>
            ) : null}
            {leagueDef ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={leagueDef.logo} alt="" className="size-10 shrink-0 object-contain" />
            ) : null}
            <h1 className={cn(V5_TITLE, 'min-w-0 flex-1 truncate')}>
              {title}
              {view !== 'games' ? <span className="text-muted-foreground"> · {VIEW_LABEL[view]}</span> : null}
            </h1>
            {view !== 'combos' && view !== 'boosts' ? (
              <SortMenu value={sort} reverse={reverse} onChange={setSort} onReverse={setReverse} />
            ) : null}
            <button
              type="button"
              aria-label={searching ? 'Close search' : 'Search'}
              onClick={() => {
                setSearching((v) => !v)
                setQuery('')
              }}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent"
            >
              {searching ? <IconX className="size-5" stroke={2} /> : <IconSearch className="size-5" stroke={2} />}
            </button>
          </header>
          {searching ? (
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams, players or leagues"
              className="mt-4 h-12 w-full rounded-lg border border-input bg-secondary px-4 text-base font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
            />
          ) : null}

          {/* Markets sub-nav — V1 pill track */}
          <V5PillTrack
            active={view}
            onChange={showView}
            modes={pills.map((p) => ({ id: p.id, label: p.label }))}
            ariaLabel="Markets"
            className="mb-0 mt-6"
          />

          {/* Sport pages: that sport's leagues (home has the sport rail up top). */}
          {home || leagues.length < 2 ? null : (
            <LeagueMenu
              className="mt-4"
              leagues={leagueMenu}
              active={league}
              onChange={pickLeague}
              short={shortLeague}
            />
          )}

          <div className="mt-8">
          <ShelfBleed.Provider value={!wide}>
          {view === 'combos' ? (
            <>
              <section className="mb-10">
                <V5Heading>Popular Combos</V5Heading>
                <div className={AUTO_GRID_3}>
                  <BuildOwnCard sport={sport} />
                  {data.combos.map((c) => (
                    <ComboPackCard key={c.id} combo={c} fluid />
                  ))}
                </div>
              </section>
              {sameGameCombos(sport).length ? (
                <section className="mb-10">
                  <V5Heading>Same Game Combos</V5Heading>
                  <div className={AUTO_GRID_3}>
                    {sameGameCombos(sport).map((c) => (
                      <ComboPackCard key={c.id} combo={c} fluid kind="same game combo" />
                    ))}
                  </div>
                </section>
              ) : null}
              {megaCombos(sport).length ? (
                <section className="mb-10">
                  <V5Heading>Mega Combos</V5Heading>
                  <div className={AUTO_GRID_3}>
                    {megaCombos(sport).map((c) => (
                      <ComboPackCard key={c.id} combo={c} fluid kind="mega combo" />
                    ))}
                  </div>
                </section>
              ) : null}
            </>
          ) : view === 'boosts' ? (
            <BoostsGrid sport={sport} />
          ) : view === 'spreads' ? (
            grid(spreads)
          ) : view === 'totals' ? (
            grid(totals)
          ) : view === 'game-props' ? (
            grid(gameProps)
          ) : view === 'player-props' ? (
            <>
              {propGroups.length > 1 ? (
                <V5PillTrack
                  active={activeGroup}
                  onChange={setPropGroup}
                  modes={propGroups.map((g) => ({ id: g, label: g }))}
                  ariaLabel="Player props"
                  className="mb-5"
                />
              ) : null}
              {grid(playerProps)}
            </>
          ) : view === 'win-totals' ? (
            grid(winTotals)
          ) : view === 'futures' ? (
            grid(futures)
          ) : (
            <>
              {gamesView}
              {gameList.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  {q ? `No games match “${query}”.` : 'No games right now.'}
                </p>
              ) : null}
            </>
          )}
          </ShelfBleed.Provider>
          </div>
        </div>
        <FadeScroll
          label="Movers and forecasts"
          className={cn(
            'flex min-w-0 flex-col gap-8',
            wide
              ? 'scrollbar-hide sticky top-[calc(var(--shell-chrome-h,140px)+16px)] max-h-[calc(100dvh-var(--shell-chrome-h,140px)-32px)] w-[320px] shrink-0 self-start overflow-y-auto pb-6'
              : 'mt-10 w-full',
          )}
        >
          <div className="flex flex-col gap-8">{rail}</div>
        </FadeScroll>
      </div>

      <SoccerBetslip
        picks={picks}
        onRemove={(id) => setSoccerSlip((prev) => prev.filter((p) => p.id !== id))}
        onClear={() => setSoccerSlip([])}
        onChange={setSoccerSlip}
        comboAction={{ label: 'Combo builder', onClick: () => openComboBuilder(sport) }}
        variant="v5"
        onClosedAfterPlace={showBetStack}
      />
      <ComboBuilderOverlay />
      <BetStackPopup />
      <CasinoMiniPlayer />
    </div>
  )
}

/** Home sport section — its four biggest games, See All jumps to the sport page. */
function SportSection({ id, cards, go }: { id: V5SportId; cards?: KCard[]; go: (href: string) => void }) {
  if (!cards?.length) return null
  return <MarketSection title={sportDef(id).label} cards={cards} onSeeAll={() => go(sportHref(id))} />
}

/** Wide enough for main column + rail. */
function useWide(min: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [wide, setWide] = useState(false)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWide(el.clientWidth >= min)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [min])
  return [ref, wide] as const
}

/** Game card — league mark + title, team rows (chance bar · multiplier · % pill), buy points. */
function GameCard({
  game,
  padDraw = false,
  selected,
  onPick,
  onOpen,
}: {
  game: SportsMarket
  /** Mixed grids (home): keep the Draw row's space on 2-way games so cards line up. */
  padDraw?: boolean
  selected: Set<string>
  onPick: (pick: SoccerSlipPick, el?: HTMLElement | null) => void
  onOpen: () => void
}) {
  const lead = leadOutcome(game)
  const teams = teamOutcomes(game)
  const draw = game.outcomes.find((o) => o.label === 'Draw')
  const rows = [...teams, ...(draw ? [draw] : [])]
  const ladders = eventLadders(game)
  return (
    <div
      role="link"
      tabIndex={0}
      data-name="v5-game-card"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen()
      }}
      style={game.live ? LIVE_ROW_STYLE : undefined}
      className={cn(V5_CARD, V5_LIGHT_UP, 'cursor-pointer overflow-hidden rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-ring')}
    >
      <div className="flex items-center gap-3 px-4 pt-4">
        <LeagueLink sport={v5SportOf(game)} league={game.leagueName} className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={leagueLogo(game.leagueName, game.leagueIcon)} alt="" className="size-9 shrink-0 object-contain" />
        </LeagueLink>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold leading-6 text-foreground">{game.title}</p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {game.live ? (
              <LiveClock when={game.when} />
            ) : (
              <span>
                {game.when.split(',')[0]} · {kickoffTime(game)}
              </span>
            )}
            <span aria-hidden>·</span>
            <LeagueLink sport={v5SportOf(game)} league={game.leagueName} className="truncate hover:text-foreground">
              {game.leagueName}
            </LeagueLink>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        {rows.map((o) => {
          const isDraw = o.label === 'Draw'
          const pick = pickFor(game, o, 'yes')
          const record = teamRecord(game, o)
          const score = game.live && game.score && !isDraw ? game.score[teams.indexOf(o)] : undefined
          return (
            <div key={o.id} className="flex items-center gap-3">
              {isDraw ? <DrawMark className="size-8" /> : <Crest name={o.team ?? o.label} className="size-8" />}
              <div className="min-w-0 flex-1">
                <p className="flex min-w-0 items-baseline gap-1.5">
                  <span className={cn('truncate text-base font-semibold', isDraw ? 'text-muted-foreground' : 'text-foreground')}>
                    {o.label}
                  </span>
                  {record ? <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">{record}</span> : null}
                </p>
                {!isDraw ? <ProbBar value={o.chance} lead={o.id === lead.id} className="mt-1.5 max-w-[62%]" /> : null}
              </div>
              {score !== undefined ? <span className={cn('w-7 shrink-0 text-center text-lg', V5_NUM)}>{score}</span> : null}
              <span className="hidden w-12 shrink-0 text-right text-sm tabular-nums text-muted-foreground sm:block">
                {(100 / yesCents(o.chance)).toFixed(2)}x
              </span>
              <PctPill chance={o.chance} selected={selected.has(pick.id)} onClick={(el) => onPick(pick, el)} />
            </div>
          )
        })}
        {padDraw && !draw ? <div aria-hidden className="h-11" /> : null}
      </div>

      {ladders.length ? (
        <div className="grid gap-3 border-t border-border px-4 py-3 sm:grid-cols-2">
          {ladders.map((l) => (
            <BuyPoints key={l.kind} ladder={l} selected={selected} onPick={onPick} />
          ))}
        </div>
      ) : null}

      <div className="flex h-10 items-center gap-3 border-t border-border px-4 text-xs text-muted-foreground">
        <span>{fmtVol(game.volume)}</span>
        <span className="flex items-center gap-1">
          <IconUsers className="size-3.5" stroke={1.5} aria-hidden />
          {bettorsNow(game)} betting
        </span>
        <span className="ml-auto inline-flex items-center gap-0.5 font-bold text-foreground">
          All markets <IconChevronRight className="size-3.5" stroke={2} />
        </span>
      </div>
    </div>
  )
}

const shortLine = (label: string) => label.replace(/^Over /, 'O ').replace(/^Under /, 'U ').replace(/ (points|goals)$/i, '')

/**
 * Buy points — the V1 board chips (both sides of the line) plus the ⇅ alternate-line menu.
 * Pick a line in the menu → that pair moves onto the card and the tapped side goes on the slip.
 */
function BuyPoints({
  ladder,
  selected,
  onPick,
}: {
  ladder: Ladder
  selected: Set<string>
  onPick: (pick: SoccerSlipPick, el?: HTMLElement | null) => void
}) {
  const main = ladder.rungs[ladder.defaultIndex]!
  const [line, setLine] = useState(main.line)
  const rung = ladder.rungs.find((r) => r.line === line) ?? main
  const spread = ladder.kind === 'spread'
  const asOdds = (p: SoccerSlipPick, chance: number): SoccerOdds => ({
    id: p.id,
    label: shortLine(p.label),
    odds: `${Math.round(chance)}%`,
  })
  const pairs: SoccerLinePair[] = ladder.rungs.map((r) => ({ line: r.line, a: asOdds(r.yes, r.chance), b: asOdds(r.no, 100 - r.chance) }))
  const byId = new Map(ladder.rungs.flatMap((r) => [[r.yes.id, { pick: r.yes, line: r.line }] as const, [r.no.id, { pick: r.no, line: r.line }] as const]))
  const columns: [string, string] = spread
    ? [main.yes.label.replace(/ [+-][\d.]+$/, ''), main.no.label.replace(/ [+-][\d.]+$/, '')]
    : ['Over', 'Under']
  return (
    <div onClick={(e) => e.stopPropagation()} className="min-w-0">
      <p className="mb-1 text-xs text-muted-foreground">{spread ? 'Spread' : 'Total'}</p>
      <div className="flex items-stretch gap-1">
        <div className="flex min-w-0 flex-1 gap-1">
          <OddsButton
            pick={asOdds(rung.yes, rung.chance)}
            selected={selected.has(rung.yes.id)}
            onSelect={(_, el) => onPick(rung.yes, el)}
            className="min-w-0 flex-1"
          />
          <OddsButton
            pick={asOdds(rung.no, 100 - rung.chance)}
            selected={selected.has(rung.no.id)}
            onSelect={(_, el) => onPick(rung.no, el)}
            className="min-w-0 flex-1"
          />
        </div>
        <AlternateLinePicker
          family={spread ? 'spread' : 'total'}
          pairs={pairs}
          selectedIds={selected}
          mainLine={main.line}
          columns={columns}
          onPick={(p) => {
            const hit = byId.get(p.id)
            if (!hit) return
            setLine(hit.line)
            if (!selected.has(hit.pick.id)) onPick(hit.pick)
          }}
        />
      </div>
    </div>
  )
}
