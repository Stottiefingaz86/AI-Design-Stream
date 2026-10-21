import { IconInfoCircle } from '@tabler/icons-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * My Account home skeleton — Figma 2103:21466 (desktop) / 2103:22741 (mobile).
 * Title stays real; module-home card shimmers.
 */
export function MyAccountSkeleton({ className }: { className?: string }) {
  return (
    <section
      data-name="section-my-account-skeleton"
      data-skeleton="true"
      aria-busy
      aria-label="Loading My Account"
      className={cn(
        'flex w-full flex-col gap-4 bg-background px-4 pb-6 pt-4 lg:px-6 lg:pb-10 lg:pt-6',
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <h1 className="text-xl font-semibold leading-7 text-foreground lg:text-2xl lg:leading-8">
          My Account
        </h1>
        <span className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground">
          <IconInfoCircle className="size-4" stroke={1.75} aria-hidden />
        </span>
      </div>

      <div className="rounded-[10px] border border-border bg-card p-4 shadow-[0_0_16px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-8 shrink-0 rounded-md" />
            <Skeleton className="h-11 flex-1 rounded-md" />
            <div className="hidden gap-4 lg:flex">
              <Skeleton className="h-10 w-[150px] rounded-lg" />
              <Skeleton className="h-10 w-[150px] rounded-lg" />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary px-6 py-5 lg:flex-row lg:gap-14">
            <StatSkeleton />
            <div aria-hidden className="hidden w-px self-stretch bg-border lg:block" />
            <div aria-hidden className="h-px w-full bg-border lg:hidden" />
            <StatSkeleton />
            <div aria-hidden className="hidden w-px self-stretch bg-border lg:block" />
            <div aria-hidden className="h-px w-full bg-border lg:hidden" />
            <StatSkeleton />
          </div>

          <div className="flex flex-col gap-3 lg:hidden">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  )
}

function StatSkeleton() {
  return (
    <div className="flex w-full flex-col gap-0.5 lg:w-[120px] lg:shrink-0">
      <Skeleton className="h-5 w-[100px] rounded-md" />
      <Skeleton className="h-6 w-[120px] rounded-md" />
    </div>
  )
}
