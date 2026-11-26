'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { pickRandomLobbyGame } from '@/lib/lumen/casino-lobby-catalog'
import { useShell } from './shell-context'
import { ShellIcon, type ShellIconName } from './shell-icons'
import { useHideOnScroll } from './shell-scroll'
import type { ShellProduct } from './shell-nav'
import { cn } from '@/lib/utils'
import { useSiteVersion } from '@/lib/lumen/site-versions'

type DockItem = {
  href: string
  icon: ShellIconName
  label: string
  action?: 'search' | 'random' | 'last-game' | 'betslip'
}

/** Figma 4308:278685 — home `nav-menu-icon-solid` (Casino + Sports). */
const HOME_DOCK: DockItem[] = [
  { href: '/casino', icon: 'dice', label: 'Casino' },
  { href: '/sports/soccer', icon: 'football', label: 'Sports' },
]

/** Figma 4308:278672 — casino dock (Search · Random · Favorite · Last Game). */
const CASINO_DOCK: DockItem[] = [
  { href: '/casino', icon: 'search', label: 'Search', action: 'search' },
  { href: '/casino', icon: 'random', label: 'Random', action: 'random' },
  { href: '/casino/category/favourites', icon: 'favorite', label: 'Favorite' },
  { href: '/casino', icon: 'lastGame', label: 'Last Game', action: 'last-game' },
]

/** Figma 4308:278679 — sports dock (Search · My Bets · Betslip · Casino). Keep ticket icon for My Bets. */
const SPORTS_DOCK: DockItem[] = [
  { href: '/sports', icon: 'search', label: 'Search' },
  { href: '/sports/my-bets', icon: 'ticket', label: 'My Bets' },
  { href: '/sports', icon: 'betslip', label: 'Betslip', action: 'betslip' },
  { href: '/casino', icon: 'dice', label: 'Casino' },
]

/** Figma 4308:278665 — promotions `nav-menu-icon-solid` dock (300×58, items 64×46). */
const PROMOTIONS_DOCK: DockItem[] = [
  { href: '/promotions', icon: 'promos', label: 'Promos' },
  { href: '/promotions/my-bonus', icon: 'bonus', label: 'My Bonus' },
  { href: '/promotions/contest', icon: 'contests', label: 'Contest' },
  { href: '/promotions/refer-a-friend', icon: 'refer', label: 'Refer' },
]

function dockForPath(pathname: string, product: ShellProduct): DockItem[] {
  if (pathname === '/') return HOME_DOCK
  /* Account shares the home dock (Casino · Sports) — not casino tools. */
  if (pathname.startsWith('/account')) return HOME_DOCK
  if (product === 'sports') return SPORTS_DOCK
  if (product === 'promotions') return PROMOTIONS_DOCK
  if (product === 'poker') return []
  return CASINO_DOCK
}

