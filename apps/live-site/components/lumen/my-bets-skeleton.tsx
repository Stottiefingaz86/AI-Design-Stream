import { cn } from '@/lib/utils'

const PULSE = 'animate-pulse rounded-md bg-surface-muted-3'

/** Destination skeleton for `/sports/my-bets` — Bet History layout. */
export function MyBetsSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-name="my-bets-skeleton"
      className={cn('mx-auto w-full max-w-[1440px] px-4 pb-14 pt-4 lg:px-6 lg:pt-6', className)}
    >
      <div className={cn(PULSE, 'mb-4 h-8 w-36')} />
      <div className={cn(PULSE, 'mb-4 h-[132px] w-full rounded-[10px]')} />
      <div className="mb-4 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={cn(PULSE, 'h-[26px] w-20 rounded-full')} />
        ))}
      </div>
      <div className="flex flex-col gap-px overflow-hidden rounded-[10px] border border-border">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={cn(PULSE, 'h-14 w-full rounded-none')} />
        ))}
      </div>
    </div>
  )
}
