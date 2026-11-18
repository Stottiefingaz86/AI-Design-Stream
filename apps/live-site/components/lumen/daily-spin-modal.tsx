'use client'

/**
 * Daily Spin — Login-sized popup.
 * Left: brand art. Right: jackpot wheel with cash / FS / miss prizes.
 */

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { IconX } from '@tabler/icons-react'
import { JackpotWheelBonus } from '@/components/lumen/jackpot/jackpot-wheel-bonus'
import {
  dailySpinFromTier,
  dailySpinResultTitle,
  type DailySpinSegment,
} from '@/lib/lumen/daily-spin'
import { cn } from '@/lib/utils'
import type { JackpotTickerTierId } from '@/lib/jackpot/constants'

const DAILY_SPIN_BRAND_ART = '/shell/auth/daily-spin-ready.jpg'

export function DailySpinModal({
  open,
  onClose,
  onResult,
}: {
  open: boolean
  onClose: () => void
  onResult: (segment: DailySpinSegment, button: HTMLButtonElement | null) => void
}) {
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)
  const [spinKey, setSpinKey] = useState(0)
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) {
      setShown(false)
      const t = window.setTimeout(() => {
        setResolved(false)
      }, 280)
      return () => window.clearTimeout(t)
    }
    setResolved(false)
    setSpinKey((k) => k + 1)
    const frame = window.requestAnimationFrame(() => setShown(true))
    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!mounted || !open) return null

  return createPortal(
    <div
      data-daily-spin-root=""
      data-open={shown ? 'true' : 'false'}
      data-brand="betonline"
      className={cn(
        'dark fixed inset-0 z-[250] flex items-center justify-center p-3 text-foreground sm:p-5',
        shown ? 'pointer-events-auto' : 'pointer-events-none',
      )}
      role="presentation"
      aria-hidden={!shown}
      onClick={onClose}
    >
      <div
        aria-hidden
        className={cn(
          'absolute inset-0 bg-black/70 transition-opacity duration-300',
          shown ? 'opacity-100' : 'opacity-0',
        )}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-spin-title"
        data-daily-spin-modal=""
        data-brand="betonline"
        className={cn(
          'dark relative z-[1] flex w-full max-w-[820px] flex-col overflow-hidden',
          'h-[min(90dvh,640px)] rounded-xl border border-white/15 text-foreground',
          'bg-background shadow-[0_24px_80px_rgba(0,0,0,0.55)]',
          'transition-[opacity,transform] duration-300',
          'min-[900px]:h-[min(86dvh,640px)] min-[900px]:flex-row min-[900px]:items-stretch',
          shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          data-daily-spin-brand=""
          className="relative hidden min-h-0 w-[55%] shrink-0 self-stretch overflow-hidden bg-primary min-[900px]:block"
        >
          <Image
            src={DAILY_SPIN_BRAND_ART}
            alt=""
            fill
            className="object-cover object-center"
            sizes="450px"
            priority
          />
          <h2 id="daily-spin-title" className="sr-only">
            Your daily spin is ready
          </h2>
        </div>

        <div
          data-daily-spin-form=""
          className={cn(
            'relative flex h-full min-h-0 w-full min-w-0 flex-col bg-background',
            'shadow-[inset_1px_0_0_rgba(255,255,255,0.06)]',
            'min-[900px]:w-[45%] min-[900px]:shrink-0',
          )}
        >
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
            <p className="text-[15px] font-semibold text-foreground min-[900px]:sr-only">
              Daily Spin is ready
            </p>
            <span className="hidden text-[15px] font-semibold text-foreground min-[900px]:inline">
              Daily Spin
            </span>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className={cn(
                'shell-chrome-btn inline-flex size-9 shrink-0 items-center justify-center',
                'rounded-lg border border-border bg-secondary text-foreground shadow-sm',
                'transition-colors hover:bg-accent active:bg-accent',
              )}
            >
              <IconX className="size-4" stroke={2} />
            </button>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden bg-background">
            <JackpotWheelBonus
              key={spinKey}
              variant="daily-spin"
              className="!relative !inset-auto !z-0 size-full !rounded-none"
              spinLabel="Spin now"
              resultTitleForTier={dailySpinResultTitle}
              onWipeStart={(tier: JackpotTickerTierId) => {
                const segment = dailySpinFromTier(tier)
                onResult(segment, null)
                setResolved(true)
              }}
              onComplete={() => {
                setResolved(true)
              }}
            />
          </div>

          {resolved ? (
            <div className="shrink-0 border-t border-border p-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Done
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  )
}
