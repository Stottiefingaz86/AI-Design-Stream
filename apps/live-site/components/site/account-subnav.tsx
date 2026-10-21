'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { ACCOUNT_SECTIONS } from '@/lib/lumen/my-account'
import { useShell } from './shell-context'
import { cn } from '@/lib/utils'

type AccountSection = (typeof ACCOUNT_SECTIONS)[number]
type AccountHref = AccountSection['href']

function activeFromPath(pathname: string | null): AccountHref {
  if (!pathname) return '/account'
  for (const item of ACCOUNT_SECTIONS) {
    if (item.href === '/account') {
      if (pathname === '/account' || pathname === '/account/') return item.href
      continue
    }
    if (pathname.startsWith(item.href)) return item.href
  }
  return '/account'
}

/**
 * Account section sub-menu — same sliding pill track as casino / promotions
 * (`sub-menu` / `nav-menu-solid`). Mobile only; desktop uses the account sidebar.
 */
export function AccountSubNav({ motion = true }: { motion?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const { startNavigating } = useShell()
  const [active, setActive] = useState<AccountHref>(activeFromPath(pathname))
  const trackRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false })
  /** White label only after the red thumb finishes covering the pill. */
  const [covered, setCovered] = useState<AccountHref | null>(null)
  const firstCover = useRef(true)

  useEffect(() => {
    const next = activeFromPath(pathname)
    setActive((prev) => (prev === next ? prev : next))
  }, [pathname])

  useEffect(() => {
    if (firstCover.current) {
      firstCover.current = false
      setCovered(active)
      return
    }
    setCovered(null)
    const id = window.setTimeout(() => setCovered(active), 240)
    return () => window.clearTimeout(id)
  }, [active])

  const measureThumb = useCallback(() => {
    const track = trackRef.current
    const btn = track?.querySelector<HTMLElement>('[data-sub-menu-pill][data-active="true"]')
    if (!track || !btn) {
      setThumb((prev) => (prev.ready ? { x: 0, w: 0, ready: false } : prev))
      return
    }
    setThumb({ x: btn.offsetLeft, w: btn.offsetWidth, ready: true })
  }, [])

  useLayoutEffect(() => {
    measureThumb()
    const track = trackRef.current
    if (!track) return
    const ro = new ResizeObserver(measureThumb)
    ro.observe(track)
    return () => ro.disconnect()
  }, [active, measureThumb])

  /* Keep the active label in view so the thumb never sits over empty space. */
  useLayoutEffect(() => {
    const track = trackRef.current
    const btn = track?.querySelector<HTMLElement>('[data-sub-menu-pill][data-active="true"]')
    const scroller = scrollRef.current
    if (!track || !btn || !scroller) return
    const btnLeft = btn.offsetLeft
    const btnRight = btnLeft + btn.offsetWidth
    const viewLeft = scroller.scrollLeft
    const viewRight = viewLeft + scroller.clientWidth
    if (btnLeft < viewLeft + 8) {
      scroller.scrollTo({ left: Math.max(0, btnLeft - 16), behavior: 'smooth' })
    } else if (btnRight > viewRight - 8) {
      scroller.scrollTo({ left: btnRight - scroller.clientWidth + 16, behavior: 'smooth' })
    }
  }, [active])

  return (
    <div
      data-name="sub-menu"
      data-glass="true"
      className="w-full shrink-0 border-b border-border lg:hidden"
    >
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center">
        {/*
          Mobile: gray w-max capsule scrolls as one unit with the labels
          (same as casino / promotions sub-menu).
        */}
        <div className="min-w-0 flex-1">
          <div
            ref={scrollRef}
            data-name="sub-menu-scroll"
            className="scrollbar-hide w-full min-w-0 overflow-x-auto overflow-y-hidden"
          >
            <div
              ref={trackRef}
              data-name="sub-menu-pill-track"
              className="relative mx-4 flex h-12 w-max items-center gap-1 rounded-full bg-[var(--surface-muted-5)] p-0.5"
              role="tablist"
              aria-label="Account sections"
            >
              <span
                aria-hidden
                data-sub-menu-thumb=""
                className={cn(
                  'pointer-events-none absolute top-0.5 z-0 h-11 rounded-full bg-[#ee3536]',
                  motion &&
                    'transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                )}
                style={{ left: thumb.x, width: thumb.w, opacity: thumb.ready ? 1 : 0 }}
              />
              {ACCOUNT_SECTIONS.map((item) => {
                const on = item.href === active
                const isCovered = item.href === covered
                return (
                  <button
                    key={item.href}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    data-sub-menu-pill=""
                    data-active={on ? 'true' : 'false'}
                    data-covered={isCovered ? 'true' : 'false'}
                    onClick={() => {
                      setActive(item.href)
                      if (item.href !== pathname) {
                        startNavigating()
                        router.push(item.href)
                      }
                    }}
                    className={cn(
                      'shell-chrome-btn relative z-10 inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-transparent px-4 text-sm font-normal leading-5 whitespace-nowrap',
                      isCovered ? 'text-white' : 'text-muted-foreground',
                    )}
                  >
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
