'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { IconCalendar, IconChevronDown, IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  TX_FILTER_DATE_RANGES,
  TX_FILTER_PRODUCTS,
  TX_TYPE_OPTIONS,
  type TxFilters,
} from '@/lib/lumen/transactions'
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

function OutlinedField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="relative pt-2">
      <span className="pointer-events-none absolute left-3 top-0 z-10 bg-background px-1 text-xs font-medium leading-4 text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  )
}

function SheetSelect({
  label,
  value,
  placeholder,
  options,
  onChange,
}: {
  label?: string
  value: string
  placeholder: string
  options: readonly string[]
  onChange: (next: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [menuBox, setMenuBox] = useState<{ top: number; left: number; width: number } | null>(
    null,
  )
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const listId = useId()

  const placeMenu = () => {
    const trigger = triggerRef.current
    if (!trigger) return
    const rect = trigger.getBoundingClientRect()
    setMenuBox({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }

  useEffect(() => {
    if (!open) {
      setMenuBox(null)
      return
    }
    placeMenu()
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onReposition = () => placeMenu()
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open])

  const portalTarget =
    typeof document !== 'undefined'
      ? document.querySelector('[data-transactions-filters-root]')
      : null

  const menu =
    open && menuBox && portalTarget
      ? createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            data-transactions-select-menu=""
            style={{
              position: 'fixed',
              top: menuBox.top,
              left: menuBox.left,
              width: menuBox.width,
              zIndex: 230,
            }}
            className="max-h-60 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
          >
            {options.map((option) => {
              const selected = value === option
              return (
                <li key={option} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full rounded-md px-2 py-2 text-left text-sm transition-colors',
                      selected
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      onChange(option)
                      setOpen(false)
                    }}
                  >
                    {option}
                  </button>
                </li>
              )
            })}
          </ul>,
          portalTarget,
        )
      : null

  const control = (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={(event) => {
          event.stopPropagation()
          setOpen((prev) => !prev)
        }}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-lg border border-input bg-background px-3 text-left text-sm',
          'outline-none focus-visible:ring-2 focus-visible:ring-ring',
          !value && 'text-muted-foreground',
        )}
      >
        <span className="min-w-0 truncate">{value || placeholder}</span>
        <IconChevronDown
          className={cn(
            'size-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
          stroke={2}
          aria-hidden
        />
      </button>
      {menu}
    </div>
  )

  return label ? <OutlinedField label={label}>{control}</OutlinedField> : control
}

function formatDisplayRange(filters: TxFilters) {
  if (filters.dateRange === 'Custom' && (filters.dateFrom || filters.dateTo)) {
    const from = filters.dateFrom
      ? filters.dateFrom.replace(/(\d{4})-(\d{2})-(\d{2})/, '$2/$3/$1')
      : '—'
    const to = filters.dateTo
      ? filters.dateTo.replace(/(\d{4})-(\d{2})-(\d{2})/, '$2/$3/$1')
      : '—'
    return `${from} - ${to}`
  }
  if (filters.dateRange === 'Last 7 days') return 'Last 7 days'
  if (filters.dateRange === 'Last 15 days') return 'Last 15 days'
  if (filters.dateRange === 'Last 30 days') return '09/01/2026 - 10/01/2026'
  return filters.dateRange || 'Select dates'
}

function FiltersForm({
  value,
  onChange,
}: {
  value: TxFilters
  onChange: (next: TxFilters) => void
}) {
  const customRange = value.dateRange === 'Custom'

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-foreground">Select a Product</p>
        <SheetSelect
          label="Product"
          value={value.product}
          placeholder="Product"
          options={TX_FILTER_PRODUCTS}
          onChange={(product) => onChange({ ...value, product })}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-foreground">Select a Date Range</p>
          <SheetSelect
            label="Time"
            value={value.dateRange}
            placeholder="Time"
            options={TX_FILTER_DATE_RANGES}
            onChange={(dateRange) =>
              onChange({
                ...value,
                dateRange,
                dateFrom: dateRange === 'Custom' ? value.dateFrom : '',
                dateTo: dateRange === 'Custom' ? value.dateTo : '',
              })
            }
          />
        </div>

        <button
          type="button"
          onClick={() => {
            if (!customRange) {
              onChange({ ...value, dateRange: 'Custom' })
            }
          }}
          className={cn(
            'flex h-11 w-full items-center gap-2 rounded-lg border border-input bg-background px-3 text-left text-sm',
            'outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <IconCalendar className="size-4 shrink-0 text-muted-foreground" stroke={1.75} aria-hidden />
          <span className="min-w-0 flex-1 truncate text-foreground">{formatDisplayRange(value)}</span>
          <IconChevronDown className="size-4 shrink-0 text-muted-foreground" stroke={2} aria-hidden />
        </button>

        {customRange ? (
          <div className="grid grid-cols-2 gap-3">
            <OutlinedField label="From">
              <div className="relative">
                <input
                  type="date"
                  value={value.dateFrom}
                  onChange={(e) =>
                    onChange({ ...value, dateFrom: e.target.value, dateRange: 'Custom' })
                  }
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 pr-9 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <IconCalendar
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  stroke={1.75}
                  aria-hidden
                />
              </div>
            </OutlinedField>
            <OutlinedField label="To">
              <div className="relative">
                <input
                  type="date"
                  value={value.dateTo}
                  onChange={(e) =>
                    onChange({ ...value, dateTo: e.target.value, dateRange: 'Custom' })
                  }
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 pr-9 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <IconCalendar
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  stroke={1.75}
                  aria-hidden
                />
              </div>
            </OutlinedField>
          </div>
        ) : null}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">Transaction Type</legend>
        <div
          role="radiogroup"
          aria-label="Transaction Type"
          className="flex flex-col gap-3 rounded-lg border border-border bg-secondary p-3.5"
        >
          {TX_TYPE_OPTIONS.map((option) => {
            const checked = value.txType === option.id
            return (
              <label key={option.id || 'all'} className="flex cursor-pointer items-start gap-3">
                <span className="relative mt-0.5 inline-flex size-5 shrink-0 items-center justify-center">
                  <input
                    type="radio"
                    name="transactions-type"
                    value={option.id}
                    checked={checked}
                    onChange={() => onChange({ ...value, txType: option.id })}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      'size-5 rounded-full border border-input bg-background',
                      'peer-focus-visible:ring-2 peer-focus-visible:ring-ring',
                      checked && 'border-primary',
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      'pointer-events-none absolute size-2.5 rounded-full bg-primary opacity-0',
                      checked && 'opacity-100',
                    )}
                    aria-hidden
                  />
                </span>
                <span className="text-sm font-medium leading-5 text-foreground">{option.label}</span>
              </label>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}

/** Same portal sheet pattern as Bet History / My Bonus filters. */
export function TransactionsFiltersSheet({
  open,
  onClose,
  draft,
  onDraftChange,
  onApply,
  onClear,
}: {
  open: boolean
  onClose: () => void
  draft: TxFilters
  onDraftChange: (next: TxFilters) => void
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
    <div data-transactions-filters-root="">
      <div
        data-transactions-filters="desktop"
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

      <div
        data-transactions-filters="mobile"
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
          <div
            className="flex w-full shrink-0 items-center justify-center px-4 pb-2 pt-3"
            aria-hidden
          >
            <span className="h-1.5 w-12 rounded-full bg-foreground/25" />
          </div>
          {chrome}
        </aside>
      </div>
    </div>,
    document.body,
  )
}
