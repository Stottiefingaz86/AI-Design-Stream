'use client'

import { createElement, useEffect, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

/**
 * BetOnline full-logo loader — wraps the custom element from `/betonline-loader.js`.
 * Transparent host; parent supplies the full-page backdrop.
 */
export function BetOnlineLoader({
  width = 320,
  duration = 2400,
  src = '/betonline-loader.js',
  className,
}: {
  width?: number
  duration?: number
  src?: string
  className?: string
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let alive = true
    if (
      !customElements.get('betonline-loader') &&
      !document.querySelector('script[data-betonline-loader]')
    ) {
      const script = document.createElement('script')
      script.src = src
      script.dataset.betonlineLoader = 'true'
      script.onerror = () => {
        script.remove()
        console.error('BetOnline loader script could not be loaded:', src)
      }
      document.head.appendChild(script)
    }
    customElements.whenDefined('betonline-loader').then(() => {
      if (alive) setReady(true)
    })
    return () => {
      alive = false
    }
  }, [src])

  const style = {
    '--loader-width': `${width}px`,
    width,
    maxWidth: '100%',
    aspectRatio: '173 / 70',
  } as CSSProperties

  return (
    <div className={cn(className)} style={style} role="status" aria-label="Loading">
      {ready
        ? createElement('betonline-loader', {
            key: duration,
            duration: String(duration),
            'aria-hidden': 'true',
          })
        : null}
    </div>
  )
}
