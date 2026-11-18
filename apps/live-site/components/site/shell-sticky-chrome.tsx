'use client'

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  galleryIsCompact,
  useGalleryDevice,
} from '@/components/lumen/lumen-gallery/device-context'
import { ShellHeader } from './shell-header'
import { ShellProductChips } from './shell-product-chips'
import { useChromeChipsRevealed } from './shell-scroll'

const CHIP_H_FALLBACK = 52
const MOTION_MS = 300
const MOTION_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const MOBILE_MQ = '(max-width: 1023px)'

/**
 * One block: quick-nav + main nav + sub-nav.
 *
 * Mobile sticky top = -chipH → page scrolls until main nav hits the top, then
 * sticks (chips above the fold). Scroll-up sets top = 0 → same block slides
 * down until quick-nav is fully down, then sticks. Glass sub-nav stays as-is.
 */
export function ShellStickyChrome({ subNav }: { subNav?: ReactNode }) {
  const galleryDevice = useGalleryDevice()
  const galleryCompact = galleryIsCompact(galleryDevice)
  const chipRef = useRef<HTMLDivElement>(null)
  const [chipH, setChipH] = useState(CHIP_H_FALLBACK)
  const [isMobile, setIsMobile] = useState(() =>
    galleryCompact != null
      ? galleryCompact
      : typeof window !== 'undefined'
        ? window.matchMedia(MOBILE_MQ).matches
        : false,
  )
  const [allowTopMotion, setAllowTopMotion] = useState(false)
  const chipsRevealed = useChromeChipsRevealed()

  useLayoutEffect(() => {
    let removeMq: (() => void) | undefined
    if (galleryCompact != null) {
      setIsMobile(galleryCompact)
    } else {
      const mq = window.matchMedia(MOBILE_MQ)
      const syncMq = () => setIsMobile(mq.matches)
      syncMq()
      mq.addEventListener('change', syncMq)
      removeMq = () => mq.removeEventListener('change', syncMq)
    }

    const measure = () => {
      const el = chipRef.current
      if (!el) return
      const h = Math.round(el.offsetHeight || el.scrollHeight)
      if (h > 0) setChipH(h)
    }
    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    if (chipRef.current) ro?.observe(chipRef.current)
    window.addEventListener('resize', measure)
    /* Enable top transition after first measure — avoids open animation on load. */
    const t = window.setTimeout(() => setAllowTopMotion(true), 50)
    return () => {
      removeMq?.()
      ro?.disconnect()
      window.removeEventListener('resize', measure)
      window.clearTimeout(t)
    }
  }, [subNav, galleryCompact])

  /* Desktop / SSR: 0. Mobile default: -chipH. Scroll-up reveal: 0. */
  const stickyTopPx = !isMobile ? 0 : chipsRevealed ? 0 : -chipH

  /* Visible chrome height → `--shell-chrome-h` so page rails stick right under the sub-nav. */
  const rootRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const publish = () => {
      const visible = Math.max(0, Math.round(el.offsetHeight + stickyTopPx))
      document.documentElement.style.setProperty('--shell-chrome-h', `${visible}px`)
    }
    publish()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(publish) : null
    ro?.observe(el)
    return () => ro?.disconnect()
  }, [stickyTopPx, subNav])

  const style = {
    ['--shell-sticky-top' as string]: `${stickyTopPx}px`,
    /* Also set `top` so motion works outside `[data-name=Product Page]` (gallery). */
    top: stickyTopPx,
    ...(isMobile && allowTopMotion
      ? { transition: `top ${MOTION_MS}ms ${MOTION_EASE}` }
      : undefined),
  } satisfies CSSProperties

  return (
    <div
      ref={rootRef}
      data-shell-sticky-chrome=""
      data-chips-revealed={chipsRevealed ? 'true' : 'false'}
      className="sticky z-[70]"
      style={style}
    >
      {/* Opaque fill only on chips + header — never wrap glass sub-nav. */}
      <div ref={chipRef}>
        <ShellProductChips />
      </div>
      <div className="relative bg-[var(--header-inverted)] pt-px">
        <ShellHeader />
      </div>
      {subNav}
    </div>
  )
}
