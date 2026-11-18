import type { ComponentProps, ReactNode } from 'react'
import { Typography } from '@/components/ui/typography'
import { CasinoTrendsSkeleton } from '@/components/lumen/casino-trends-skeleton'
import { getCategoryWallpaper, getProviderWallpaper } from '@/lib/lumen/casino-wallpaper'
import { cn } from '@/lib/utils'

/** Lumen skeleton — official fill + Storybook `lm-shimmer` sweep. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn('lm-shimmer rounded-[10px] bg-[var(--skeleton)]', className)}
      {...props}
    />
  )
}

/** Flat blocks for the VIP + Races + promo banner row (164px). */
export function CasinoBannerSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-name="banner_row_skeleton"
      aria-hidden
      className={cn('flex gap-3 overflow-hidden pl-6', className)}
    >
      <Skeleton className="h-[164px] w-[288px] shrink-0" />
      <Skeleton className="h-[164px] w-[288px] shrink-0" />
      {Array.from({ length: 2 }, (_, i) => (
        <Skeleton key={i} className="h-[164px] w-[340px] shrink-0" />
      ))}
    </div>
  )
}

/** One game shelf — real title when known, tile rail matching CasinoGameShelf. */
export function CasinoShelfRowSkeleton({
  title,
  className,
}: {
  title?: string
  className?: string
}) {
  return (
    <section data-name="carousel_skeleton" aria-hidden className={cn('py-2', className)}>
      <div className="mb-0 flex min-h-9 items-center gap-2 px-6">
        {title ? (
          <Typography as="h3" shape="h4" weight="semibold" className="min-w-0 truncate">
            {title}
          </Typography>
        ) : (
          <Skeleton className="h-7 w-40" />
        )}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Skeleton className="h-9 w-[4.5rem] rounded-md" />
          <Skeleton className="size-9 rounded-md" />
          <Skeleton className="size-9 rounded-md" />
        </div>
      </div>
      <div className="flex gap-3 overflow-hidden py-4 pl-6">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-[207px] w-[152px] shrink-0" />
        ))}
      </div>
    </section>
  )
}

/** Top 10 rail — rank peek width + poster tiles. */
export function CasinoTop10Skeleton({
  title,
  hideTitle = false,
}: {
  title?: string
  hideTitle?: boolean
}) {
  return (
    <section data-name="top-10_skeleton" aria-hidden className="py-2">
      {hideTitle ? null : (
        <div className="mb-0 flex min-h-9 items-center px-6">
          {title ? (
            <Typography as="h3" shape="h4" weight="semibold" className="min-w-0 truncate">
              {title}
            </Typography>
          ) : (
            <Skeleton className="h-7 w-48" />
          )}
        </div>
      )}
      <div className="flex gap-4 overflow-hidden py-5 pl-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="relative h-[207px] w-[224px] shrink-0">
            <Skeleton className="absolute inset-y-0 left-0 w-[72px] rounded-md opacity-40" />
            <Skeleton className="absolute left-[72px] top-0 h-[207px] w-[152px]" />
          </div>
        ))}
      </div>
    </section>
  )
}

/** Provider logo strip under Slots Top 10. */
export function CasinoProviderRowSkeleton() {
  return (
    <section data-name="providers_skeleton" aria-hidden className="py-2">
      <div className="flex gap-3 overflow-hidden pl-6">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-14 w-[140px] shrink-0 rounded-lg" />
        ))}
      </div>
    </section>
  )
}

/** Activity block stub (filter pills + rows). */
function CasinoActivitySkeleton() {
  return (
    <section data-name="Activity_skeleton" aria-hidden className="px-6 py-6">
      <Typography as="h3" shape="h4" weight="semibold" className="mb-2.5">
        Activity
      </Typography>
      <div className="mb-3 flex gap-2">
        <Skeleton className="h-9 w-16 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-36 rounded-full" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </section>
  )
}

