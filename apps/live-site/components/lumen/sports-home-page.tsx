'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
  IconPlayerPlay,
} from '@tabler/icons-react'
import { Typography } from '@/components/ui/typography'
import { CasinoLiveWinsCarousel } from '@/components/lumen/casino-live-wins-carousel'
import { CasinoLobbyBannerRow } from '@/components/lumen/casino-lobby-banners'
import { LeagueCard as NflLeagueBoard } from '@/components/lumen/nfl-sport-page'
import {
  BoardTeamBadge,
  LIVE_ROW_STYLE,
  ODDS_EDGE_ARROW,
  OddsButton,
  SoccerLeagueBoard,
} from '@/components/lumen/soccer-sport-page'
import { SoccerBetslip, type SoccerSlipPick } from '@/components/lumen/soccer-betslip'
import { ShellIcon, type ShellIconName } from '@/components/site/shell-icons'
import { useShell } from '@/components/site/shell-context'
import { revealShellDock } from '@/components/site/shell-scroll'
import { CASINO_LOBBY_PROMO_BANNERS } from '@/lib/lumen/casino-lobby-promos'
import { setSoccerSlip, useSoccerSlip, withOneLegPerMarket } from '@/lib/lumen/soccer-slip-store'
import {
  sportsHomeNflBoard,
  sportsHomeOddsBoosts,
  sportsHomePopular,
  sportsHomePremierLeague,
  sportsHomeSgpPacks,
  type OddsBoost,
  type PopularCard,
  type SgpPack,
} from '@/lib/lumen/sports-home'
import { rememberSportsReturn } from '@/lib/lumen/sports-return'
import { flyBetDotToSlip } from '@/lib/lumen/vip-celebrate'
import { cn } from '@/lib/utils'

const CARD = 'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'
/** Inner header plate — teams + chevron sit on their own surface for hierarchy. */
const EVENT_PLATE =
  'flex w-full items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5 text-left transition-colors hover:bg-accent'
const FINE_POINTER_MQ = '(hover: hover) and (pointer: fine)'
/** Subtle lift for every home card — softer than casino posters. */
const CARD_SPRING = { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.8 }
const CARD_HOVER = { y: -2, scale: 1.01 }
const CARD_TAP_FINE = { y: -1, scale: 1.005 }
const CARD_TAP_TOUCH = { scale: 0.98 }

const POPULAR = sportsHomePopular()
const SGP_PACKS = sportsHomeSgpPacks()
const BOOSTS = sportsHomeOddsBoosts()

type SportFilter = 'all' | 'soccer' | 'nfl'
const SPORT_FILTERS: { id: SportFilter; label: string; icon?: ShellIconName }[] = [
  { id: 'all', label: 'All' },
  { id: 'soccer', label: 'Soccer', icon: 'soccer' },
  { id: 'nfl', label: 'Football', icon: 'football' },
]

function useFinePointer() {
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(FINE_POINTER_MQ)
    const sync = () => setFine(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return fine
}

function useCardMotion() {
  const fine = useFinePointer()
  return {
    whileHover: fine ? CARD_HOVER : undefined,
    whileTap: fine ? CARD_TAP_FINE : CARD_TAP_TOUCH,
    transition: CARD_SPRING,
  }
}

/** Lobby-banner launch beat — spinner paints on the card before the route swaps. */
function useLaunch(onOpen: () => void) {
  const [loading, setLoading] = useState(false)
  const open = () => {
    if (loading) return
    setLoading(true)
    window.requestAnimationFrame(onOpen)
  }
  return { loading, open }
}

function LaunchOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[10px] bg-background/55 backdrop-blur-[1px]">
      <IconLoader2 className="size-8 animate-spin text-foreground" stroke={2} aria-hidden />
    </div>
  )
}