/** Figma `nav-menu-icon-solid` — floating dock. Labels sit under the icons. */
export function ShellMobileNav() {
  const pathname = usePathname()
  const {
    product,
    setCasinoSearchOpen,
    launchGame,
    startNavigating,
    sportsBetCount,
    openSportsBetslip,
    sportsBetslipOpen,
    intercomOpen,
    loggedIn,
    lastPlayedGame,
    openAuth,
  } = useShell()
  const hidden = useHideOnScroll('down')
  const v5 = useSiteVersion() === 'v5'
  const baseItems = dockForPath(pathname, product)
  /* V5 · the homepage takes sports picks (Browse markets, Activity) — show Betslip once there are some. */
  const items =
    v5 && pathname === '/' && sportsBetCount > 0
      ? [baseItems[0]!, { href: '/', icon: 'betslip' as const, label: 'Betslip', action: 'betslip' as const }, ...baseItems.slice(1)]
      : baseItems
  const [selected, setSelected] = useState<string | null>(null)

  if (items.length === 0) return null
  /* Betslip / Intercom owns the bottom — hide dock so panels sit flush. */
  if (sportsBetslipOpen || intercomOpen) return null

  return (
    <nav
      data-name="nav-menu-icon-solid"
      className={cn(
        'fixed bottom-6 left-1/2 z-40 flex h-[58px] -translate-x-1/2 items-center justify-center rounded-full border border-border bg-[var(--container)] p-0.5 shadow-[0_0_16px_rgba(0,0,0,0.06)] backdrop-blur-[8px] transition-transform duration-300 ease-in-out lg:hidden',
        hidden ? 'translate-y-[calc(100%+2rem)]' : 'translate-y-0',
      )}
      aria-label="Quick navigation"
    >
      <div className="flex h-[54px] items-center gap-1 px-1.5">
        {items.map((item) => {
          const routeActive =
            (item.label === 'Casino' && pathname.startsWith('/casino')) ||
            (item.label === 'Sports' && pathname.startsWith('/sports')) ||
            (product === 'promotions' &&
              ((item.label === 'Promos' &&
                (pathname === '/promotions' || pathname === '/promotions/')) ||
                (item.label === 'My Bonus' && pathname.startsWith('/promotions/my-bonus')) ||
                (item.label === 'Refer' && pathname.startsWith('/promotions/refer-a-friend')) ||
                (item.label === 'Contest' && pathname.startsWith('/promotions/contest')))) ||
            (item.label === 'Favorite' && pathname.startsWith('/casino/category/favourites'))
          const showBetBadge = item.action === 'betslip' && sportsBetCount > 0
          /** Betslip with picks counts as active — white/foreground icon. */
          const active =
            selected === item.label ||
            (selected === null && routeActive) ||
            showBetBadge
          return (
            <Link
              key={item.label}
              href={item.href}
              data-name="nav-item"
              data-shell-betslip={item.action === 'betslip' ? '' : undefined}
              data-state={active ? 'active' : 'default'}
              aria-current={active ? 'page' : undefined}
              onClick={(e) => {
                setSelected(item.label)
                if (item.action === 'search') {
                  e.preventDefault()
                  setCasinoSearchOpen(true)
                  return
                }
                if (item.action === 'random') {
                  e.preventDefault()
                  launchGame(pickRandomLobbyGame())
                  return
                }
                if (item.action === 'last-game') {
                  e.preventDefault()
                  if (!loggedIn) {
                    openAuth('login')
                    return
                  }
                  if (!lastPlayedGame) return
                  launchGame(lastPlayedGame)
                  return
                }
                if (item.action === 'betslip') {
                  e.preventDefault()
                  openSportsBetslip()
                  return
                }
                startNavigating(item.href)
              }}
              className={cn(
                /* Wider than Figma’s 64px slot so “Last Game” fits without ellipsis. */
                'flex h-[46px] min-w-[76px] shrink-0 flex-col items-center justify-center gap-0 rounded-full px-1.5 text-xs font-medium leading-4 outline-none ring-0 transition-[background-color,color,transform] duration-200 ease-in-out',
                active
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                'active:scale-95 active:bg-[color-mix(in_oklch,var(--accent),var(--foreground)_8%)] active:text-foreground',
              )}
            >
              <span className="relative flex size-[30px] shrink-0 items-center justify-center opacity-90">
                <ShellIcon
                  name={item.icon}
                  tone="token"
                  active={active}
                  className={cn(
                    'size-5',
                    active || showBetBadge ? 'bg-white' : 'bg-muted-foreground',
                  )}
                />
                {item.action === 'betslip' ? (
                  <span
                    data-betslip-fly-target="dock"
                    aria-label={
                      showBetBadge ? `${sportsBetCount} in betslip` : undefined
                    }
                    aria-hidden={!showBetBadge}
                    className={cn(
                      'absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none',
                      showBetBadge
                        ? 'bg-primary text-primary-foreground'
                        : 'pointer-events-none bg-transparent text-transparent',
                    )}
                  >
                    {showBetBadge
                      ? sportsBetCount > 99
                        ? '99+'
                        : sportsBetCount
                      : ''}
                  </span>
                ) : null}
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
