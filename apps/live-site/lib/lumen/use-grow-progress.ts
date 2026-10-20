'use client'

import { useEffect, useState } from 'react'

/** Animate a progress fill from 0 → target on first mount (VIP hub + casino banner). */
export function useGrowProgress(targetPercent: number, durationMs = 900) {
  const target = Math.min(100, Math.max(0, targetPercent))
  const [value, setValue] = useState(0)

  useEffect(() => {
    setValue(0)
    const start = performance.now()
    let raf = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - (1 - t) ** 3
      setValue(target * eased)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, durationMs])

  return value
}
