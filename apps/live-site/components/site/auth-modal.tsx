'use client'

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  IconArrowRight,
  IconCheck,
  IconChevronDown,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconMail,
  IconX,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DIAL_COUNTRIES,
  DEFAULT_DIAL_COUNTRY,
  flagEmoji,
  formatE164,
  getDialCountry,
  normalizeNationalNumber,
  resolveDialCountryIso,
} from '@/lib/lumen/dial-countries'
import { fireJoinWelcomeConfetti } from '@/lib/lumen/vip-celebrate'
import type { JoinJourneyId } from '@/lib/lumen/join-journeys'
import { useShell, type AuthModalView } from './shell-context'
import { ShellIcon } from './shell-icons'
import { cn } from '@/lib/utils'

function parseLabJourneyCode(raw: string): JoinJourneyId | null {
  const t = raw.trim()
  if (t === '1' || t === '2' || t === '3' || t === '4' || t === '5') return Number(t) as JoinJourneyId
  return null
}

/**
 * Lumen cashier field shape + visible frost glass:
 * `rounded-lg border border-input` + white focus (never blue).
 * Soft white wash so blur/frost reads on dark auth.
 */
const fieldClass = cn(
  'h-10 w-full rounded-lg border border-white/15 bg-white/[0.07] px-3 text-sm text-foreground',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl',
  'placeholder:text-muted-foreground',
  'focus:border-white focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-0',
  'focus-visible:border-white focus-visible:outline-none focus-visible:!ring-1 focus-visible:!ring-white focus-visible:!ring-offset-0',
  '[&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.07)]',
  '[&:-webkit-autofill]:[-webkit-text-fill-color:var(--foreground)]',
  '[&:-webkit-autofill]:caret-foreground',
  '[&:-webkit-autofill]:border-white/15',
  '[&:-webkit-autofill:focus]:shadow-[inset_0_0_0px_1000px_rgba(255,255,255,0.07)]',
  '[&:-webkit-autofill:focus]:border-white',
)

/** Inline auth links — red in light, white in dark (never primary-on-dark). */
const authLinkClass =
  'font-medium text-primary hover:text-primary/80 dark:text-white dark:hover:text-white/80'

const PASSWORD_RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'One lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { id: 'number', label: 'One number', test: (v: string) => /[0-9]/.test(v) },
  {
    id: 'special',
    label: 'One special character (!@#$…)',
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
] as const

function passwordMeetsAll(value: string) {
  return PASSWORD_RULES.every((rule) => rule.test(value))
}

/** Demo taken emails — live check simulates a lookup. */
const TAKEN_EMAILS = new Set(
  [
    'admin@betonline.ag',
    'chris@betonline.ag',
    'christopher.hunt86@gmail.com',
    'support@betonline.ag',
    'test@test.com',
  ].map((n) => n.toLowerCase()),
)

/** Demo taken usernames — journey 4 live check. */
const TAKEN_USERNAMES = new Set(
  [
    'admin',
    'betonline',
    'chris',
    'dealer',
    'jackpot',
    'player1',
    'support',
    'vip',
    'winner',
  ].map((n) => n.toLowerCase()),
)

type LiveStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

/** Nickname on Verify — no spaces or special chars (letters, numbers, _). */
function validateNickname(value: string): string | undefined {
  const raw = value.trim()
  if (!raw) return 'Enter a nickname'
  if (/\s/.test(value)) return 'No spaces'
  if (raw.length < 3) return 'At least 3 characters'
  if (raw.length > 20) return 'Max 20 characters'
  if (!/^[a-zA-Z0-9_]+$/.test(raw)) return 'No spaces or special characters'
  return undefined
}

function validateUsernameFormat(value: string): string | undefined {
  const raw = value.trim()
  if (!raw) return 'Enter a username'
  if (raw.length < 3) return 'At least 3 characters'
  if (raw.length > 20) return 'Max 20 characters'
  if (!/^[a-zA-Z0-9_]+$/.test(raw)) return 'Letters, numbers, and _ only'
  return undefined
}

function checkUsernameAvailable(username: string): Promise<boolean> {
  const key = username.trim().toLowerCase()
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(!TAKEN_USERNAMES.has(key)), 380)
  })
}

/** Journey 1/5 demo OTP — any 5 digits also accepted after check. */
const DEMO_OTP = '12345'
const OTP_LENGTH = 5

function validateOtp(value: string): string | undefined {
  const raw = value.trim()
  if (!raw) return 'Enter the 5-digit code'
  if (!/^\d{5}$/.test(raw)) return 'Enter the 5-digit code'
  return undefined
}

/** Friendly email format errors while typing. */
function validateEmailFormat(value: string): string | undefined {
  const raw = value.trim()
  if (!raw) return 'Enter your email'
  if (!raw.includes('@')) return 'Include an @ in the email address'
  const [local, domain = ''] = raw.split('@')
  if (!local) return 'Enter a name before the @'
  if (!domain) return 'Enter a domain after the @'
  if (!domain.includes('.')) return 'Domain needs a dot (e.g. name@email.com)'
  if (domain.startsWith('.') || domain.endsWith('.')) return 'Enter a valid domain'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return 'Enter a valid email'
  return undefined
}

function checkEmailAvailable(value: string): Promise<boolean> {
  const key = value.trim().toLowerCase()
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(!TAKEN_EMAILS.has(key)), 380)
  })
}

function FieldStatusIcon({ status }: { status: LiveStatus }) {
  if (status === 'checking') {
    return (
      <IconLoader2 className="size-4 animate-spin text-muted-foreground" aria-label="Checking" />
    )
  }
  if (status === 'available') {
    return <IconCheck className="size-4 text-success" stroke={2.5} aria-label="Available" />
  }
  if (status === 'taken' || status === 'invalid') {
    return <IconX className="size-4 text-primary" stroke={2.5} aria-label="Not available" />
  }
  return null
}

