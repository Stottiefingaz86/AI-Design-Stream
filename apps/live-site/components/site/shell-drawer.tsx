'use client'

import Link from 'next/link'
import { IconChevronDown } from '@tabler/icons-react'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type HTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import type { CasinoLobbyGame } from '@/lib/lumen/casino-lobby-catalog'
import { useSiteVersion } from '@/lib/lumen/site-versions'
import { hashFromHref, isInPageHashHref, scrollShellToId } from '@/lib/lumen/shell-scroll'
import { useShell } from './shell-context'
import { ShellIcon, ShellLogo } from './shell-icons'
import { gameForNavAction } from './shell-nav-launch'
import { comboBuilderHosted, openComboBuilder } from '@/lib/lumen/v5-combos'
import {
  CHIP_NAV,
  chipItemActive,
  navForPathname,
  promoNavTourId,
  withLastGamePlayed,
  withNavActive,
  type ShellNavGroup,
  type ShellNavItem,
} from './shell-nav'
import { cn } from '@/lib/utils'

/** Mobile/tablet left nav — Figma drawer, not the desktop rail. */
export function ShellDrawer() {
  const pathname = usePathname()
  const [hash, setHash] = useState('')
  const {
    navOpen,
    setNavOpen,
    product,
    launchGame,
    setVipHubOpen,
    startNavigating,
    loggedIn,
    lastPlayedGame,
    openAuth,
  } = useShell()
  const siteVersion = useSiteVersion()
  const groups = withLastGamePlayed(
    withNavActive(navForPathname(pathname, product, siteVersion), pathname, hash),
    { loggedIn, lastPlayed: lastPlayedGame },
  )
  const tabsRef = useRef<HTMLElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const sync = () => setHash(window.location.hash.replace(/^#/, ''))
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  useEffect(() => {
    if (!navOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [navOpen])

  useEffect(() => {
    if (!navOpen) return
    const active = tabsRef.current?.querySelector<HTMLElement>('[data-state="active"]')
    active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' })
  }, [navOpen, pathname])

  const drawer = (
    <div
      data-shell-drawer=""
      data-state={navOpen ? 'open' : 'closed'}
      className={cn(
        'fixed inset-0 z-[180] lg:hidden',
        navOpen ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      aria-hidden={!navOpen}
      {...(!navOpen ? ({ inert: '' } as HTMLAttributes<HTMLDivElement>) : {})}
    >
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-black/70 transition-opacity duration-300 ease-in-out',
          navOpen ? 'opacity-100' : 'opacity-0',
        )}
        aria-label="Close menu"
        onClick={() => setNavOpen(false)}
      />
      <aside
        data-name="sidebar-drawer"
        className={cn(
          'absolute inset-y-0 left-0 flex h-full w-[311px] max-w-[83vw] flex-col overflow-hidden rounded-r-2xl border-r border-[rgba(255,255,255,0.08)] bg-[var(--sidebar-inverted)] shadow-2xl transition-transform duration-300 ease-in-out',
          navOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex shrink-0 flex-col gap-2 pb-2 pt-3">
          <div className="flex h-9 items-center justify-between px-2">
            <span className="size-9" aria-hidden />
            <ShellLogo
              expanded
              onNavigate={() => {
                setNavOpen(false)
                startNavigating('/')
              }}
              className="rounded-md transition-colors duration-200 ease-in-out hover:bg-[var(--surface-muted-1-inverted)]"
            />
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
              className="inline-flex size-9 items-center justify-center rounded-lg text-[rgba(255,255,255,0.87)] transition-colors duration-200 ease-in-out hover:bg-[var(--surface-muted-1-inverted)]"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
          <nav
            ref={tabsRef}
            className="scrollbar-hide flex w-full items-center overflow-x-auto border-b border-[var(--border-inverted)]"
            aria-label="Products"
          >
            {CHIP_NAV.map((item) => {
              const active = chipItemActive(item.label, pathname)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  data-name="tab-item-outline"
                  data-state={active ? 'active' : 'default'}
                  onClick={() => {
                    startNavigating(item.href)
                    setNavOpen(false)
                  }}
                  className={cn(
                    'inline-flex shrink-0 items-center justify-center border-b-2 px-3.5 py-1.5 text-sm leading-5 transition-colors duration-200 ease-in-out',
                    active
                      ? 'border-primary font-semibold text-[rgba(255,255,255,0.87)]'
                      : 'border-transparent font-medium text-[rgba(255,255,255,0.6)] hover:text-[rgba(255,255,255,0.87)]',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <nav
          className="shell-scroll flex flex-1 flex-col gap-3 overflow-y-auto px-2 pt-3"
          aria-label={product}
        >
          {groups.map((group, index) => (
            <DrawerNavGroup
              key={`${group.heading ?? 'group'}-${index}`}
              group={group}
              index={index}
              pathname={pathname}
              onNavigate={(href) => {
                startNavigating(href)
                setNavOpen(false)
              }}
              onClose={() => setNavOpen(false)}
              onLaunch={(game) => {
                launchGame(game)
                setNavOpen(false)
              }}
              onOpenVipHub={() => {
                setVipHubOpen(true)
                setNavOpen(false)
              }}
              onLogin={() => {
                openAuth('login')
                setNavOpen(false)
              }}
              lastPlayed={lastPlayedGame}
              loggedIn={loggedIn}
            />
          ))}
        </nav>
      </aside>
    </div>
  )

  if (!mounted) return null
  return createPortal(drawer, document.body)
}

function DrawerNavGroup({
  group,
  index,
  pathname,
  onNavigate,
  onClose,
  onLaunch,
  onOpenVipHub,
  onLogin,
  lastPlayed,
  loggedIn,
}: {
  group: ShellNavGroup
  index: number
  pathname: string
  onNavigate: (href?: string) => void
  onClose: () => void
  onLaunch: (game: CasinoLobbyGame) => void
  onOpenVipHub: () => void
  onLogin: () => void
  lastPlayed: CasinoLobbyGame | null
  loggedIn: boolean
}) {
  const collapsible = Boolean(group.collapsible && group.heading)
  const [open, setOpen] = useState(true)
  const sectionOpen = !collapsible || open

  return (
    <div className="flex flex-col gap-1.5">
      {index > 0 ? <div className="my-1.5 h-px w-full bg-[var(--border-inverted)]" /> : null}
      {group.heading ? (
        collapsible ? (
          <div className="group/section flex items-center gap-1 px-2 py-1.5">
            <span className="min-w-0 flex-1 truncate text-xs font-medium leading-4 text-[var(--muted-foreground-inverted)]">
              {group.heading}
            </span>
            <button
              type="button"
              aria-label={open ? `Collapse ${group.heading}` : `Expand ${group.heading}`}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
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
          <p className="px-2 py-1.5 text-xs font-medium leading-4 text-[var(--muted-foreground-inverted)]">
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
            <DrawerNavItem
              key={`${group.heading ?? ''}-${item.label}`}
              item={item}
              pathname={pathname}
              onNavigate={onNavigate}
              onClose={onClose}
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

function DrawerNavItem({
  item,
  pathname,
  onNavigate,
  onClose,
  onLaunch,
  onOpenVipHub,
  onLogin,
  lastPlayed,
  loggedIn,
}: {
  item: ShellNavItem
  pathname: string
  onNavigate: (href?: string) => void
  onClose: () => void
  onLaunch: (game: CasinoLobbyGame) => void
  onOpenVipHub: () => void
  onLogin: () => void
  lastPlayed: CasinoLobbyGame | null
  loggedIn: boolean
}) {
  const iconGlyphClass = cn(
    'size-5',
    item.active ? '!bg-white' : '!bg-white/60 group-hover:!bg-white',
  )
  const itemClass = cn(
    'group flex w-full items-center gap-2 rounded-lg border-0 bg-transparent px-2 text-left text-sm font-medium leading-5 transition-colors duration-200 ease-in-out',
    item.emphasis ? 'h-11' : 'h-10',
    item.active
      ? 'bg-[var(--sidebar-primary)] font-semibold text-white'
      : 'text-white/60 hover:bg-[var(--surface-muted-1-inverted)] hover:text-white',
  )
  const body = (
    <>
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-md',
          item.emphasis ? 'size-8' : 'size-6',
          !item.active && item.emphasis && 'bg-[var(--surface-muted-1-inverted)]',
        )}
      >
        {item.iconSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.iconSrc} alt="" className="size-full rounded-md object-cover object-top" />
        ) : (
          <ShellIcon
            name={item.icon}
            tone="token"
            active={item.active}
            className={iconGlyphClass}
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{item.label}</span>
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
  )

  if (item.action === 'open-vip-hub') {
    return (
      <button type="button" className={itemClass} onClick={onOpenVipHub}>
        {body}
      </button>
    )
  }
  if (item.action && item.action !== 'open-combo-builder') {
    return (
      <button
        type="button"
        className={itemClass}
        onClick={() => {
          if (item.action === 'launch-last-game') {
            if (!loggedIn) {
              onLogin()
              return
            }
            if (!lastPlayed) {
              onClose()
              return
            }
            onLaunch(lastPlayed)
            return
          }
          onLaunch(gameForNavAction(item.action as 'launch-random'))
        }}
      >
        {body}
      </button>
    )
  }
  return (
    <Link
      href={item.href}
      aria-label={item.label}
      data-tour={promoNavTourId(item.label)}
      onClick={(event) => {
        /* V5 · Combo Builder opens over the page when the page has one; otherwise the link lands on Sports. */
        if (item.action === 'open-combo-builder' && comboBuilderHosted()) {
          event.preventDefault()
          onClose()
          openComboBuilder('all')
          return
        }
        if (isInPageHashHref(item.href, pathname)) {
          event.preventDefault()
          const id = hashFromHref(item.href)
          window.history.pushState(null, '', `#${id}`)
          window.dispatchEvent(new HashChangeEvent('hashchange'))
          onClose()
          requestAnimationFrame(() => scrollShellToId(id))
          return
        }
        onNavigate(item.href)
      }}
      className={itemClass}
    >
      {body}
    </Link>
  )
}