export type CasinoLobbySkeletonProps = {
  className?: string
  /** When true, include the Originals shelf placeholders below the banner row. */
  withOriginalsShelf?: boolean
}

/** Casino lobby — banners + shelves. */
export function CasinoLobbySkeleton({
  className,
  withOriginalsShelf = true,
}: CasinoLobbySkeletonProps) {
  return (
    <div
      data-name="lobby_content"
      data-skeleton="true"
      aria-busy
      aria-label="Loading"
      className={cn('w-full bg-background py-4', className)}
    >
      <CasinoBannerSkeleton />
      {withOriginalsShelf ? <CasinoShelfRowSkeleton title="BetOnline Originals" /> : null}
      <CasinoShelfRowSkeleton title="Popular Games" />
    </div>
  )
}

/** Live / Table / Specialty style — sectioned shelves, no banners. */
export function CasinoShelvesLobbySkeleton({
  titles,
  withActivity = true,
  className,
  children,
}: {
  titles: string[]
  withActivity?: boolean
  className?: string
  /** Inserted after the first N shelves (e.g. Top 10 between Blackjack and Baccarat). */
  children?: ReactNode
}) {
  return (
    <div
      data-name="shelves_lobby_skeleton"
      data-skeleton="true"
      aria-busy
      aria-label="Loading"
      className={cn('w-full bg-background pb-8 pt-4', className)}
    >
      {titles.map((title) => (
        <CasinoShelfRowSkeleton key={title} title={title} />
      ))}
      {children}
      {withActivity ? <CasinoActivitySkeleton /> : null}
    </div>
  )
}

/** Live Casino — shelves + Top 10 in real page order. No banners (lobby only). */
export function CasinoLiveSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-name="live-casino_skeleton"
      data-skeleton="true"
      aria-busy
      aria-label="Loading"
      className={cn('w-full bg-background pb-8 pt-4', className)}
    >
      <CasinoShelfRowSkeleton title="VIP Tables" />
      <CasinoShelfRowSkeleton title="Live Blackjack" />
      <CasinoTop10Skeleton title="Top 10 Live Casino" />
      <CasinoShelfRowSkeleton title="Baccarat" />
      <CasinoShelfRowSkeleton title="Roulette" />
      <CasinoShelfRowSkeleton title="Casino Poker" />
      <CasinoShelfRowSkeleton title="Other Games" />
      <CasinoActivitySkeleton />
    </div>
  )
}

/** Slots / category / provider wallpaper — Top 10 optional, title row, tile grid. */
export function CasinoWallpaperSkeleton({
  title,
  withBack = false,
  withTop10 = false,
  top10Title,
  withProviders = false,
  className,
}: {
  title?: string
  withBack?: boolean
  withTop10?: boolean
  top10Title?: string
  withProviders?: boolean
  className?: string
}) {
  return (
    <div
      data-name="wallpaper_skeleton"
      data-skeleton="true"
      aria-busy
      aria-label="Loading"
      className={cn('w-full bg-background pb-12 pt-4', className)}
    >
      {withTop10 ? <CasinoTop10Skeleton title={top10Title} /> : null}
      {withProviders ? <CasinoProviderRowSkeleton /> : null}

      <section className={cn(withTop10 || withProviders ? 'pt-8' : 'pt-2', 'pb-2')}>
        <div className="mb-5 flex min-h-11 items-center justify-between gap-4 px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {withBack ? <Skeleton className="size-10 shrink-0 rounded-md" /> : null}
            {title ? (
              <Typography as="h1" shape="h4" weight="semibold" className="min-w-0 truncate">
                {title}
              </Typography>
            ) : (
              <Skeleton className="h-7 w-40" />
            )}
          </div>
          <Skeleton className="h-9 w-[7.5rem] shrink-0 rounded-md" />
        </div>
        <div
          className={cn(
            'grid px-6 md:px-8',
            'gap-4 md:gap-5',
            'grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8',
          )}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <Skeleton key={i} className="aspect-[152/207] w-full min-w-0 rounded-[10px]" />
          ))}
        </div>
      </section>
    </div>
  )
}