function Field({
  label,
  children,
  error,
  required,
}: {
  label: string
  children: ReactNode
  error?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-muted-foreground">
        {label}
        {required ? (
          <span className="text-primary" aria-hidden>
            {' '}
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs text-primary">{error}</p> : null}
    </div>
  )
}

/**
 * Fixed tip under the password field — rendered as a sibling inside the auth root
 * (not clipped by dialog overflow). CSS carve-out keeps `position: fixed` alive.
 */
function PasswordCriteriaTip({
  open,
  password,
  anchorRef,
}: {
  open: boolean
  password: string
  anchorRef: React.RefObject<HTMLElement | null>
}) {
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const missing = PASSWORD_RULES.filter((rule) => !rule.test(password))
  const shouldShow = open && password.length > 0 && missing.length > 0

  useLayoutEffect(() => {
    if (!shouldShow) {
      setPos(null)
      return
    }
    const measure = () => {
      const el = anchorRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setPos({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 220),
      })
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [shouldShow, password, anchorRef])

  if (!shouldShow || !pos) return null

  return (
    <div
      data-auth-password-rules=""
      data-brand="betonline"
      role="status"
      aria-live="polite"
      className="dark rounded-lg border border-border bg-popover p-3 text-foreground shadow-xl"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        width: pos.width,
        maxWidth: 'min(280px, calc(100vw - 24px))',
        zIndex: 500,
      }}
    >
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Still need
      </p>
      <ul className="flex flex-col gap-1">
        {missing.map((rule) => (
          <li key={rule.id} className="flex items-center gap-1.5 text-[12px] leading-4 text-foreground">
            <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            {rule.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground',
        'rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white',
      )}
      aria-label={visible ? 'Hide password' : 'Show password'}
    >
      {visible ? <IconEyeOff className="size-[18px]" /> : <IconEye className="size-[18px]" />}
    </button>
  )
}

type SocialProvider = 'telegram' | 'google' | 'kick'

const SOCIAL_PROVIDERS: {
  id: SocialProvider
  label: string
  /** Demo full name + email when that provider “succeeds”. */
  fullName: string
  email: string
}[] = [
  {
    id: 'google',
    label: 'Google',
    fullName: 'Google Player',
    email: 'player@gmail.com',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    fullName: 'Telegram Player',
    email: 'tg.player@telegram.demo',
  },
  {
    id: 'kick',
    label: 'Kick',
    fullName: 'Kick Player',
    email: 'player@kick.demo',
  },
]

/** Bare brand marks — no nested circular “badge in a field” look. */
function SocialProviderIcon({ id, compact }: { id: SocialProvider; compact?: boolean }) {
  const size = compact ? 'size-3.5' : 'size-4'
  if (id === 'telegram') {
    return (
      <svg viewBox="0 0 24 24" className={cn(size, 'shrink-0')} aria-hidden>
        <circle cx="12" cy="12" r="12" fill="#2AABEE" />
        <path
          fill="#fff"
          d="M17.6 7.2 7.9 10.9c-.7.3-.7.7-.1.9l2.5.8 1 3c.1.4.3.5.6.5.3 0 .4-.1.6-.4l1.5-2 3.1 2.3c.6.3 1 .2 1.1-.5l1.9-8.9c.2-.8-.3-1.1-.9-.7Z"
        />
      </svg>
    )
  }
  if (id === 'google') {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/shell/figma/auth/google.svg"
        alt=""
        width={compact ? 14 : 16}
        height={compact ? 14 : 16}
        className={cn(size, 'shrink-0 object-contain')}
      />
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/shell/figma/auth/kick.svg"
      alt=""
      width={compact ? 12 : 14}
      height={compact ? 12 : 14}
      className={cn(size, 'shrink-0 object-contain')}
    />
  )
}

/**
 * Rainbet social picker — floating menu above the trigger (body-portaled with
 * carve-out). Never expands inline (that resizes the auth modal). Radix Popover
 * portals as a plain body div and gets `position: relative` from legacy CSS.
 */
function SocialSignUpOptions({
  busy,
  onPick,
  mode = 'join',
}: {
  busy?: boolean
  onPick: (provider: SocialProvider) => void
  mode?: 'join' | 'login'
}) {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const divider = mode === 'login' ? 'Or sign in with' : 'Or sign up with'
  const trigger = mode === 'login' ? 'Other sign in options' : 'Other sign up options'

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null)
      return
    }
    const measure = () => {
      const el = triggerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const menuH = menuRef.current?.offsetHeight ?? 148
      const gap = 8
      const top = Math.max(12, rect.top - menuH - gap)
      setMenuPos({
        top,
        left: rect.left,
        width: rect.width,
      })
    }
    measure()
    /* Remeasure after paint so menu height is known for upward placement. */
    const raf = window.requestAnimationFrame(measure)
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="space-y-2">
      <div className="relative flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="shrink-0 text-[11px] font-medium text-muted-foreground">{divider}</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <button
        ref={triggerRef}
        type="button"
        disabled={busy}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-11 w-full items-center gap-2.5 rounded-lg border border-white/15',
          'bg-white/[0.07] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl',
          'text-[13px] font-medium text-foreground transition-colors',
          '[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/[0.11]',
          'disabled:opacity-60',
          open && 'ring-1 ring-white/25',
        )}
      >
        <span className="flex items-center -space-x-1.5">
          {SOCIAL_PROVIDERS.map((p) => (
            <span
              key={p.id}
              className="relative grid size-6 place-items-center rounded-full bg-popover ring-2 ring-secondary"
            >
              <SocialProviderIcon id={p.id} compact />
            </span>
          ))}
        </span>
        <span className="flex-1 text-left">{trigger}</span>
        <IconChevronDown
          className={cn(
            'size-4 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
          strokeWidth={2.25}
          aria-hidden
        />
      </button>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={menuRef}
              data-auth-social-menu=""
              data-brand="betonline"
              role="listbox"
              aria-label={trigger}
              className={cn(
                'dark overflow-hidden rounded-xl border border-border bg-popover',
                'text-popover-foreground shadow-[0_16px_48px_rgba(0,0,0,0.55)]',
              )}
              style={{
                position: 'fixed',
                top: menuPos?.top ?? 0,
                left: menuPos?.left ?? 0,
                width: menuPos?.width ?? 280,
                zIndex: 500,
                visibility: menuPos ? 'visible' : 'hidden',
              }}
            >
              <ul className="py-1">
                {SOCIAL_PROVIDERS.map((p, i) => (
                  <li key={p.id}>
                    {i > 0 ? <div className="mx-3 h-px bg-border" /> : null}
                    <button
                      type="button"
                      role="option"
                      disabled={busy}
                      onClick={() => {
                        setOpen(false)
                        onPick(p.id)
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-3 text-left text-[14px] font-medium text-foreground',
                        '[@media(hover:hover)_and_(pointer:fine)]:hover:bg-accent',
                        'disabled:opacity-60',
                      )}
                    >
                      <SocialProviderIcon id={p.id} />
                      <span>{p.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

/** Five square OTP boxes — no card wrapper. Paste-friendly. */
const otpBoxClass = cn(
  'aspect-square min-w-0 flex-1 rounded-lg border border-white/15 bg-white/[0.07] text-center text-base font-semibold tabular-nums text-foreground',
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl',
  'focus:border-white focus:outline-none focus:ring-1 focus:ring-white focus:ring-offset-0',
  'disabled:opacity-50',
)

function AuthOtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] ?? '')

  const focusAt = (i: number) => {
    const el = refs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))]
    el?.focus()
    el?.select()
  }

  const commit = (next: string) => {
    onChange(next.replace(/\D/g, '').slice(0, OTP_LENGTH))
  }

  return (
    <div className="flex w-full items-center gap-2" role="group" aria-label="Verification code">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className={otpBoxClass}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '')
            if (!raw) {
              commit(digits.map((d, j) => (j === i ? '' : d)).join(''))
              return
            }
            if (raw.length > 1) {
              commit(raw)
              focusAt(Math.min(OTP_LENGTH - 1, raw.length - 1))
              return
            }
            const nextDigits = [...digits]
            nextDigits[i] = raw
            commit(nextDigits.join(''))
            if (i < OTP_LENGTH - 1) focusAt(i + 1)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              if (digits[i]) {
                const nextDigits = [...digits]
                nextDigits[i] = ''
                commit(nextDigits.join(''))
              } else if (i > 0) {
                e.preventDefault()
                const nextDigits = [...digits]
                nextDigits[i - 1] = ''
                commit(nextDigits.join(''))
                focusAt(i - 1)
              }
              return
            }
            if (e.key === 'ArrowLeft' && i > 0) {
              e.preventDefault()
              focusAt(i - 1)
            }
            if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) {
              e.preventDefault()
              focusAt(i + 1)
            }
          }}
          onPaste={(e) => {
            e.preventDefault()
            const pasted = e.clipboardData
              .getData('text')
              .replace(/\D/g, '')
              .slice(0, OTP_LENGTH)
            if (!pasted) return
            commit(pasted)
            focusAt(Math.min(OTP_LENGTH - 1, pasted.length - 1))
          }}
          onFocus={(e) => e.currentTarget.select()}
        />
      ))}
    </div>
  )
}