export function SportsHomePage({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const { startNavigating, setVipHubOpen, setCashierOpen } = useShell()
  const [popularSport, setPopularSport] = useState<SportFilter>('all')
  const [expandedNfl, setExpandedNfl] = useState(false)

  useEffect(() => {
    rememberSportsReturn(pathname)
  }, [pathname])
  const slipPicks = useSoccerSlip()
  const selectedIds = useMemo(() => new Set(slipPicks.map((p) => p.id)), [slipPicks])

  const premier = sportsHomePremierLeague()
  const nfl = sportsHomeNflBoard()
  const popular = useMemo(
    () => (popularSport === 'all' ? POPULAR : POPULAR.filter((c) => c.sport === popularSport)),
    [popularSport],
  )

  const banners = useMemo(
    () =>
      CASINO_LOBBY_PROMO_BANNERS.map((promo) => {
        if (promo.id === '100-free-spins') {
          return { ...promo, onAction: () => setCashierOpen(true) }
        }
        if (promo.id === 'casino-rakeback') {
          return { ...promo, onAction: () => setVipHubOpen(true) }
        }
        return promo
      }),
    [setCashierOpen, setVipHubOpen],
  )

  const go = (href: string) => {
    startNavigating(href)
    router.push(href)
  }

  const addPick = (next: SoccerSlipPick, originEl?: HTMLElement | null) => {
    if (selectedIds.has(next.id)) {
      setSoccerSlip((prev) => prev.filter((p) => p.id !== next.id))
      return
    }
    setSoccerSlip((prev) => (next.outright ? [next, ...prev] : withOneLegPerMarket(prev, next)))
    revealShellDock()
    flyBetDotToSlip(originEl, next.id)
  }

  /* Whole pack replaces any legs already on that game so the slip forms one SGP. */
  const addSgpPack = (pack: SgpPack, originEl?: HTMLElement | null) => {
    const ids = new Set(pack.legs.map((l) => l.id))
    if (pack.legs.every((l) => selectedIds.has(l.id))) {
      setSoccerSlip((prev) => prev.filter((p) => !ids.has(p.id)))
      return
    }
    const legs: SoccerSlipPick[] = pack.legs.map(({ display: _display, ...leg }) => leg)
    const key = legs[0]?.eventId ?? pack.eventLabel
    setSoccerSlip((prev) => [
      ...legs,
      ...prev.filter((p) => p.outright || (p.eventId ?? p.eventLabel) !== key),
    ])
    revealShellDock()
    flyBetDotToSlip(originEl, pack.id)
  }

  return (
    <div
      data-name="sports-home-page"
      className={cn('mx-auto w-full max-w-[1440px] bg-background pb-14 pt-4', className)}
    >
      <CasinoLobbyBannerRow promos={banners} />

      <section data-name="popular" className="mt-8 px-4 md:px-6">
        <ShelfTitle icon="popularSports" title="Popular" />
        <SportChips active={popularSport} onChange={setPopularSport} />
        <HorizontalRail label="Popular live games">
          {popular.map((card) => (
            <PopularGameCard key={card.id} card={card} onOpen={() => go(card.href)} />
          ))}
        </HorizontalRail>
      </section>

      <div className="mt-8 px-4 md:px-6">
        {premier?.events.length ? (
          <SoccerLeagueBoard
            section={premier}
            expanded
            onToggleMore={() => {}}
            onSeeAll={() => go('/sports/soccer')}
          />
        ) : null}

        <section data-name="sgp-packs" className="mb-6">
          <ShelfTitle icon="sgp" title="Same Game Parlays" />
          <HorizontalRail label="Same Game Parlay packs">
            {SGP_PACKS.map((pack) => (
              <SgpPackCard
                key={pack.id}
                pack={pack}
                selected={pack.legs.every((l) => selectedIds.has(l.id))}
                onAdd={(el) => addSgpPack(pack, el)}
                onOpen={() => go(pack.eventHref)}
              />
            ))}
          </HorizontalRail>
        </section>

        <section data-name="odds-boosts" className="mb-6">
          <ShelfTitle icon="rocket" title="Odds Boosts" />
          <HorizontalRail label="Odds Boosts">
            {BOOSTS.map((boost) => (
              <OddsBoostCard
                key={boost.id}
                boost={boost}
                selected={selectedIds.has(boost.id)}
                onAdd={(el) => addPick(boost.pick, el)}
                onOpen={() => go(boost.eventHref)}
              />
            ))}
          </HorizontalRail>
        </section>

        {nfl?.events.length ? (
          <NflLeagueBoard
            section={nfl}
            expanded={expandedNfl}
            onToggleMore={() => setExpandedNfl((v) => !v)}
            onSeeAll={() => go('/sports/football/nfl')}
            selectedIds={selectedIds}
            onPick={addPick}
          />
        ) : null}
      </div>

      <div className="mt-8">
        <CasinoLiveWinsCarousel />
      </div>

      <SoccerBetslip
        picks={slipPicks}
        onRemove={(id) => setSoccerSlip((prev) => prev.filter((p) => p.id !== id))}
        onClear={() => setSoccerSlip([])}
        onChange={setSoccerSlip}
      />
    </div>
  )
}

function ShelfTitle({ icon, title }: { icon: ShellIconName; title: string }) {
  return (
    <div className="mb-3 flex h-7 items-center gap-2">
      <ShellIcon name={icon} tone="token" className="size-5 text-foreground" />
      <Typography as="h2" shape="small" weight="semibold">
        {title}
      </Typography>
    </div>
  )
}

function SportChips({
  active,
  onChange,
}: {
  active: SportFilter
  onChange: (id: SportFilter) => void
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter popular by sport"
      className="scrollbar-hide -mx-4 mb-3 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0"
    >
      {SPORT_FILTERS.map((f) => {
        const on = f.id === active
        return (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(f.id)}
            className={cn(
              'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm transition-colors',
              on
                ? 'bg-secondary font-medium text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            {f.icon ? <ShellIcon name={f.icon} tone="token" className="size-4" /> : null}
            {f.label}
          </button>
        )
      })}
    </div>
  )
}

/** Swipe on touch; glass arrows on fine pointers only. Padded so card lift isn't clipped. */
function HorizontalRail({ label, children }: { label: string; children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canBack, setCanBack] = useState(false)
  const [canMore, setCanMore] = useState(false)
  const showArrows = useFinePointer()

  const measure = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanBack(el.scrollLeft > 8)
    setCanMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [measure, children])

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * Math.min(360, el.clientWidth * 0.8), behavior: 'smooth' })
  }

  return (
    <div className="relative -mx-4 md:-mx-2">
      <div
        ref={scrollRef}
        data-name="sports-home-rail"
        aria-label={label}
        className="scrollbar-hide -my-2 flex gap-3 overflow-x-auto overscroll-x-contain px-4 py-2 md:px-2"
        onScroll={measure}
      >
        {children}
      </div>
      {showArrows && canBack ? (
        <button
          type="button"
          aria-label={`Scroll ${label} back`}
          className={cn(ODDS_EDGE_ARROW, 'left-1')}
          onClick={() => scrollBy(-1)}
        >
          <IconChevronLeft className="size-4" strokeWidth={2} />
        </button>
      ) : null}
      {showArrows && canMore ? (
        <button
          type="button"
          aria-label={`Scroll ${label} forward`}
          className={cn(ODDS_EDGE_ARROW, 'right-1')}
          onClick={() => scrollBy(1)}
        >
          <IconChevronRight className="size-4" strokeWidth={2} />
        </button>
      ) : null}
    </div>
  )
}

