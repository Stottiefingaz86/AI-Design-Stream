import { IconInfoCircle } from '@tabler/icons-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/** Payments skeleton — title stays real; filters + table rows shimmer. */
export function PaymentsSkeleton({ className }: { className?: string }) {
  return (
    <section
      data-name="section-payments-skeleton"
      data-skeleton="true"
      aria-busy
      aria-label="Loading Payments"
      className={cn('w-full bg-background px-4 pb-14 pt-4 lg:px-6 lg:pt-6', className)}
    >
      <div className="mb-4 flex items-center gap-1.5">
        <h1 className="text-xl font-semibold leading-7 text-foreground lg:text-2xl lg:leading-8">
          Payments
        </h1>
        <span className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground">
          <IconInfoCircle className="size-4" stroke={1.75} aria-hidden />
        </span>
      </div>

      <div className="mb-4 flex gap-2">
        <Skeleton className="h-8 w-[108px] rounded-md" />
        <Skeleton className="h-8 w-[93px] rounded-full" />
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]">
        <div className="hidden gap-3 border-b border-border bg-[var(--surface-muted-1,#f9fafb)] px-3 py-3 text-xs font-medium text-muted-foreground md:flex">
          <span className="w-[14%]">Trace ID</span>
          <span className="w-[12%]">Date</span>
          <span className="w-[12%]">Type</span>
          <span className="w-[16%]">Method</span>
          <span className="min-w-0 flex-1">Descriptor</span>
          <span className="w-[14%]">Total Amount</span>
          <span className="w-[60px] text-center">More</span>
        </div>
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-border px-3 py-4 last:border-b-0"
          >
            <Skeleton className="hidden h-4 w-[14%] md:block" />
            <Skeleton className="hidden h-4 w-[12%] sm:block" />
            <Skeleton className="hidden h-4 w-[12%] lg:block" />
            <Skeleton className="hidden h-4 w-[16%] lg:block" />
            <Skeleton className="h-4 min-w-0 flex-1" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="size-5 shrink-0 rounded" />
          </div>
        ))}
      </div>
    </section>
  )
}
