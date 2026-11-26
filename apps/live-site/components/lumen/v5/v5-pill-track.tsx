'use client'

import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

/**
 * V5 sub-nav — the V1 ModePillTrack look (red thumb sliding under the pills) with the casino
 * sub-nav's overflow: no scrollbar ever, the capsule clips, glass chevrons appear on the edge
 * that has more (desktop), phones just swipe.
 */
export function V5PillTrack<T extends string>({
  active,
  onChange,
  modes,
  ariaLabel,
  className,
}: {
  active: T
  onChange: (id: T) => void
  modes: { id: T; label: string }[]
  ariaLabel: string
  className?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false })
  const [covered, setCovered] = useState(active)
  const [edge, setEdge] = useState({ back: false, more: false })

  const measure = useCallback(() => {
    const track = trackRef.current
    const btn = track?.querySelector<HTMLElement>('[data-active="true"]')
    if (track && btn) setThumb({ x: btn.offsetLeft, w: btn.offsetWidth, ready: true })
    const el = scrollRef.current
    if (el) setEdge({ back: el.scrollLeft > 2, more: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 })
  }, [])

  useLayoutEffect(() => {
    measure()
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (trackRef.current) ro.observe(trackRef.current)
    return () => ro.disconnect()
  }, [active, modes, measure])

  useLayoutEffect(() => {
    const id = window.setTimeout(() => setCovered(active), 280)
    /* Keep the active pill in view. */
    const btn = trackRef.current?.querySelector<HTMLElement>('[data-active="true"]')
    const el = scrollRef.current
    if (btn && el) {
      const l = btn.offsetLeft
      const r = l + btn.offsetWidth
      if (l < el.scrollLeft || r > el.scrollLeft + el.clientWidth) el.scrollTo({ left: l - 24, behavior: 'smooth' })
    }
    return () => window.clearTimeout(id)
  }, [active])

  const by = (d: 1 | -1) => {
    const el = scrollRef.current
    if (el) el.scrollBy({ left: d * Math.min(240, el.clientWidth * 0.7), behavior: 'smooth' })
  }

  const fade = `linear-gradient(to right, ${edge.back ? 'transparent 0, black 48px' : 'black 0'}, ${
    edge.more ? 'black calc(100% - 64px), transparent 100%' : 'black 100%'
  })`

  return (
    <div data-name="v5-pill-track" className={cn('relative -mx-4 min-w-0 md:mx-0', className)}>
      {/*
        Phone: the grey capsule scrolls edge to edge as one unit (casino sub-nav).
        md+: the capsule clips, fades at the edge with more, glass chevrons step it.
      */}
      <div className="w-full md:w-max md:max-w-full md:overflow-hidden md:rounded-full">
        <div
          ref={scrollRef}
          onScroll={measure}
          className="scrollbar-hide w-full overflow-x-auto overflow-y-hidden md:[-webkit-mask-image:var(--v5-fade)] md:[mask-image:var(--v5-fade)]"
          style={{ ['--v5-fade' as string]: edge.back || edge.more ? fade : 'none' }}
        >
          <div
            ref={trackRef}
            role="tablist"
            aria-label={ariaLabel}
            className="relative mx-4 flex h-12 w-max items-center gap-1 rounded-full bg-secondary p-0.5 md:mx-0"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute top-0.5 h-11 rounded-full bg-primary transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ left: thumb.x, width: thumb.w, opacity: thumb.ready ? 1 : 0 }}
            />
            {modes.map((m) => {
              const on = m.id === active
              return (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  data-active={on ? 'true' : 'false'}
                  onClick={() => onChange(m.id)}
                  className={cn(
                    'relative z-10 h-11 shrink-0 rounded-full px-4 text-sm leading-5 transition-colors',
                    m.id === covered ? 'font-medium text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      {edge.back ? (
        <button
          type="button"
          aria-label={`Scroll ${ariaLabel} back`}
          onClick={() => by(-1)}
          className="absolute left-1 top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center v5-glass rounded-full border border-border text-foreground hover:bg-accent md:inline-flex"
        >
          <IconChevronLeft className="size-4" stroke={2} />
        </button>
      ) : null}
      {edge.more ? (
        <button
          type="button"
          aria-label={`Scroll ${ariaLabel} forward`}
          onClick={() => by(1)}
          className="absolute right-1 top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center v5-glass rounded-full border border-border text-foreground hover:bg-accent md:inline-flex"
        >
          <IconChevronRight className="size-4" stroke={2} />
        </button>
      ) : null}
    </div>
  )
}
