'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useShell } from './shell-context'
import { ShellIcon, type ShellIconName } from './shell-icons'
import { useHideOnScroll } from './shell-scroll'
import type { ShellProduct } from './shell-nav'
import { cn } from '@/lib/utils'

const CASINO_DOCK: { href: string; icon: ShellIconName; label: string }[] = [
  { href: '/casino', icon: 'search', label: 'Search' },
  { href: '/casino', icon: 'random', label: 'Play Random' },
  { href: '/casino', icon: 'favorite', label: 'Favourites' },
]

const SPORTS_DOCK: { href: string; icon: ShellIconName; label: string }[] = [
  { href: '/sports', icon: 'search', label: 'Search' },
  { href: '/sports', icon: 'ticket', label: 'Bets' },
]

function dockForProduct(product: ShellProduct) {
  if (product === 'sports') return SPORTS_DOCK
  return CASINO_DOCK
}

/** Figma `nav-menu-icon-solid` — floating dock. Labels sit under the icons. */
export function ShellMobileNav() {
  const { product, setCasinoSearchOpen } = useShell()
  const hidden = useHideOnScroll('down')
  const items = dockForProduct(product)
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <nav
      data-name="nav-menu-icon-solid"
      className={cn(
        'fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-stretch gap-1 rounded-full border border-border bg-[var(--container)] px-2 py-1.5 shadow-[0_8px_28px_rgba(0,0,0,0.18)] backdrop-blur-[32px] transition-transform duration-300 ease-in-out lg:hidden',
        hidden ? 'translate-y-[calc(100%+2rem)]' : 'translate-y-0'
      )}
      aria-label="Quick navigation"
    >
      {items.map((item) => {
        const active = selected === item.label
        const openSearch = product === 'casino' && item.label === 'Search'
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
              }
            }}
            className={cn(
              'flex w-[76px] flex-col items-center justify-center gap-1 rounded-full py-1.5 text-[10px] font-medium leading-none outline-none ring-0 transition-[background-color,color,transform] duration-200 ease-in-out',
              active
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              'active:scale-95 active:bg-[color-mix(in_oklch,var(--accent),var(--foreground)_8%)] active:text-foreground'
            )}
          >
            <ShellIcon name={item.icon} tone="surface" active={active} className="size-5" />
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
