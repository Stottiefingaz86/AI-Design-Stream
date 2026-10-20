'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconInfoCircle } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

const TIP_BG = '#2c2c2c'
const TIP_BORDER = 'rgba(255,255,255,0.14)'

/**
 * Figma 906:952403 — portals onto `[data-vip-hub-root]` (not the overflow-hidden aside)
 * so the panel is visible above the sheet content.
 */
export function LoyaltyInfoTip({
  title,
  body,
  termsLabel,
  onTermsClick,
  label = 'More information',
  onOpenChange,
}: {
  title: string
  body: string
  termsLabel?: string
  onTermsClick?: () => void
  label?: string
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const [portalEl, setPortalEl] = useState<Element | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const tipId = useId()

  const setOpenSafe = (next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)
  }

  const updateCoords = () => {
    const el = triggerRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const width = Math.min(276, window.innerWidth - 32)
    let left = r.left
    if (left + width > window.innerWidth - 16) left = window.innerWidth - 16 - width
    if (left < 16) left = 16
    let top = r.bottom + 8
    if (top + 200 > window.innerHeight - 16) {
      top = Math.max(16, r.top - 208)
    }
    setCoords({ top, left })
  }

  useLayoutEffect(() => {
    if (!open) return
    updateCoords()
    const hubRoot = triggerRef.current?.closest('[data-vip-hub-root]') ?? document.body
    setPortalEl(hubRoot)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenSafe(false)
    }
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t)) return
      if (panelRef.current?.contains(t)) return
      setOpenSafe(false)
    }
    const onReposition = () => updateCoords()
    const attachId = window.setTimeout(() => {
      document.addEventListener('pointerdown', onPointer, true)
    }, 100)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      window.clearTimeout(attachId)
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer, true)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <span className="relative inline-flex shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? tipId : undefined}
        className="inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (open) {
            setOpenSafe(false)
            return
          }
          updateCoords()
          const hubRoot = triggerRef.current?.closest('[data-vip-hub-root]') ?? document.body
          setPortalEl(hubRoot)
          setOpenSafe(true)
        }}
      >
        <IconInfoCircle className="size-4" strokeWidth={1.75} />
      </button>
      {open && portalEl
        ? createPortal(
            <div
              ref={panelRef}
              id={tipId}
              role="dialog"
              aria-label={title}
              data-vip-info-tip=""
              className="flex w-[min(276px,calc(100vw-32px))] flex-col gap-2.5 rounded-[10px] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.55)]"
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                zIndex: 20,
                backgroundColor: TIP_BG,
                border: `1px solid ${TIP_BORDER}`,
                opacity: 1,
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium leading-5" style={{ color: '#fff' }}>
                  {title}
                </p>
                <p className="text-sm leading-5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {body}
                </p>
              </div>
              {termsLabel ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="xs"
                  className="h-[26px] w-full min-w-0 max-w-none cursor-pointer rounded-lg px-2 text-xs font-medium"
                  onClick={() => {
                    onTermsClick?.()
                    setOpenSafe(false)
                  }}
                >
                  {termsLabel}
                </Button>
              ) : null}
            </div>,
            portalEl,
          )
        : null}
    </span>
  )
}
