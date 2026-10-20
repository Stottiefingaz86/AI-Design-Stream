'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconChevronLeft } from '@tabler/icons-react'
import { CasinoGameTile } from '@/components/lumen/casino-game-tile'
import { CasinoTop10 } from '@/components/lumen/casino-lobby-page'
import { WallpaperSortMenu } from '@/components/lumen/wallpaper-sort-menu'
import { useShell } from '@/components/site/shell-context'
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
 * Optional Top 10 (Staff Picks). Back returns to the previous page.
 */
export function CasinoWallpaperPage({
  config,
  fallbackHref = '/casino',
}: {
  config: WallpaperConfig
  fallbackHref?: string
}) {
  const { launchGame } = useShell()
  const [sort, setSort] = useState<WallpaperSortId>('newest')
  const games = useMemo(() => sortWallpaperGames(config.games, sort), [config.games, sort])
  const showTop10 = Boolean(config.top10Games?.length)

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
          <WallpaperSortMenu value={sort} onChange={setSort} />
        </div>

        {/* Keep ~152px tile floor so 8-up never crushes art / type. */}
        <div
          className={cn(
            'grid px-6 md:px-8',
            'gap-4 md:gap-5',
            'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
          )}
        >
          {games.map((game) => (
            <div key={game.id} className="aspect-[152/207] w-full min-w-0">
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
