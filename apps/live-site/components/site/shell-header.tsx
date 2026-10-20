'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useShell } from './shell-context'
import { ShellIcon, ShellLettermark } from './shell-icons'
import { CHIP_NAV, HEADER_NAV, OTHER_NAV, TABLET_NAV, chipItemActive, headerItemActive } from './shell-nav'
import { useHideOnScroll } from './shell-scroll'
import { ShellUbc } from './shell-ubc'
import { cn } from '@/lib/utils'

const navItemClass =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium leading-5 transition-colors duration-200 ease-in-out'

const CHIP_STRIP_H = 48

/**
 * Desktop: 68px header-brand.
 * Mobile: product chips above the bar — hide on scroll down / show on scroll up
 * (smooth max-height + scroll compensation so the page doesn’t accelerate).
 */
export function ShellHeader() {
  const pathname = usePathname()
  const { toggle, loggedIn, setLoggedIn, navOpen, setNavOpen, startNavigating } = useShell()
  const [otherOpen, setOtherOpen] = useState(false)
  const chipsHidden = useHideOnScroll('down', CHIP_STRIP_H)

  return (
    <header data-name="header-brand" className="z-[60] w-full shrink-0 overflow-visible bg-[var(--header-inverted)]">
      <div
        className={cn(
          'max-w-full overflow-hidden border-b border-[var(--border-inverted)] lg:hidden',
          'transition-[max-height,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          chipsHidden ? 'max-h-0 border-b-0 opacity-0' : 'max-h-12 opacity-100',
        )}
        aria-hidden={chipsHidden}
      >
        <div className="scrollbar-hide max-w-full overflow-x-auto px-4 pt-1">
          <nav className="flex h-11 w-max items-center gap-2" aria-label="Products">
            {CHIP_NAV.map((item) => {
              const active = chipItemActive(item.label, pathname)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={startNavigating}
                  data-name="nav-item-outline-inverted"
                  data-state={active ? 'active' : 'default'}
                  tabIndex={chipsHidden ? -1 : undefined}
                  className={cn(
                    'inline-flex min-w-[60px] items-center justify-center border-b-2 px-[14px] py-1.5 text-sm leading-5 transition-colors duration-200 ease-in-out',
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
      </div>

      <div data-header-bar="" className="grid h-[68px] w-full grid-cols-[minmax(0,1fr)_auto] items-center border-b border-[var(--border-inverted)] px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            className="shell-chrome-btn inline-flex size-9 items-center justify-center rounded-lg border-0 bg-transparent text-[var(--foreground-inverted)] transition-colors duration-200 ease-in-out hover:bg-[var(--surface-muted-1-inverted)]"
            aria-label="Toggle sidebar"
            onClick={() => {
              if (window.matchMedia('(min-width: 1024px)').matches) toggle()
              else setNavOpen(!navOpen)
            }}
          >
            <ShellIcon name="menu" className="size-4" />
          </button>
          <ShellLettermark className="lg:hidden" />
          <span className="hidden h-8 w-px bg-[var(--border-inverted)] md:block lg:hidden" aria-hidden />
          <nav className="hidden items-center gap-2 md:flex lg:hidden" aria-label="Main">
            {TABLET_NAV.map((item) => {
              const active = headerItemActive(item.label, pathname)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={startNavigating}
                  data-state={active ? 'active' : 'default'}
                  className={cn(
                    navItemClass,
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-[var(--secondary-foreground-inverted)] hover:bg-[var(--surface-muted-1-inverted)]',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <span className="hidden h-8 w-px bg-[var(--border-inverted)] lg:block" aria-hidden />
          <nav className="hidden items-center gap-2 lg:flex" aria-label="Main">
            {HEADER_NAV.map((item) => {
              const active = headerItemActive(item.label, pathname)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={startNavigating}
                  data-state={active ? 'active' : 'default'}
                  className={cn(
                    navItemClass,
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-[var(--secondary-foreground-inverted)] hover:bg-[var(--surface-muted-1-inverted)]',
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
            <>
              <Button
                variant="outline"
                className="h-9 border-[var(--border-inverted)] bg-transparent px-4 text-sm font-medium text-[var(--secondary-foreground-inverted)] hover:bg-[var(--surface-muted-1-inverted)] hover:text-[var(--foreground-inverted)]"
                onClick={() => setLoggedIn(true)}
              >
                Login
              </Button>
              <Button className="h-9 px-4 text-sm font-medium" onClick={() => setLoggedIn(true)}>
                Join
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
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
                  startNavigating()
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
