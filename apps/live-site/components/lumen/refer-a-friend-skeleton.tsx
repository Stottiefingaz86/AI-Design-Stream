import { cn } from '@/lib/utils'

function Block({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[10px] bg-surface-muted-2', className)} />
}

export function ReferAFriendSkeleton({ className }: { className?: string }) {
  return (
    <div data-name="raf_skeleton" className={cn('w-full bg-background px-6 pb-14 pt-6', className)}>
      <Block className="mb-4 h-8 w-48" />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Block className="h-28 w-full" />
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Block key={i} className="h-28" />
            ))}
          </div>
          <Block className="h-80 w-full" />
        </div>
        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[320px]">
          <Block className="h-32" />
          <Block className="h-56" />
        </div>
      </div>
    </div>
  )
}
