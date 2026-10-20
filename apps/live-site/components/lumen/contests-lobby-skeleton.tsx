import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Promo26 Contest skeleton — 2144:391631.
 * Real title; tab track + cards as flat loading blocks.
 */
export function ContestsLobbySkeleton({ className }: { className?: string }) {
  return (
    <div
      data-name="contest_skeleton"
      data-skeleton="true"
      aria-busy
      aria-label="Loading Contest"
      className={cn('flex w-full flex-col gap-7 bg-background px-6 pb-10 pt-6', className)}
    >
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold leading-8 text-foreground">Contest</h1>
        {/* Figma NavMenu skeleton — 580×48 pill */}
        <Skeleton className="h-12 w-full max-w-[580px] rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }, (_, i) => (
          <Skeleton key={i} className="h-[238px] w-full rounded-[14px]" />
        ))}
      </div>
    </div>
  )
}
