'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  IconAlertTriangle,
  IconChevronRight,
  IconCircleCheck,
  IconLoader2,
  IconX,
} from '@tabler/icons-react'
import { formatClaimAmount } from '@/lib/lumen/vip-hub'
import { playMessengerPopSound } from '@/lib/lumen/vip-celebrate'
import { useShell } from '@/components/site/shell-context'
import { cn } from '@/lib/utils'

const CLAIM_TOAST_MS = 5000
const LOW_BALANCE_TOAST_MS = 8000

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
  const {
    vipClaimToast,
    dismissVipClaimToast,
    depositTracker,
    launchedGame,
    openDepositFromLowBalance,
  } = useShell()
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
  const lastToastIdRef = useRef<number | null>(null)
  /** Polling confirmation ticks share one id — pop only once for the poll. */
  const pollingSoundIdRef = useRef<number | null>(null)
  /** Launching a game closes any open toast (no pause / hold). */
  const blockedByGame = launchedGame != null

  const confirmations =
    depositTracker?.confirmations ?? vipClaimToast?.confirmations ?? 0
  const required =
    depositTracker?.required ?? vipClaimToast?.required ?? 2

  const toastMs =
    vipClaimToast?.kind === 'low-balance' ? LOW_BALANCE_TOAST_MS : CLAIM_TOAST_MS

  useEffect(() => {
    setMounted(true)
  }, [])

  /* Launching a game dismisses any open toast — no hold / pause / resume. */
  useEffect(() => {
    if (!blockedByGame || !vipClaimToast) return
    if (vipClaimToast.kind === 'deposit-polling') return
    dismissVipClaimToast()
  }, [blockedByGame, vipClaimToast, dismissVipClaimToast])

  /*
   * Intercom pop: once per toast id.
   * Deposit poll: once when polling starts (same id across ticks), again on complete.
   */
  useEffect(() => {
    if (!vipClaimToast) {
      lastToastIdRef.current = null
      return
    }
    if (vipClaimToast.kind === 'deposit-polling') {
      if (pollingSoundIdRef.current === vipClaimToast.id) return
      pollingSoundIdRef.current = vipClaimToast.id
      lastToastIdRef.current = vipClaimToast.id
      playMessengerPopSound()
      return
    }
    /* Fresh success / claim / low-balance — allow sound even after a poll. */
    if (vipClaimToast.kind === 'deposit') {
      pollingSoundIdRef.current = null
    }
    if (lastToastIdRef.current === vipClaimToast.id) return
    lastToastIdRef.current = vipClaimToast.id
    playMessengerPopSound()
  }, [vipClaimToast])

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

    const duration =
      vipClaimToast.kind === 'low-balance' ? LOW_BALANCE_TOAST_MS : CLAIM_TOAST_MS
    remainingRef.current = duration
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
    /* Polling toast stays until confirmed — no auto-dismiss. */
    if (vipClaimToast.kind === 'deposit-polling') {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
      window.addEventListener('resize', place)
      return () => {
        window.removeEventListener('resize', place)
      }
    }

    deadlineRef.current = Date.now() + remainingRef.current
    timerRef.current = window.setTimeout(() => dismissVipClaimToast(), remainingRef.current)
    window.addEventListener('resize', place)
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = null
      window.removeEventListener('resize', place)
    }
  }, [vipClaimToast, dismissVipClaimToast])

  /* Keep polling toast confirmations in sync with the live tracker. */
  useEffect(() => {
    if (!vipClaimToast || vipClaimToast.kind !== 'deposit-polling' || !depositTracker) return
    if (depositTracker.stage === 'confirmed') return
    if (
      vipClaimToast.confirmations === depositTracker.confirmations &&
      vipClaimToast.required === depositTracker.required
    ) {
      return
    }
  }, [depositTracker, vipClaimToast])

  const pauseTimer = () => {
    if (paused || !vipClaimToast || vipClaimToast.kind === 'deposit-polling') return
    remainingRef.current = Math.max(0, deadlineRef.current - Date.now())
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setPaused(true)
  }

  const resumeTimer = () => {
    if (!paused || !vipClaimToast || vipClaimToast.kind === 'deposit-polling') return
    deadlineRef.current = Date.now() + remainingRef.current
    timerRef.current = window.setTimeout(() => dismissVipClaimToast(), remainingRef.current)
    setPaused(false)
  }

  if (!mounted || !vipClaimToast || !coords || blockedByGame) return null

  const isPolling = vipClaimToast.kind === 'deposit-polling'
  const isLowBalance = vipClaimToast.kind === 'low-balance'
  const freeSpinsOffer = vipClaimToast.freeSpins ?? 50

  /* Lean low-balance offer — caps label + bold offer + text CTA (not a fat button card). */
  if (isLowBalance) {
    return createPortal(
      <div
        data-vip-claim-toast=""
        role="status"
        aria-live="assertive"
        className="w-[min(340px,calc(100%-32px))] overflow-hidden rounded-[12px] border border-white/10 bg-[#2c2c2c] text-white shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
        style={{
          position: 'fixed',
          top: coords.top,
          bottom: coords.bottom,
          left: coords.left,
          right: coords.right,
          zIndex: 230,
        }}
        onMouseEnter={pauseTimer}
        onMouseLeave={resumeTimer}
      >
        <div className="relative flex items-start gap-3 px-4 pb-3.5 pt-3.5 pr-10">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-white/10">
            <IconAlertTriangle className="size-4 text-primary" strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/55">
              Balance running low
            </p>
            <p className="mt-1 text-sm font-semibold leading-5 text-white">
              {freeSpinsOffer} Free Spins on your next deposit
            </p>
            <button
              type="button"
              onClick={openDepositFromLowBalance}
              className="mt-1.5 inline-flex items-center gap-0.5 text-sm font-semibold text-primary transition-opacity hover:opacity-90"
            >
              Deposit now
              <IconChevronRight className="size-4" strokeWidth={2.5} />
            </button>
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            className="absolute right-2.5 top-2.5 inline-flex size-7 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            onClick={dismissVipClaimToast}
          >
            <IconX className="size-3.5" strokeWidth={2} />
          </button>
        </div>
        <div className="h-0.5 w-full bg-primary/15">
          <div
            className="h-full origin-left bg-primary"
            style={{
              animation: `vip-claim-toast-timer ${toastMs}ms linear forwards`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          />
        </div>
      </div>,
      document.body,
    )
  }

  const isCardPoll = isPolling && depositTracker?.channel === 'card'

  const title = isPolling
    ? confirmations >= required
      ? 'Confirming deposit…'
      : isCardPoll
        ? 'Communicating with bank'
        : 'Confirming on the blockchain'
    : vipClaimToast.kind === 'deposit'
      ? 'Deposit has arrived!'
      : vipClaimToast.kind === 'rakeback'
        ? 'Casino Rakeback earned!'
        : vipClaimToast.freeSpins && vipClaimToast.amount <= 0
          ? 'Free Spins unlocked!'
          : 'Reward successfully claimed!'

  const body = isPolling
    ? isCardPoll
      ? 'Usually under a minute.'
      : `${confirmations} of ${required} confirmations — usually a few minutes.`
    : vipClaimToast.kind === 'rakeback'
      ? `${formatClaimAmount(vipClaimToast.amount)} has been added to your Casino Rakeback.`
      : vipClaimToast.kind === 'deposit' && vipClaimToast.freeSpins
        ? `${formatClaimAmount(vipClaimToast.amount)} credited · ${vipClaimToast.freeSpins} Free Spins ready — play now.`
        : vipClaimToast.freeSpins && vipClaimToast.amount <= 0
          ? `${vipClaimToast.freeSpins} Free Spins ready — play from VIP Hub.`
          : `${formatClaimAmount(vipClaimToast.amount)} has been credited to your account.`

  return createPortal(
    <div
      data-vip-claim-toast=""
      role="status"
      aria-live="assertive"
      className={cn(
        'w-[min(360px,calc(100%-32px))] overflow-hidden rounded-[10px]',
        'border border-success/50 bg-[#2c2c2c] text-white shadow-[0_12px_40px_rgba(0,0,0,0.65)]',
        !isPolling && 'cursor-pointer',
      )}
      style={{
        position: 'fixed',
        top: coords.top,
        bottom: coords.bottom,
        left: coords.left,
        right: coords.right,
        zIndex: 230,
      }}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onClick={() => {
        if (!isPolling) dismissVipClaimToast()
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span
          className={cn(
            'mt-0.5 grid size-6 shrink-0 place-items-center rounded-full',
            isPolling ? 'bg-warning text-foreground' : 'bg-[#4ade80] text-black',
          )}
        >
          {isPolling ? (
            <IconLoader2 className="size-4 animate-spin text-foreground" strokeWidth={2.25} />
          ) : (
            <IconCircleCheck className="size-4" strokeWidth={2.25} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-5 text-white">{title}</p>
          <p className="text-sm leading-5 text-white/70">{body}</p>
          {isPolling ? (
            <div className="mt-2.5 flex gap-1.5">
              {Array.from({ length: required }).map((_, i) => {
                const filled = i < confirmations
                const active = i === confirmations
                return (
                  <span
                    key={i}
                    className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
                  >
                    <span
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-500',
                        filled ? 'w-full' : active ? 'w-[70%] animate-pulse' : 'w-0',
                      )}
                    />
                  </span>
                )
              })}
            </div>
          ) : null}
        </div>
        {!isPolling ? (
          <button
            type="button"
            aria-label="Dismiss"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-lg text-white/65 transition-colors hover:bg-white/10 hover:text-white"
            onClick={(e) => {
              e.stopPropagation()
              dismissVipClaimToast()
            }}
          >
            <IconX className="size-4" strokeWidth={2} />
          </button>
        ) : null}
      </div>
      {!isPolling ? (
        <div className="h-1 w-full bg-[#4ade80]/20">
          <div
            className="h-full origin-left bg-[#4ade80]"
            style={{
              animation: `vip-claim-toast-timer ${toastMs}ms linear forwards`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          />
        </div>
      ) : null}
    </div>,
    document.body,
  )
}
