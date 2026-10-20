'use client'

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

/**
 * Instagram-style sheet dismiss: only the drag handle pulls the sheet down.
 * Content swipes / scrolls never start a close gesture — tap backdrop or pull the handle.
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