/** Phone row: one auth Input (no nested tones). Dial lives in the country dropdown. */
function PhoneSmsField({
  countryIso,
  onCountryChange,
  national,
  onNationalChange,
  onSendSms,
  sending,
  disabled,
}: {
  countryIso: string
  onCountryChange: (iso: string) => void
  national: string
  onNationalChange: (v: string) => void
  onSendSms: () => void
  sending?: boolean
  disabled?: boolean
}) {
  const [countryOpen, setCountryOpen] = useState(false)
  const country = getDialCountry(countryIso)
  const canSend = national.replace(/\D/g, '').length >= 7 && !sending && !disabled
  const locked = Boolean(disabled || sending)

  return (
    <div className="flex w-full items-center gap-2">
      <div className="relative min-w-0 flex-1">
        <Popover open={countryOpen} onOpenChange={setCountryOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={locked}
              aria-label={`Country: ${country.name} ${country.dial}`}
              className={cn(
                'absolute left-1.5 top-1/2 z-10 flex h-7 -translate-y-1/2 items-center gap-1 rounded-md px-1.5',
                'bg-transparent text-sm text-foreground outline-none transition-colors',
                'hover:bg-white/[0.1] active:bg-white/[0.14]',
                'focus-visible:bg-white/[0.1] focus-visible:outline-none',
                'disabled:pointer-events-none disabled:opacity-50',
              )}
            >
              <span aria-hidden className="text-[15px] leading-none">
                {flagEmoji(country.iso)}
              </span>
              <span className="tabular-nums text-muted-foreground">{country.dial}</span>
              <IconChevronDown
                className="size-3.5 text-muted-foreground"
                strokeWidth={2.25}
                aria-hidden
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            sideOffset={6}
            className="z-[320] max-h-64 w-64 overflow-y-auto border-border bg-popover p-1"
          >
            {DIAL_COUNTRIES.map((c) => {
              const active = c.iso === country.iso
              return (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => {
                    onCountryChange(c.iso)
                    setCountryOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm',
                    'hover:bg-accent',
                    active && 'bg-accent',
                  )}
                >
                  <span aria-hidden className="text-base leading-none">
                    {flagEmoji(c.iso)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-foreground">{c.name}</span>
                  <span className="tabular-nums text-muted-foreground">{c.dial}</span>
                </button>
              )
            })}
          </PopoverContent>
        </Popover>

        <Input
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={national}
          disabled={locked}
          onChange={(e) =>
            onNationalChange(normalizeNationalNumber(e.target.value, country.dial))
          }
          className={cn(fieldClass, 'pl-[5.75rem]')}
          aria-label="Mobile number"
          placeholder="Mobile number"
        />
      </div>

      <Button
        type="button"
        className="h-10 shrink-0 rounded-lg px-3.5 text-sm font-semibold"
        disabled={!canSend}
        aria-busy={sending}
        onClick={onSendSms}
      >
        {sending ? (
          <IconLoader2
            className="size-4 animate-spin text-primary-foreground"
            strokeWidth={2.25}
            aria-label="Sending"
          />
        ) : (
          'Send SMS'
        )}
      </Button>
    </div>
  )
}

/** Journey 1/5 — email/SMS OTP + Nickname before account success. */
function JoinVerifyPanel({
  email,
  fullName,
  onFullNameChange,
  nicknameStatus,
  nicknameError,
  otp,
  onOtpChange,
  preferSms,
  onPreferSmsOpenChange,
  phoneCountry,
  onPhoneCountryChange,
  phone,
  onPhoneChange,
  onSendSms,
  smsSending,
  error,
  verifying,
  onVerify,
  onResend,
  showDemoHint,
}: {
  email: string
  fullName: string
  onFullNameChange: (v: string) => void
  nicknameStatus: LiveStatus
  nicknameError?: string
  otp: string
  onOtpChange: (v: string) => void
  preferSms: boolean
  onPreferSmsOpenChange: (open: boolean) => void
  phoneCountry: string
  onPhoneCountryChange: (iso: string) => void
  phone: string
  onPhoneChange: (v: string) => void
  onSendSms: () => void
  smsSending?: boolean
  error?: string
  verifying: boolean
  onVerify: () => void
  onResend: () => void
  showDemoHint?: boolean
}) {
  const dial = getDialCountry(phoneCountry).dial
  const phoneDisplay = formatE164(dial, phone)
  const dest =
    preferSms && phone.replace(/\D/g, '').length >= 7
      ? phoneDisplay
      : email.trim() || 'your email'
  const showNickError =
    nicknameStatus === 'invalid' || Boolean(nicknameError && fullName.trim())
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <h2 className="shrink-0 text-[18px] font-bold tracking-tight text-foreground">
        Verify your account
      </h2>
      <p className="mt-1.5 text-[13px] leading-snug text-muted-foreground">
        We sent a code to{' '}
        <span className="font-medium text-foreground">{dest}</span>.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <Field
          label="Nickname"
          required
          error={showNickError ? nicknameError : undefined}
        >
          <div className="relative">
            <Input
              type="text"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              autoComplete="username"
              spellCheck={false}
              className={cn(fieldClass, 'pr-10')}
              aria-label="Nickname"
              aria-invalid={nicknameStatus === 'invalid'}
              placeholder="Nickname"
              autoFocus
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <FieldStatusIcon status={nicknameStatus} />
            </span>
          </div>
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-muted-foreground">
            Verification code <span className="text-primary">*</span>
          </span>
          <AuthOtpInput value={otp} onChange={onOtpChange} disabled={verifying} />
        </div>

        <div className="space-y-2">
          <button
            type="button"
            aria-expanded={preferSms}
            onClick={() => onPreferSmsOpenChange(!preferSms)}
            className="flex w-full items-center gap-3 py-1 text-left"
          >
            <span className={cn('shrink-0 text-[13px]', authLinkClass)}>
              I prefer to receive SMS
            </span>
            <span className="h-px min-w-0 flex-1 bg-border" aria-hidden />
            <IconChevronDown
              className={cn(
                'size-4 shrink-0 text-muted-foreground transition-transform',
                preferSms && 'rotate-180',
              )}
              strokeWidth={2.25}
              aria-hidden
            />
          </button>
          {preferSms ? (
            <PhoneSmsField
              countryIso={phoneCountry}
              onCountryChange={onPhoneCountryChange}
              national={phone}
              onNationalChange={onPhoneChange}
              onSendSms={onSendSms}
              sending={smsSending}
              disabled={verifying}
            />
          ) : null}
        </div>

        <button
          type="button"
          onClick={onResend}
          className="self-start text-[12px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Resend code
        </button>

        {showDemoHint ? (
          <p className="text-[12px] text-muted-foreground">Demo code: 12345</p>
        ) : null}

        {error ? <p className="-mt-1 text-xs text-primary">{error}</p> : null}

        <Button
          type="button"
          className="mt-1 h-10 w-full text-sm font-semibold"
          disabled={
            verifying ||
            nicknameStatus !== 'available' ||
            Boolean(validateOtp(otp))
          }
          aria-busy={verifying}
          onClick={onVerify}
        >
          {verifying ? (
            <IconLoader2
              className="size-5 animate-spin text-primary-foreground"
              strokeWidth={2.25}
              aria-label="Verifying"
            />
          ) : (
            'Complete'
          )}
        </Button>
      </div>
    </div>
  )
}

