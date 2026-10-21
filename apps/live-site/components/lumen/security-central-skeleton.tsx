import { IconInfoCircle } from '@tabler/icons-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/** Security Central home skeleton — Figma 8214:68763. */
export function SecurityCentralSkeleton({ className }: { className?: string }) {
  return (
    <section
      data-name="section-security-central-skeleton"
      data-skeleton="true"
      aria-busy
      aria-label="Loading Security Central"
      className={cn('w-full bg-background px-4 pb-14 pt-4 lg:px-6 lg:pt-6', className)}
    >
      <div className="mb-4 flex items-center gap-1.5">
        <h1 className="text-xl font-semibold leading-7 text-foreground lg:text-2xl lg:leading-8">
          Security Central
        </h1>
        <span className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground">
          <IconInfoCircle className="size-4" stroke={1.75} aria-hidden />
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-[10px] border border-border bg-card p-4 shadow-[0_0_16px_rgba(0,0,0,0.06)]"
          >
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <Skeleton className="h-[46px] min-w-0 flex-1 rounded-lg" />
          </div>
        ))}
      </div>
    </section>
  )
}
