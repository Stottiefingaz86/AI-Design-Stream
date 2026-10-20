'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconCircleCheck, IconX } from '@tabler/icons-react'
import { formatClaimAmount } from '@/lib/lumen/vip-hub'
import { useShell } from '@/components/site/shell-context'
import { cn } from '@/lib/utils'

const CLAIM_TOAST_MS = 5000

/**
 * Kept for callers that still import it — React host is the real UI.
 * (DOM injection was unreliable against the VIP overlay stack.)
 */
export function flashVipClaimToast(_amount: number) {
  /* no-op: VipClaimToastHost reads shell `vipClaimToast` state */
}

/**
 * Always mount inside ShellChrome. Renders when `vipClaimToast` is set after a claim.
 * Desktop: under balance / top-right. Mobile: bottom-center of the viewport.
 * Hover pauses the dismiss timer + progress bar.
 */
export function VipClaimToastHost() {
  const { vipClaimToast, dismissVipClaimToast } = useShell()
  const [mounted, setMounted] = useState(false)
  const [paused, setPaused] = useState(false)
  const [coords, setCoords] = useState<{
    top?: number
    bottom?: number
    left?: number
    right?: number
  } | null>(null)

  const remainingRef = useRef(CLAIM_TOAST_MS)
  const deadlineRef = useRef(0)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!vipClaimToast) {
      setCoords(null)
      setPaused(false)
      remainingRef.current = CLAIM_TOAST_MS
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    remainingRef.current = CLAIM_TOAST_MS
    setPaused(false)

    const place = () => {
      const desktop = window.matchMedia('(min-width: 1024px)').matches
      const balance = document.querySelector<HTMLElement>('[data-shell-balance]')
      const width = Math.min(360, window.innerWidth - 32)

      if (desktop && balance) {
        const r = balance.getBoundingClientRect()
        let left = r.right - width
        left = Math.max(16, Math.min(left, window.innerWidth - width - 16))
        setCoords({ top: Math.round(r.bottom + 8), left: Math.round(left) })
        return
      }

      if (desktop) {
        setCoords({ top: 76, right: 112 })
        return
      }

      /* Mobile: bottom-center of the device */
      setCoords({ bottom: 24, left: Math.round((window.innerWidth - width) / 2) })
    }

    place()
    deadlineRef.current = Date.now() + remainingRef.current
    timerRef.current = window.setTimeout(() => dismissVipClaimToast(), remainingRef.current)
    window.addEventListener('resize', place)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = null
      window.removeEventListener('resize', place)
    }
  }, [vipClaimToast, dismissVipClaimToast])

  const pauseTimer = () => {
    if (paused || !vipClaimToast) return
    remainingRef.current = Math.max(0, deadlineRef.current - Date.now())
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setPaused(true)
  }

  const resumeTimer = () => {
    if (!paused || !vipClaimToast) return
    deadlineRef.current = Date.now() + remainingRef.current
    timerRef.current = window.setTimeout(() => dismissVipClaimToast(), remainingRef.current)
    setPaused(false)
  }

  if (!mounted || !vipClaimToast || !coords) return null

  return createPortal(
    <div
      data-vip-claim-toast=""
      role="status"
      aria-live="assertive"
      className={cn(
        'w-[min(360px,calc(100%-32px))] cursor-pointer overflow-hidden rounded-[10px]',
        'border border-success/50 bg-[#2c2c2c] text-white shadow-[0_12px_40px_rgba(0,0,0,0.65)]',
      )}
      style={{
        /* Inline fixed — globals sticky helper uses relative !important on body>div unless excluded */
        position: 'fixed',
        top: coords.top,
        bottom: coords.bottom,
        left: coords.left,
        right: coords.right,
        zIndex: 2147483647,
      }}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onClick={() => dismissVipClaimToast()}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#4ade80] text-black">
          <IconCircleCheck className="size-4" strokeWidth={2.25} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5 text-white">Reward successfully claimed!</p>
          <p className="text-sm leading-5 text-white/70">
            {formatClaimAmount(vipClaimToast.amount)} has been credited to your account.
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-white/65 transition-colors hover:bg-white/10 hover:text-white"
          onClick={(e) => {
            e.stopPropagation()
            dismissVipClaimToast()
          }}
        >
          <IconX className="size-4" strokeWidth={2} />
        </button>
      </div>
      <div className="h-1 w-full bg-[#4ade80]/20">
        <div
          className="h-full origin-left bg-[#4ade80]"
          style={{
            animation: `vip-claim-toast-timer ${CLAIM_TOAST_MS}ms linear forwards`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      </div>
    </div>,
    document.body,
  )
}
