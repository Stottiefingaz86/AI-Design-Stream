'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Animate VIP progress fill. First paint grows 0 → target; later bumps
 * ease from the previous value → new target (game close / rakeback).
 * Always commits the live value into `fromRef` on cleanup so rapid
 * 100→0→bump sequences (level-up) don’t leave the bar stuck.
 */
export function useGrowProgress(targetPercent: number, durationMs = 900) {
  const target = Math.min(100, Math.max(0, targetPercent))
  const [value, setValue] = useState(0)
  const fromRef = useRef(0)
  const liveRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    const start = performance.now()
    let raf = 0
    let live = from
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - (1 - t) ** 3
      live = from + (target - from) * eased
      liveRef.current = live
      setValue(live)
      if (t < 1) {
        raf = requestAnimationFrame(step)
      } else {
        fromRef.current = target
        liveRef.current = target
      }
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      fromRef.current = liveRef.current
    }
  }, [target, durationMs])

  return value
}
