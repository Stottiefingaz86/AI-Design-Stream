import { cn } from '@/lib/utils'

function Block({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('lm-shimmer rounded-[10px] bg-[var(--skeleton)]', className)}
    />
  )
}

/** Flat blocks matching Crypto Home / Loading — 3-col coin grid, no pulse pills. */
export function CashierSheetSkeleton({ className }: { className?: string }) {
  return (
    <div data-name="cashier_sheet_skeleton" aria-busy className={cn('flex flex-col gap-3', className)}>
      <div className="flex items-center gap-1.5">
        <Block className="size-9 shrink-0 rounded-lg" />
        <Block className="h-5 w-16" />
      </div>
      <div className="flex gap-0">
        <Block className="h-10 flex-1 rounded-lg" />
        <Block className="h-10 flex-1 rounded-lg" />
      </div>
      <div className="flex flex-col gap-6 pb-2 pt-2">
        <Block className="mx-auto h-12 w-[244px] rounded-full" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 18 }, (_, i) => (
            <div key={i} className="flex h-[100px] flex-col items-center justify-center gap-2 rounded-lg border border-border bg-secondary p-2">
              <Block className="size-7 rounded-full" />
              <Block className="h-3 w-14" />
              <Block className="h-3 w-8" />
            </div>
          ))}
        </div>
        <Block className="h-11 w-full rounded-lg" />
      </div>
    </div>
  )
}
