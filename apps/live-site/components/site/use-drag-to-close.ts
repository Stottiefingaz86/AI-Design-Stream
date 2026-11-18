'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

/**
 * Instagram-style sheet dismiss: only the drag handle pulls the sheet down.
 * While dragging, block document touchmove so iOS/Android pull-to-refresh
 * doesn’t steal an imperfect downward swipe.
 */
export function useDragToClose(open: boolean, onClose: () => void) {
  const sheetRef = useRef<HTMLElement>(null)
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)
  const lastY = useRef(0)
  const lastT = useRef(0)
  const velocity = useRef(0)
  const offsetRef = useRef(0)
  const draggingRef = useRef(false)
  const pointerId = useRef<number | null>(null)

  const setDragOffset = (value: number) => {
    offsetRef.current = value
    setOffset(value)
  }

  useEffect(() => {
    if (open) setDragOffset(0)
  }, [open])

  /* Non-passive touchmove while dragging — stops pull-to-refresh / overscroll. */
  useEffect(() => {
    if (!dragging) return
    const block = (e: TouchEvent) => {
      e.preventDefault()
    }
    document.addEventListener('touchmove', block, { passive: false })
    const prevHtml = document.documentElement.style.overscrollBehaviorY
    const prevBody = document.body.style.overscrollBehaviorY
    document.documentElement.style.overscrollBehaviorY = 'none'
    document.body.style.overscrollBehaviorY = 'none'
    /* If the pointer ends outside the sheet, still clear drag — stuck capture eats taps. */
    const forceEnd = () => {
      if (!draggingRef.current) return
      draggingRef.current = false
      pointerId.current = null
      const height = sheetRef.current?.offsetHeight ?? 400
      const current = offsetRef.current
      const shouldClose =
        current > 80 || current > height * 0.22 || velocity.current > 0.55
      setDragging(false)
      setDragOffset(0)
      if (shouldClose) onClose()
    }
    window.addEventListener('pointerup', forceEnd)
    window.addEventListener('pointercancel', forceEnd)
    return () => {
      document.removeEventListener('touchmove', block)
      window.removeEventListener('pointerup', forceEnd)
      window.removeEventListener('pointercancel', forceEnd)
      document.documentElement.style.overscrollBehaviorY = prevHtml
      document.body.style.overscrollBehaviorY = prevBody
    }
  }, [dragging, onClose])

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!open) return
    const fromHandle = (event.target as HTMLElement).closest('[data-drag-handle]')
    if (!fromHandle) return

    event.preventDefault()
    startY.current = event.clientY
    lastY.current = event.clientY
    lastT.current = performance.now()
    velocity.current = 0
    draggingRef.current = true
    pointerId.current = event.pointerId
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (!draggingRef.current) return
    event.preventDefault()
    const dy = event.clientY - startY.current
    const now = performance.now()
    const dt = now - lastT.current
    if (dt > 0) velocity.current = (event.clientY - lastY.current) / dt
    lastY.current = event.clientY
    lastT.current = now
    setDragOffset(Math.max(0, dy))
  }

  const endDrag = (event?: ReactPointerEvent<HTMLElement>) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    if (event && pointerId.current != null) {
      try {
        event.currentTarget.releasePointerCapture(pointerId.current)
      } catch {
        /* already released */
      }
    }
    pointerId.current = null
    const height = sheetRef.current?.offsetHeight ?? 400
    const current = offsetRef.current
    const shouldClose = current > 80 || current > height * 0.22 || velocity.current > 0.55
    setDragging(false)
    setDragOffset(0)
    if (shouldClose) onClose()
  }

  return {
    sheetRef,
    offset,
    dragging,
    /** Bind to the sheet (or a wrapper that contains `[data-drag-handle]`). */
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  }
}
