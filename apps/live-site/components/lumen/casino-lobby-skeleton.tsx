import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** Lumen skeleton — official fill + Storybook `lm-shimmer` sweep. */
export function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn('lm-shimmer rounded-[10px] bg-[var(--skeleton)]', className)}
      {...props}
    />
  );
}

/** Flat blocks for the VIP + Races + promo banner row (164px). */
export function CasinoBannerSkeleton({ className }: { className?: string }) {
  return (
    <div
      data-name="banner_row_skeleton"
      aria-hidden
      className={cn('flex gap-3 overflow-hidden pl-6', className)}
    >
      <Skeleton className="h-[164px] w-[288px] shrink-0" />
      <Skeleton className="h-[164px] w-[288px] shrink-0" />
      {Array.from({ length: 2 }, (_, i) => (
        <Skeleton key={i} className="h-[164px] w-[340px] shrink-0" />
      ))}
    </div>
  );
}

/** Flat blocks for the Originals game shelf row (152 × 207 tiles). */
export function CasinoOriginalsShelfSkeleton({ className }: { className?: string }) {
  return (
    <div data-name="originals_shelf_skeleton" aria-hidden className={cn('pt-6', className)}>
      <div className="mb-3 flex items-center gap-2 px-6">
        <Skeleton className="size-5 shrink-0 rounded-md" />
        <Skeleton className="h-7 w-36" />
      </div>
      <div className="flex gap-3 overflow-hidden pl-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-[207px] w-[152px] shrink-0" />
        ))}
      </div>
    </div>
  );
}

export type CasinoLobbySkeletonProps = {
  className?: string;
  /** When true, include the Originals shelf placeholders below the banner row. */
  withOriginalsShelf?: boolean;
};

/** Casino-Lumen loading layout: banners plus two game shelves. */
export function CasinoLobbySkeleton({ className, withOriginalsShelf = true }: CasinoLobbySkeletonProps) {
  return (
    <div
      data-name="lobby_content"
      data-skeleton="true"
      aria-busy
      aria-label="Loading"
      className={cn('w-full bg-background py-4', className)}
    >
      <CasinoBannerSkeleton />
      {withOriginalsShelf ? <CasinoOriginalsShelfSkeleton /> : null}
      <CasinoOriginalsShelfSkeleton />
    </div>
  );
}
