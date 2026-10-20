'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, Loader2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import { ShellIcon } from '@/components/site/shell-icons';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { useGrowProgress } from '@/lib/lumen/use-grow-progress';
import { cn } from '@/lib/utils';

const BANNER_LAUNCH_MS = 2200;

function useLaunchAction(onAction?: () => void) {
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const launch = () => {
    if (loading) return;
    setLoading(true);
    onAction?.();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), BANNER_LAUNCH_MS);
  };

  return { loading, launch };
}

export type VipProgressBannerProps = {
  levelLabel?: string;
  progressPercent?: number;
  updatedAt?: string;
  hubLabel?: string;
  onOpenHub?: () => void;
  className?: string;
};

export function VipProgressBanner({
  levelLabel = 'Bronze to Silver',
  progressPercent = 25,
  updatedAt = 'Updated 24/25/2024, 8:00 PM ET',
  hubLabel = 'Open VIP Hub',
  onOpenHub,
  className,
}: VipProgressBannerProps) {
  const pct = Math.min(100, Math.max(0, progressPercent));
  const grown = useGrowProgress(pct);
  const { loading, launch } = useLaunchAction(onOpenHub);

  return (
    <Card
      className={cn(
        'flex h-[164px] w-[288px] shrink-0 flex-col justify-between rounded-[10px] border border-border bg-card p-4 shadow-none',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Typography as="h3" shape="small" weight="semibold">
          VIP Progress
        </Typography>
        <button
          type="button"
          onClick={launch}
          disabled={loading}
          aria-busy={loading}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-70"
        >
          {loading ? (
            <Loader2Icon className="size-3.5 animate-spin" aria-hidden />
          ) : (
            <>
              {hubLabel}
              <ShellIcon name="external" tone="token" className="size-3.5" aria-hidden />
            </>
          )}
        </button>
      </div>
      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{levelLabel}</span>
          <span className="tabular-nums">{Math.round(grown)}%</span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted-2"
          role="progressbar"
          aria-valuenow={Math.round(grown)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="VIP tier progress"
        >
          <div
            className="h-full rounded-full bg-[var(--vip-rewards-bronze-400,#e39e3d)]"
            style={{ width: `${grown}%` }}
          />
        </div>
        <Typography as="p" shape="xxs" variant="muted" className="mt-2">
          {updatedAt}
        </Typography>
      </div>
    </Card>
  );
}

export type DailyRacesBannerProps = {
  countdown?: string;
  position?: string;
  wagered?: string;
  prize?: string;
  className?: string;
};

export function DailyRacesBanner({
  countdown = '06 : 54 : 31',
  position = '3th',
  wagered = '$80.000',
  prize = '$160.000',
  className,
}: DailyRacesBannerProps) {
  const cells: [string, string][] = [
    [position, 'Position'],
    [wagered, 'Wagered'],
    [prize, 'Current Prize'],
  ];
  const { loading, launch } = useLaunchAction();

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label="Open Daily Races"
      aria-busy={loading}
      onClick={launch}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          launch();
        }
      }}
      className={cn(
        'relative flex h-[164px] w-[288px] shrink-0 cursor-pointer flex-col justify-between rounded-[10px] border border-border bg-card p-4 shadow-none',
        className,
      )}
    >
      {loading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[10px] bg-background/55 backdrop-blur-[1px]">
          <Loader2Icon className="size-8 animate-spin text-foreground" aria-hidden />
        </div>
      ) : null}
      <div className="flex items-start justify-between gap-2">
        <Typography as="h3" shape="small" weight="semibold">
          Daily Races
        </Typography>
        <Typography as="p" shape="small" className="font-mono tabular-nums">
          {countdown}
        </Typography>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {cells.map(([value, label]) => (
          <div
            key={label}
            className="flex min-h-[72px] flex-col justify-center rounded-md border border-border bg-surface-muted-1 px-2 py-2"
          >
            <Typography as="p" shape="small" weight="semibold" className="leading-tight">
              {value}
            </Typography>
            <Typography as="p" shape="xxs" variant="muted" className="mt-0.5">
              {label}
            </Typography>
          </div>
        ))}
      </div>
    </Card>
  );
}

export type PromoLobbyBannerProps = {
  tag?: string;
  title?: string;
  body?: string;
  buttonLabel?: string;
  imageSrc?: string;
  imageAlt?: string;
  onAction?: () => void;
  className?: string;
};

