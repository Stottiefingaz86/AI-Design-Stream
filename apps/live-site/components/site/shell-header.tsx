'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useGalleryDevice } from '@/components/lumen/lumen-gallery/device-context'
import { useShell, type AuthModalView } from './shell-context'
import { ShellIcon, ShellLettermark, ShellWordmark } from './shell-icons'
import { HEADER_NAV, OTHER_NAV, TABLET_NAV, headerItemActive } from './shell-nav'
import { ShellUbc, VipButton } from './shell-ubc'
import { useTapAction } from './use-tap-action'
import { cn } from '@/lib/utils'

const navItemClass =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium leading-5 transition-colors duration-150 ease-in-out active:opacity-80'

/**
 * Header brand bar (68px). Stitched with chips + glass sub-nav in sticky chrome.
 * Inner bar matches page column (`max-w-[1440px]`) so balance / VIP / UB sit on
 * the content right edge on ultra-wide — not the viewport edge.
 * No nav spinners — they flickered between soft-nav states.
 */
export function ShellHeader() {
  const pathname = usePathname()
  const galleryDevice = useGalleryDevice()
  const {
    toggle,
    loggedIn,
    openAuth,
    closeAuth,
    authOpen,
    authView,
    navOpen,
    setNavOpen,
    startNavigating,
    vipHubOpen,
    setVipHubOpen,
    pendingHref,
  } = useShell()
  const [otherOpen, setOtherOpen] = useState(false)
  /* Match shell-frame: leave home chrome as soon as soft-nav targets another product. */
  const isHome = pathname === '/' && !pendingHref

  /* Gallery device frame — ignore browser viewport breakpoints. */
  const forceMobile = galleryDevice === 'mobile'
  const forceTablet = galleryDevice === 'tablet'
  const forceDesktop = galleryDevice === 'desktop'

  const onNavClick = (href: string, active: boolean) => {
    if (active) return
    startNavigating(href)
  }

  const onMenuClick = () => {
    if (forceMobile || forceTablet) {
      setNavOpen(!navOpen)
      return
    }
    if (forceDesktop || window.matchMedia('(min-width: 1024px)').matches) toggle()
    else setNavOpen(!navOpen)
  }

  return (
    <header
      data-name="header-brand"
      className="z-[60] w-full shrink-0 overflow-visible border-b border-[var(--border-inverted)] bg-[var(--header-inverted)]"
    >
      <div
        data-header-bar=""
        className={cn(
          'mx-auto grid h-[68px] w-full max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center px-4',
          (forceDesktop || !galleryDevice) && 'lg:px-6',
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {isHome ? (
            <ShellWordmark onNavigate={() => startNavigating('/')} />
          ) : (
            <>
              <button
                type="button"
                className="shell-chrome-btn inline-flex size-9 items-center justify-center rounded-lg border-0 bg-transparent text-[var(--foreground-inverted)] transition-colors duration-200 ease-in-out hover:bg-[var(--surface-muted-1-inverted)]"
                aria-label="Toggle sidebar"
                onClick={onMenuClick}
              >
                <ShellIcon name="menu" className="size-4" />
              </button>
              <ShellLettermark
                className={cn(
                  forceMobile || forceTablet ? 'flex' : forceDesktop ? 'hidden' : 'lg:hidden',
                )}
                onNavigate={() => startNavigating('/')}
              />
            </>
          )}
          {!isHome && (forceTablet || !galleryDevice) ? (
            <span
              className={cn(
                'h-8 w-px bg-[var(--border-inverted)]',
                forceTablet ? 'block' : 'hidden md:block lg:hidden',
              )}
              aria-hidden
            />
          ) : null}
          <nav
            className={cn(
              'items-center gap-2',
              forceTablet
                ? 'flex'
                : forceMobile || forceDesktop
                  ? 'hidden'
                  : 'hidden md:flex lg:hidden',
            )}
            aria-label="Main"
          >
            {TABLET_NAV.map((item) => {
              const active = headerItemActive(item.label, pathname)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => onNavClick(item.href, active)}
                  data-state={active ? 'active' : 'default'}
                  className={cn(
                    navItemClass,
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-[var(--secondary-foreground-inverted)] hover:bg-[var(--surface-muted-1-inverted)] hover:text-[var(--foreground-inverted)]',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <span
            className={cn(
              'h-8 w-px bg-[var(--border-inverted)]',
              forceDesktop ? 'block' : forceMobile || forceTablet ? 'hidden' : 'hidden lg:block',
              isHome && 'ml-1',
            )}
            aria-hidden
          />
          <nav
            className={cn(
              'items-center gap-2',
              forceDesktop ? 'flex' : forceMobile || forceTablet ? 'hidden' : 'hidden lg:flex',
            )}
            aria-label="Main"
          >
            {HEADER_NAV.map((item) => {
              const active = headerItemActive(item.label, pathname)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => onNavClick(item.href, active)}
                  data-state={active ? 'active' : 'default'}
                  className={cn(
                    navItemClass,
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-[var(--secondary-foreground-inverted)] hover:bg-[var(--surface-muted-1-inverted)] hover:text-[var(--foreground-inverted)]',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
            <OtherMenu open={otherOpen} onOpenChange={setOtherOpen} />
          </nav>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2">
          {loggedIn ? (
            <ShellUbc />
          ) : (
            <LoggedOutChrome
              vipHubOpen={vipHubOpen}
              setVipHubOpen={setVipHubOpen}
              openAuth={openAuth}
              closeAuth={closeAuth}
              authOpen={authOpen}
              authView={authView}
            />
          )}
        </div>
      </div>
    </header>
  )
}

/** Login / Join / logged-out VIP — same control toggles; tap-lock only blocks ghost re-fires. */
function LoggedOutChrome({
  vipHubOpen,
  setVipHubOpen,
  openAuth,
  closeAuth,
  authOpen,
  authView,
}: {
  vipHubOpen: boolean
  setVipHubOpen: (open: boolean) => void
  openAuth: (view?: AuthModalView) => void
  closeAuth: () => void
  authOpen: boolean
  authView: AuthModalView
}) {
  const toggleVip = useTapAction(() => setVipHubOpen(!vipHubOpen))
  const toggleLogin = useTapAction(() => {
    if (authOpen && authView === 'login') closeAuth()
    else openAuth('login')
  })
  const toggleJoin = useTapAction(() => {
    if (authOpen && authView === 'join') closeAuth()
    else openAuth('join')
  })

  return (
    <>
      <VipButton variant="loggedOut" open={vipHubOpen} onClick={toggleVip} />
      <Button
        variant="outline"
        className="shell-chrome-btn h-9 border-[var(--border-inverted)] bg-transparent px-4 text-sm font-medium text-[var(--secondary-foreground-inverted)] hover:bg-[var(--surface-muted-1-inverted)] hover:text-[var(--foreground-inverted)] active:bg-[var(--surface-muted-1-inverted)]"
        onClick={toggleLogin}
      >
        Login
      </Button>
      <Button
        className="shell-chrome-btn h-9 px-4 text-sm font-medium active:opacity-90"
        onClick={toggleJoin}
      >
        Join
      </Button>
    </>
  )
}

function OtherMenu({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { startNavigating } = useShell()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return
      onOpenChange(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        data-state={open ? 'active' : 'default'}
        className={cn(
          navItemClass,
          open
            ? 'bg-[var(--surface-muted-1-inverted)] text-[var(--foreground-inverted)]'
            : 'text-[var(--secondary-foreground-inverted)] hover:bg-[var(--surface-muted-1-inverted)]',
        )}
        onClick={() => onOpenChange(!open)}
      >
        Other
        <ShellIcon name="caretDown" className="size-3" />
      </button>
      {open ? (
        <ul
          data-header-other-menu=""
          role="menu"
          className="absolute left-0 top-full z-[80] mt-2 w-56 rounded-md border border-border bg-popover p-1 text-sm text-popover-foreground shadow-lg"
        >
          {OTHER_NAV.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                role="menuitem"
                className="flex items-center rounded px-2 py-1.5 hover:bg-accent"
                onClick={() => {
                  onOpenChange(false)
                  startNavigating(item.href)
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
