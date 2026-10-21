'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CasinoLobbyGame } from '@/lib/lumen/casino-lobby-catalog'
import {
  hashFromHref,
  isInPageHashHref,
  scrollShellToId,
} from '@/lib/lumen/shell-scroll'
import { useShell } from './shell-context'
import { ShellIcon, ShellLogo } from './shell-icons'
import { gameForNavAction } from './shell-nav-launch'
import { navForPathname, withNavActive, type ShellNavItem } from './shell-nav'
import { cn } from '@/lib/utils'

function useLocationHash() {
  const [hash, setHash] = useState('')
  useEffect(() => {
    const sync = () => setHash(window.location.hash.replace(/^#/, ''))
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])
  return hash
}

/**
 * Figma sidebar-container — 96px collapsed / 256px expanded.
 * Width eases in/out. Logo morphs wordmark → lettermark with a pop.
 */
export function ShellSidebar() {
  const pathname = usePathname()
  const hash = useLocationHash()
  const { expanded, product, startNavigating, launchGame, setVipHubOpen } = useShell()
  const groups = withNavActive(navForPathname(pathname, product), pathname, hash)

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
        <ShellLogo
          expanded={expanded}
          onNavigate={() => startNavigating('/')}
          className="shell-chrome-btn rounded-md border-0 bg-transparent"
        />
      </div>

      <nav
        className={cn(
          'shell-scroll flex flex-1 flex-col gap-3 overflow-y-auto overflow-x-visible pt-3 transition-[padding] duration-300 ease-in-out',
          expanded ? 'px-2' : 'px-4'
        )}
        aria-label={product}
      >
        {groups.map((group, index) => (
          <div key={`${group.heading ?? 'group'}-${index}`} className="flex flex-col gap-1.5">
            {index > 0 ? (
              <div className="my-1.5 h-px w-full bg-[var(--border-inverted)]" />
            ) : null}
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
                pathname={pathname}
                onNavigate={startNavigating}
                onLaunch={launchGame}
                onOpenVipHub={() => setVipHubOpen(true)}
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
  pathname,
  onNavigate,
  onLaunch,
  onOpenVipHub,
}: {
  item: ShellNavItem
  expanded: boolean
  pathname: string
  onNavigate: (href?: string) => void
  onLaunch: (game: CasinoLobbyGame) => void
  onOpenVipHub: () => void
}) {
  const className = cn(
    'group relative flex w-full items-center border-0 bg-transparent p-0 text-left text-sm leading-5 outline-none ring-0 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:outline-none',
    expanded ? 'h-11 justify-start gap-2 overflow-hidden rounded-lg px-2' : 'h-12 justify-center overflow-visible',
    expanded && item.active && 'bg-[var(--sidebar-primary)] text-white',
    expanded &&
      !item.active &&
      'text-white/60 hover:bg-[var(--surface-muted-1-inverted)] hover:text-white',
    !expanded && 'text-white/60 hover:text-white',
  )

  /* Mask icons paint via background — set bg-* directly (currentColor was staying muted). */
  const iconGlyphClass = cn(
    'size-5',
    item.active ? '!bg-white' : '!bg-white/60 group-hover:!bg-white',
  )

  const body = (
    <>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-[8px] transition-colors duration-200 ease-in-out',
          expanded ? (item.emphasis || item.active ? 'size-8' : 'size-6') : 'size-10',
          item.active && 'bg-[var(--sidebar-primary)]',
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
          <ShellIcon
            name={item.icon}
            tone="token"
            active={item.active}
            className={iconGlyphClass}
          />
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
          {item.trailing ? (
            <ShellIcon name={item.trailing} tone="token" className={iconGlyphClass} />
          ) : null}
        </>
      ) : null}
    </>
  )

  if (item.action === 'open-vip-hub') {
    return (
      <button
        type="button"
        aria-label={item.label}
        data-tip={expanded ? undefined : item.label}
        data-tip-side="right"
        className={className}
        onClick={onOpenVipHub}
      >
        {body}
      </button>
    )
  }

  if (item.action) {
    return (
      <button
        type="button"
        aria-label={item.label}
        data-tip={expanded ? undefined : item.label}
        data-tip-side="right"
        className={className}
        onClick={() => onLaunch(gameForNavAction(item.action))}
      >
        {body}
      </button>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={(event) => {
        if (isInPageHashHref(item.href, pathname)) {
          event.preventDefault()
          const id = hashFromHref(item.href)
          window.history.pushState(null, '', `#${id}`)
          window.dispatchEvent(new HashChangeEvent('hashchange'))
          scrollShellToId(id)
          return
        }
        onNavigate(item.href)
      }}
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
