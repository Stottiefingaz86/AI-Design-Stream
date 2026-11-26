'use client'

import { useCallback, useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react'

/**
 * V5 · edge fade for horizontal rails and banner carousels: the side with more to scroll fades out
 * (56px leading, 88px trailing) instead of clipping a card in half. Same mask as the V5 shelves.
 */
export function edgeFadeMask(back: boolean, more: boolean): CSSProperties | undefined {
  if (!back && !more) return undefined
  const mask = `linear-gradient(to right, ${back ? 'transparent 0, black 56px' : 'black 0'}, ${
    more ? 'black calc(100% - 88px), transparent 100%' : 'black 100%'
  })`
  return { maskImage: mask, WebkitMaskImage: mask }
}

/** Edge fade for a plain overflow-x scroller (not Embla) — tracks scroll and size. */
export function useScrollEdgeFade(ref: RefObject<HTMLElement>, enabled: boolean): CSSProperties | undefined {
  const [edge, setEdge] = useState({ back: false, more: false })
  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    setEdge((prev) => {
      const next = { back: el.scrollLeft > 4, more: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 }
      return prev.back === next.back && prev.more === next.more ? prev : next
    })
  }, [ref])
  useLayoutEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => {
      el.removeEventListener('scroll', measure)
      ro.disconnect()
    }
  }, [enabled, measure, ref])
  return enabled ? edgeFadeMask(edge.back, edge.more) : undefined
}
