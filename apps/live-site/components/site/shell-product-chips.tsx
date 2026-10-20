'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useShell } from './shell-context'
import { CHIP_NAV, chipItemActive } from './shell-nav'
import { cn } from '@/lib/utils'

/**
 * Mobile/tablet product quick-links. Lives in `#shell-scroll` (not sticky) so
 * the first scroll naturally pushes them away — then header + sub-nav stick
 * and content can frost under the glass. No max-height / scrollTop snap.
 */
export function ShellProductChips() {
  const pathname = usePathname()
  const { startNavigating } = useShell()

  return (
    <div
      data-name="product-chips"
      className="w-full shrink-0 border-b border-[var(--border-inverted)] bg-[var(--header-inverted)] lg:hidden"
    >
      <div className="scrollbar-hide max-w-full overflow-x-auto px-4 pt-1">
        <nav className="flex h-11 w-max items-center gap-2" aria-label="Products">
          {CHIP_NAV.map((item) => {
            const active = chipItemActive(item.label, pathname)
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={startNavigating}
                data-name="nav-item-outline-inverted"
                data-state={active ? 'active' : 'default'}
                className={cn(
                  'inline-flex min-w-[60px] items-center justify-center border-b-2 px-[14px] py-1.5 text-sm leading-5 transition-colors duration-200 ease-in-out',
                  active
                    ? 'border-primary font-semibold text-[rgba(255,255,255,0.87)]'
                    : 'border-transparent font-medium text-[rgba(255,255,255,0.6)] hover:text-[rgba(255,255,255,0.87)]',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
