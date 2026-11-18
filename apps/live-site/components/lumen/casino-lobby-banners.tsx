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
import { useShell } from '@/components/site/shell-context';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { useGrowProgress } from '@/lib/lumen/use-grow-progress';
import { useVipLevelUpCeremony } from '@/lib/lumen/use-vip-level-up-ceremony';
import {
  VipProgressBarFill,
  VipProgressCrown,
} from '@/components/lumen/vip-progress-crown';
import {
  DAILY_RACE_STATUS,
  formatRaceCountdown,
} from '@/lib/lumen/daily-races';
import { cn } from '@/lib/utils';

const BANNER_LAUNCH_MS = 2200;

/**
 * Theme-safe hover — white/25 on light mode washes the card into the page.
 * Foreground tint works on solid cards and dark promo art.
 */
const BANNER_HOVER =
  'transition-[background-color,border-color,box-shadow] duration-150 hover:border-foreground/15 hover:bg-foreground/[0.04] hover:shadow-[0_0_16px_rgba(0,0,0,0.06)]';

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
  levelLabel: levelLabelProp,
  progressPercent,
  updatedAt,
  hubLabel = 'Open VIP Hub',
  onOpenHub,
  className,
}: VipProgressBannerProps) {
  const { setVipHubOpen } = useShell();
  const {
    displayPercent,
    levelLabel: ceremonyLabel,
    barTone,
    crownTone,
    updatedLabel,
  } = useVipLevelUpCeremony();
  const pct = Math.min(
    100,
    Math.max(0, progressPercent ?? displayPercent),
  );
  const grown = useGrowProgress(pct);
  const stamp = updatedAt ?? updatedLabel;
  const levelLabel = levelLabelProp ?? ceremonyLabel;
  const openHub = () => {
    if (onOpenHub) onOpenHub();
    else setVipHubOpen(true);
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={hubLabel}
      onClick={openHub}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openHub();
        }
      }}
      className={cn(
        'relative flex h-[164px] w-[288px] shrink-0 cursor-pointer flex-col justify-between rounded-[10px] border border-border bg-card p-4 shadow-none',
        BANNER_HOVER,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Typography as="h3" shape="small" weight="semibold">
          VIP Progress
        </Typography>
        <span className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-1.5 text-xs font-medium text-foreground">
          {hubLabel}
          <ShellIcon name="external" tone="token" className="size-3.5" aria-hidden />
        </span>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <VipProgressCrown tone={crownTone} size={28} className="size-7" />
          <div className="flex min-w-0 flex-1 items-center justify-between text-xs text-muted-foreground">
            <span className="truncate text-foreground">{levelLabel}</span>
            <span className="tabular-nums">{Math.round(grown)}%</span>
          </div>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted-2"
          role="progressbar"
          aria-valuenow={Math.round(grown)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="VIP tier progress"
        >
          <VipProgressBarFill percent={grown} tone={barTone} />
        </div>
        <Typography as="p" shape="xxs" variant="muted" className="mt-2">
          {stamp}
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
  countdown,
  position = DAILY_RACE_STATUS.position,
  wagered = DAILY_RACE_STATUS.wagered,
  prize = DAILY_RACE_STATUS.prize,
  className,
}: DailyRacesBannerProps) {
  const { setVipHubOpen } = useShell();
  const [remaining, setRemaining] = useState(DAILY_RACE_STATUS.endsInSeconds);
  const cells: [string, string][] = [
    [position, 'Position'],
    [wagered, 'Wagered'],
    [prize, 'Current Prize'],
  ];
  const { loading, launch } = useLaunchAction(() => setVipHubOpen(true, '$25k Daily Race'));
  const clock = countdown ?? formatRaceCountdown(remaining);

  useEffect(() => {
    if (countdown != null) return;
    const id = window.setInterval(() => {
      setRemaining((s) => (s <= 0 ? DAILY_RACE_STATUS.endsInSeconds : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [countdown]);

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label="Open $25k Daily Race in VIP Hub"
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
        BANNER_HOVER,
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
          $25k Daily Race
        </Typography>
        <Typography as="p" shape="small" className="font-mono tabular-nums">
          {clock}
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
  /** `bleed` = full-card background (left clear for copy). `panel` = Figma right 160px art slot. */
  imageMode?: 'panel' | 'bleed';
  /** Bleed art only — `dark` = black pill. Default = white pill (matches Halloween / lobby). */
  tagTone?: 'light' | 'dark';
  /** Extra classes on bleed art (e.g. push subject further right so copy stays clear). */
  imageClassName?: string;
  /** Left scrim strength over bleed art. `strong` when subject sits under the copy column. */
  bleedScrim?: 'default' | 'strong';
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
  imageMode = 'panel',
  tagTone = 'light',
  imageClassName,
  bleedScrim = 'default',
  onAction,
  className,
}: PromoLobbyBannerProps) {
  const { loading, launch } = useLaunchAction(onAction);
  const bleed = imageMode === 'bleed';
  const darkTag = bleed && tagTone === 'dark';

  /* Figma Banner 340×164 — Play Now hugs content (h-8). */
  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`${title} — ${buttonLabel}`}
      aria-busy={loading}
      onClick={launch}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          launch()
        }
      }}
      className={cn(
        'group relative flex h-[164px] w-[340px] shrink-0 cursor-pointer overflow-hidden rounded-[10px] border border-border bg-card shadow-none',
        BANNER_HOVER,
        className,
      )}
    >
      {bleed && imageSrc ? (
        <>
          <img
            src={imageSrc}
            alt=""
            className={cn(
              'pointer-events-none absolute inset-0 size-full object-cover object-right',
              imageClassName,
            )}
          />
          <div
            className={cn(
              'pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent',
              bleedScrim === 'strong' && 'from-black from-35% via-black/80 via-55% to-transparent',
              bleedScrim === 'default' && darkTag && 'from-black/55 via-black/25',
              bleedScrim === 'default' && !darkTag && 'from-black/75 via-black/45',
            )}
          />
        </>
      ) : null}

      {loading ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[10px] bg-background/55 backdrop-blur-[1px]">
          <Loader2Icon className="size-8 animate-spin text-foreground" aria-hidden />
        </div>
      ) : null}

      {/*
        Figma banner type (Figtree):
        tag 10/14 medium · title Lead 20/20 bold · body XXS 10/14 regular (12 was too large) ·
        CTA SM 14 medium h-32 — copy top, CTA bottom
      */}
      <div className="relative z-10 flex h-full w-[180px] shrink-0 flex-col justify-between p-4 font-[family-name:var(--font-figtree),ui-sans-serif,sans-serif]">
        <div className="flex w-[164px] shrink-0 flex-col gap-1">
          <span
            className={cn(
              'inline-flex w-fit rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-[14px]',
              !bleed && 'bg-foreground text-background',
              bleed && !darkTag && 'bg-white text-black',
              darkTag && 'rounded-md bg-black text-white uppercase tracking-wide',
            )}
          >
            {tag}
          </span>
          <h3
            className={cn(
              'line-clamp-2 text-[20px] font-extrabold leading-5',
              bleed ? 'text-white' : 'text-foreground',
            )}
          >
            {title}
          </h3>
          <p
            className={cn(
              /* 3 lines so welcome free-spins copy can finish with “at BetOnline!” */
              'line-clamp-3 text-[10px] font-normal leading-3',
              bleed ? 'text-white/75' : 'text-muted-foreground',
            )}
          >
            {body}
          </p>
        </div>
        <Button
          type="button"
          size="default"
          tabIndex={-1}
          className="h-8 w-fit shrink-0 self-start px-3 text-sm font-medium group-hover:bg-[color-mix(in_srgb,var(--primary)_80%,transparent)]"
          onClick={(e) => {
            e.stopPropagation()
            launch()
          }}
          disabled={loading}
          aria-busy={loading}
        >
          {buttonLabel}
        </Button>
      </div>

      {!bleed ? (
        <div
          aria-hidden={!imageAlt}
          className="pointer-events-none absolute inset-y-0 right-0 w-[160px] overflow-hidden rounded-br-[10px] rounded-tr-[10px] bg-surface-muted-2"
        >
          {imageSrc ? (
            <img src={imageSrc} alt={imageAlt} className="size-full object-contain object-center p-2" />
          ) : (
            <div className="flex size-full flex-col items-center justify-center gap-1 px-2 text-center text-muted-foreground">
              <span className="text-[10px] leading-tight">safe zone</span>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}

export type PromoLobbyBannerItem = Omit<PromoLobbyBannerProps, 'className'> & { id?: string };

export type CasinoLobbyBannerRowProps = {
  vip?: VipProgressBannerProps | false;
  dailyRaces?: DailyRacesBannerProps | false;
  promos?: PromoLobbyBannerItem[];
  className?: string;
  /**
   * Flush-left variant for padded containers (e.g. account desk) — removes the
   * `first:pl-6` lobby gutter so the first banner aligns with neighboring cards.
   */
  flush?: boolean;
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
  flush = false,
}: CasinoLobbyBannerRowProps) {
  const { loggedIn } = useShell();
  /* VIP Progress + Daily Race are player widgets — never on logged-out lobby. */
  const showVip = loggedIn && vip !== false;
  const showRaces = loggedIn && dailyRaces !== false;
  const items = promos ?? [];
  const firstGutter = flush ? 'first:pl-0' : 'first:pl-6';
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
          <CarouselItem className={cn('basis-auto pl-0', firstGutter)}>
            <VipProgressBanner {...vip} />
          </CarouselItem>
        ) : null}
        {showRaces ? (
          <CarouselItem className={cn('basis-auto pl-0', firstGutter)}>
            <DailyRacesBanner {...(dailyRaces === false ? {} : dailyRaces)} />
          </CarouselItem>
        ) : null}
        {items.map((item, i) => (
          <CarouselItem key={item.id ?? `promo-${i}`} className={cn('basis-auto pl-0', firstGutter)}>
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
