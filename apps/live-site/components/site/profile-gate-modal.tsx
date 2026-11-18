'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { hasFullName } from '@/lib/lumen/join-journeys'
import { useShell } from './shell-context'
import { cn } from '@/lib/utils'

/**
 * Cashier / AuthModal frost fields. White focus — never blue.
 */
const fieldClass = cn(
  'h-10 w-full rounded-lg border border-white/15 bg-white/[0.07] px-3 text-sm text-foreground',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl',
  'placeholder:text-muted-foreground',
  'focus:border-white focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-0',
  'focus-visible:border-white focus-visible:outline-none focus-visible:!ring-1 focus-visible:!ring-white focus-visible:!ring-offset-0',
)

/**
 * Local journey lab gates. Body portal + `data-profile-gate-root` carve-out
 * (z-index 260) — Tailwind z alone paints under shell / betslip.
 * Visual = AuthModal glass. Compact sheet — no ticket hero, no eyebrow chrome.
 */
export function ProfileGateModal() {
  const {
    profileGate,
    closeProfileGate,
    profile,
    updateProfile,
    setDateOfBirth,
    startNavigating,
  } = useShell()
  const [portalReady, setPortalReady] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    if (!profileGate) return
    setFullName(profile.fullName)
    setPhone(profile.phone ?? '')
    setDob(profile.dateOfBirth ?? '')
    setError(undefined)
  }, [profileGate, profile.fullName, profile.phone, profile.dateOfBirth])

  if (!portalReady || !profileGate) return null

  const reason = profileGate.reason
  const copy = copyForReason(reason)

  const onSubmit = () => {
    if (reason === 'sports-name' || reason === 'vip-claim') {
      if (!hasFullName(fullName)) {
        setError('Enter First Name, Last Name')
        return
      }
      if (reason === 'vip-claim' && !dob && !profile.dateOfBirth) {
        setError('Add your date of birth')
        return
      }
      updateProfile({ fullName: fullName.trim() })
      if (reason === 'vip-claim' && dob) setDateOfBirth(dob)
      closeProfileGate()
      return
    }
    if (reason === 'sports-level') {
      const nextPhone = phone.trim().length >= 7 ? phone.trim() : profile.phone
      if (!nextPhone || nextPhone.trim().length < 7) {
        setError('Enter a phone number')
        return
      }
      if (!hasFullName(fullName)) {
        setError('Enter First Name, Last Name')
        return
      }
      if (!dob) {
        setError('Add your date of birth')
        return
      }
      updateProfile({
        fullName: fullName.trim(),
        phone: nextPhone.trim(),
      })
      setDateOfBirth(dob)
      closeProfileGate()
      return
    }
    if (reason === 'card-cashier') {
      closeProfileGate()
      startNavigating('/account')
      window.location.assign('/account')
    }
  }

  return createPortal(
    <div
      data-profile-gate-root=""
      data-brand="betonline"
      className="dark fixed inset-0 z-[260] flex items-center justify-center p-3 sm:p-5 text-foreground"
      role="presentation"
      onClick={closeProfileGate}
    >
      <div aria-hidden className="absolute inset-0 bg-black/70" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-gate-title"
        data-profile-gate=""
        className={cn(
          'relative z-[1] flex w-full max-w-[360px] flex-col overflow-hidden',
          'rounded-xl border border-white/15 text-foreground',
          'bg-background/40 shadow-[0_24px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]',
          'backdrop-blur-2xl',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={closeProfileGate}
          aria-label="Close"
          className={cn(
            'shell-chrome-btn absolute right-2.5 top-2.5 z-20 inline-flex size-8 items-center justify-center',
            'rounded-lg border border-border bg-secondary text-foreground shadow-sm',
            'transition-colors hover:bg-accent active:bg-accent',
          )}
        >
          <IconX className="size-3.5" stroke={2} />
        </button>

        <div className="flex flex-col gap-3 px-4 pb-4 pt-4 pr-12">
          <div>
            <h2
              id="profile-gate-title"
              className="text-[15px] font-semibold leading-snug text-foreground"
            >
              {copy.title}
            </h2>
            <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{copy.body}</p>
          </div>

          {reason === 'card-cashier' ? null : (
            <div className="flex flex-col gap-2">
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="First Name, Last Name"
                className={fieldClass}
                autoComplete="name"
                autoFocus
                aria-label="Full Name"
              />
              {(reason === 'sports-level' || reason === 'vip-claim') && (
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className={fieldClass}
                  aria-label="Date of birth"
                />
              )}
              {reason === 'sports-level' ? (
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Mobile number"
                  className={fieldClass}
                  inputMode="tel"
                  aria-label="Phone"
                />
              ) : null}
              {error ? <p className="text-xs text-primary">{error}</p> : null}
            </div>
          )}

          <Button type="button" className="h-10 w-full text-sm font-semibold" onClick={onSubmit}>
            {copy.cta}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function copyForReason(reason: 'sports-name' | 'sports-level' | 'vip-claim' | 'card-cashier') {
  if (reason === 'sports-name') {
    return {
      title: 'Name required to bet',
      body: 'First Name, Last Name on the account — then this bet can go through.',
      cta: 'Confirm & bet',
    }
  }
  if (reason === 'sports-level') {
    return {
      title: 'Sports needs Level 2',
      body: 'Phone, Full Name, and date of birth unlock sportsbook bets.',
      cta: 'Confirm Level 2',
    }
  }
  if (reason === 'vip-claim') {
    return {
      title: 'Name required to claim',
      body: 'First Name, Last Name (and DOB) before this reward pays out.',
      cta: 'Confirm & claim',
    }
  }
  return {
    title: 'Cards need an address',
    body: 'Crypto works now. Credit card and bank payouts unlock at Level 3 in My Account.',
    cta: 'Open My Account',
  }
}
