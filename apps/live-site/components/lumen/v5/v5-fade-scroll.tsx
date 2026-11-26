'use client'

import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

/** Scroll area that fades its leading / trailing edge while there is more to scroll — never a hard clip. */
export function FadeScroll({
  className,
  children,
  label,
  axis = 'y',
  role,
}: {
  className?: string
  children: ReactNode
  label?: string
  axis?: 'x' | 'y'
  role?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [edge, setEdge] = useState({ back: false, more: false })
  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    setEdge(
      axis === 'y'
        ? { back: el.scrollTop > 4, more: el.scrollTop + el.clientHeight < el.scrollHeight - 4 }
        : { back: el.scrollLeft > 4, more: el.scrollLeft + el.clientWidth < el.scrollWidth - 4 },
    )
  }, [axis])
  useLayoutEffect(() => {
    measure()
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => ro.disconnect()
  }, [measure, children])
  const size = axis === 'y' ? 72 : 40
  const fade =
    edge.back || edge.more
      ? `linear-gradient(${axis === 'y' ? 'to bottom' : 'to right'}, ${edge.back ? `transparent 0, black ${size / 2}px` : 'black 0'}, ${
          edge.more ? `black calc(100% - ${size}px), transparent 100%` : 'black 100%'
        })`
      : undefined
  return (
    <div
      ref={ref}
      role={role ?? (label ? 'complementary' : undefined)}
      aria-label={label}
      onScroll={measure}
      className={className}
      style={fade ? { maskImage: fade, WebkitMaskImage: fade } : undefined}
    >
      {children}
    </div>
  )
}
