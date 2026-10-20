'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { ShellIcon } from '@/components/site/shell-icons'
import { useShellOptional } from '@/components/site/shell-context'
import { cn } from '@/lib/utils'

/** Casino-Lumen sub-menu (69:47911 → sub-menu) — left to right. */
export const CASINO_SUBNAV = [
  'Lobby',
  'Slots',
  'Live',
  'Bonus Buy',
  'Originals',
  'Blackjack',
  'Jackpots',
  'Scratch Cards',
  'Staff Picks',
  'Exclusive',
  'New',
] as const

const SUBNAV_HREF: Partial<Record<(typeof CASINO_SUBNAV)[number], string>> = {
  Lobby: '/casino',
  Slots: '/casino/slots',
  Live: '/casino/live',
  'Bonus Buy': '/casino/category/bonus-buy',
  Originals: '/casino/category/originals',
  Blackjack: '/casino/category/blackjack',
  Jackpots: '/casino/category/jackpots',
  'Scratch Cards': '/casino/category/scratch-cards',
  'Staff Picks': '/casino/category/staff-picks',
  Exclusive: '/casino/category/exclusive',
  New: '/casino/category/new',
}

type SubNavItem = (typeof CASINO_SUBNAV)[number]

export type CasinoSubNavOptions = {
  glass?: boolean
  /** Stick to the top of `#shell-scroll` so it stays flush under the header. */
  sticky?: boolean
  motion?: boolean
  defaultActive?: SubNavItem | null
  defaultFavourites?: boolean
}

const iconBtnClass =
  'shell-chrome-btn inline-flex size-11 shrink-0 items-center justify-center rounded-full border-0 bg-transparent shadow-none outline-none'

/** Only highlight a chip when the URL maps to it — never default to Lobby. */
function activeFromPath(pathname: string | null): SubNavItem | null {
  if (!pathname) return null
  if (pathname === '/casino' || pathname === '/casino/') return 'Lobby'
  if (pathname.startsWith('/casino/live')) return 'Live'
  if (pathname.startsWith('/casino/slots')) return 'Slots'
  if (pathname.startsWith('/casino/category/bonus-buy')) return 'Bonus Buy'
  if (pathname.startsWith('/casino/category/originals')) return 'Originals'
  /* Exact RNG Blackjack only — not /casino/category/live-blackjack. */
  if (
    pathname === '/casino/category/blackjack' ||
    pathname.startsWith('/casino/category/blackjack/')
  ) {
    return 'Blackjack'
  }
  if (pathname.startsWith('/casino/category/jackpots')) return 'Jackpots'
  if (pathname.startsWith('/casino/category/scratch-cards')) return 'Scratch Cards'
  if (pathname.startsWith('/casino/category/staff-picks')) return 'Staff Picks'
  if (pathname.startsWith('/casino/category/exclusive')) return 'Exclusive'
  if (pathname.startsWith('/casino/category/new')) return 'New'
  return null
}

function favouritesActive(pathname: string | null) {
  return Boolean(pathname?.startsWith('/casino/category/favourites'))
}

/**
 * Figma sub-menu under the shell header. Usually wrapped in sticky chrome
 * with the header (`sticky={false}`); page content frosts under the glass
 * only after product chips have scrolled away. Sliding thumb for the glide.
 * Mobile: whole gray capsule swipes with the labels. Desktop: clipped chip + chevrons.
 */
