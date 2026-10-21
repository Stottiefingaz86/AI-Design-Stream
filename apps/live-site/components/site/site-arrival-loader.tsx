'use client'

import { useEffect, useState } from 'react'
import { FullPageLoader } from './full-page-loader'

/** One full logo loop on every hard arrival (root layout mounts once per document load). */
const BOOT_MIN_MS = 2400

/**
 * Full-page BetOnline loader for first paint after a refresh / cold open.
 * Lives in the root layout so it is not skipped by sessionStorage or ShellProvider remounts.
 * Deep-link overlays stay in ShellProvider via `startDeepLink`.
 */
export function SiteArrivalLoader() {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const started = performance.now()
    let dismissTimer = 0
    const dismiss = () => {
      const wait = Math.max(0, BOOT_MIN_MS - (performance.now() - started))
      dismissTimer = window.setTimeout(() => setOpen(false), wait)
    }

    if (document.readyState === 'complete') {
      dismiss()
    } else {
      window.addEventListener('load', dismiss, { once: true })
    }
    const safety = window.setTimeout(dismiss, BOOT_MIN_MS + 2000)

    return () => {
      window.removeEventListener('load', dismiss)
      window.clearTimeout(safety)
      window.clearTimeout(dismissTimer)
    }
  }, [])

  return <FullPageLoader open={open} />
}
