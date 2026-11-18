'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconChevronDown } from '@tabler/icons-react'
import { cn } from '@/lib/utils'

/** Match RAF / cashier fields — solid elevated fill. */
const FIELD = 'rounded-lg border border-input bg-popover'

/**
 * Sort/filter box — body-portaled menu (no Radix Select).
 * Shell CSS crushes Radix Select portals and can inert the whole page.
 */
export function FilterSelectBox<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
  triggerClassName,
}: {
  label: string
  value: T
  options: { id: T; label: string }[]
  onChange: (id: T) => void
  className?: string
  triggerClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 148 })
  const selected = options.find((o) => o.id === value)?.label ?? value

  useEffect(() => {
    setPortalReady(true)
  }, [])

  const updateCoords = () => {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const width = Math.max(r.width, 148)
    let left = r.left
    if (left + width > window.innerWidth - 8) left = window.innerWidth - width - 8
    if (left < 8) left = 8
    setCoords({ top: r.bottom + 4, left, width })
  }

  useLayoutEffect(() => {
    if (!open) return
    updateCoords()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopImmediatePropagation()
      setOpen(false)
    }
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onReposition = () => updateCoords()
    const attachId = window.setTimeout(() => {
      document.addEventListener('pointerdown', onPointer, true)
    }, 0)
    document.addEventListener('keydown', onKey, true)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.clearTimeout(attachId)
      document.removeEventListener('pointerdown', onPointer, true)
      document.removeEventListener('keydown', onKey, true)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open])

  return (
    <div className={cn('relative shrink-0', className)}>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${selected}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => {
          if (open) {
            setOpen(false)
            return
          }
          updateCoords()
          setOpen(true)
        }}
        className={cn(
          FIELD,
          'inline-flex h-9 items-center justify-between gap-2 px-3 text-sm',
          'outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring',
          triggerClassName,
        )}
      >
        <span className="min-w-0 flex-1 truncate text-left text-muted-foreground">
          {label}: <span className="text-foreground">{selected}</span>
        </span>
        <IconChevronDown
          className={cn(
            'size-4 shrink-0 opacity-50 transition-transform',
            open && 'rotate-180',
          )}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>
      {open && portalReady
        ? createPortal(
            <ul
              ref={menuRef}
              role="listbox"
              aria-label={label}
              data-trends-filter-menu=""
              className="overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                width: coords.width,
                zIndex: 260,
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {options.map((opt) => (
                <li key={opt.id} role="option" aria-selected={opt.id === value}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full cursor-pointer items-center rounded-sm px-2 py-1.5 text-left text-sm outline-none',
                      'hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent',
                      opt.id === value && 'bg-accent text-accent-foreground',
                    )}
                    onClick={() => {
                      onChange(opt.id)
                      setOpen(false)
                    }}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>,
            document.body,
          )
        : null}
    </div>
  )
}