export function CasinoSubNav({
  glass = true,
  sticky = false,
  motion = true,
  defaultActive,
  defaultFavourites = false,
}: CasinoSubNavOptions) {
  const router = useRouter()
  const pathname = usePathname()
  const shell = useShellOptional()
  const casinoSearchOpen = shell?.casinoSearchOpen ?? false
  const setCasinoSearchOpen = shell?.setCasinoSearchOpen
  const [active, setActive] = useState<SubNavItem | null>(
    defaultActive !== undefined ? defaultActive : activeFromPath(pathname),
  )
  const fav = defaultFavourites || favouritesActive(pathname)
  const trackRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false })
  const [canScrollMore, setCanScrollMore] = useState(false)
  const [canScrollBack, setCanScrollBack] = useState(false)

  useEffect(() => {
    const next = defaultActive !== undefined ? defaultActive : activeFromPath(pathname)
    setActive((prev) => (prev === next ? prev : next))
  }, [pathname, defaultActive])

  const measureOverflow = useCallback(() => {
    const el = scrollRef.current
    if (!el) {
      setCanScrollMore(false)
      setCanScrollBack(false)
      return
    }
    setCanScrollBack(el.scrollLeft > 8)
    setCanScrollMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  const measureThumb = useCallback(() => {
    const track = trackRef.current
    const btn = track?.querySelector<HTMLElement>('[data-sub-menu-pill][data-active="true"]')
    if (!track || !btn) {
      setThumb((prev) => (prev.ready ? { x: 0, w: 0, ready: false } : prev))
      return
    }
    setThumb({ x: btn.offsetLeft, w: btn.offsetWidth, ready: true })
  }, [])

  useLayoutEffect(() => {
    measureThumb()
    measureOverflow()
    const track = trackRef.current
    const wrap = scrollRef.current
    if (!track) return
    const ro = new ResizeObserver(() => {
      measureThumb()
      measureOverflow()
    })
    ro.observe(track)
    if (wrap) ro.observe(wrap)
    window.addEventListener('resize', measureOverflow)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measureOverflow)
    }
  }, [active, measureThumb, measureOverflow])

  /* Keep the active label in view so the thumb never sits over empty space. */
  useLayoutEffect(() => {
    const track = trackRef.current
    const btn = track?.querySelector<HTMLElement>('[data-sub-menu-pill][data-active="true"]')
    const scroller = scrollRef.current
    if (!track || !btn || !scroller) return
    const btnLeft = btn.offsetLeft
    const btnRight = btnLeft + btn.offsetWidth
    const viewLeft = scroller.scrollLeft
    const viewRight = viewLeft + scroller.clientWidth
    if (btnLeft < viewLeft + 8) {
      scroller.scrollTo({ left: Math.max(0, btnLeft - 16), behavior: 'smooth' })
    } else if (btnRight > viewRight - 8) {
      scroller.scrollTo({ left: btnRight - scroller.clientWidth + 16, behavior: 'smooth' })
    }
  }, [active])

  useEffect(() => {
    document.documentElement.dataset.brand = 'betonline'
  }, [])

  return (
    <div
      data-name="sub-menu"
      data-glass={glass ? 'true' : 'false'}
      data-sticky={sticky ? 'true' : 'false'}
      className={cn(
        'w-full shrink-0 border-b border-border',
        sticky && 'sticky top-0',
      )}
    >
      {/* Match page column — center on large screens like max-w-[1440] content */}
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center md:h-[76px] md:gap-2 md:px-6 md:py-4">
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
            aria-label="Favourites"
            aria-pressed={fav}
            data-tip="Favourites"
            data-tip-side="bottom"
            data-sub-menu-fav=""
            className={cn(
              iconBtnClass,
              fav ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              motion && 'transition-[transform,background-color,color] duration-200 active:scale-95',
            )}
            onClick={() => router.push('/casino/category/favourites')}
          >
            <ShellIcon name="heart" tone="token" className="size-5" />
          </button>
        </div>

        {/*
          Mobile: gray w-max capsule scrolls as one unit with the labels.
          Desktop: clip shell caps the track so glass chevrons sit on a fixed chip.
        */}
        <div className="min-w-0 flex-1 md:relative">
          <div className="w-full md:relative md:w-max md:max-w-full md:overflow-hidden md:rounded-full">
            <div
              ref={scrollRef}
              data-name="sub-menu-scroll"
              className="scrollbar-hide w-full min-w-0 overflow-x-auto overflow-y-hidden"
              onScroll={measureOverflow}
            >
              <div
                ref={trackRef}
                data-name="sub-menu-pill-track"
                className={cn(
                  'relative flex h-12 w-max items-center gap-1 rounded-full bg-[var(--surface-muted-5)] p-0.5',
                  'mx-6 md:mx-0',
                )}
                role="tablist"
                aria-label="Casino categories"
              >
                <span
                  aria-hidden
                  data-sub-menu-thumb=""
                  className={cn(
                    'pointer-events-none absolute top-0.5 z-0 h-11 rounded-full bg-[#ee3536]',
                    motion &&
                      'transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  )}
                  style={{ left: thumb.x, width: thumb.w, opacity: thumb.ready ? 1 : 0 }}
                />
                {CASINO_SUBNAV.map((item) => {
                  const on = item === active
                  return (
                    <button
                      key={item}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      data-sub-menu-pill=""
                      data-active={on ? 'true' : 'false'}
                      onClick={() => {
                        setActive(item)
                        const href = SUBNAV_HREF[item]
                        if (href && href !== pathname) router.push(href)
                      }}
                      className={cn(
                        'shell-chrome-btn relative z-10 inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-transparent px-4 text-sm font-normal leading-5 whitespace-nowrap',
                        motion && 'transition-colors duration-300',
                        on ? 'text-white' : 'text-muted-foreground',
                      )}
                    >
                      <span className={on ? 'text-white' : undefined}>{item}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Desktop only — glass chevrons when the capsule is clipped. */}
          {canScrollBack ? (
            <button
              type="button"
              aria-label="Scroll categories back"
              data-sub-menu-scroll-back=""
              className={cn(
                'absolute left-1 top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full md:inline-flex',
                'border border-border/60 bg-background/55 text-foreground backdrop-blur-md',
                'outline-none hover:bg-background/75 focus-visible:ring-2 focus-visible:ring-ring',
              )}
              onClick={() => {
                const el = scrollRef.current
                if (!el) return
                el.scrollBy({ left: -Math.min(220, el.clientWidth * 0.7), behavior: 'smooth' })
              }}
            >
              <IconChevronLeft className="size-4" strokeWidth={2} />
            </button>
          ) : null}
          {canScrollMore ? (
            <button
              type="button"
              aria-label="Scroll categories forward"
              data-sub-menu-scroll-more=""
              className={cn(
                'absolute right-1 top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full md:inline-flex',
                'border border-border/60 bg-background/55 text-foreground backdrop-blur-md',
                'outline-none hover:bg-background/75 focus-visible:ring-2 focus-visible:ring-ring',
              )}
              onClick={() => {
                const el = scrollRef.current
                if (!el) return
                el.scrollBy({ left: Math.min(220, el.clientWidth * 0.7), behavior: 'smooth' })
              }}
            >
              <IconChevronRight className="size-4" strokeWidth={2} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
