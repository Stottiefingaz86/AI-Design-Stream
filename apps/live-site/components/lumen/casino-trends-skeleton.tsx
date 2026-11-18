import { cn } from '@/lib/utils'

function Block({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('lm-shimmer rounded-[10px] bg-[var(--skeleton)]', className)}
    />
  )
}

/** Destination skeleton for `/casino/trends`. */
export function CasinoTrendsSkeleton() {
  return (
    <div data-name="trends_skeleton" className="w-full bg-background pb-10 pt-4">
      <div className="mb-5 px-4 sm:px-6">
        <Block className="h-7 w-28" />
        <Block className="mt-2 h-4 w-64 max-w-full" />
        <div className="mt-4 flex items-center justify-between gap-3">
          <Block className="h-12 w-[220px] rounded-full" />
          <Block className="h-8 w-[100px] rounded-md" />
        </div>
      </div>

      <div className="px-4 sm:px-6">
        <Block className="h-5 w-72 max-w-full" />
      </div>
      <div className="mt-4 flex gap-4 overflow-hidden pl-4 sm:pl-6">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex shrink-0 flex-col" style={{ width: i === 9 ? 284 : 224 }}>
            <Block className="h-[207px] w-full rounded-[10px]" />
            <Block className="mt-2 ml-[72px] h-4 w-28" />
            <Block className="mt-1 ml-[72px] h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
