'use client'

import { useEffect, useRef, useState } from 'react'

const REVEAL_EVENT = 'shell-reveal-dock'

/** Force the mobile dock visible (e.g. before odds → betslip fly). */
export function revealShellDock(holdMs = 2800) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(REVEAL_EVENT, { detail: { holdMs } }),
  )
}

/**
 * Mid-page scroll-up: sticky `top: 0` so the chrome block slides down and
 * quick-nav is fully revealed. Scroll-down / near top: `top: -chipH` again
 * (page scrolls until main nav hits the top — CSS sticky, no JS close).
 */
export function useChromeChipsRevealed() {
  const [revealed, setRevealed] = useState(false)
  const lastY = useRef(0)
  const revealedRef = useRef(false)
  const lockUntil = useRef(0)

  useEffect(() => {
    const shell = document.getElementById('shell-scroll')
    if (!shell) return

    lastY.current = shell.scrollTop

    const onScroll = () => {
      const y = Math.max(0, shell.scrollTop)
      const dy = y - lastY.current
      lastY.current = y
      const now = Date.now()

      /* Top of page — natural -chipH sticky; chips in the block at rest. */
      if (y < 16) {
        if (revealedRef.current) {
          revealedRef.current = false
          setRevealed(false)
        }
        return
      }

      if (now < lockUntil.current) return

      if (dy > 10) {
        if (revealedRef.current) {
          revealedRef.current = false
          lockUntil.current = now + 300
          setRevealed(false)
        }
      } else if (dy < -10) {
        if (!revealedRef.current) {
          revealedRef.current = true
          lockUntil.current = now + 300
          setRevealed(true)
        }
      }
    }

    shell.addEventListener('scroll', onScroll, { passive: true })
    return () => shell.removeEventListener('scroll', onScroll)
  }, [])

  return revealed
}

/**
 * Scroll-aware chrome visibility.
 * `hideOn: 'down'` — hide while scrolling down, show on the way up.
 *
 * `layoutDeltaPx` — when chrome height changes, bump `#shell-scroll` so the
 * page doesn’t feel like it accelerates (header shrinks → scrollport grows).
 */
export function useHideOnScroll(hideOn: 'down' | 'up', layoutDeltaPx = 0) {
  const [hidden, setHidden] = useState(false)
  const lastRef = useRef(0)
  const ignoreUntilRef = useRef(0)
  const hiddenRef = useRef(false)

  useEffect(() => {
    const scroller = () =>
      document.getElementById('shell-scroll') ?? document.scrollingElement ?? document.documentElement

    lastRef.current = scroller().scrollTop

    const showDock = (holdMs: number) => {
      ignoreUntilRef.current = Date.now() + holdMs
      if (hiddenRef.current) {
        hiddenRef.current = false
        setHidden(false)
      }
      lastRef.current = scroller().scrollTop
    }

    const onReveal = (e: Event) => {
      const holdMs =
        typeof (e as CustomEvent).detail?.holdMs === 'number'
          ? (e as CustomEvent).detail.holdMs
          : 2800
      showDock(holdMs)
    }

    const onScroll = () => {
      const el = scroller()
      const y = Math.max(0, el.scrollTop)

      if (Date.now() < ignoreUntilRef.current) {
        lastRef.current = y
        return
      }

      let next = hiddenRef.current
      if (y < 16) {
        next = false
      } else if (y > lastRef.current + 4) {
        next = hideOn === 'down'
      } else if (y < lastRef.current - 4) {
        next = hideOn === 'up'
      }
      lastRef.current = y

      if (next === hiddenRef.current) return
      hiddenRef.current = next

      if (layoutDeltaPx > 0) {
        const shellEl = document.getElementById('shell-scroll')
        if (shellEl) {
          const delta = next ? layoutDeltaPx : -layoutDeltaPx
          ignoreUntilRef.current = Date.now() + 320
          shellEl.scrollTop = Math.max(0, shellEl.scrollTop + delta)
          lastRef.current = shellEl.scrollTop
        }
      }

      setHidden(next)
    }

    const el = document.getElementById('shell-scroll')
    el?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener(REVEAL_EVENT, onReveal)
    return () => {
      el?.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener(REVEAL_EVENT, onReveal)
    }
  }, [hideOn, layoutDeltaPx])

  return hidden
}
