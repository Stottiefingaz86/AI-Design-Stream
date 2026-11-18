import { cn } from '@/lib/utils'

const PULSE = 'animate-pulse rounded-md bg-surface-muted-3'

/** Destination skeleton for `/sports/soccer/event/[id]` soft-nav. */
export function SoccerEventSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-name="soccer-event-skeleton"
      className={cn('mx-auto w-full max-w-[1440px] px-4 py-4 md:px-6 md:py-6', className)}
    >
      <div className={cn(PULSE, 'mb-4 h-7 w-72')} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0">
          <div className={cn(PULSE, 'h-[188px] w-full rounded-[10px] md:h-[212px]')} />
          <div className={cn(PULSE, 'mt-4 aspect-video w-full rounded-[10px] lg:hidden')} />
          <div className={cn(PULSE, 'mb-4 mt-5 h-12 w-full max-w-[520px] rounded-full')} />
          <div className="flex flex-col gap-3">
            {[108, 168, 168, 108].map((h, i) => (
              <div key={i} className={cn(PULSE, 'w-full rounded-[10px]')} style={{ height: h }} />
            ))}
          </div>
        </div>
        <div className="hidden flex-col gap-4 lg:flex">
          <div className={cn(PULSE, 'h-[290px] w-full rounded-[10px]')} />
          <div className={cn(PULSE, 'h-[320px] w-full rounded-[10px]')} />
        </div>
      </div>
    </div>
  )
}