/** Account-created step — Lumen card + shell gift mark (not BOL Tabler/red). */
function JoinWelcomePanel({
  email,
  fullName,
  onContinue,
}: {
  email: string
  fullName: string
  onContinue: () => void
}) {
  const name = fullName.trim() || 'there'
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-2 text-center">
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.05 }}
        className="relative"
      >
        <span className="relative flex size-16 items-center justify-center rounded-full bg-primary">
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.25 }}
          >
            <IconCheck className="size-8 text-primary-foreground" stroke={3} />
          </motion.span>
        </span>
      </motion.div>

      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        className="mt-7"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Built for Winners.
        </p>
        <h3 className="mt-2 text-[26px] font-bold leading-tight tracking-tight text-foreground sm:text-[28px]">
          Welcome, {name}!
          <br />
          <span className="text-[22px] font-semibold sm:text-[24px]">
            Your account is ready.
          </span>
        </h3>
      </motion.div>

      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.35 }}
        className="mt-7 w-full rounded-[10px] border border-border bg-card p-4 text-left shadow-[0_0_16px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <ShellIcon name="gift" tone="surface" className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-muted-foreground">Welcome offer</p>
            <p className="mt-1 text-[13px] font-semibold leading-snug text-foreground">
              $250 in Free Sports Bets{' '}
              <span className="font-normal text-muted-foreground">+</span> 100 Free Spins
            </p>
            <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
              On your first deposit.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.3 }}
        className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs text-muted-foreground"
      >
        <IconMail className="size-3.5 shrink-0" />
        Activation link sent to{' '}
        <span className="font-medium text-foreground">{email || 'your email'}</span>
      </motion.p>

      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.35 }}
        className="mt-7 w-full"
      >
        <Button
          type="button"
          className="h-12 w-full gap-2 text-sm font-semibold"
          onClick={onContinue}
        >
          Let&apos;s Go
          <IconArrowRight className="size-[18px]" />
        </Button>
      </motion.div>
    </div>
  )
}

/**
 * Brand art is full-bleed (copy baked in). Portrait assets ~835×1024.
 * Login: “Built for winners.” Join / welcome: crypto welcome offer.
 */
function BrandPanel({ view }: { view: 'login' | 'join' | 'verify' | 'welcome' }) {
  const src =
    view === 'login'
      ? '/shell/auth/login-welcome.jpg'
      : '/shell/auth/welcome-offer-crypto.jpg'
  return (
    <div
      data-auth-brand=""
      className="relative hidden min-h-0 w-[55%] shrink-0 self-stretch overflow-hidden bg-primary min-[900px]:block"
      aria-hidden
    >
      <Image
        key={src}
        src={src}
        alt=""
        fill
        className="object-cover object-center"
        sizes="450px"
        priority
      />
    </div>
  )
}

/**
 * Join / Login — viewport-centered portal (never in #shell-scroll flow).
 * Layout inspired by BOL shad; Lumen tokens only.
 */
