'use client'

import { useMemo, useState } from 'react'
import { CasinoGameTile } from '@/components/lumen/casino-game-tile'
import { CasinoProviderRow, CasinoTop10 } from '@/components/lumen/casino-lobby-page'
import { WallpaperSortMenu } from '@/components/lumen/wallpaper-sort-menu'
import { useShell } from '@/components/site/shell-context'
import { Typography } from '@/components/ui/typography'
import { SLOTS_TOP10_GAMES, SLOTS_WALLPAPER_GAMES } from '@/lib/lumen/casino-lobby-catalog'
import { sortWallpaperGames, type WallpaperSortId } from '@/lib/lumen/casino-wallpaper'
import { cn } from '@/lib/utils'

/** Casino-Lumen Slots wallpaper — Figma 115:389970. */
export function CasinoSlotsLobby() {
  const { launchGame } = useShell()
  const [sort, setSort] = useState<WallpaperSortId>('newest')
  const games = useMemo(() => sortWallpaperGames(SLOTS_WALLPAPER_GAMES, sort), [sort])

  return (
    <div data-name="slot_content" className="w-full bg-background pb-12 pt-4">
      <CasinoTop10
        title="Top 10 Slots"
        games={SLOTS_TOP10_GAMES}
        onLaunch={launchGame}
        hideTitle
      />

      <CasinoProviderRow hideTitle />

      <section data-name="all-slots" aria-label="All Slots" className="pt-8 pb-2">
        <div className="mb-5 flex min-h-11 items-center justify-between gap-4 px-6 md:px-8">
          <Typography as="h1" shape="h4" weight="semibold" className="min-w-0 truncate">
            All Slots
          </Typography>
          <WallpaperSortMenu value={sort} onChange={setSort} />
        </div>

        {/* Wallpaper grid — 8-up from xl */}
        <div
          className={cn(
            'grid px-6 md:px-8',
            'gap-4 md:gap-5',
            'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
          )}
        >
          {games.map((game, index) => (
            <div
              key={game.id}
              className="lm-tile-enter aspect-[152/207] w-full min-w-0"
              style={{ ['--lm-tile-i' as `--lm-tile-i`]: index }}
            >
              <CasinoGameTile
                game={game}
                onLaunch={launchGame}
                hideTitle
                className="!h-full !w-full"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
