'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-aware chrome visibility.
 * `hideOn: 'down'` — hide while scrolling down, show on the way up.
 * Chips and the mobile dock both use `down` so they show and hide together.
 *
 * `layoutDeltaPx` — when chrome height changes with `hidden`, compensate
 * `#shell-scroll` so collapsing the strip does not feel like a scroll jump.
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

    const onScroll = () => {
      const el = scroller()
      const y = Math.max(0, el.scrollTop)

      // Ignore programmatic compensation from chrome show/hide.
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
        const shell = document.getElementById('shell-scroll')
        if (shell) {
          // Header shrank → scrollport grew upward; bump scrollTop to keep content pinned.
          // Header grew → reverse.
          const delta = next ? layoutDeltaPx : -layoutDeltaPx
          ignoreUntilRef.current = Date.now() + 120
          shell.scrollTop = Math.max(0, shell.scrollTop + delta)
          lastRef.current = shell.scrollTop
        }
      }

      setHidden(next)
    }

    const el = document.getElementById('shell-scroll')
    el?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el?.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
    }
  }, [hideOn, layoutDeltaPx])

  return hidden
}
