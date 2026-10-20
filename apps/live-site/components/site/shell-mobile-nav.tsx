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

type DockItem = { href: string; icon: ShellIconName; label: string }

const CASINO_DOCK: DockItem[] = [
  { href: '/casino', icon: 'search', label: 'Search' },
  { href: '/casino', icon: 'random', label: 'Play Random' },
  { href: '/casino/category/favourites', icon: 'favorite', label: 'Favourites' },
]

const SPORTS_DOCK: DockItem[] = [
  { href: '/sports', icon: 'search', label: 'Search' },
  { href: '/sports', icon: 'ticket', label: 'Bets' },
]

/** Figma 4308:278665 — promotions `nav-menu-icon-solid` dock (300×58, items 64×46). */
const PROMOTIONS_DOCK: DockItem[] = [
  { href: '/promotions', icon: 'promos', label: 'Promos' },
  { href: '/promotions/my-bonus', icon: 'bonus', label: 'My Bonus' },
  { href: '/promotions', icon: 'refer', label: 'Refer' },
  { href: '/promotions', icon: 'contests', label: 'Contest' },
]

function dockForProduct(product: ShellProduct): DockItem[] {
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
  const items = dockForProduct(product)
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
            product === 'promotions' &&
            ((item.label === 'Promos' &&
              (pathname === '/promotions' || pathname === '/promotions/')) ||
              (item.label === 'My Bonus' && pathname.startsWith('/promotions/my-bonus')))
          const active = selected === item.label || (selected === null && routeActive)
          const openSearch = product === 'casino' && item.label === 'Search'
          const playRandom = product === 'casino' && item.label === 'Play Random'
          return (
            <Link
              key={item.label}
              href={item.href}
              data-name="nav-item"
              data-state={active ? 'active' : 'default'}
              aria-current={active ? 'page' : undefined}
              onClick={(e) => {
                setSelected(item.label)
                if (openSearch) {
                  e.preventDefault()
                  setCasinoSearchOpen(true)
                  return
                }
                if (playRandom) {
                  e.preventDefault()
                  launchGame(pickRandomLobbyGame())
                }
              }}
              className={cn(
                /* rounded-xl (not full) so long labels stay inside the highlight, not in the end-cap curve */
                'flex h-[46px] w-16 shrink-0 flex-col items-center justify-center gap-0 rounded-xl px-0.5 text-[11px] font-medium leading-[14px] outline-none ring-0 transition-[background-color,color,transform] duration-200 ease-in-out',
                active
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                'active:scale-95 active:bg-[color-mix(in_oklch,var(--accent),var(--foreground)_8%)] active:text-foreground',
              )}
            >
              <span className="flex size-5 shrink-0 items-center justify-center">
                <ShellIcon
                  name={item.icon}
                  tone="token"
                  active={active}
                  className={cn(
                    'size-5',
                    active ? 'bg-foreground' : 'bg-current',
                  )}
                />
              </span>
              <span className="max-w-full truncate whitespace-nowrap">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
