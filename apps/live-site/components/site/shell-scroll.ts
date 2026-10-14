'use client'

import { useEffect, useState } from 'react'

/**
 * Scroll-aware chrome visibility.
 * `hideOn: 'down'` — chips: hide while scrolling down, show on the way up.
 * `hideOn: 'up'` — dock: opposite of the chips.
 */
export function useHideOnScroll(hideOn: 'down' | 'up') {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const scroller = () =>
      document.getElementById('shell-scroll') ?? document.scrollingElement ?? document.documentElement
    let last = scroller().scrollTop
    const onScroll = () => {
      const y = Math.max(0, scroller().scrollTop)
      if (y < 16) {
        setHidden(false)
      } else if (y > last + 4) {
        setHidden(hideOn === 'down')
      } else if (y < last - 4) {
        setHidden(hideOn === 'up')
      }
      last = y
    }
    const el = document.getElementById('shell-scroll')
    el?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      el?.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
    }
  }, [hideOn])

  return hidden
}
