import { Skeleton } from '@/components/lumen/casino-lobby-skeleton'
import { cn } from '@/lib/utils'

/** Homepage loading layout — hero + a couple of shelf placeholders. */
export function HomepageLobbySkeleton({ className }: { className?: string }) {
  return (
    <div
      data-name="homepage_content"
      data-skeleton="true"
      aria-busy
      aria-label="Loading"
      className={cn('w-full bg-background py-4', className)}
    >
      <div className="px-6">
        <Skeleton className="h-[320px] w-full rounded-2xl md:h-[368px]" />
      </div>
      <div className="mt-6 space-y-6">
        {Array.from({ length: 3 }, (_, row) => (
          <div key={row} className="pt-2">
            <div className="mb-3 flex items-center gap-2 px-6">
              <Skeleton className="h-7 w-40" />
            </div>
            <div className="flex gap-3 overflow-hidden pl-6">
              {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-[207px] w-[152px] shrink-0" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