function LiveClock({ when, className }: { when: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium text-destructive',
        className,
      )}
    >
      <IconPlayerPlay className="size-3 fill-current" stroke={0} />
      {when}
    </span>
  )
}

function CardMeta({
  icon,
  league,
  when,
  live,
}: {
  icon: string
  league: string
  when: string
  live: boolean
}) {
  return (
    <div className="flex w-full items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={icon} alt="" className="size-4 object-contain" />
      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{league}</span>
      {live ? (
        <LiveClock when={when} />
      ) : (
        <span className="text-xs text-muted-foreground">{when}</span>
      )}
    </div>
  )
}

function EventPlate({ teams, onOpen }: { teams: [string, string]; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className={cn(EVENT_PLATE, 'group')}>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {teams.map((name) => (
          <div key={name} className="flex h-5 items-center gap-2">
            <BoardTeamBadge name={name} />
            <span className="truncate text-sm font-semibold text-foreground">{name}</span>
          </div>
        ))}
      </div>
      <IconChevronRight
        className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
        stroke={1.5}
      />
    </button>
  )
}

function PopularGameCard({ card, onOpen }: { card: PopularCard; onOpen: () => void }) {
  const motionProps = useCardMotion()
  const { loading, open } = useLaunch(onOpen)
  const sides = card.awayFirst
    ? [
        { name: card.away, abbr: card.awayAbbr, pts: card.score[1] },
        { name: card.home, abbr: card.homeAbbr, pts: card.score[0] },
      ]
    : [
        { name: card.home, abbr: card.homeAbbr, pts: card.score[0] },
        { name: card.away, abbr: card.awayAbbr, pts: card.score[1] },
      ]
  const labels =
    card.sport === 'soccer'
      ? [sides[0]!.abbr, 'Draw', sides[1]!.abbr]
      : [sides[0]!.abbr, sides[1]!.abbr]
  const top = Math.max(...card.mlPct)

  return (
    <motion.button
      type="button"
      onClick={open}
      aria-busy={loading}
      data-name="popular-game-card"
      data-live=""
      {...motionProps}
      style={LIVE_ROW_STYLE}
      className={cn(
        CARD,
        'relative z-0 flex h-[160px] w-[min(340px,85vw)] shrink-0 flex-col overflow-hidden text-left touch-manipulation motion-reduce:!transform-none',
      )}
    >
      {loading ? <LaunchOverlay /> : null}
      <div className="flex h-[34px] w-full items-center border-b border-border px-3">
        <CardMeta icon={card.leagueIcon} league={card.leagueName} when={card.when} live />
      </div>
      <div className="flex min-h-0 w-full flex-1 items-center gap-2 px-3">
        {sides.map((side, i) => (
          <div
            key={side.name}
            className={cn(
              'flex min-w-0 flex-1 flex-col items-center gap-1.5',
              i === 1 && 'order-3',
            )}
          >
            <BoardTeamBadge name={side.name} />
            <span className="line-clamp-1 text-center text-xs font-medium leading-4 text-foreground">
              {side.name}
            </span>
          </div>
        ))}
        <span className="order-2 shrink-0 text-lg font-semibold tabular-nums text-foreground">
          {sides[0]!.pts} - {sides[1]!.pts}
        </span>
      </div>
      <div className="w-full border-t border-border px-3 py-2">
        <div className="mb-1.5 flex justify-between text-[10px] leading-3 tabular-nums">
          {card.mlPct.map((p, i) => (
            <span
              key={i}
              className={p === top ? 'font-semibold text-foreground' : 'text-muted-foreground'}
            >
              {labels[i]} {p}%
            </span>
          ))}
        </div>
        <div className="flex h-1 gap-0.5">
          {card.mlPct.map((p, i) => (
            <span
              key={i}
              className={cn(
                'h-full rounded-full',
                p === top ? 'bg-foreground' : 'bg-muted-foreground',
              )}
              style={{ width: `${Math.max(p, 2)}%` }}
            />
          ))}
        </div>
      </div>
    </motion.button>
  )
}

