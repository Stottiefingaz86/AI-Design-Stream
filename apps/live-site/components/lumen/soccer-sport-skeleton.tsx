import { cn } from '@/lib/utils'

const PULSE = 'animate-pulse rounded-md bg-surface-muted-3'

/** Destination skeleton for `/sports/soccer` soft-nav. */
export function SoccerSportSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-name="soccer-sport-skeleton"
      className={cn('mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 md:py-6', className)}
    >
      <div className={cn(PULSE, 'mb-4 h-7 w-64')} />
      <div className="mb-5 flex gap-2 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={cn(PULSE, 'size-20 shrink-0')} />
        ))}
      </div>
      <div className={cn(PULSE, 'mb-4 h-12 w-[280px] rounded-full')} />
      <div className={cn(PULSE, 'mb-2 h-5 w-36')} />
      <div className={cn(PULSE, 'h-[420px] w-full rounded-[10px]')} />
    </div>
  )
}
