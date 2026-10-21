'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { pickRandomLobbyGame } from '@/lib/lumen/casino-lobby-catalog'
import { gameForNavAction } from './shell-nav-launch'
import { useShell } from './shell-context'
import { ShellIcon, type ShellIconName } from './shell-icons'
import { useHideOnScroll } from './shell-scroll'
import type { ShellProduct } from './shell-nav'
import { cn } from '@/lib/utils'

type DockItem = {
  href: string
  icon: ShellIconName
  label: string
  action?: 'search' | 'random' | 'last-game'
}

/** Figma 4308:278685 — home `nav-menu-icon-solid` (Casino + Sports). */
const HOME_DOCK: DockItem[] = [
  { href: '/casino', icon: 'dice', label: 'Casino' },
  { href: '/sports', icon: 'football', label: 'Sports' },
]

/** Figma 4308:278672 — casino dock (Search · Random · Favorite · Last Game). */
const CASINO_DOCK: DockItem[] = [
  { href: '/casino', icon: 'search', label: 'Search', action: 'search' },
  { href: '/casino', icon: 'random', label: 'Random', action: 'random' },
  { href: '/casino/category/favourites', icon: 'favorite', label: 'Favorite' },
  { href: '/casino', icon: 'lastGame', label: 'Last Game', action: 'last-game' },
]

/** Figma 4308:278679 — sports dock (Search · My Bets · Betslip). Keep ticket icon for My Bets. */
const SPORTS_DOCK: DockItem[] = [
  { href: '/sports', icon: 'search', label: 'Search' },
  { href: '/sports', icon: 'ticket', label: 'My Bets' },
  { href: '/sports', icon: 'betslip', label: 'Betslip' },
]

/** Figma 4308:278665 — promotions `nav-menu-icon-solid` dock (300×58, items 64×46). */
const PROMOTIONS_DOCK: DockItem[] = [
  { href: '/promotions', icon: 'promos', label: 'Promos' },
  { href: '/promotions/my-bonus', icon: 'bonus', label: 'My Bonus' },
  { href: '/promotions', icon: 'refer', label: 'Refer' },
  { href: '/promotions/contest', icon: 'contests', label: 'Contest' },
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
  const { product, setCasinoSearchOpen, launchGame } = useShell()
  const hidden = useHideOnScroll('down')
  const items = dockForPath(pathname, product)
  const [selected, setSelected] = useState<string | null>(null)

  if (items.length === 0) return null

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
                (item.label === 'Contest' && pathname.startsWith('/promotions/contest')))) ||
            (item.label === 'Favorite' && pathname.startsWith('/casino/category/favourites'))
          const active = selected === item.label || (selected === null && routeActive)
          return (
            <Link
              key={item.label}
              href={item.href}
              data-name="nav-item"
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
                  launchGame(gameForNavAction('launch-last-game'))
                }
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
              <span className="flex size-[30px] shrink-0 items-center justify-center opacity-90">
                <ShellIcon
                  name={item.icon}
                  tone="token"
                  active={active}
                  className={cn(
                    'size-5',
                    active ? 'bg-foreground' : 'bg-muted-foreground',
                  )}
                />
              </span>
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
