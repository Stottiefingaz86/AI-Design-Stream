'use client'

import { useCallback, useEffect, useRef, type MouseEvent, type PointerEvent } from 'react'

/**
 * Debounce chrome taps so iOS “ghost clicks” can’t undo the action.
 *
 * Typical failure: tap opens VIP → ~300ms synthetic click hits the same
 * button → toggle closes it → feels like every control needs 2 taps.
 * Locking the control briefly makes the ghost a no-op.
 */
export function useTapAction(action: () => void, lockMs = 550) {
  const lockUntil = useRef(0)

  return useCallback(() => {
    const now = Date.now()
    if (now < lockUntil.current) return
    lockUntil.current = now + lockMs
    action()
  }, [action, lockMs])
}

/**
 * Ignore backdrop dismiss for a beat after open so the opening tap’s ghost
 * click can’t immediately close the sheet.
 */
export function useBackdropClose(open: boolean, onClose: () => void, graceMs = 550) {
  const armedAt = useRef(0)

  useEffect(() => {
    if (open) armedAt.current = Date.now() + graceMs
  }, [open, graceMs])

  return useCallback(() => {
    if (Date.now() < armedAt.current) return
    onClose()
  }, [onClose])
}

/**
 * Fire on first intentional press — beats Embla / overflow-x eating the click
 * (feels like “need 2 taps or a long press”). Touch/pen activate on pointerup
 * if movement stayed under the cancel threshold; mouse keeps native click.
 */
export function usePressHandlers(
  action: () => void,
  opts?: { moveCancelPx?: number; disabled?: boolean },
) {
  const moveCancelPx = opts?.moveCancelPx ?? 14
  const disabled = opts?.disabled ?? false
  const start = useRef<{ x: number; y: number } | null>(null)
  const touchFired = useRef(false)
  const actionRef = useRef(action)
  actionRef.current = action

  const onPointerDown = useCallback(
    (event: PointerEvent) => {
      if (disabled || event.button !== 0) return
      start.current = { x: event.clientX, y: event.clientY }
      touchFired.current = false
    },
    [disabled],
  )

  const onPointerUp = useCallback(
    (event: PointerEvent) => {
      if (disabled || !start.current) return
      const dx = Math.abs(event.clientX - start.current.x)
      const dy = Math.abs(event.clientY - start.current.y)
      start.current = null
      if (dx > moveCancelPx || dy > moveCancelPx) return
      /* Mouse: let onClick handle it (avoids double-fire). */
      if (event.pointerType === 'mouse') return
      touchFired.current = true
      actionRef.current()
    },
    [disabled, moveCancelPx],
  )

  const onPointerCancel = useCallback(() => {
    start.current = null
  }, [])

  const onClick = useCallback(
    (event: MouseEvent) => {
      if (disabled) return
      if (touchFired.current) {
        touchFired.current = false
        event.preventDefault()
        event.stopPropagation()
        return
      }
      actionRef.current()
    },
    [disabled],
  )

  return { onPointerDown, onPointerUp, onPointerCancel, onClick }
}
