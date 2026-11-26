'use client'

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconChevronDown } from '@tabler/icons-react'
import type { CasinoLobbyGame } from '@/lib/lumen/casino-lobby-catalog'
import { useSiteVersion } from '@/lib/lumen/site-versions'
import { hashFromHref, isInPageHashHref, scrollShellToId } from '@/lib/lumen/shell-scroll'
import { useShell } from './shell-context'
import { ShellIcon, ShellLogo } from './shell-icons'
import { gameForNavAction } from './shell-nav-launch'
import {
  navForPathname,
  navPickKey,
  promoNavTourId,
  withLastGamePlayed,
  withNavActive,
  withSingleActive,
  type ShellNavGroup,
  type ShellNavItem,
} from './shell-nav'
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
  const {
    expanded,
    product,
    startNavigating,
    launchGame,
    setVipHubOpen,
    loggedIn,
    lastPlayedGame,
    openAuth,
  } = useShell()
  const siteVersion = useSiteVersion()
  /* V5: one lit item even when MLB, Top Sports › Baseball and A–Z › Baseball share a page. */
  const pickKey = `shell-sidebar-pick:${product}`
  const [picked, setPicked] = useState<string | null>(null)
  useLayoutEffect(() => {
    try {
      setPicked(window.sessionStorage.getItem(pickKey))
    } catch {
      /* storage blocked — first match wins */
    }
  }, [pickKey])
  const savePick = (event: React.MouseEvent) => {
    const key = (event.target as HTMLElement).closest<HTMLElement>('[data-nav-pick]')?.dataset.navPick
    if (!key) return
    setPicked(key)
    try {
      window.sessionStorage.setItem(pickKey, key)
    } catch {
      /* ignore */
    }
  }
  const litGroups = withNavActive(navForPathname(pathname, product, siteVersion), pathname, hash)
  const groups = withLastGamePlayed(
    siteVersion === 'v5' ? withSingleActive(litGroups, picked, pathname) : litGroups,
    { loggedIn, lastPlayed: lastPlayedGame },
  )

  /* Each route mounts its own shell — keep the nav where the player left it instead of jumping to the top. */
  const navRef = useRef<HTMLElement>(null)
  const scrollKey = `shell-sidebar-scroll:${product}`
  useLayoutEffect(() => {
    const el = navRef.current
    if (!el) return
    try {
      const saved = Number(window.sessionStorage.getItem(scrollKey) ?? 0)
      if (saved > 0) el.scrollTop = saved
    } catch {
      /* storage blocked — start at the top */
    }
  }, [scrollKey])
  const saveScroll = () => {
    try {
      if (navRef.current) window.sessionStorage.setItem(scrollKey, String(navRef.current.scrollTop))
    } catch {
      /* ignore */
    }
  }

  return (
    <aside
      data-name="sidebar-container"
      data-state={expanded ? 'expanded' : 'collapsed'}
      className={cn(
        'pointer-events-auto fixed inset-y-0 left-0 z-[80] hidden h-svh flex-col border-r border-[var(--sidebar-border-inverted)] bg-[var(--sidebar-inverted)] transition-[width] duration-300 ease-in-out lg:flex',
        expanded ? 'w-64 overflow-hidden' : 'w-24 overflow-visible',
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
        ref={navRef}
        onScroll={saveScroll}
        onClickCapture={savePick}
        className={cn(
          'shell-scroll flex flex-1 flex-col gap-3 overflow-y-auto overflow-x-visible pt-3 transition-[padding] duration-300 ease-in-out',
          expanded ? 'px-2' : 'px-4',
        )}
        aria-label={product}
      >
        {groups.map((group, index) => (
          <SidebarNavGroup
            key={`${group.heading ?? 'group'}-${index}`}
            group={group}
            index={index}
            expanded={expanded}
            pathname={pathname}
            onNavigate={startNavigating}
            onLaunch={launchGame}
            onOpenVipHub={() => setVipHubOpen(true)}
            onLogin={() => openAuth('login')}
            lastPlayed={lastPlayedGame}
            loggedIn={loggedIn}
          />
        ))}
      </nav>
    </aside>
  )
}

function SidebarNavGroup({
  group,
  index,
  expanded,
  pathname,
  onNavigate,
  onLaunch,
  onOpenVipHub,
  onLogin,
  lastPlayed,
  loggedIn,
}: {
  group: ShellNavGroup
  index: number
  expanded: boolean
  pathname: string
  onNavigate: (href?: string) => void
  onLaunch: (game: CasinoLobbyGame) => void
  onOpenVipHub: () => void
  onLogin: () => void
  lastPlayed: CasinoLobbyGame | null
  loggedIn: boolean
}) {
  const collapsible = Boolean(group.collapsible && group.heading)
  const [open, setOpen] = useState(true)
  /* Collapsed rail always shows icons; smooth collapse only when expanded. */
  const sectionOpen = !collapsible || !expanded || open

  return (
    <div className="flex flex-col gap-1.5">
      {index > 0 ? <div className="my-1.5 h-px w-full bg-[var(--border-inverted)]" /> : null}
      {group.heading ? (
        collapsible ? (
          <div
            className={cn(
              'group/section flex items-center gap-1 px-2 py-1.5 transition-[height,opacity,padding] duration-200 ease-in-out',
              expanded ? 'opacity-100' : 'h-0 overflow-hidden p-0 opacity-0',
            )}
          >
            <span className="min-w-0 flex-1 truncate text-xs font-medium leading-4 text-[var(--muted-foreground-inverted)]">
              {group.heading}
            </span>
            <button
              type="button"
              aria-label={open ? `Collapse ${group.heading}` : `Expand ${group.heading}`}
              aria-expanded={open}
              onClick={() => {
                if (!expanded) return
                setOpen((v) => !v)
              }}
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-lg text-[var(--muted-foreground-inverted)] transition-colors duration-200 ease-in-out',
                'hover:bg-[var(--surface-muted-1-inverted)] hover:text-white',
              )}
            >
              <IconChevronDown
                className={cn(
                  'size-3.5 transition-transform duration-300 ease-in-out',
                  open ? 'rotate-0' : '-rotate-90',
                )}
                aria-hidden
              />
            </button>
          </div>
        ) : (
          <p
            className={cn(
              'px-2 py-1.5 text-xs font-medium leading-4 text-[var(--muted-foreground-inverted)] transition-opacity duration-200 ease-in-out',
              expanded ? 'opacity-100' : 'h-0 overflow-hidden p-0 opacity-0',
            )}
          >
            {group.heading}
          </p>
        )
      ) : null}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-in-out',
          sectionOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="flex min-h-0 flex-col gap-1.5 overflow-hidden">
          {group.items.map((item) => (
            <NavItem
              key={`${group.heading ?? ''}-${item.label}`}
              pick={navPickKey(group, index, item)}
              item={item}
              expanded={expanded}
              pathname={pathname}
              onNavigate={onNavigate}
              onLaunch={onLaunch}
              onOpenVipHub={onOpenVipHub}
              onLogin={onLogin}
              lastPlayed={lastPlayed}
              loggedIn={loggedIn}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function NavItem({
  pick,
  item,
  expanded,
  pathname,
  onNavigate,
  onLaunch,
  onOpenVipHub,
  onLogin,
  lastPlayed,
  loggedIn,
}: {
  pick?: string
  item: ShellNavItem
  expanded: boolean
  pathname: string
  onNavigate: (href?: string) => void
  onLaunch: (game: CasinoLobbyGame) => void
  onOpenVipHub: () => void
  onLogin: () => void
  lastPlayed: CasinoLobbyGame | null
  loggedIn: boolean
}) {
  const className = cn(
    'group relative flex w-full items-center border-0 bg-transparent p-0 text-left text-sm leading-5 outline-none ring-0 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:outline-none',
    expanded
      ? 'h-11 justify-start gap-2 overflow-hidden rounded-lg px-2'
      : 'h-12 justify-center overflow-visible',
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
          {item.live ? (
            <span className="relative mr-0.5 flex size-2 shrink-0" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
          ) : null}
          {item.trailing ? (
            <ShellIcon name={item.trailing} tone="token" className={iconGlyphClass} />
          ) : null}
        </>
      ) : item.live ? (
        <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" aria-hidden />
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
        onClick={() => {
          if (item.action === 'launch-last-game') {
            if (!loggedIn) {
              onLogin()
              return
            }
            if (!lastPlayed) return
            onLaunch(lastPlayed)
            return
          }
          onLaunch(gameForNavAction(item.action))
        }}
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
      data-nav-pick={pick}
      data-tour={promoNavTourId(item.label)}
      data-tip={expanded ? undefined : item.label}
      data-tip-side="right"
      className={className}
    >
      {body}
    </Link>
  )
}
