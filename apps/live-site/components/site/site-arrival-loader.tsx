'use client'

import { useEffect } from 'react'

const BOOT_ID = 'site-boot-loader'
/** At least two full logo loops (duration 2400ms each). */
const BOOT_MIN_MS = 4800

/**
 * Removes the static `#site-boot-loader` after first paint.
 * Must `remove()` — hiding left it in the body and it was stacking above the shell menu.
 */
export function SiteArrivalLoader() {
  useEffect(() => {
    const el = document.getElementById(BOOT_ID)
    if (!el) return

    /* Pin on <body> with inline fixed styles (already on the node from layout). */
    if (el.parentElement !== document.body) {
      document.body.appendChild(el)
    }
    el.style.position = 'fixed'
    el.style.inset = '0'
    el.style.zIndex = '99999'
    el.style.display = 'flex'
    el.style.alignItems = 'center'
    el.style.justifyContent = 'center'
    el.style.background = '#1a1a1a'
    el.hidden = false

    const started = performance.now()
    let finished = false
    let dismissTimer = 0

    const finish = () => {
      if (finished) return
      finished = true
      const wait = Math.max(0, BOOT_MIN_MS - (performance.now() - started))
      dismissTimer = window.setTimeout(() => {
        el.classList.add('is-exiting')
        el.style.opacity = '0'
        el.style.transition = 'opacity 0.28s ease-out'
        window.setTimeout(() => {
          el.remove()
        }, 280)
      }, wait)
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
