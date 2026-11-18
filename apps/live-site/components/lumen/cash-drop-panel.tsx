'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Typography } from '@/components/ui/typography'
import { useShell } from '@/components/site/shell-context'
import { cn } from '@/lib/utils'

const CARD =
  'rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]'

/** Cashier-style field on dark cards. */
const FIELD =
  'h-12 w-full rounded-lg border border-input bg-popover px-3 text-sm font-medium uppercase tracking-wide text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring'

/** Same wrap as VIP hub Click2Claim (Figma md 109×36). */
const CTA =
  'h-9 w-[109px] min-w-[109px] max-w-[109px] shrink-0 gap-2 rounded-lg px-4'

/** Demo drop amount — same celebrate → toast → balance as hub claims. */
const CASH_DROP_AMOUNT = 25

/**
 * VIP Hub — Cash Drop Code. Enter a code → claim cash / rewards.
 */
export function CashDropPanel() {
  const router = useRouter()
  const btnRef = useRef<HTMLButtonElement>(null)
  const {
    loggedIn,
    openAuth,
    startNavigating,
    setVipHubOpen,
    claimMissionReward,
  } = useShell()
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'claiming' | 'ok' | 'bad'>('idle')

  const canSubmit = code.trim().length >= 3 && status !== 'claiming'

  const claim = () => {
    if (!loggedIn) {
      openAuth('login')
      return
    }
    if (!canSubmit) return
    setStatus('claiming')
    window.setTimeout(() => {
      const ok = code.trim().toUpperCase() === 'BOLDROP' || code.trim().length >= 4
      if (!ok) {
        setStatus('bad')
        return
      }
      setCode('')
      setStatus('ok')
      claimMissionReward(CASH_DROP_AMOUNT, btnRef.current)
    }, 400)
  }

  return (
    <section className={cn(CARD, 'p-5')} data-name="module-cash-drop">
      <Typography as="h2" shape="h4" weight="semibold" className="text-base sm:text-lg">
        Cash Drop Code
      </Typography>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
          Enter Code
        </span>
        <Input
          value={code}
          onChange={(e) => {
            setStatus('idle')
            setCode(e.target.value.toUpperCase())
          }}
          placeholder="CODE"
          autoComplete="off"
          spellCheck={false}
          className={FIELD}
          onKeyDown={(e) => {
            if (e.key === 'Enter') claim()
          }}
        />
      </label>

      <p className="mt-3 text-sm leading-5 text-muted-foreground">
        Enter your code in Cash Drop and win instantly. Try your luck for cash and rewards.
      </p>

      {status === 'ok' ? (
        <p className="mt-2 text-sm font-medium text-success">Code accepted — reward added.</p>
      ) : null}
      {status === 'bad' ? (
        <p className="mt-2 text-sm font-medium text-destructive">Invalid code. Try again.</p>
      ) : null}

      <div className="mt-5 flex items-center gap-3">
        <Button
          ref={btnRef}
          type="button"
          size="lg"
          className={CTA}
          disabled={!canSubmit}
          onClick={claim}
        >
          {status === 'claiming' ? '…' : 'Claim Now'}
        </Button>
      </div>

      <button
        type="button"
        className="mt-4 block text-sm font-medium text-foreground underline-offset-2 hover:underline"
        onClick={() => {
          setVipHubOpen(false)
          startNavigating('/promotions')
          router.push('/promotions')
        }}
      >
        Terms &amp; Conditions
      </button>
    </section>
  )
}
