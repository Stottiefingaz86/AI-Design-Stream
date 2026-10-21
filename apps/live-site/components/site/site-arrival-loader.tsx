'use client'

import { useEffect } from 'react'

const BOOT_ID = 'site-boot-loader'
/** At least one full logo loop. */
const BOOT_MIN_MS = 2400

function dismissBoot(el: HTMLElement) {
  el.classList.add('is-exiting')
  window.setTimeout(() => {
    el.hidden = true
    el.setAttribute('aria-hidden', 'true')
  }, 280)
}

/**
 * Dismisses the static `#site-boot-loader` in root layout after first paint.
 * The overlay itself is plain HTML so it shows before React / PassGate hydrate.
 */
export function SiteArrivalLoader() {
  useEffect(() => {
    const el = document.getElementById(BOOT_ID)
    if (!el) return

    /* Keep above everything — including PassGate blank / shell chrome. */
    document.body.appendChild(el)
    el.hidden = false
    el.classList.remove('is-exiting')

    const started = performance.now()
    let finished = false
    let dismissTimer = 0

    const finish = () => {
      if (finished) return
      finished = true
      const wait = Math.max(0, BOOT_MIN_MS - (performance.now() - started))
      dismissTimer = window.setTimeout(() => dismissBoot(el), wait)
    }

    if (document.readyState === 'complete') {
      finish()
    } else {
      window.addEventListener('load', finish, { once: true })
    }
    const safety = window.setTimeout(finish, BOOT_MIN_MS + 3000)

    return () => {
      window.removeEventListener('load', finish)
      window.clearTimeout(safety)
      window.clearTimeout(dismissTimer)
    }
  }, [])

  return null
}
