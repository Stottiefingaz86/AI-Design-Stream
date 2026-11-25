'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useSiteVersion, type SiteVersionId } from '@/lib/lumen/site-versions'

/**
 * V5 · Combos owns the sports routes when picked in the messenger; every other version
 * renders `children` untouched. `initial` is the server cookie so hydration matches.
 */
export function V5Switch({
  initial,
  v5,
  children,
}: {
  initial: SiteVersionId
  v5: ReactNode
  children: ReactNode
}) {
  const live = useSiteVersion()
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  const version = hydrated ? live : initial
  return <>{version === 'v5' ? v5 : children}</>
}
