'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useShell } from './shell-context'
import { ShellIcon, ShellLogo } from './shell-icons'
import { CHIP_NAV, chipItemActive, navForProduct } from './shell-nav'
import { cn } from '@/lib/utils'

/** Mobile/tablet left nav — Figma drawer, not the desktop rail. */
export function ShellDrawer() {
  const pathname = usePathname()
  const { navOpen, setNavOpen, product } = useShell()
  const groups = navForProduct(product)
  const tabsRef = useRef<HTMLElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
        navOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      aria-hidden={!navOpen}
    >
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-black/70 transition-opacity duration-300 ease-in-out',
          navOpen ? 'opacity-100' : 'opacity-0'
        )}
        aria-label="Close menu"
        onClick={() => setNavOpen(false)}
      />
      <aside
        data-name="sidebar-drawer"
        className={cn(
          'absolute inset-y-0 left-0 flex h-full w-[311px] max-w-[83vw] flex-col overflow-hidden rounded-r-2xl border-r border-[rgba(255,255,255,0.08)] bg-[var(--sidebar-inverted)] shadow-2xl transition-transform duration-300 ease-in-out',
          navOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex shrink-0 flex-col gap-2 pb-2 pt-3">
          <div className="flex h-9 items-center justify-between px-2">
            <span className="size-9" aria-hidden />
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
              className="flex h-8 items-center justify-center rounded-md transition-colors duration-200 ease-in-out hover:bg-[var(--surface-muted-1-inverted)]"
            >
              <ShellLogo expanded />
            </button>
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
                  onClick={() => setNavOpen(false)}
                  className={cn(
                    'inline-flex shrink-0 items-center justify-center border-b-2 px-3.5 py-1.5 text-sm leading-5 transition-colors duration-200 ease-in-out',
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
        <nav className="shell-scroll flex flex-1 flex-col gap-2 overflow-y-auto px-2 pt-2" aria-label={product}>
          {groups.map((group, index) => (
                <div key={`${group.heading ?? 'group'}-${index}`} className="flex flex-col gap-1.5">
                  {index > 0 ? <div className="h-px w-full bg-[var(--border-inverted)]" /> : null}
                  {group.heading ? (
                    <p className="px-2 py-1.5 text-xs font-medium leading-4 text-[var(--muted-foreground-inverted)]">
                      {group.heading}
                    </p>
                  ) : null}
                  {group.items.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setNavOpen(false)}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-2 text-sm font-medium leading-5 transition-colors duration-200 ease-in-out',
                        item.emphasis ? 'h-11' : 'h-10',
                        item.active
                          ? 'bg-[var(--sidebar-primary)] font-semibold text-[var(--sidebar-primary-foreground)]'
                          : 'text-[var(--muted-foreground-inverted)] hover:bg-[var(--surface-muted-1-inverted)] hover:text-[var(--foreground-inverted)]'
                      )}
                    >
                      <span
                        className={cn(
                          'flex shrink-0 items-center justify-center rounded-md',
                          item.emphasis ? 'size-8' : 'size-6',
                          !item.active && item.emphasis && 'bg-[var(--surface-muted-1-inverted)]'
                        )}
                      >
                        <ShellIcon name={item.icon} active={item.active} className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate">{item.label}</span>
                        {item.subtitle ? (
                          <span className="block truncate text-[10px] font-normal leading-[14px] opacity-80">
                            {item.subtitle}
                          </span>
                        ) : null}
                      </span>
                      {item.trailing ? <ShellIcon name={item.trailing} className="size-5" /> : null}
                    </Link>
                  ))}
                </div>
              ))}
        </nav>
      </aside>
    </div>
  )

  if (!mounted) return null
  return createPortal(drawer, document.body)
}
