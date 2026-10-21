'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconTrash } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Figma dialog-remove-device 8298:94111 — centered confirm. */
export function SecurityRemoveDeviceDialog({
  open,
  deviceName,
  onClose,
  onConfirm,
}: {
  open: boolean
  deviceName: string
  onClose: () => void
  onConfirm: () => void
}) {
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

  if (!open || !portalReady) return null

  return createPortal(
    <div
      data-security-remove-dialog=""
      className="fixed inset-0 z-[220] flex items-center justify-center bg-black/60 p-6"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="remove-device-title"
        aria-describedby="remove-device-desc"
        className={cn(
          'flex w-full max-w-[500px] flex-col gap-4 rounded-[10px] border border-border bg-popover p-6 shadow-lg',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-2.5 text-center">
          <IconTrash className="size-6 text-destructive" stroke={1.75} aria-hidden />
          <div className="flex flex-col gap-2">
            <h2 id="remove-device-title" className="text-lg font-semibold leading-7 text-foreground">
              Remove Device
            </h2>
            <p id="remove-device-desc" className="text-sm leading-5 text-muted-foreground">
              Are you sure you want to remove this trusted device?{' '}
              <span className="font-medium text-foreground">{deviceName}</span>
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="h-10 flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            className="h-10 flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={onConfirm}
          >
            Yes, Confirm
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
