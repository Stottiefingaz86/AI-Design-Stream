'use client'

import type { ReactNode } from 'react'

/**
 * @deprecated Boot is handled by ShellProvider + FullPageLoader.
 * Kept as a passthrough so older imports keep compiling.
 */
export function SiteBootLoader({ children }: { children: ReactNode }) {
  return children
}
