'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BONUS_FILTER_DATE_RANGES,
  BONUS_FILTER_STATUSES,
  type BonusFilters,
} from '@/lib/lumen/my-bonus'
import { cn } from '@/lib/utils'

function useAnimatedOpen(open: boolean) {
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setShown(false)
      let timeout = 0
      const frame = window.requestAnimationFrame(() => {
        timeout = window.setTimeout(() => setShown(true), 24)
      })
      return () => {
        window.cancelAnimationFrame(frame)
        window.clearTimeout(timeout)
      }
    }
    setShown(false)
    const timer = window.setTimeout(() => setMounted(false), 320)
    return () => window.clearTimeout(timer)
  }, [open])

  return { mounted, shown }
}

function FiltersForm({
  value,
  onChange,
}: {
  value: BonusFilters
  onChange: (next: BonusFilters) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Select a Status</label>
        <Select
          value={value.status || undefined}
          onValueChange={(status) => onChange({ ...value, status })}
        >
          <SelectTrigger className="h-10 border-border bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="z-[220]">
            {BONUS_FILTER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Select a Date Range</label>
        <Select
          value={value.dateRange || undefined}
          onValueChange={(dateRange) => onChange({ ...value, dateRange, specificDate: '' })}
        >
          <SelectTrigger className="h-10 border-border bg-background">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent className="z-[220]">
            {BONUS_FILTER_DATE_RANGES.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">OR</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-muted-foreground">Select a Specific Date</label>
        <input
          type="date"
          value={value.specificDate}
          onChange={(e) => onChange({ ...value, specificDate: e.target.value, dateRange: '' })}
          className={cn(
            'flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm',
            'outline-none focus-visible:ring-2 focus-visible:ring-ring',
            !value.specificDate && 'text-muted-foreground',
          )}
          aria-label="Pick a Date"
        />
      </div>
    </div>
  )
}

/** Promo26 filter sheet — same portal pattern as VIP Hub (z-200 above shell). */
export function MyBonusFiltersSheet({
  open,
  onClose,
  draft,
  onDraftChange,
  onApply,
  onClear,
}: {
  open: boolean
  onClose: () => void
  draft: BonusFilters
  onDraftChange: (next: BonusFilters) => void
  onApply: () => void
  onClear: () => void
}) {
  const { mounted, shown } = useAnimatedOpen(open)
  const [portalReady, setPortalReady] = useState(false)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!mounted || !portalReady) return null

  const footer = (
    <div className="flex w-full gap-3 border-t border-border p-4">
      <Button type="button" variant="outline" className="h-10 flex-1" onClick={onClear}>
        Clear All
      </Button>
      <Button type="button" className="h-10 flex-1" onClick={onApply}>
        Apply
      </Button>
    </div>
  )

  const chrome = (
    <>
      <header className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
        <button
          type="button"
          aria-label="Close filters"
          onClick={onClose}
          className="inline-flex size-8 items-center justify-center rounded-md text-foreground hover:bg-accent"
        >
          <IconX className="size-4" stroke={2} />
        </button>
        <h2 className="text-base font-semibold text-foreground">Sort & Filters</h2>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <FiltersForm value={draft} onChange={onDraftChange} />
      </div>
      {footer}
    </>
  )

  return createPortal(
    <div data-my-bonus-filters-root="">
      {/* Desktop — right sheet */}
      <div
        data-my-bonus-filters="desktop"
        className={cn(
          'pointer-events-none fixed inset-0 z-[200] hidden md:block',
          shown && 'pointer-events-auto',
        )}
      >
        <button
          type="button"
          aria-label="Close filters"
          onClick={onClose}
          className={cn(
            'absolute inset-0 border-0 bg-black/60 transition-opacity duration-300',
            shown ? 'opacity-100' : 'opacity-0',
          )}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Sort & Filters"
          data-state={shown ? 'open' : 'closed'}
          className={cn(
            'absolute inset-y-0 right-0 flex w-full max-w-[384px] flex-col overflow-hidden border-l border-border bg-background text-foreground shadow-lg transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            shown ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          {chrome}
        </aside>
      </div>

      {/* Mobile — bottom drawer */}
      <div
        data-my-bonus-filters="mobile"
        className={cn(
          'pointer-events-none fixed inset-0 z-[200] md:hidden',
          shown && 'pointer-events-auto',
        )}
      >
        <button
          type="button"
          aria-label="Close filters"
          onClick={onClose}
          className={cn(
            'absolute inset-0 border-0 bg-black/60 transition-opacity duration-300',
            shown ? 'opacity-100' : 'opacity-0',
          )}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Sort & Filters"
          data-state={shown ? 'open' : 'closed'}
          className={cn(
            'absolute inset-x-0 bottom-0 flex max-h-[85svh] flex-col overflow-hidden rounded-t-[16px] bg-background text-foreground shadow-[0_0_16px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            shown ? 'translate-y-0' : 'translate-y-full',
          )}
        >
          <div className="flex w-full shrink-0 items-center justify-center px-4 pb-1 pt-2">
            <span className="h-1.5 w-12 rounded-full bg-muted-foreground/40" />
          </div>
          {chrome}
        </aside>
      </div>
    </div>,
    document.body,
  )
}
