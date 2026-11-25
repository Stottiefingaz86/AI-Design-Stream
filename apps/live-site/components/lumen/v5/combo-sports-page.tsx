'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  IconBallAmericanFootball,
  IconBallFootball,
  IconChevronLeft,
  IconChevronRight,
  IconStack2,
  IconTrophy,
  IconUsers,
} from '@tabler/icons-react'
import { Typography } from '@/components/ui/typography'
import { CasinoLiveWinsCarousel } from '@/components/lumen/casino-live-wins-carousel'
import { ShelfSeeMore } from '@/components/lumen/shelf-see-more'
import { SoccerBetslip, type SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { HorizontalRail, LiveClock } from '@/components/lumen/sports-home-page'
import {
  BreadcrumbMenu,
  LeagueQuickLinks,
  LIVE_ROW_STYLE,
  ModePillTrack,
} from '@/components/lumen/soccer-sport-page'
import { useShell } from '@/components/site/shell-context'
import type { SoccerQuickLink } from '@/lib/lumen/soccer-sport'
import { setSoccerSlip, useSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import type { SportsMarket } from '@/lib/lumen/sports-markets'
import {
  bettorsNow,
  featuredCombos,
  kickoffTime,
  leadOutcome,
  openComboBuilder,
  pickFor,
  teamOutcomes,
  teamRecord,
  v5Games,
  v5Leagues,
  yesCents,
  type V5Sport,
} from '@/lib/lumen/v5-combos'
import { cn } from '@/lib/utils'
import { BetStackPopup, showBetStack } from './bet-stack-popup'
import { BuildOwnCard, ComboBuilderOverlay, FeaturedComboCard } from './combo-builder'
import { ChancePill, Crest, DrawMark, ProbBar, V5_CARD, V5_LIGHT_UP, fmtVol, useV5Pick } from './combo-ui'

type Mode = 'games' | 'live' | 'combos'

const SPORT_LABEL: Record<V5Sport, string> = { all: 'Sports', nfl: 'Football', soccer: 'Soccer' }
const ALL_LABEL: Record<V5Sport, string> = { all: 'All Sports', nfl: 'All Football', soccer: 'All Soccer' }

function SportIcon({ sport, className }: { sport: V5Sport; className?: string }) {
  if (sport === 'nfl') return <IconBallAmericanFootball className={className} stroke={1.5} />
  if (sport === 'soccer') return <IconBallFootball className={className} stroke={1.5} />
  return <IconTrophy className={className} stroke={1.5} />
}

const shortLeague = (name: string) => (name === 'NCAA Football' ? 'NCAA' : name)

/**
 * V5 · Combos sport page — V1 sportsbook layout (breadcrumb, league tiles, mode pills,
 * league boards) with prediction-market cards: chance bar, multiplier, % chip.
 * The combo builder lives in the Selections bar.
 */
export function ComboSportsPage({ sport = 'all' }: { sport?: V5Sport }) {
  const router = useRouter()
  const { startNavigating } = useShell()
  const [league, setLeague] = useState<string>('all')
  const [mode, setMode] = useState<Mode>('games')
  const picks = useSoccerSlip()
  const selected = useMemo(() => new Set(picks.map((p) => p.id)), [picks])
  const onPick = useV5Pick()

  const allGames = v5Games(sport)
  const leagues = v5Leagues(sport)
  const liveCount = allGames.filter((g) => g.live).length
  const combos = featuredCombos(sport)

  useEffect(() => {
    if (mode === 'live' && liveCount === 0) setMode('games')
  }, [mode, liveCount])

  const sections = useMemo(() => {
    const scoped = allGames.filter(
      (g) => (league === 'all' || g.leagueName === league) && (mode !== 'live' || g.live),
    )
    return leagues
      .map((l) => ({
        league: l,
        games: scoped
          .filter((g) => g.leagueName === l.name)
          .sort((a, b) => Number(b.live) - Number(a.live)),
      }))
      .filter((s) => s.games.length > 0)
  }, [allGames, leagues, league, mode])

  const links: SoccerQuickLink[] = [
    { id: 'all', label: ALL_LABEL[sport], icon: '' },
    ...leagues.map((l) => ({ id: l.name, label: shortLeague(l.name), icon: l.logo })),
  ]

  const modes: { id: Mode; label: string }[] = [
    { id: 'games', label: 'Games' },
    ...(liveCount ? [{ id: 'live' as const, label: `Live · ${liveCount}` }] : []),
    { id: 'combos', label: 'Popular Combos' },
  ]

  const go = (href: string) => {
    startNavigating(href)
    router.push(href)
  }

  return (
    <div data-name="v5-combo-sports" className="mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 md:py-6">
      {/* Breadcrumbs — V1 */}
      <div data-name="breadcrumbs" className="mb-4 flex items-center gap-2 sm:gap-3">
        {sport !== 'all' ? (
          <button
            type="button"
            onClick={() => (league !== 'all' ? setLeague('all') : go('/sports'))}
            aria-label={league !== 'all' ? `Back to ${SPORT_LABEL[sport].toLowerCase()}` : 'Back to sports home'}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary transition-colors hover:bg-accent"
          >
            <IconChevronLeft className="size-4" stroke={1.5} />
          </button>
        ) : null}
        <div className="flex items-center gap-1.5 whitespace-nowrap text-sm leading-none">
          <span className="inline-flex h-7 shrink-0 items-center gap-1.5 font-medium text-foreground">
            <SportIcon sport={sport} className="size-4 shrink-0" />
            {SPORT_LABEL[sport]}
          </span>
          <span className="inline-flex h-7 items-center text-muted-foreground/70" aria-hidden>
            /
          </span>
          <BreadcrumbMenu
            label={league === 'all' ? 'Select League' : league}
            options={[{ id: 'all', label: ALL_LABEL[sport] }, ...leagues.map((l) => ({ id: l.name, label: l.name }))]}
            active={league}
            onPick={setLeague}
            emphasize={league !== 'all'}
          />
        </div>
      </div>

      <LeagueQuickLinks
        links={links}
        activeId={league}
        onPick={setLeague}
        allIcon={<SportIcon sport={sport} className="size-6" />}
      />

      <ModePillTrack active={mode} onChange={setMode} modes={modes} ariaLabel="Sports views" />

      {mode === 'combos' ? (
        <section data-name="v5-combos-grid" className="mb-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <BuildOwnCard sport={sport} />
            {combos.map((c) => (
              <FeaturedComboCard key={c.id} combo={c} fluid />
            ))}
          </div>
        </section>
      ) : (
        <>
          {mode === 'games' && league === 'all' && combos.length ? (
            <section data-name="v5-popular-combos" className="mb-6">
              <div className="mb-3 flex h-9 items-center gap-2 px-0.5">
                <IconStack2 className="size-[18px] text-primary" stroke={1.75} aria-hidden />
                <Typography as="h2" shape="small" weight="semibold" className="min-w-0 flex-1 truncate">
                  Popular Combos
                </Typography>
                <ShelfSeeMore label="See All" onClick={() => setMode('combos')} />
              </div>
              <div className="-mx-4 md:-mx-6">
                <HorizontalRail label="Popular combos">
                  {combos.map((c) => (
                    <FeaturedComboCard key={c.id} combo={c} />
                  ))}
                </HorizontalRail>
              </div>
            </section>
          ) : null}

          {sections.map(({ league: l, games }) => (
            <section key={l.name} data-name="league-section" className="mb-6">
              <div className="mb-3 flex h-9 items-center gap-2 px-0.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.logo} alt="" width={18} height={18} className="size-[18px] object-contain" />
                <Typography as="h2" shape="small" weight="semibold" className="min-w-0 flex-1 truncate">
                  {l.name}
                </Typography>
                {league === 'all' && sections.length > 1 ? (
                  <ShelfSeeMore label="See All" onClick={() => setLeague(l.name)} />
                ) : null}
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {games.map((g) => (
                  <GameCard key={g.id} game={g} selected={selected} onPick={onPick} onOpen={() => go(g.href)} />
                ))}
              </div>
            </section>
          ))}
          {sections.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No games right now.</p>
          ) : null}
        </>
      )}

      <div className="-mx-4 mt-6 md:-mx-6">
        <CasinoLiveWinsCarousel />
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
    </div>
  )
}

/** Game card — V1 card meta strip, team rows with chance bar, multiplier + % chip. */
function GameCard({
  game,
  selected,
  onPick,
  onOpen,
}: {
  game: SportsMarket
  selected: Set<string>
  onPick: (pick: SoccerSlipPick, el?: HTMLElement | null) => void
  onOpen: () => void
}) {
  const lead = leadOutcome(game)
  const teams = teamOutcomes(game)
  const draw = game.outcomes.find((o) => o.label === 'Draw')
  const rows = [...teams, ...(draw ? [draw] : [])]
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
      className={cn(V5_CARD, V5_LIGHT_UP, 'group cursor-pointer overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring')}
    >
      <div className="flex h-[34px] items-center gap-2 border-b border-border px-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={game.leagueIcon} alt="" className="size-4 object-contain" />
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{game.leagueName}</span>
        {game.live ? (
          <LiveClock when={game.when} />
        ) : (
          <span className="text-xs text-muted-foreground">
            {game.when.split(',')[0]} · {kickoffTime(game)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2.5 px-3 py-3">
        {rows.map((o) => {
          const isDraw = o.label === 'Draw'
          const pick = pickFor(game, o, 'yes')
          const record = teamRecord(game, o)
          const score = game.live && game.score && !isDraw ? game.score[teams.indexOf(o)] : undefined
          return (
            <div key={o.id} className="flex items-center gap-3">
              {isDraw ? <DrawMark /> : <Crest name={o.team ?? o.label} />}
              <div className="min-w-0 flex-1">
                <p className="flex min-w-0 items-baseline gap-1.5">
                  <Typography
                    as="span"
                    shape="small"
                    weight="medium"
                    className={cn('truncate', isDraw && 'text-muted-foreground')}
                  >
                    {o.label}
                  </Typography>
                  {record ? <span className="shrink-0 text-xs text-muted-foreground">{record}</span> : null}
                </p>
                {!isDraw ? <ProbBar value={o.chance} lead={o.id === lead.id} className="mt-1.5 max-w-[200px]" /> : null}
              </div>
              {score !== undefined ? (
                <span className="w-6 shrink-0 text-center text-sm font-semibold tabular-nums text-foreground">{score}</span>
              ) : null}
              <ChancePill
                chance={o.chance}
                label={`${(100 / yesCents(o.chance)).toFixed(2)}x`}
                selected={selected.has(pick.id)}
                onClick={(el) => onPick(pick, el)}
              />
            </div>
          )
        })}
      </div>

      <div className="flex h-9 items-center gap-3 border-t border-border px-3 text-xs text-muted-foreground">
        <span>{fmtVol(game.volume)}</span>
        <span className="flex items-center gap-1">
          <IconUsers className="size-3.5" stroke={1.5} aria-hidden />
          {bettorsNow(game)} betting
        </span>
        <span className="ml-auto inline-flex items-center gap-0.5 font-medium text-foreground">
          All markets <IconChevronRight className="size-3.5" stroke={1.5} />
        </span>
      </div>
    </div>
  )
}
