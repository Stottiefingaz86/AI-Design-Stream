'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { BetOnlineLoader } from './betonline-loader'
import { cn } from '@/lib/utils'

/**
 * Full-viewport BetOnline loader (centered, looping).
 *
 * Show when:
 * - First arrival / boot into the shell
 * - Deep-link redirects (UBC → account pages, poker → promotions?filter=poker, etc.)
 *
 * Do NOT show for top-menu / product-chip / sub-nav product switches
 * (Casino ↔ Sports ↔ Poker ↔ Promotions) — those use soft-nav skeletons only.
 */
export function FullPageLoader({ open }: { open: boolean }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !open) return null

  return createPortal(
    <div
      data-name="full-page-loader"
      role="alertdialog"
      aria-busy
      aria-label="Loading"
      className={cn(
        'pointer-events-auto fixed inset-0 z-[9999] flex items-center justify-center',
        'bg-[#101012]',
      )}
    >
      <BetOnlineLoader width={320} duration={2400} className="px-6" />
    </div>,
    document.body,
  )
}