/** Jackpots category — tier bar + rail × 3. */
export function CasinoJackpotsSkeleton({ className }: { className?: string }) {
  const blocks = ['Hot Jackpots', 'Halloween Jackpots', 'BGaming Jackpots']
  return (
    <div
      data-name="jackpots_skeleton"
      data-skeleton="true"
      aria-busy
      aria-label="Loading"
      className={cn('w-full bg-background pb-8 pt-4', className)}
    >
      {blocks.map((title) => (
        <section key={title} className="py-2" aria-hidden>
          <div className="px-6">
            <div className="mb-3 flex min-h-9 items-center gap-2">
              <Typography as="h3" shape="h4" weight="semibold">
                {title}
              </Typography>
              <Skeleton className="ml-auto size-9 rounded-md" />
              <Skeleton className="size-9 rounded-md" />
            </div>
            <Skeleton className="mb-3 hidden h-[50px] w-full rounded-[10px] md:block" />
            <Skeleton className="mb-3 h-[50px] w-full rounded-[10px] md:hidden" />
          </div>
          <div className="flex gap-3 overflow-hidden py-4 pl-6">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-[207px] w-[152px] shrink-0" />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/** Flat blocks for the Originals game shelf row (152 × 207 tiles). */
export function CasinoOriginalsShelfSkeleton({ className }: { className?: string }) {
  return <CasinoShelfRowSkeleton title="BetOnline Originals" className={className} />
}

function normalizeCasinoPath(path: string) {
  return path.split('?')[0]?.replace(/\/+$/, '') || '/'
}

/**
 * Destination-matched casino skeleton — shelves vs wallpaper vs lobby banners.
 * Soft-nav + `loading.tsx` both use this so layout never jumps to a generic lobby.
 */
export function casinoSkeletonForPath(path: string): ReactNode {
  const p = normalizeCasinoPath(path)

  if (p === '/casino') return <CasinoLobbySkeleton />

  if (p === '/casino/live') return <CasinoLiveSkeleton />

  if (p === '/casino/table-games') {
    return (
      <CasinoShelvesLobbySkeleton
        titles={['Roulette', 'Other Table Games', 'Baccarat', 'Casino Poker']}
      />
    )
  }

  if (p === '/casino/virtual-sports') {
    return <CasinoShelvesLobbySkeleton titles={['Esports', 'Sports']} />
  }

  if (p === '/casino/specialty') {
    return (
      <CasinoShelvesLobbySkeleton titles={['Scratch Cards', 'Keno', 'Other Games']} />
    )
  }

  if (p === '/casino/trends') {
    return <CasinoTrendsSkeleton />
  }

  if (p === '/casino/video-poker') {
    return <CasinoShelvesLobbySkeleton titles={['Multi Hand', 'Single Hand']} />
  }

  if (p === '/casino/slots') {
    return (
      <CasinoWallpaperSkeleton
        title="All Slots"
        withTop10
        top10Title="Top 10 Slots"
        withProviders
      />
    )
  }

  if (p === '/casino/category/jackpots') {
    return <CasinoJackpotsSkeleton />
  }

  const categoryMatch = p.match(/^\/casino\/category\/([^/]+)$/)
  if (categoryMatch) {
    const config = getCategoryWallpaper(categoryMatch[1]!)
    return (
      <CasinoWallpaperSkeleton
        title={config?.title}
        withBack
        withTop10={Boolean(config?.top10Games?.length)}
        top10Title={config?.top10Title}
      />
    )
  }

  const providerMatch = p.match(/^\/casino\/provider\/([^/]+)$/)
  if (providerMatch) {
    const config = getProviderWallpaper(providerMatch[1]!)
    return <CasinoWallpaperSkeleton title={config?.title ?? undefined} withBack />
  }

  return <CasinoShelvesLobbySkeleton titles={['Games']} withActivity={false} />
}
