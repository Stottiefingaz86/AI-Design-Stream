import { IconInfoCircle } from '@tabler/icons-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Bet History skeleton — Figma 4227:120085 (1.1 Main Screen / Skeleton).
 * Title + week tabs stay real; daily boxes, filters, and table rows shimmer.
 */
export function BetHistorySkeleton({ className }: { className?: string }) {
  return (
    <section
      data-name="section-bet-history-skeleton"
      data-skeleton="true"
      aria-busy
      aria-label="Loading Bet History"
      className={cn('w-full bg-background px-4 pb-14 pt-4 lg:px-6 lg:pt-6', className)}
    >
      <div className="mb-4 flex items-center gap-1.5">
        <h1 className="text-xl font-semibold leading-7 text-foreground lg:text-2xl lg:leading-8">
          Bet History
        </h1>
        <span className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground">
          <IconInfoCircle className="size-4" stroke={1.75} aria-hidden />
        </span>
      </div>

      <div className="mb-4 overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]">
        <div className="flex gap-2 border-b border-border bg-[var(--surface-muted-1,#f9fafb)] px-5 pt-3">
          <span className="relative -mb-px border-b-2 border-primary pb-2 text-sm font-medium text-foreground">
            This Week
          </span>
          <span className="pb-2 text-sm font-medium text-muted-foreground">Last Week</span>
        </div>
        <div className="flex gap-2 overflow-x-auto px-5 py-4">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className="flex min-w-[72px] flex-1 flex-col items-center gap-0.5 rounded-lg border border-border bg-secondary p-2"
            >
              <Skeleton className="h-4 w-[66px] rounded" />
              <Skeleton className="h-4 w-[66px] rounded" />
            </div>
          ))}
          <div className="flex w-[100px] shrink-0 flex-col justify-center gap-0.5">
            <span className="text-sm font-medium text-muted-foreground">Total Result</span>
            <Skeleton className="h-5 w-20 rounded" />
          </div>
        </div>
        <p className="border-t border-border px-5 py-4 text-xs text-muted-foreground">
          Daily Figures (EST) include activity from Sports, Live Betting, Racebook, Esports, and
          Casino. See full details in Transactions.
        </p>
      </div>

      <div className="mb-4 flex gap-2">
        <Skeleton className="h-8 w-[108px] rounded-md" />
        <Skeleton className="h-8 w-[93px] rounded-full" />
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]">
        <div className="hidden gap-3 border-b border-border bg-[var(--surface-muted-1,#f9fafb)] px-3 py-3 text-xs font-medium text-muted-foreground md:flex">
          <span className="w-[120px]">Date</span>
          <span className="min-w-0 flex-1">Description</span>
          <span className="w-[14%]">Type</span>
          <span className="w-[12%]">Risk</span>
          <span className="w-[12%]">To Win</span>
          <span className="w-[12%]">Status</span>
          <span className="w-[60px] text-center">More</span>
        </div>
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border px-3 py-4 last:border-b-0"
          >
            <Skeleton className="hidden h-4 w-[100px] md:block" />
            <Skeleton className="h-4 min-w-0 flex-1" />
            <Skeleton className="hidden h-4 w-[14%] lg:block" />
            <Skeleton className="hidden h-4 w-[12%] md:block" />
            <Skeleton className="hidden h-4 w-[12%] md:block" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="size-4 shrink-0 rounded" />
          </div>
        ))}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>
    </section>
  )
}
