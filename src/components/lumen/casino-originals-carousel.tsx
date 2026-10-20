'use client';

import { motion } from 'framer-motion';
import { Favorite } from './casino';
import { Carousel, CarouselContent, CarouselItem } from './carousel';
import { cn } from '@/lib/utils';

const TILE_SPRING = { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.85 };

const ORIGINALS_VENDOR_LOGO = '/vendot_logos/orginals.svg';

function OriginalSparkle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <path d="M6 0l1.2 4.2L12 6l-4.8 1.8L6 12 4.8 7.8 0 6l4.8-1.8L6 0z" />
    </svg>
  );
}

/** Figma 509:406894 — vendor mark + “Original” meta tag on each tile. */
export function CasinoOriginalsGameTag({ className }: { className?: string }) {
  return (
    <div className={cn('absolute left-1.5 top-1.5 z-10 flex items-center gap-1', className)}>
      <div className="flex size-4 items-center justify-center overflow-hidden rounded-[3px] bg-[#0A0A0A]">
        <img src={ORIGINALS_VENDOR_LOGO} alt="" aria-hidden className="size-3 object-contain opacity-100" />
      </div>
      <span className="inline-flex items-center gap-0.5 rounded-full border border-white/25 bg-white/10 px-1.5 py-[3px] text-[9px] font-semibold leading-none text-white backdrop-blur-sm">
        <OriginalSparkle className="size-3 text-white/70" />
        Original
      </span>
    </div>
  );
}

export type CasinoOriginalsGame = {
  id: string;
  title: string;
  imageSrc?: string;
};

/** Default Originals roster — Figma BOL 300×414 under `public/games/originals`. */
export const CASINO_ORIGINALS_GAMES: CasinoOriginalsGame[] = [
  { id: 'blackjack', title: 'Blackjack', imageSrc: '/games/originals/blackjack.png' },
  { id: 'plinko', title: 'Plinko', imageSrc: '/games/originals/plinko.png' },
  { id: 'dice', title: 'Dice', imageSrc: '/games/originals/dice.png' },
  { id: 'diamonds', title: 'Diamonds', imageSrc: '/games/originals/diamonds.png' },
  { id: 'mines', title: 'Mines', imageSrc: '/games/originals/mines.png' },
  { id: 'keno', title: 'Keno', imageSrc: '/games/originals/keno.png' },
  { id: 'limbo', title: 'Limbo', imageSrc: '/games/originals/limbo.png' },
  { id: 'wheel', title: 'Wheel', imageSrc: '/games/originals/wheel.png' },
  { id: 'hilo', title: 'Hilo', imageSrc: '/games/originals/hilo.png' },
  { id: 'video-poker', title: 'Video Poker', imageSrc: '/games/originals/video-poker.png' },
  { id: 'baccarat', title: 'Baccarat', imageSrc: '/games/originals/baccarat.png' },
  { id: 'crash', title: 'Crash', imageSrc: '/games/originals/crash.png' },
  { id: 'dragons-tower', title: "Dragon's Tower", imageSrc: '/games/originals/dragons-tower.png' },
  { id: 'roulette', title: 'Roulette', imageSrc: '/games/originals/roulette.png' },
  { id: 'chicken', title: 'Chicken', imageSrc: '/games/originals/chicken.png' },
  { id: 'trader', title: 'Trader', imageSrc: '/games/originals/trader.png' },
];

/** Figma game tile — 152 × 207 portrait, Originals tag, favourite control. */
export function CasinoOriginalsGameTile({
  title,
  imageSrc,
  className,
}: {
  title: string;
  imageSrc?: string;
  className?: string;
}) {
  return (
    <motion.article
      data-name="game-tile"
      whileHover={{ scale: 1.04, y: -6, zIndex: 30 }}
      whileTap={{ scale: 1.015, y: -2 }}
      transition={TILE_SPRING}
      className={cn(
        'group relative z-0 h-[207px] w-[152px] shrink-0 cursor-pointer overflow-hidden rounded-[10px] bg-surface-muted-3 text-foreground',
        'shadow-[0_0_16px_rgba(0,0,0,0.06)]',
        'motion-reduce:!transform-none',
        className,
      )}
    >
      {imageSrc ? (
        <img src={imageSrc} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-muted-5" aria-hidden />
      )}
      <CasinoOriginalsGameTag />
      <span className="absolute right-1 top-1">
        <Favorite
          favoriteLabel={`Add ${title} to favorites`}
          unfavoriteLabel={`Remove ${title} from favorites`}
        />
      </span>
      {!imageSrc ? (
        <span className="absolute inset-x-2 bottom-3 text-center text-xs font-bold uppercase tracking-wide">
          {title}
        </span>
      ) : null}
    </motion.article>
  );
}

export type CasinoOriginalsCarouselProps = {
  games?: CasinoOriginalsGame[];
  totalCount?: number;
  seeMoreHref?: string;
  className?: string;
};

/**
 * Originals game shelf — Casino Master row (509:406894).
 * Header: dice icon + “Originals (n)” + See More + outside prev/next (32px outline).
 */
export function CasinoOriginalsCarousel({
  games = CASINO_ORIGINALS_GAMES,
  totalCount = 26,
  seeMoreHref,
  className,
}: CasinoOriginalsCarouselProps) {
  const heading = `Originals (${totalCount})`;

  return (
    <section
      data-name="originals-carousel"
      className={cn('w-full pb-2 pt-6', className)}
      aria-label={heading}
    >
      <Carousel
        arrowsPosition="outside"
        icon="dice"
        seeMoreHref={seeMoreHref}
        className="[&>header]:px-6"
        labels={{
          title: heading,
          seeMoreLabel: 'See More',
          nextLabel: 'Next Originals games',
          prevLabel: 'Previous Originals games',
        }}
      >
        <CarouselContent className="ml-0 gap-3">
          {games.map((game) => (
            <CarouselItem key={game.id} className="basis-auto pl-0 first:pl-6">
              <CasinoOriginalsGameTile title={game.title} imageSrc={game.imageSrc} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
