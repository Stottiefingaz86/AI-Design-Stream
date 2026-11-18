import { cn } from '@/lib/utils'

const PULSE = 'animate-pulse rounded-[10px] bg-surface-muted-3'

/** Soft-nav destination for `/sports`. */
export function SportsHomeSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-name="sports-home-skeleton"
      className={cn('mx-auto w-full max-w-[1440px] px-4 pb-14 pt-4 md:px-6 md:pt-6', className)}
    >
      <div className="mb-5 flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn(PULSE, 'h-[164px] w-[340px] shrink-0')} />
        ))}
      </div>
      <div className={cn(PULSE, 'mb-3 h-7 w-36')} />
      <div className="mb-6 flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn(PULSE, 'h-[160px] w-[340px] shrink-0')} />
        ))}
      </div>
      <div className={cn(PULSE, 'mb-3 h-7 w-48')} />
      <div className="mb-6 flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={cn(PULSE, 'h-[180px] w-[300px] shrink-0')} />
        ))}
      </div>
      <div className={cn(PULSE, 'mb-4 h-10 w-64 rounded-full')} />
      <div className={cn(PULSE, 'h-[320px] w-full')} />
    </div>
  )
}
