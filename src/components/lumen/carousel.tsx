import { Children, isValidElement, type ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import {
  Carousel as EmblaCarousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { ShellIcon } from '../../../apps/live-site/components/site/shell-icons';
import { cn } from '@/lib/utils';

/** Casino Master Originals row heading mark (vendor dice). */
function OriginalsRowIcon({ className }: { className?: string }) {
  return (
    <img
      src="/vendot_logos/orginals.svg"
      alt=""
      aria-hidden
      className={cn('size-5 shrink-0 object-contain', className)}
    />
  );
}

export { CarouselContent, CarouselItem };

export type CarouselLabels = {
  title: string;
  seeMoreLabel?: string;
  nextLabel?: string;
  prevLabel?: string;
};

export type CarouselIcon = 'star' | 'dice';

function OutsideArrows({ prevLabel, nextLabel }: { prevLabel: string; nextLabel: string }) {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } = useCarousel();
  const arrowClass =
    'size-9 shrink-0 rounded-md border border-border bg-secondary p-0 text-foreground hover:bg-muted disabled:opacity-45';

  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        aria-label={prevLabel}
        className={arrowClass}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        aria-label={nextLabel}
        className={arrowClass}
        disabled={!canScrollNext}
        onClick={scrollNext}
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  );
}

export function Carousel({
  arrowsPosition = 'outside',
  icon,
  labels,
  title,
  seeMoreHref,
  className,
  children,
}: {
  arrowsPosition?: 'outside' | 'inside';
  icon?: CarouselIcon;
  labels?: CarouselLabels;
  title?: string;
  seeMoreHref?: string;
  className?: string;
  children: ReactNode;
}) {
  const heading = labels?.title ?? title ?? 'Carousel';
  const nextLabel = labels?.nextLabel ?? 'Next slide';
  const prevLabel = labels?.prevLabel ?? 'Previous slide';
  const seeMoreLabel = labels?.seeMoreLabel ?? 'See More';
  const iconNode =
    icon === 'dice' ? (
      <OriginalsRowIcon />
    ) : icon === 'star' ? (
      <ShellIcon name="star" tone="token" className="size-5" aria-hidden />
    ) : null;

  const content = isCarouselContent(children) ? (
    children
  ) : (
    <CarouselContent className="-ml-3">
      {Children.map(children, (child, i) => (
        <CarouselItem key={i} className="basis-auto pl-3">
          {child}
        </CarouselItem>
      ))}
    </CarouselContent>
  );

  return (
    <EmblaCarousel opts={{ align: 'start', dragFree: true }} className={cn('w-full', className)}>
      <header className="mb-3 flex h-9 items-center justify-between gap-4">
        <Typography as="h3" shape="h4" weight="semibold" className="flex min-w-0 items-center gap-2">
          {iconNode}
          <span className="truncate">{heading}</span>
        </Typography>
        <div className="flex shrink-0 items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 border border-border bg-secondary px-3 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            asChild={Boolean(seeMoreHref)}
          >
            {seeMoreHref ? <a href={seeMoreHref}>{seeMoreLabel}</a> : seeMoreLabel}
          </Button>
          {arrowsPosition === 'outside' ? <OutsideArrows prevLabel={prevLabel} nextLabel={nextLabel} /> : null}
        </div>
      </header>
      {content}
      {arrowsPosition === 'inside' ? (
        <>
          <CarouselPrevious aria-label={prevLabel} />
          <CarouselNext aria-label={nextLabel} />
        </>
      ) : null}
    </EmblaCarousel>
  );
}

function isCarouselContent(children: ReactNode) {
  return isValidElement(children) && children.type === CarouselContent;
}

const SLIDE_TITLES = ['Blackjack', 'Roulette', 'Baccarat', 'Crash', 'Dice', 'Plinko', 'Hilo', 'Keno', 'Mines', 'Wheel'];

/** Storybook slide used by the official Lumen carousel story. */
export function Ze({ index }: { index: number }) {
  return (
    <CarouselItem className="basis-36 pl-3">
      <article className="relative aspect-[152/207] w-36 overflow-hidden rounded-md bg-surface-muted-3 text-foreground">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-muted-5" />
        <span className="absolute inset-x-2 bottom-3 text-center text-xs font-bold uppercase tracking-wide">
          {SLIDE_TITLES[index % SLIDE_TITLES.length]}
        </span>
      </article>
    </CarouselItem>
  );
}
