'use client'

import { useEffect, useRef, useState } from 'react'

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
        const shell = document.getElementById('shell-scroll')
        if (shell) {
          const delta = next ? layoutDeltaPx : -layoutDeltaPx
          ignoreUntilRef.current = Date.now() + 320
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
