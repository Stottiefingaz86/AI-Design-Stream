'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconChevronDown, IconFilter } from '@tabler/icons-react'
import {
  WALLPAPER_SORT_OPTIONS,
  type WallpaperSortId,
} from '@/lib/lumen/casino-wallpaper'
import { cn } from '@/lib/utils'

/**
 * Sort menu portaled to `document.body` so it never stacks under sticky
 * header / sub-nav chrome (z-35).
 */
export function WallpaperSortMenu({
  value,
  onChange,
}: {
  value: WallpaperSortId
  onChange: (id: WallpaperSortId) => void
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 140 })
  const label = WALLPAPER_SORT_OPTIONS.find((o) => o.id === value)?.label ?? 'Newest'

  useEffect(() => {
    setMounted(true)
  }, [])

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return
    const place = () => {
      const r = btnRef.current!.getBoundingClientRect()
      const width = Math.max(r.width, 140)
      setPos({
        top: r.bottom + 4,
        left: r.right - width,
        width,
      })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative shrink-0">
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort by: ${label}`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 text-xs text-foreground',
          'outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <IconFilter className="size-3.5 shrink-0 opacity-70" strokeWidth={2} aria-hidden />
        <span className="min-w-0 flex-1 truncate text-left font-medium">{label}</span>
        <IconChevronDown
          className={cn('size-3.5 shrink-0 opacity-50 transition-transform', open && 'rotate-180')}
          strokeWidth={1.5}
        />
      </button>
      {mounted && open
        ? createPortal(
            <ul
              ref={menuRef}
              role="listbox"
              aria-label="Sort options"
              style={{ top: pos.top, left: Math.max(8, pos.left), width: pos.width }}
              className="fixed z-[80] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
            >
              {WALLPAPER_SORT_OPTIONS.map((opt) => (
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