function SgpPackCard({
  pack,
  selected,
  onAdd,
  onOpen,
}: {
  pack: SgpPack
  selected: boolean
  onAdd: (el?: HTMLElement | null) => void
  onOpen: () => void
}) {
  const motionProps = useCardMotion()
  const { loading, open } = useLaunch(onOpen)
  return (
    <motion.article
      aria-busy={loading}
      data-name="sgp-pack-card"
      data-live={pack.live ? '' : undefined}
      {...motionProps}
      style={pack.live ? LIVE_ROW_STYLE : undefined}
      className={cn(
        CARD,
        'relative z-0 flex w-[min(320px,85vw)] shrink-0 flex-col overflow-hidden motion-reduce:!transform-none',
      )}
    >
      <div className="flex flex-col gap-2.5 p-3">
        <CardMeta
          icon={pack.leagueIcon}
          league={pack.leagueName}
          when={pack.when}
          live={!!pack.live}
        />
        <EventPlate teams={pack.teams} onOpen={open} />
      </div>
      {loading ? <LaunchOverlay /> : null}

      <ol data-name="sgp-pack-legs" className="flex flex-col px-4 pb-4 pt-1">
        {pack.legs.map((leg, i) => {
          const last = i === pack.legs.length - 1
          return (
            <li key={leg.id} className={cn('relative flex gap-3', !last && 'pb-3')}>
              {!last ? (
                <span className="absolute bottom-0 left-[7.5px] top-5 w-px bg-border" aria-hidden />
              ) : null}
              <span
                className={cn(
                  'relative mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full transition-colors',
                  selected ? 'bg-primary' : 'border-2 border-muted-foreground bg-card',
                )}
                aria-hidden
              >
                {selected ? (
                  <IconCheck className="size-2.5 text-primary-foreground" stroke={3.5} />
                ) : null}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium leading-5 text-foreground">
                  {leg.display}
                </div>
                {leg.market.toLowerCase() !== leg.display.toLowerCase() ? (
                  <div className="truncate text-xs leading-4 text-muted-foreground">
                    {leg.market}
                  </div>
                ) : null}
              </div>
              <span className="shrink-0 text-xs leading-5 tabular-nums text-muted-foreground">
                {leg.odds}
              </span>
            </li>
          )
        })}
      </ol>

      <div className="mt-auto border-t border-border p-3">
        <OddsButton
          pick={{
            id: pack.id,
            label: selected ? 'Added to Betslip' : `${pack.legs.length} Leg SGP`,
            odds: pack.odds,
          }}
          selected={selected}
          onSelect={(_, el) => onAdd(el)}
          className="h-12 w-full"
        />
      </div>
    </motion.article>
  )
}

