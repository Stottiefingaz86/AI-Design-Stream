import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/lumen/casino-lobby-skeleton';

/** Poker_Landing-Page loading layout — flat blocks matching 78:163252. Chrome stays real. */
export function PokerLandingSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-name="poker_landing_skeleton"
      data-skeleton="true"
      aria-busy
      aria-label="Loading poker page"
      className={cn('w-full space-y-0 bg-background', className)}
    >
      <div className="px-8 py-8">
        <Skeleton className="h-[470px] w-full rounded-3xl" />
      </div>
      <div className="px-8 py-14">
        <Skeleton className="mx-auto mb-11 h-10 w-72" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-[10px]" />
          ))}
        </div>
      </div>
      <div className="bg-surface-muted-1 px-8 py-14">
        <div className="mx-auto flex max-w-[740px] flex-col gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-[10px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
