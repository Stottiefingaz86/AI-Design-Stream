'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CasinoLobbyGame } from '@/lib/lumen/casino-lobby-catalog'
import { useShell } from './shell-context'
import { ShellIcon, ShellLogo } from './shell-icons'
import { gameForNavAction } from './shell-nav-launch'
import { navForProduct, withNavActive, type ShellNavItem } from './shell-nav'
import { cn } from '@/lib/utils'

/**
 * Figma sidebar-container — 96px collapsed / 256px expanded.
 * Width eases in/out. Logo morphs wordmark → lettermark with a pop.
 */
export function ShellSidebar() {
  const pathname = usePathname()
  const { expanded, toggle, product, startNavigating, launchGame } = useShell()
  const groups = withNavActive(navForProduct(product), pathname)

  return (
    <aside
      data-name="sidebar-container"
      data-state={expanded ? 'expanded' : 'collapsed'}
      className={cn(
        'pointer-events-auto fixed inset-y-0 left-0 z-[80] hidden h-svh flex-col border-r border-[var(--sidebar-border-inverted)] bg-[var(--sidebar-inverted)] transition-[width] duration-300 ease-in-out lg:flex',
        expanded ? 'w-64 overflow-hidden' : 'w-24 overflow-visible'
      )}
    >
      <div className="flex h-16 w-full shrink-0 items-center justify-center p-2">
        <button
          type="button"
          onClick={toggle}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          className="shell-chrome-btn flex h-8 items-center justify-center rounded-md border-0 bg-transparent"
        >
          <ShellLogo expanded={expanded} />
        </button>
      </div>

      <nav
        className={cn(
          'shell-scroll flex flex-1 flex-col gap-2 overflow-y-auto overflow-x-visible pt-2 transition-[padding] duration-300 ease-in-out',
          expanded ? 'px-2' : 'px-4'
        )}
        aria-label={product}
      >
        {groups.map((group, index) => (
          <div key={`${group.heading ?? 'group'}-${index}`} className="flex flex-col gap-1.5">
            {index > 0 ? <div className="h-px w-full bg-[var(--border-inverted)]" /> : null}
            {group.heading ? (
              <p
                className={cn(
                  'px-2 py-1.5 text-xs font-medium leading-4 text-[var(--muted-foreground-inverted)] transition-opacity duration-200 ease-in-out',
                  expanded ? 'opacity-100' : 'h-0 overflow-hidden p-0 opacity-0'
                )}
              >
                {group.heading}
              </p>
            ) : null}
            {group.items.map((item) => (
              <NavItem
                key={`${group.heading ?? ''}-${item.label}`}
                item={item}
                expanded={expanded}
                onNavigate={startNavigating}
                onLaunch={launchGame}
              />
            ))}
          </div>
        ))}
      </nav>
    </aside>
  )
}

function NavItem({
  item,
  expanded,
  onNavigate,
  onLaunch,
}: {
  item: ShellNavItem
  expanded: boolean
  onNavigate: () => void
  onLaunch: (game: CasinoLobbyGame) => void
}) {
  const className = cn(
    'group relative flex w-full items-center border-0 bg-transparent p-0 text-left text-sm leading-5 outline-none ring-0 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:outline-none',
    expanded ? 'h-11 justify-start gap-2 overflow-hidden rounded-lg px-2' : 'h-12 justify-center overflow-visible',
    expanded && item.active && 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]',
    expanded &&
      !item.active &&
      'text-[var(--muted-foreground-inverted)] hover:bg-[var(--surface-muted-1-inverted)] hover:text-[var(--foreground-inverted)]',
    !expanded && 'text-[var(--muted-foreground-inverted)] hover:text-[var(--foreground-inverted)]',
  )

  const body = (
    <>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-[8px] transition-colors duration-200 ease-in-out',
          expanded ? (item.emphasis || item.active ? 'size-8' : 'size-6') : 'size-10',
          item.active && 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)]',
          !item.active && item.emphasis && 'bg-[var(--surface-muted-1-inverted)]',
          !expanded && !item.active && 'group-hover:bg-[var(--surface-muted-1-inverted)]',
        )}
      >
        {item.iconSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.iconSrc}
            alt=""
            className="size-full rounded-[6px] object-cover object-top"
          />
        ) : (
          <ShellIcon name={item.icon} tone="token" active={item.active} className="size-5" />
        )}
      </span>
      {expanded ? (
        <>
          <span className="min-w-0 flex-1">
            <span className={cn('block truncate', item.active ? 'font-semibold' : 'font-medium')}>
              {item.label}
            </span>
            {item.subtitle ? (
              <span className="block truncate text-[10px] font-normal leading-[14px] opacity-80">
                {item.subtitle}
              </span>
            ) : null}
          </span>
          {item.trailing ? <ShellIcon name={item.trailing} tone="token" className="size-5" /> : null}
        </>
      ) : null}
    </>
  )

  if (item.action) {
    return (
      <button
        type="button"
        aria-label={item.label}
        data-tip={expanded ? undefined : item.label}
        data-tip-side="right"
        className={className}
        onClick={() => onLaunch(gameForNavAction(item.action!))}
      >
        {body}
      </button>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-label={item.label}
      aria-current={item.active ? 'page' : undefined}
      data-state={item.active ? 'active' : 'default'}
      data-tip={expanded ? undefined : item.label}
      data-tip-side="right"
      className={className}
    >
      {body}
    </Link>
  )
}
