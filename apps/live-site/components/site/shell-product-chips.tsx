'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  galleryIsCompact,
  useGalleryDevice,
} from '@/components/lumen/lumen-gallery/device-context'
import { useShell } from './shell-context'
import { CHIP_NAV, chipItemActive } from './shell-nav'
import { cn } from '@/lib/utils'

function ChipSpinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block size-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-90',
        className,
      )}
    />
  )
}

/**
 * Mobile/tablet product quick-links. Stitched into sticky chrome with header +
 * glass sub-nav — not a separate sticky of its own.
 */
export function ShellProductChips({ className }: { className?: string }) {
  const pathname = usePathname()
  const galleryCompact = galleryIsCompact(useGalleryDevice())
  const { startNavigating, pendingHref } = useShell()
  const [pendingHrefLocal, setPendingHrefLocal] = useState<string | null>(null)

  useEffect(() => {
    setPendingHrefLocal(null)
  }, [pathname])

  useEffect(() => {
    if (!pendingHref) setPendingHrefLocal(null)
  }, [pendingHref])

  return (
    <div
      data-name="product-chips"
      className={cn(
        'w-full shrink-0 border-b border-[var(--border-inverted)] bg-[var(--header-inverted)]',
        /* Live: mobile/tablet only. Gallery device frame overrides viewport. */
        galleryCompact === true
          ? 'block'
          : galleryCompact === false
            ? 'hidden'
            : 'lg:hidden',
        className,
      )}
    >
      <div className="scrollbar-hide max-w-full overflow-x-auto px-4 pt-1">
        <nav className="flex h-11 w-max items-center gap-2" aria-label="Products">
          {CHIP_NAV.map((item) => {
            const active = chipItemActive(item.label, pathname)
            const loading = pendingHrefLocal === item.href
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => {
                  if (active) return
                  setPendingHrefLocal(item.href)
                  startNavigating(item.href)
                }}
                aria-busy={loading || undefined}
                data-name="nav-item-outline-inverted"
                data-state={active ? 'active' : loading ? 'loading' : 'default'}
                className={cn(
                  'inline-flex min-w-[60px] items-center justify-center gap-1.5 border-b-2 px-[14px] py-1.5 text-sm leading-5 transition-colors duration-150 ease-in-out',
                  'active:opacity-80',
                  active
                    ? 'border-primary font-semibold text-[rgba(255,255,255,0.87)]'
                    : loading
                      ? 'border-primary/60 font-medium text-[rgba(255,255,255,0.87)]'
                      : 'border-transparent font-medium text-[rgba(255,255,255,0.6)] hover:text-[rgba(255,255,255,0.87)]',
                )}
              >
                {loading ? <ChipSpinner /> : null}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
