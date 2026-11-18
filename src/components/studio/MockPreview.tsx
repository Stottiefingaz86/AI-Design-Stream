'use client'

import { useEffect, useRef, useState } from 'react'
import { BREAKPOINTS } from '@/lib/studio/mock'

const PREVIEW_HEIGHT = 900

/**
 * Scaled iframe of a mock page so you can see what you're approving without
 * leaving the brief. Picks a device width; scales to the card's width.
 */
export function MockPreview({ url, label }: { url: string; label?: string }) {
  const isFigma = /figma\.com\//i.test(url)
  const [bp, setBp] = useState<number>(BREAKPOINTS[0].width)
  const [w, setW] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(e?.contentRect.width ?? 0))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  if (isFigma) {
    return (
      <div className="ge-mock">
        <div className="ge-mock__bar">
          <span>{label ?? 'Figma'}</span>
          <a href={url} target="_blank" rel="noreferrer">
            Open in Figma ↗
          </a>
        </div>
        <a className="ge-mock__figma" href={url} target="_blank" rel="noreferrer">
          Design mock — open the Figma file
        </a>
      </div>
    )
  }
  const base = url.replace(/[&?]view=frames/, '')
  const bare = base.includes('?') ? `${base}&bare=1` : `${base}?bare=1`
  const useW = bp
  const useScale = w ? Math.min(1, w / bp) : 0
  return (
    <div className="ge-mock">
      <div className="ge-mock__bar">
        <span>{label ?? 'Preview'}</span>
        <span className="ge-mock__bps">
          {BREAKPOINTS.map((b) => (
            <button
              key={b.id}
              type="button"
              className={bp === b.width ? 'is-on' : ''}
              onClick={() => setBp(b.width)}
            >
              {b.id}
            </button>
          ))}
        </span>
        <a href={url} target="_blank" rel="noreferrer">
          Open full size ↗
        </a>
      </div>
      <div
        className="ge-mock__viewport"
        ref={ref}
        style={{ height: useScale ? PREVIEW_HEIGHT * useScale : 240 }}
      >
        {useScale ? (
          <iframe
            title={label ?? 'Mock preview'}
            src={bare}
            loading="lazy"
            style={{
              width: useW,
              height: PREVIEW_HEIGHT,
              transform: `scale(${useScale})`,
              transformOrigin: 'top left',
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