export function AuthModal() {
  const {
    authOpen,
    authView,
    setAuthView,
    closeAuth,
    completeLogin,
    completeJoin,
    joinJourney,
    setJoinJourney,
    joinJourneyLab,
  } = useShell()

  const finishJoin = useCallback(
    (email: string, fullName: string) => {
      completeJoin({ email: email.trim(), fullName: fullName.trim() })
      setJoin({ email: '', password: '', fullName: '', terms: false })
      setJoinTouched(false)
    },
    [completeJoin],
  )
  const [portalReady, setPortalReady] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  /** Show missing-password tip while focused / after blur; stays until rules pass. */
  const [passwordTipOpen, setPasswordTipOpen] = useState(false)
  const passwordFieldRef = useRef<HTMLDivElement>(null)
  const [login, setLogin] = useState({ identifier: '', password: '' })
  const [join, setJoin] = useState({
    email: '',
    password: '',
    fullName: '',
    terms: false,
  })
  const [referralOpen, setReferralOpen] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [joinTouched, setJoinTouched] = useState(false)
  /** Demo join API — spinner on CTA until resolve. */
  const [joining, setJoining] = useState(false)
  const [fullNameStatus, setFullNameStatus] = useState<LiveStatus>('idle')
  const [usernameStatus, setUsernameStatus] = useState<LiveStatus>('idle')
  const [emailStatus, setEmailStatus] = useState<LiveStatus>('idle')
  const [otp, setOtp] = useState('')
  const [preferSms, setPreferSms] = useState(false)
  const [phoneCountry, setPhoneCountry] = useState(DEFAULT_DIAL_COUNTRY)
  const [phone, setPhone] = useState('')
  const [smsSending, setSmsSending] = useState(false)
  const smsTimerRef = useRef<number | null>(null)
  const [verifyError, setVerifyError] = useState<string | undefined>()
  const [verifying, setVerifying] = useState(false)
  const [otpHint, setOtpHint] = useState(false)
  const emailCheckId = useRef(0)
  const usernameCheckId = useRef(0)
  const joinTimerRef = useRef<number | null>(null)
  const verifyTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setPortalReady(true)
    return () => {
      if (joinTimerRef.current) window.clearTimeout(joinTimerRef.current)
      if (verifyTimerRef.current) window.clearTimeout(verifyTimerRef.current)
    }
  }, [])

  /* Live email format + availability. */
  useEffect(() => {
    if (!authOpen || authView !== 'join') return
    const value = join.email
    const formatError = validateEmailFormat(value)
    if (!value.trim()) {
      setEmailStatus('idle')
      return
    }
    if (formatError) {
      setEmailStatus('invalid')
      return
    }

    setEmailStatus('checking')
    const checkId = ++emailCheckId.current
    const timer = window.setTimeout(() => {
      void checkEmailAvailable(value).then((available) => {
        if (checkId !== emailCheckId.current) return
        setEmailStatus(available ? 'available' : 'taken')
      })
    }, 320)

    return () => {
      window.clearTimeout(timer)
    }
  }, [join.email, authOpen, authView])

  /* Nickname live format on Verify (journeys 1 + 5). */
  useEffect(() => {
    if (!authOpen || authView !== 'verify') {
      setFullNameStatus('idle')
      return
    }
    const value = join.fullName
    if (!value.trim()) {
      setFullNameStatus('idle')
      return
    }
    const formatError = validateNickname(value)
    setFullNameStatus(formatError ? 'invalid' : 'available')
  }, [join.fullName, authOpen, authView])

  /* Lab switch — clear name/username so journey 1 vs 4 fields don’t collide. */
  useEffect(() => {
    if (!authOpen || authView !== 'join') return
    setJoin((prev) => (prev.fullName ? { ...prev, fullName: '' } : prev))
    setFullNameStatus('idle')
    setUsernameStatus('idle')
    usernameCheckId.current += 1
  }, [joinJourney, authOpen, authView])

  /* Journey 4 — Username live availability (same demo check as before). */
  useEffect(() => {
    if (!authOpen || authView !== 'join' || joinJourney !== 4) {
      setUsernameStatus('idle')
      return
    }
    const value = join.fullName
    const formatError = validateUsernameFormat(value)
    if (!value.trim()) {
      setUsernameStatus('idle')
      return
    }
    if (formatError) {
      setUsernameStatus('invalid')
      return
    }

    setUsernameStatus('checking')
    const checkId = ++usernameCheckId.current
    const timer = window.setTimeout(() => {
      void checkUsernameAvailable(value).then((available) => {
        if (checkId !== usernameCheckId.current) return
        setUsernameStatus(available ? 'available' : 'taken')
      })
    }, 320)

    return () => {
      window.clearTimeout(timer)
    }
  }, [join.fullName, authOpen, authView, joinJourney])

  /**
   * Join → welcome (“You’re in”) → Let’s Go / X → completeJoin + cashier.
   * Login → completeLogin + Daily Spin (never welcome).
   */
  const dismissAuth = useCallback(() => {
    if (authView === 'welcome') {
      finishJoin(join.email, join.fullName)
      return
    }
    /* Verify incomplete — close without creating the account. */
    closeAuth()
  }, [authView, closeAuth, finishJoin, join.email, join.fullName])

  /** After demo “create account” — show welcome, don’t skip straight to cashier. */
  const goToJoinWelcome = useCallback(
    (email: string, fullName: string) => {
      setJoin({
        email: email.trim(),
        password: '',
        fullName: fullName.trim(),
        terms: true,
      })
      setJoinTouched(false)
      setJoining(false)
      setVerifying(false)
      setAuthView('welcome')
    },
    [setAuthView],
  )

  /** Journey 1/5 — email/password done → verify (OTP + Nickname) before welcome. */
  const goToJoinVerify = useCallback(
    (email: string, fullName = '') => {
      setJoin({
        email: email.trim(),
        password: '',
        fullName: fullName.trim(),
        terms: true,
      })
      setOtp('')
      setPreferSms(false)
      setPhoneCountry(DEFAULT_DIAL_COUNTRY)
      setPhone('')
      setSmsSending(false)
      setVerifyError(undefined)
      setOtpHint(false)
      setJoinTouched(false)
      setJoining(false)
      setVerifying(false)
      setAuthView('verify')
    },
    [setAuthView],
  )

  const submitSendSms = useCallback(() => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 7) {
      setVerifyError('Enter a valid mobile number')
      return
    }
    setVerifyError(undefined)
    setSmsSending(true)
    setOtp('')
    if (smsTimerRef.current) window.clearTimeout(smsTimerRef.current)
    smsTimerRef.current = window.setTimeout(() => {
      smsTimerRef.current = null
      setSmsSending(false)
      setOtpHint(true)
    }, 650)
  }, [phone])

  const submitVerify = useCallback(() => {
    const nameErr = validateNickname(join.fullName)
    const otpErr = validateOtp(otp)
    /* Phone is optional even when SMS preferred. */
    if (nameErr || otpErr) {
      setVerifyError(nameErr || otpErr)
      return
    }
    /* Demo: 12345 always works; any other 5 digits also pass. */
    if (otp.trim() !== DEMO_OTP && !/^\d{5}$/.test(otp.trim())) {
      setVerifyError('Enter the 5-digit code')
      return
    }
    setVerifyError(undefined)
    setVerifying(true)
    if (verifyTimerRef.current) window.clearTimeout(verifyTimerRef.current)
    verifyTimerRef.current = window.setTimeout(() => {
      verifyTimerRef.current = null
      goToJoinWelcome(join.email, join.fullName)
    }, 700)
  }, [join.email, join.fullName, otp, goToJoinWelcome])

  useEffect(() => {
    if (!authOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismissAuth()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [authOpen, dismissAuth])

  useEffect(() => {
    if (!authOpen) {
      setPasswordVisible(false)
      setPasswordTipOpen(false)
      setJoinTouched(false)
      setJoining(false)
      if (joinTimerRef.current) {
        window.clearTimeout(joinTimerRef.current)
        joinTimerRef.current = null
      }
      setFullNameStatus('idle')
      setUsernameStatus('idle')
      setEmailStatus('idle')
      setOtp('')
      setPreferSms(false)
      setPhoneCountry(DEFAULT_DIAL_COUNTRY)
      setPhone('')
      setSmsSending(false)
      setVerifyError(undefined)
      setVerifying(false)
      setOtpHint(false)
      emailCheckId.current += 1
      usernameCheckId.current += 1
      if (verifyTimerRef.current) {
        window.clearTimeout(verifyTimerRef.current)
        verifyTimerRef.current = null
      }
      if (smsTimerRef.current) {
        window.clearTimeout(smsTimerRef.current)
        smsTimerRef.current = null
      }
    }
  }, [authOpen])

  useEffect(() => {
    if (authView !== 'join') {
      setPasswordTipOpen(false)
      setJoining(false)
      if (joinTimerRef.current) {
        window.clearTimeout(joinTimerRef.current)
        joinTimerRef.current = null
      }
      setFullNameStatus('idle')
      setUsernameStatus('idle')
      setEmailStatus('idle')
    }
  }, [authView])

  /* Tip only while password has content and still fails rules — clear field hides it. */
  useEffect(() => {
    if (!authOpen || authView !== 'join') return
    if (join.password.length === 0) {
      setPasswordTipOpen(false)
    } else if (!passwordMeetsAll(join.password)) {
      setPasswordTipOpen(true)
    } else {
      setPasswordTipOpen(false)
    }
  }, [join.password, authOpen, authView])

  /* BOL join confirmation — side cannons + centre pop. */
  useEffect(() => {
    if (!authOpen || authView !== 'welcome') return
    const t = window.setTimeout(() => fireJoinWelcomeConfetti(), 120)
    return () => window.clearTimeout(t)
  }, [authOpen, authView])

  if (!authOpen || !portalReady) return null

  const emailFormatError = validateEmailFormat(join.email)
  const fullNameFormatError = validateNickname(join.fullName)
  const usernameFormatError = validateUsernameFormat(join.fullName)
  /* Nickname lives on Verify (journeys 1 + 5) — never on the join form. */
  const needsFullNameAtJoin = false
  const needsUsernameAtJoin = joinJourney === 4
  const needsVerifyStep = joinJourney === 1 || joinJourney === 5
  const emailLiveError =
    emailStatus === 'taken'
      ? 'Email is already registered'
      : emailStatus === 'invalid'
        ? emailFormatError
        : undefined
  const usernameLiveError =
    usernameStatus === 'taken'
      ? 'Username is taken'
      : usernameStatus === 'invalid'
        ? usernameFormatError
        : undefined
  const joinErrors = {
    email: emailFormatError ?? emailLiveError,
    password: !passwordMeetsAll(join.password) ? 'Password does not meet all requirements' : undefined,
    fullName: needsFullNameAtJoin ? fullNameFormatError : undefined,
    username: needsUsernameAtJoin
      ? (usernameFormatError ?? usernameLiveError)
      : undefined,
    terms: !join.terms ? 'Confirm you are 18+ and agree to the terms' : undefined,
  }
  const emailOk = emailStatus === 'available' && !emailFormatError
  const fullNameOk =
    !needsFullNameAtJoin || (fullNameStatus === 'available' && !fullNameFormatError)
  const usernameOk =
    !needsUsernameAtJoin || (usernameStatus === 'available' && !usernameFormatError)
  const joinValid =
    emailOk && fullNameOk && usernameOk && !joinErrors.password && !joinErrors.terms
  const loginValid =
    login.identifier.trim().length > 0 && login.password.trim().length >= 6

  const tabs: { id: AuthModalView; label: string }[] = [
    { id: 'login', label: 'Login' },
    { id: 'join', label: 'Join' },
  ]

  /* Single body child — carved out of legacy `body > div { position: relative }` rules.
     Solid shell only — dark `--card` is translucent (#fafafa0d); never use bg-card here. */
  return createPortal(
    <div
      data-auth-modal-root=""
      data-brand="betonline"
      className="dark fixed inset-0 z-[220] flex items-center justify-center p-3 sm:p-5 text-foreground"
      role="presentation"
      onClick={dismissAuth}
    >
      <div aria-hidden className="absolute inset-0 bg-black/70" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        data-auth-modal=""
        data-brand="betonline"
        className={cn(
          /* Always dark — ignore site light theme (same as VIP Hub / game launcher). */
          'dark relative z-[1] flex w-full max-w-[820px] flex-col overflow-hidden',
          'min-[900px]:h-[min(86dvh,640px)] min-[900px]:flex-row min-[900px]:items-stretch',
          'h-[min(90dvh,640px)] rounded-xl border border-white/15 text-foreground',
          'bg-background/40 shadow-[0_24px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)]',
          'backdrop-blur-2xl',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <BrandPanel view={authView} />

        <div
          data-auth-form=""
          className={cn(
            'relative flex h-full min-h-0 w-full min-w-0 flex-col',
            'bg-background/35 backdrop-blur-2xl',
            'shadow-[inset_1px_0_0_rgba(255,255,255,0.06)]',
            'min-[900px]:w-[45%] min-[900px]:shrink-0',
          )}
        >
          <button
            type="button"
            onClick={dismissAuth}
            aria-label="Close"
            className={cn(
              'shell-chrome-btn absolute right-3 top-3 z-20 inline-flex size-9 shrink-0 items-center justify-center',
              'rounded-lg border border-border bg-secondary text-foreground shadow-sm',
              'transition-colors hover:bg-accent active:bg-accent',
            )}
          >
            <IconX className="size-4" stroke={2} />
          </button>
          <div className="flex w-full shrink-0 items-center border-b border-border px-5 pr-12">
            {authView === 'welcome' ? (
              <h2
                id="auth-modal-title"
                className="py-3.5 text-[15px] font-semibold text-foreground"
              >
                You&apos;re in
              </h2>
            ) : authView === 'verify' ? (
              <h2
                id="auth-modal-title"
                className="py-3.5 text-[15px] font-semibold text-foreground"
              >
                Verify
              </h2>
            ) : (
              <div className="flex gap-6" role="tablist" aria-label="Account">
                {tabs.map((tab) => {
                  const active = authView === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => setAuthView(tab.id)}
                      className={cn(
                        'relative py-3.5 text-[15px] font-semibold transition-colors focus-visible:outline-none',
                        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {tab.label}
                      {active ? (
                        <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Form stack — fields fill the column (Rainbet gutters, no max-w dead space). */}
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto px-5 pb-5 pt-4">
            {authView === 'welcome' ? (
              <JoinWelcomePanel
                email={join.email.trim()}
                fullName={join.fullName.trim()}
                onContinue={() => {
                  completeJoin({
                    email: join.email.trim(),
                    fullName: join.fullName.trim(),
                  })
                  setJoin({ email: '', password: '', fullName: '', terms: false })
                  setJoinTouched(false)
                }}
              />
            ) : authView === 'verify' ? (
              <JoinVerifyPanel
                email={join.email.trim()}
                fullName={join.fullName}
                onFullNameChange={(v) => {
                  setJoin((prev) => ({ ...prev, fullName: v }))
                  setVerifyError(undefined)
                }}
                nicknameStatus={fullNameStatus}
                nicknameError={
                  fullNameStatus === 'invalid' ? fullNameFormatError : undefined
                }
                otp={otp}
                onOtpChange={(v) => {
                  setOtp(v)
                  setVerifyError(undefined)
                }}
                preferSms={preferSms}
                onPreferSmsOpenChange={(open) => {
                  setPreferSms(open)
                  if (!open) {
                    setPhone('')
                    setSmsSending(false)
                  } else {
                    /* Geo-default country when SMS expands. */
                    void fetch('/api/geo/country')
                      .then((r) => r.json())
                      .then((data: { country?: string }) => {
                        setPhoneCountry(resolveDialCountryIso(data.country))
                      })
                      .catch(() => {
                        setPhoneCountry(DEFAULT_DIAL_COUNTRY)
                      })
                  }
                  setVerifyError(undefined)
                }}
                phoneCountry={phoneCountry}
                onPhoneCountryChange={(iso) => {
                  setPhoneCountry(iso)
                  setVerifyError(undefined)
                }}
                phone={phone}
                onPhoneChange={(v) => {
                  setPhone(v)
                  setVerifyError(undefined)
                }}
                onSendSms={submitSendSms}
                smsSending={smsSending}
                error={verifyError}
                verifying={verifying}
                onVerify={submitVerify}
                onResend={() => {
                  setOtp('')
                  setOtpHint(true)
                  setVerifyError(undefined)
                }}
                showDemoHint={otpHint}
              />
            ) : authView === 'login' ? (
              <>
                <h2 id="auth-modal-title" className="shrink-0 text-[18px] font-bold tracking-tight text-foreground">
                  Welcome back
                </h2>
                <div className="mt-3 flex flex-col gap-3">
                  <Field label="Email or Customer ID" required>
                    <Input
                      type="text"
                      value={login.identifier}
                      onChange={(e) =>
                        setLogin((prev) => ({ ...prev, identifier: e.target.value }))
                      }
                      autoComplete="username"
                      inputMode="email"
                      className={fieldClass}
                      aria-label="Email or Customer ID"
                      placeholder="Email or Customer ID"
                    />
                  </Field>
                  <Field label="Password" required>
                    <div className="relative">
                      <Input
                        type={passwordVisible ? 'text' : 'password'}
                        value={login.password}
                        onChange={(e) => setLogin((prev) => ({ ...prev, password: e.target.value }))}
                        autoComplete="current-password"
                        className={cn(fieldClass, 'pr-11')}
                        aria-label="Password"
                      />
                      <PasswordToggle
                        visible={passwordVisible}
                        onToggle={() => setPasswordVisible((v) => !v)}
                      />
                    </div>
                  </Field>
                  <div className="flex justify-end">
                    <button type="button" className={cn('text-[13px]', authLinkClass)}>
                      Forgot password?
                    </button>
                  </div>
                  <Button
                    type="button"
                    className="h-10 w-full text-sm font-semibold"
                    disabled={!loginValid}
                    onClick={() => {
                      const id = login.identifier.trim()
                      if (id.includes('@')) {
                        completeLogin({ email: id })
                      } else {
                        completeLogin({ username: id })
                      }
                    }}
                  >
                    Log in
                  </Button>

                  <SocialSignUpOptions
                    mode="login"
                    busy={joining}
                    onPick={(provider) => {
                      /* Returning player — completeLogin + Daily Spin. Never join/Intercom welcome. */
                      if (joining) return
                      const picked = SOCIAL_PROVIDERS.find((p) => p.id === provider)
                      if (!picked) return
                      setJoinTouched(false)
                      setPasswordTipOpen(false)
                      setJoining(true)
                      if (joinTimerRef.current) window.clearTimeout(joinTimerRef.current)
                      joinTimerRef.current = window.setTimeout(() => {
                        joinTimerRef.current = null
                        setJoining(false)
                        completeLogin({
                          email: picked.email,
                          username: picked.fullName,
                        })
                      }, 900)
                    }}
                  />
                </div>
                <p className="mt-auto shrink-0 pt-4 text-center text-sm text-muted-foreground">
                  New here?{' '}
                  <button
                    type="button"
                    className={authLinkClass}
                    onClick={() => setAuthView('join')}
                  >
                    Join now
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2 id="auth-modal-title" className="shrink-0 text-[18px] font-bold tracking-tight text-foreground">
                  Create an account
                </h2>
                <div className="mt-3 flex flex-col gap-2.5">
                  <Field
                    label="Email"
                    required
                    error={
                      joinTouched || emailStatus === 'taken' || emailStatus === 'invalid'
                        ? joinErrors.email
                        : undefined
                    }
                  >
                    <div className="relative">
                      <Input
                        type="email"
                        value={join.email}
                        onChange={(e) => setJoin((prev) => ({ ...prev, email: e.target.value }))}
                        autoComplete="email"
                        className={cn(fieldClass, 'pr-10')}
                        aria-label="Email"
                        aria-busy={emailStatus === 'checking'}
                        aria-invalid={emailStatus === 'taken' || emailStatus === 'invalid'}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        <FieldStatusIcon status={emailStatus} />
                      </span>
                    </div>
                  </Field>
                  {needsFullNameAtJoin ? (
                    <Field
                      label="Nickname"
                      required
                      error={
                        joinTouched || fullNameStatus === 'invalid'
                          ? joinErrors.fullName
                          : undefined
                      }
                    >
                      <div className="relative">
                        <Input
                          type="text"
                          value={join.fullName}
                          onChange={(e) =>
                            setJoin((prev) => ({
                              ...prev,
                              fullName: e.target.value,
                            }))
                          }
                          autoComplete="username"
                          spellCheck={false}
                          className={cn(fieldClass, 'pr-10')}
                          aria-label="Nickname"
                          aria-invalid={fullNameStatus === 'invalid'}
                          placeholder="Nickname"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                          <FieldStatusIcon status={fullNameStatus} />
                        </span>
                      </div>
                    </Field>
                  ) : null}
                  {needsUsernameAtJoin ? (
                    <Field
                      label="Username"
                      required
                      error={
                        joinTouched ||
                        usernameStatus === 'taken' ||
                        usernameStatus === 'invalid'
                          ? joinErrors.username
                          : undefined
                      }
                    >
                      <div className="relative">
                        <Input
                          type="text"
                          value={join.fullName}
                          onChange={(e) =>
                            setJoin((prev) => ({
                              ...prev,
                              fullName: e.target.value.replace(/\s/g, ''),
                            }))
                          }
                          autoComplete="username"
                          spellCheck={false}
                          className={cn(fieldClass, 'pr-10')}
                          aria-label="Username"
                          aria-busy={usernameStatus === 'checking'}
                          aria-invalid={
                            usernameStatus === 'taken' || usernameStatus === 'invalid'
                          }
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                          <FieldStatusIcon status={usernameStatus} />
                        </span>
                      </div>
                    </Field>
                  ) : null}
                  <Field label="Password" required>
                    <div
                      ref={passwordFieldRef}
                      className="relative"
                      onMouseEnter={() => {
                        if (join.password.length > 0 && !passwordMeetsAll(join.password)) {
                          setPasswordTipOpen(true)
                        }
                      }}
                    >
                      <Input
                        type={passwordVisible ? 'text' : 'password'}
                        value={join.password}
                        onChange={(e) => {
                          const next = e.target.value
                          setJoin((prev) => ({ ...prev, password: next }))
                          if (next.length === 0) {
                            setPasswordTipOpen(false)
                          } else if (!passwordMeetsAll(next)) {
                            setPasswordTipOpen(true)
                          } else {
                            setPasswordTipOpen(false)
                          }
                        }}
                        onFocus={() => {
                          if (join.password.length > 0 && !passwordMeetsAll(join.password)) {
                            setPasswordTipOpen(true)
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.currentTarget.value
                          if (value.length === 0) {
                            setPasswordTipOpen(false)
                          } else if (!passwordMeetsAll(value)) {
                            setPasswordTipOpen(true)
                          }
                        }}
                        autoComplete="new-password"
                        className={cn(fieldClass, 'pr-11')}
                        aria-label="Password"
                      />
                      <PasswordToggle
                        visible={passwordVisible}
                        onToggle={() => setPasswordVisible((v) => !v)}
                      />
                    </div>
                  </Field>

                  <div className="space-y-2">
                    <button
                      type="button"
                      aria-expanded={referralOpen}
                      onClick={() => setReferralOpen((open) => !open)}
                      className="flex w-full items-center gap-3 py-1 text-left"
                    >
                      <span className="shrink-0 text-[13px] text-muted-foreground">
                        Referral Code{' '}
                        <span className="italic text-muted-foreground/80">(optional)</span>
                        {joinJourneyLab ? (
                          <span className="ml-1 not-italic text-muted-foreground/70">
                            · lab {joinJourney}
                          </span>
                        ) : null}
                      </span>
                      <span className="h-px min-w-0 flex-1 bg-border" aria-hidden />
                      <IconChevronDown
                        className={cn(
                          'size-4 shrink-0 text-muted-foreground transition-transform',
                          referralOpen && 'rotate-180',
                        )}
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    </button>
                    {referralOpen ? (
                      <Input
                        type="text"
                        value={referralCode}
                        onChange={(e) => {
                          const v = e.target.value
                          setReferralCode(v)
                          if (joinJourneyLab) {
                            const next = parseLabJourneyCode(v)
                            if (next) setJoinJourney(next)
                          }
                        }}
                        autoComplete="off"
                        spellCheck={false}
                        placeholder={
                          joinJourneyLab ? 'Code — or type 1 / 2 / 3 / 4 / 5' : 'Enter code'
                        }
                        className={fieldClass}
                        aria-label="Referral code"
                      />
                    ) : null}
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 pt-1">
                    <Checkbox
                      checked={join.terms}
                      onCheckedChange={(checked) =>
                        setJoin((prev) => ({ ...prev, terms: checked === true }))
                      }
                      className="mt-0.5 size-[18px] shrink-0 rounded-[4px] border-input"
                    />
                    <span className="text-[13px] leading-snug text-muted-foreground">
                      I acknowledge that I am over the age of 18 and agree to the{' '}
                      <span className={authLinkClass}>Terms and Conditions</span>
                    </span>
                  </label>
                  {joinTouched && joinErrors.terms ? (
                    <p className="-mt-1 text-xs text-primary">{joinErrors.terms}</p>
                  ) : null}

                  <Button
                    type="button"
                    className="h-10 w-full shrink-0 text-sm font-semibold"
                    disabled={
                      joining ||
                      !joinValid ||
                      emailStatus === 'checking' ||
                      usernameStatus === 'checking'
                    }
                    aria-busy={joining}
                    onClick={() => {
                      setJoinTouched(true)
                      if (join.password.length > 0 && !passwordMeetsAll(join.password)) {
                        setPasswordTipOpen(true)
                      }
                      if (!joinValid || joining) return
                      setPasswordTipOpen(false)
                      setJoining(true)
                      if (joinTimerRef.current) window.clearTimeout(joinTimerRef.current)
                      joinTimerRef.current = window.setTimeout(() => {
                        joinTimerRef.current = null
                        if (needsVerifyStep) {
                          goToJoinVerify(join.email)
                          return
                        }
                        goToJoinWelcome(
                          join.email,
                          needsFullNameAtJoin || needsUsernameAtJoin
                            ? join.fullName
                            : '',
                        )
                      }, 1100)
                    }}
                  >
                    {joining ? (
                      <IconLoader2
                        className="size-5 animate-spin text-primary-foreground"
                        strokeWidth={2.25}
                        aria-label="Creating account"
                      />
                    ) : needsVerifyStep ? (
                      'Next'
                    ) : (
                      'Join & Play'
                    )}
                  </Button>
                </div>
                <div className="mt-auto shrink-0 pt-4">
                  <SocialSignUpOptions
                    mode="join"
                    busy={joining}
                    onPick={(provider) => {
                      /* New account — welcome modal, then cashier. Never Daily Spin. */
                      if (joining) return
                      const picked = SOCIAL_PROVIDERS.find((p) => p.id === provider)
                      if (!picked) return
                      setJoinTouched(false)
                      setPasswordTipOpen(false)
                      setJoining(true)
                      if (joinTimerRef.current) window.clearTimeout(joinTimerRef.current)
                      joinTimerRef.current = window.setTimeout(() => {
                        joinTimerRef.current = null
                        if (joinJourney === 1 || joinJourney === 5) {
                          goToJoinVerify(picked.email, picked.fullName)
                          return
                        }
                        goToJoinWelcome(picked.email, picked.fullName)
                      }, 900)
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sibling of dialog — escapes overflow:hidden; stays above modal chrome. */}
      {authView === 'join' ? (
        <PasswordCriteriaTip
          open={
            passwordTipOpen &&
            join.password.length > 0 &&
            !passwordMeetsAll(join.password)
          }
          password={join.password}
          anchorRef={passwordFieldRef}
        />
      ) : null}
    </div>,
    document.body,
  )
}