function OddsBoostCard({
  boost,
  selected,
  onAdd,
  onOpen,
}: {
  boost: OddsBoost
  selected: boolean
  onAdd: (el?: HTMLElement | null) => void
  onOpen: () => void
}) {
  const motionProps = useCardMotion()
  const { loading, open } = useLaunch(onOpen)
  return (
    <motion.article
      aria-busy={loading}
      data-name="odds-boost-card"
      data-live={boost.live ? '' : undefined}
      {...motionProps}
      style={boost.live ? LIVE_ROW_STYLE : undefined}
      className={cn(
        CARD,
        'relative z-0 flex w-[min(320px,85vw)] shrink-0 flex-col overflow-hidden motion-reduce:!transform-none',
      )}
    >
      <div className="flex flex-col gap-2.5 p-3">
        <CardMeta
          icon={boost.leagueIcon}
          league={boost.leagueName}
          when={boost.when}
          live={boost.live}
        />
        <EventPlate teams={boost.teams} onOpen={open} />
      </div>
      {loading ? <LaunchOverlay /> : null}
      <div className="flex flex-1 items-start gap-2 px-4 pb-4 pt-1">
        <ShellIcon name="rocket" tone="token" className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-sm font-medium leading-5 text-foreground">{boost.title}</p>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border p-3">
        <div className="flex h-12 flex-col items-center justify-center gap-0.5 rounded-lg border border-border px-2 text-center">
          <span className="text-[10px] font-medium leading-3.5 text-muted-foreground">Was</span>
          <span className="text-sm font-semibold tabular-nums leading-5 text-muted-foreground line-through">
            {boost.was}
          </span>
        </div>
        <OddsButton
          pick={{ id: boost.id, label: 'Boosted', odds: boost.boosted }}
          selected={selected}
          onSelect={(_, el) => onAdd(el)}
          className="h-12 w-full"
        />
      </div>
    </motion.article>
  )
}
