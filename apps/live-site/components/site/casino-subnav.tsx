'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShellIcon } from '@/components/site/shell-icons';
import { useShellOptional } from '@/components/site/shell-context';
import { cn } from '@/lib/utils';
/** Casino-Lumen sub-menu (69:47911 → sub-menu) — left to right. */
export const CASINO_SUBNAV = [
  'Lobby',
  'Slots',
  'Bonus Buy',
  'Megaways',
  'Originals',
  'Blackjack',
  'Live',
  'Jackpots',
  'Early',
  'Staff Picks',
  'Exclusive',
  'New',
] as const;

const SUBNAV_HREF: Partial<Record<(typeof CASINO_SUBNAV)[number], string>> = {
  Lobby: '/casino',
  Slots: '/casino/slots',
  Live: '/casino/live',
};

export type CasinoSubNavOptions = {
  glass?: boolean;
  sticky?: boolean;
  motion?: boolean;
  /** Storybook / testing-ground initial state. */
  defaultActive?: (typeof CASINO_SUBNAV)[number];
  defaultFavourites?: boolean;
};

const iconBtnClass =
  'shell-chrome-btn inline-flex size-11 shrink-0 items-center justify-center rounded-full border-0 bg-transparent shadow-none outline-none';

function activeFromPath(pathname: string | null): (typeof CASINO_SUBNAV)[number] {
  if (pathname?.startsWith('/casino/live')) return 'Live';
  if (pathname?.startsWith('/casino/slots')) return 'Slots';
  return 'Lobby';
}

/**
 * Figma sub-menu: glass bar under the header; search + favourites in one track chip;
 * category labels in a single horizontal pill track (active = primary fill that glides).
 *
 * Mobile: full-width muted grey bar; labels scroll off the right edge (no chip).
 * Desktop: contained rounded chip for the pill track.
 */
export function CasinoSubNav({
  glass = true,
  sticky = true,
  motion = true,
  defaultActive,
  defaultFavourites = false,
}: CasinoSubNavOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const shell = useShellOptional();
  const casinoSearchOpen = shell?.casinoSearchOpen ?? false;
  const setCasinoSearchOpen = shell?.setCasinoSearchOpen;
  const [active, setActive] = useState<(typeof CASINO_SUBNAV)[number]>(
    defaultActive ?? activeFromPath(pathname),
  );
  const [fav, setFav] = useState(defaultFavourites);
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false });

  // Keep pill in sync with the route — but don't clobber an in-flight click target.
  useEffect(() => {
    const next = defaultActive ?? activeFromPath(pathname);
    setActive((prev) => (prev === next ? prev : next));
  }, [pathname, defaultActive]);

  const measureThumb = useCallback(() => {
    const track = trackRef.current;
    const btn = track?.querySelector<HTMLElement>('[data-sub-menu-pill][data-active="true"]');
    if (!track || !btn) return;
    const x = btn.offsetLeft;
    const w = btn.offsetWidth;
    setThumb((prev) =>
      prev.ready && prev.x === x && prev.w === w ? prev : { x, w, ready: true },
    );
  }, []);

  useLayoutEffect(() => {
    measureThumb();
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(measureThumb);
    ro.observe(track);
    track.addEventListener('scroll', measureThumb, { passive: true });
    return () => {
      ro.disconnect();
      track.removeEventListener('scroll', measureThumb);
    };
  }, [active, measureThumb]);

  useEffect(() => {
    document.documentElement.dataset.brand = 'betonline';
  }, []);

  return (
    <div
      data-name="sub-menu"
      data-glass={glass ? 'true' : 'false'}
      className={cn(
        'z-40 shrink-0 border-b border-border',
        sticky && 'sticky top-0',
        !glass && 'bg-background',
      )}
    >
      <div className="flex h-16 items-center md:h-[76px] md:gap-2 md:px-6 md:py-4">
        {/* Search + favourites live in the mobile dock — hide here below md. */}
        <div
          data-name="sub-menu-icon-chip"
          className="hidden h-12 shrink-0 items-center gap-1 rounded-full p-0.5 md:flex"
          aria-label="Sub-menu actions"
        >
          <button
            type="button"
            aria-label="Search"
            aria-haspopup="dialog"
            aria-expanded={casinoSearchOpen}
            data-tip="Search"
            data-tip-side="bottom"
            data-sub-menu-search=""
            className={cn(
              iconBtnClass,
              casinoSearchOpen ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              motion && 'transition-[transform,background-color,color] duration-200 active:scale-95',
            )}
            onClick={() => setCasinoSearchOpen?.(true)}
          >
            <ShellIcon name="search" tone="token" className="size-5" />
          </button>
          <button
            type="button"
            aria-label={fav ? 'Remove from favourites' : 'Favourites'}
            aria-pressed={fav}
            data-tip={fav ? 'Remove from favourites' : 'Favourites'}
            data-tip-side="bottom"
            data-sub-menu-fav=""
            className={cn(
              iconBtnClass,
              fav ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              motion && 'transition-[transform,background-color,color] duration-200 active:scale-95',
            )}
            onClick={() => setFav((v) => !v)}
          >
            <ShellIcon name="heart" tone="token" className="size-5" />
          </button>
        </div>

        <div
          data-name="sub-menu-scroll"
          className="scrollbar-hide min-w-0 flex-1 overflow-x-auto md:contents"
        >
        <div
          ref={trackRef}
          data-name="sub-menu-pill-track"
          className={cn(
            'relative flex h-12 w-max items-center gap-1 rounded-full bg-[var(--surface-muted-5)] p-0.5',
            /* Figma slot inset is 24px; the pill scrolls off with the labels */
            'mx-6',
            'md:mx-0 md:w-fit md:max-w-full md:flex-none md:overflow-x-auto',
          )}
          role="tablist"
          aria-label="Casino categories"
        >
          <span
            aria-hidden
            data-sub-menu-thumb=""
            className={cn(
              'pointer-events-none absolute left-0 top-0.5 h-11 rounded-full bg-primary will-change-transform',
              motion && thumb.ready
                ? 'transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]'
                : '',
            )}
            style={{
              width: thumb.w,
              opacity: thumb.ready ? 1 : 0,
              transform: `translate3d(${thumb.x}px,0,0)`,
            }}
          />
          {CASINO_SUBNAV.map((item) => {
            const on = item === active;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={on}
                data-sub-menu-pill=""
                data-active={on ? 'true' : 'false'}
                onClick={() => {
                  setActive(item);
                  const href = SUBNAV_HREF[item];
                  if (href && href !== pathname) router.push(href);
                }}
                className={cn(
                  'shell-chrome-btn relative z-10 h-11 shrink-0 rounded-full bg-transparent px-4 text-sm font-normal leading-5',
                  motion && 'transition-colors duration-300',
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}
