import { IconInfoCircle } from '@tabler/icons-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Promo26 My Bonus skeleton — title + tabs + table headers stay real;
 * only filter chips and body rows shimmer (matches Figma loading frame).
 */
export function MyBonusSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-name="my_bonus_skeleton"
      data-skeleton="true"
      aria-busy
      aria-label="Loading My Bonus"
      className={cn('w-full bg-background px-6 pb-14 pt-6', className)}
    >
      <div className="mb-4 flex items-center gap-1.5">
        <h1 className="text-3xl font-semibold leading-9 text-foreground">My Bonus</h1>
        <span className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground">
          <IconInfoCircle className="size-4" stroke={1.75} aria-hidden />
        </span>
      </div>

      <div className="mb-4 flex gap-6 border-b border-border" aria-hidden>
        <span className="relative -mb-px pb-2 text-sm font-semibold text-foreground">
          Casino
          <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
        </span>
        <span className="pb-2 text-sm font-medium text-muted-foreground">Sports</span>
      </div>

      <div className="mb-4 flex gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-8 rounded-md" style={{ width: 72 + i * 28 }} />
        ))}
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]">
        <div className="flex gap-4 border-b border-border px-4 py-3 text-xs font-medium text-muted-foreground">
          <span className="w-[14%]">Name</span>
          <span className="hidden w-[12%] sm:block">Code</span>
          <span className="hidden w-[12%] md:block">Bonus Fund</span>
          <span className="hidden w-[12%] lg:block">Expiry Date</span>
          <span className="hidden w-[14%] lg:block">Rollover</span>
          <span className="hidden w-[10%] md:block">Free Spins</span>
          <span className="w-[12%]">Action</span>
          <span className="ml-auto w-10 text-right">More</span>
        </div>
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={cn('flex items-center gap-4 px-4 py-3', i % 2 === 1 && 'bg-muted/40')}
          >
            <Skeleton className="h-4 w-[14%]" />
            <Skeleton className="hidden h-4 w-[12%] sm:block" />
            <Skeleton className="hidden h-4 w-[12%] md:block" />
            <Skeleton className="hidden h-4 w-[12%] lg:block" />
            <Skeleton className="hidden h-4 w-[14%] lg:block" />
            <Skeleton className="hidden h-4 w-[10%] md:block" />
            <Skeleton className="h-8 w-[5.5rem] rounded-md" />
            <Skeleton className="ml-auto size-6 rounded-full" />
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
    </div>
  )
}