export function PromoLobbyBanner({
  tag = 'Tag',
  title = 'Title',
  body = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  buttonLabel = 'Play Now',
  imageSrc,
  imageAlt = '',
  onAction,
  className,
}: PromoLobbyBannerProps) {
  const { loading, launch } = useLaunchAction(onAction);

  return (
    <article
      className={cn(
        'group flex h-[164px] w-[340px] shrink-0 overflow-hidden rounded-[10px] border border-border bg-card',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
        <div className="min-w-0">
          <span className="inline-flex rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium leading-none text-background">
            {tag}
          </span>
          <Typography as="h3" shape="small" weight="bold" className="mt-2">
            {title}
          </Typography>
          <Typography as="p" shape="xxs" variant="muted" className="mt-1 line-clamp-2">
            {body}
          </Typography>
        </div>
        <Button
          size="sm"
          className="relative w-[6.5rem] justify-center group-hover:bg-primary/80"
          onClick={launch}
          disabled={loading}
          aria-busy={loading}
        >
          <span className={cn('inline-flex items-center gap-1.5', loading && 'invisible')}>
            {buttonLabel}
          </span>
          {loading ? (
            <Loader2Icon className="absolute size-4 animate-spin" aria-hidden />
          ) : null}
        </Button>
      </div>
      <div className="relative w-[132px] shrink-0 border-l border-border bg-surface-muted-2">
        {imageSrc ? (
          <img src={imageSrc} alt={imageAlt} className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 px-2 text-center text-muted-foreground">
            <span className="text-[10px] leading-tight">safe zone.</span>
          </div>
        )}
      </div>
    </article>
  );
}

export type PromoLobbyBannerItem = Omit<PromoLobbyBannerProps, 'className'> & { id?: string };

export type CasinoLobbyBannerRowProps = {
  vip?: VipProgressBannerProps | false;
  dailyRaces?: DailyRacesBannerProps | false;
  promos?: PromoLobbyBannerItem[];
  className?: string;
};

/** Figma 69-47911 — VIP + Daily Races + promo cards. Inside arrows sit on the track. */
const DEFAULT_PROMOS: PromoLobbyBannerItem[] = [{ id: 'promo-1' }, { id: 'promo-2' }];

const ARROW_CLASS =
  'absolute top-1/2 z-10 size-8 -translate-y-1/2 rounded-full max-md:!hidden';

export function CasinoLobbyBannerRow({
  vip = {},
  dailyRaces = {},
  promos = DEFAULT_PROMOS,
  className,
}: CasinoLobbyBannerRowProps) {
  const showVip = vip !== false;
  const showRaces = dailyRaces !== false;
  const items = promos ?? [];
  const [api, setApi] = useState<CarouselApi>();
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const sync = () => {
      setCanPrev(api.canScrollPrev());
      setCanNext(api.canScrollNext());
    };
    sync();
    api.on('select', sync);
    api.on('reInit', sync);
    return () => {
      api.off('select', sync);
      api.off('reInit', sync);
    };
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ align: 'start', dragFree: true }}
      className={cn('relative w-full', className)}
      data-name="banner-row"
    >
      <CarouselContent className="ml-0 gap-3">
        {showVip ? (
          <CarouselItem className="basis-auto pl-0 first:pl-6">
            <VipProgressBanner {...vip} />
          </CarouselItem>
        ) : null}
        {showRaces ? (
          <CarouselItem className="basis-auto pl-0 first:pl-6">
            <DailyRacesBanner {...dailyRaces} />
          </CarouselItem>
        ) : null}
        {items.map((item, i) => (
          <CarouselItem key={item.id ?? `promo-${i}`} className="basis-auto pl-0 first:pl-6">
            <PromoLobbyBanner {...item} />
          </CarouselItem>
        ))}
      </CarouselContent>
      {canPrev ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(ARROW_CLASS, 'left-3')}
          aria-label="Previous banners"
          onClick={() => api?.scrollPrev()}
        >
          <ChevronLeftIcon />
          <span className="sr-only">Previous banners</span>
        </Button>
      ) : null}
      {canNext ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(ARROW_CLASS, 'right-3')}
          aria-label="Next banners"
          onClick={() => api?.scrollNext()}
        >
          <ChevronRightIcon />
          <span className="sr-only">Next banners</span>
        </Button>
      ) : null}
    </Carousel>
  );
}
