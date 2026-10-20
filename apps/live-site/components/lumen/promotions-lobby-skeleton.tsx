import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/lumen/casino-lobby-skeleton'

/**
 * Promo26_Revamp 2625:327204 — banner strip + title + filter pill + 4×3 card grid.
 * Flat blocks only; shell chrome stays real.
 */
export function PromotionsLobbySkeleton({ className }: { className?: string }) {
  return (
    <div
      data-name="promotions_lobby_skeleton"
      data-skeleton="true"
      aria-busy
      aria-label="Loading promotions"
      className={cn('w-full bg-background pt-6', className)}
    >
      {/* Banner carousel — 340×164 cards */}
      <div className="flex gap-3 overflow-hidden pl-6" aria-hidden>
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[164px] w-[340px] shrink-0 rounded-[10px]" />
        ))}
      </div>

      <div className="mt-8 px-6">
        <Skeleton className="mb-4 h-8 w-40" />
        <Skeleton className="mb-6 h-12 w-full max-w-[580px] rounded-full" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }, (_, i) => (
            <Skeleton key={i} className="aspect-[280/220] w-full rounded-[10px]" />
          ))}
        </div>
      </div>
    </div>
  )
}
