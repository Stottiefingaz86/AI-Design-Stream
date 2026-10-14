'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useShell } from './shell-context'
import { ShellIcon, ShellLettermark } from './shell-icons'
import { CHIP_NAV, HEADER_NAV, OTHER_NAV, TABLET_NAV, chipItemActive, headerItemActive } from './shell-nav'
import { useHideOnScroll } from './shell-scroll'
import { ShellUbc } from './shell-ubc'
import { cn } from '@/lib/utils'

const navItemClass =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium leading-5 transition-colors duration-200 ease-in-out'

/**
 * Desktop: 68px header-brand, sticky.
 * Mobile/tablet: Figma nav-item-outline-inverted pills + lettermark.
 * Chip strip hides on scroll down and returns on scroll up.
 */
export function ShellHeader() {
  const pathname = usePathname()
  const { toggle, loggedIn, setLoggedIn, navOpen, setNavOpen } = useShell()
  const [otherOpen, setOtherOpen] = useState(false)
  const chipsHidden = useHideOnScroll('down')

  return (
    <header data-name="header-brand" className="sticky top-0 z-[60] w-full shrink-0 bg-[var(--header-inverted)]">
      <div
        className={cn(
          'max-w-full overflow-hidden border-b border-[var(--border-inverted)] transition-all duration-300 ease-in-out lg:hidden',
          chipsHidden ? 'max-h-0 border-b-0 opacity-0' : 'max-h-12 opacity-100'
        )}
      >
        <div className="scrollbar-hide max-w-full overflow-x-auto px-4 pt-1">
          <nav className="flex w-max items-center gap-2" aria-label="Products">
            {CHIP_NAV.map((item) => {
              const active = chipItemActive(item.label, pathname)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  data-name="nav-item-outline-inverted"
                  data-state={active ? 'active' : 'default'}
                  className={cn(
                    'inline-flex min-w-[60px] items-center justify-center border-b-2 px-[14px] py-1.5 text-sm leading-5 transition-colors duration-200 ease-in-out',
                    active
                      ? 'border-primary font-semibold text-[rgba(255,255,255,0.87)]'
                      : 'border-transparent font-medium text-[rgba(255,255,255,0.6)] hover:text-[rgba(255,255,255,0.87)]'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="grid h-[68px] w-full grid-cols-[minmax(0,1fr)_auto] items-center border-b border-[var(--border-inverted)] px-4 lg:px-6">
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
                  data-state={active ? 'active' : 'default'}
                  className={cn(
                    navItemClass,
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-[var(--secondary-foreground-inverted)] hover:bg-[var(--surface-muted-1-inverted)]'
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
                  data-state={active ? 'active' : 'default'}
                  className={cn(
                    navItemClass,
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-[var(--secondary-foreground-inverted)] hover:bg-[var(--surface-muted-1-inverted)]'
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
            <DropdownMenu open={otherOpen} onOpenChange={setOtherOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  data-state={otherOpen ? 'active' : 'default'}
                  className={cn(
                    navItemClass,
                    otherOpen
                      ? 'bg-[var(--surface-muted-1-inverted)] text-[var(--foreground-inverted)]'
                      : 'text-[var(--secondary-foreground-inverted)] hover:bg-[var(--surface-muted-1-inverted)]'
                  )}
                >
                  Other
                  <ShellIcon name="caretDown" className="size-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[180px] border-[var(--border-inverted)] bg-[var(--popover-inverted)] p-1 text-[var(--foreground-inverted)] shadow-md"
              >
                {OTHER_NAV.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    asChild
                    className="rounded-md px-2 py-2 text-sm font-normal leading-5 text-[var(--foreground-inverted)] focus:bg-[var(--surface-muted-1-inverted)] focus:text-[var(--foreground-inverted)]"
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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

