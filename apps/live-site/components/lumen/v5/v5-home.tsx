'use client'

import { useState, type ReactNode } from 'react'
import { SoccerBetslip } from '@/components/lumen/soccer-betslip'
import { setSoccerSlip, useSoccerSlip } from '@/lib/lumen/soccer-slip-store'
import { cn } from '@/lib/utils'
import { BetStackPopup, showBetStack } from './bet-stack-popup'
import { ComboBuilderOverlay } from './combo-builder'
import { V5_HEADING } from './combo-ui'
import { SportsActivity } from './v5-activity'
import { CasinoActivityFeed } from './v5-casino-activity'
import { PopularCarousel, ShelfGutter } from './v5-shelves'
import { PopularLeagues, TrendingHero } from './v5-widgets'

/**
 * V5 · Combos on the homepage — the sports shelves swap to the V5 sports components (live Popular
 * games, Popular leagues, Trending), Activity gets a Casino / Sports switch (both feeds one shape), and the V5 slip,
 * combo builder and bet stack come along so prices tapped here work like they do on Sports.
 * The homepage gutter is 24px, so shelves get it through ShelfGutter.
 */

const HOME_GUTTER = 24

function HomeBand({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('px-6 pt-2 [&>section]:mb-6', className)}>
      <ShelfGutter.Provider value={HOME_GUTTER}>{children}</ShelfGutter.Provider>
    </div>
  )
}

/** Live and big games, grouped by league — the carousel from the top of Sports home. */
export function V5HomePopular() {
  return (
    <HomeBand>
      <PopularCarousel sport="all" />
    </HomeBand>
  )
}

/** Replaces the static Top Markets tiles — leagues with live counts, straight to the league page. */
export function V5HomeLeagues() {
  return (
    <HomeBand>
      <PopularLeagues />
    </HomeBand>
  )
}

/** Replaces Trending Sports — the big trending games with their chance charts (phones: the row
 * swipes edge to edge at the homepage's 24px gutter). */
export function V5HomeTrending() {
  return (
    <HomeBand className="max-md:[&_.snap-x]:-mx-6 max-md:[&_.snap-x]:scroll-px-6 max-md:[&_.snap-x]:px-6">
      <TrendingHero sport="all" title="Trending sports" />
    </HomeBand>
  )
}

type Feed = 'casino' | 'sports'

/** Activity with a Casino / Sports switch — the switch sits next to the heading in both feeds. */
export function V5HomeActivity() {
  const [feed, setFeed] = useState<Feed>('casino')
  const title = (
    <div className="flex flex-wrap items-center gap-3">
      <h2 className={V5_HEADING}>Activity</h2>
      <div role="tablist" aria-label="Activity feed" className="inline-flex h-10 items-center rounded-full border border-border bg-card p-1">
        {(
          [
            { id: 'casino', label: 'Casino' },
            { id: 'sports', label: 'Sports' },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={feed === f.id}
            onClick={() => setFeed(f.id)}
            className={cn(
              'h-8 rounded-full px-3.5 text-sm font-semibold transition-colors',
              feed === f.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
  /* Both feeds share one shape — tile, two lines, player and stake, the price / multiplier button. */
  return (
    <div className="px-6 pt-6">
      {feed === 'casino' ? <CasinoActivityFeed titleSlot={title} /> : <SportsActivity sport="all" titleSlot={title} />}
    </div>
  )
}

/** The V5 slip, combo builder and bet stack — so Yes / No and Activity prices work on the homepage. */
export function V5HomeSlip() {
  const picks = useSoccerSlip()
  return (
    <>
      <SoccerBetslip
        picks={picks}
        onRemove={(id) => setSoccerSlip((prev) => prev.filter((p) => p.id !== id))}
        onClear={() => setSoccerSlip([])}
        onChange={setSoccerSlip}
        /* No combo builder entry on the homepage — the Selections bar only shows once there are picks. */
        variant="v5"
        onClosedAfterPlace={showBetStack}
      />
      <ComboBuilderOverlay />
      <BetStackPopup />
    </>
  )
}
