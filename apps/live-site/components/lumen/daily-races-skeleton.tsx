import { cn } from '@/lib/utils'

function Block({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-[10px] bg-surface-muted-2', className)} />
}

export function DailyRacesSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-name="daily_races_skeleton"
      className={cn('w-full bg-background px-6 pb-14 pt-6', className)}
    >
      <Block className="mb-4 h-8 w-28" />
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <Block className="h-36 w-full" />
        <Block className="h-[420px] w-full" />
      </div>
    </div>
  )
}
