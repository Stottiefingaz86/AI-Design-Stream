'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useSiteVersion, type SiteVersionId } from '@/lib/lumen/site-versions'

/**
 * Sports routes render V3 Markets or the V1/V2 sportsbook.
 * `initial` is the server cookie read so hydration matches; `?v=3` links switch after mount.
 */
export function V3Switch({
  initial,
  v3,
  children,
}: {
  initial: SiteVersionId
  v3: ReactNode
  children: ReactNode
}) {
  const live = useSiteVersion()
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  const version = hydrated ? live : initial
  return <>{version === 'v3' ? v3 : children}</>
}
