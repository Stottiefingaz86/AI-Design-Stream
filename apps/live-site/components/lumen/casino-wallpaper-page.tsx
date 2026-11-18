'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconChevronLeft, IconHeartOff } from '@tabler/icons-react'
import { CasinoGameTile } from '@/components/lumen/casino-game-tile'
import { CasinoTop10 } from '@/components/lumen/casino-lobby-page'
import { WallpaperSortMenu } from '@/components/lumen/wallpaper-sort-menu'
import { useShell } from '@/components/site/shell-context'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { Typography } from '@/components/ui/typography'
import {
  sortWallpaperGames,
  type WallpaperConfig,
  type WallpaperSortId,
} from '@/lib/lumen/casino-wallpaper'
import { cn } from '@/lib/utils'

function WallpaperBackButton({ fallbackHref = '/casino' }: { fallbackHref?: string }) {
  const router = useRouter()

  return (
    <button
      type="button"
      aria-label="Go back"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back()
          return
        }
        router.push(fallbackHref)
      }}
      className={cn(
        'shell-chrome-btn inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-secondary text-foreground',
        'outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <IconChevronLeft className="size-5" strokeWidth={1.5} />
    </button>
  )
}

/**
 * Shared wallpaper grid — Figma All Slots style.
 * Favourites: empty + auth CTAs when logged out / no hearts.
 */
export function CasinoWallpaperPage({
  config,
  fallbackHref = '/casino',
}: {
  config: WallpaperConfig
  fallbackHref?: string
}) {
  const { launchGame, loggedIn, openAuth, favoriteGames } = useShell()
  const [sort, setSort] = useState<WallpaperSortId>('newest')
  const isFavourites = config.slug === 'favourites'
  const sourceGames = isFavourites ? favoriteGames : config.games
  const games = useMemo(() => sortWallpaperGames(sourceGames, sort), [sourceGames, sort])
  const showTop10 = Boolean(config.top10Games?.length)
  const showEmpty = isFavourites && games.length === 0

  return (
    <div data-name="wallpaper_content" className="w-full bg-background pb-12 pt-4">
      {showTop10 ? (
        <div className="mb-2">
          <CasinoTop10
            title={config.top10Title ?? `Top 10 ${config.title}`}
            games={config.top10Games!}
            onLaunch={launchGame}
          />
        </div>
      ) : null}

      <section
        data-name="wallpaper-grid"
        aria-label={config.title}
        className={cn(showTop10 ? 'pt-6' : 'pt-2', 'pb-2')}
      >
        <div className="mb-5 flex min-h-11 items-center justify-between gap-4 px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <WallpaperBackButton fallbackHref={fallbackHref} />
            <Typography as="h1" shape="h4" weight="semibold" className="min-w-0 truncate">
              {config.title}
            </Typography>
          </div>
          {!showEmpty ? <WallpaperSortMenu value={sort} onChange={setSort} /> : null}
        </div>

        {showEmpty ? (
          <Empty className="mx-6 border border-dashed border-border bg-card md:mx-8">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconHeartOff className="size-6 text-muted-foreground" aria-hidden />
              </EmptyMedia>
              <EmptyTitle>No favourites yet</EmptyTitle>
              <EmptyDescription>
                {loggedIn
                  ? 'Heart a game to save it here.'
                  : 'Login or Join to save games.'}
              </EmptyDescription>
            </EmptyHeader>
            {!loggedIn ? (
              <EmptyContent>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button type="button" onClick={() => openAuth('login')}>
                    Login
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openAuth('join')}
                  >
                    Join
                  </Button>
                </div>
              </EmptyContent>
            ) : null}
          </Empty>
        ) : (
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
        )}
      </section>
    </div>
  )
}
