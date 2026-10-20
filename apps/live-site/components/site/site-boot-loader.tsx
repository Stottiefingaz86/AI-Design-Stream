'use client'

import { useEffect, type ReactNode } from 'react'

const BOOT_ID = 'site-boot-loader'
const MIN_MS = 3000

function dismissBoot(el: HTMLElement) {
  el.classList.add('is-exiting')
  window.setTimeout(() => {
    el.remove()
  }, 320)
}

/**
 * Keeps the static `#site-boot-loader` on top of the shell until the page
 * has loaded. Shows on every full refresh (no session skip — for testing).
 */
export function SiteBootLoader({ children }: { children: ReactNode }) {
  useEffect(() => {
    const el = document.getElementById(BOOT_ID)
    if (!el) return

    /* Pin to <body> end so shell `fixed` chrome cannot bury it. */
    document.body.appendChild(el)
    el.hidden = false
    el.classList.remove('is-exiting')

    const started = performance.now()
    let finished = false

    const finish = () => {
      if (finished) return
      finished = true
      const wait = Math.max(0, MIN_MS - (performance.now() - started))
      window.setTimeout(() => dismissBoot(el), wait)
    }

    if (document.readyState === 'complete') {
      finish()
    } else {
      window.addEventListener('load', finish, { once: true })
    }

    const safety = window.setTimeout(finish, 10000)
    return () => {
      window.removeEventListener('load', finish)
      window.clearTimeout(safety)
    }
  }, [])

  return children
}
