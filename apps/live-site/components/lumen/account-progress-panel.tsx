'use client'

import { useState } from 'react'
import { IconCheck, IconChevronRight } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ACCOUNT_LEVEL_META,
  accountLevel,
  hasFullName,
  type AccountLevel,
} from '@/lib/lumen/join-journeys'
import { useShell } from '@/components/site/shell-context'
import { cn } from '@/lib/utils'

const fieldClass = cn(
  'h-9 w-full rounded-lg border border-input bg-popover px-3 text-sm text-foreground',
  'placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
)

const STEP_SHORT = ['Profile', 'Identity', 'Address', 'KYC'] as const

function nextHint(level: AccountLevel): string {
  if (level >= 4) return 'All levels unlocked'
  if (level === 0) return 'Add a phone to reach Level 1'
  if (level === 1) return 'Add DOB + Full Name for Level 2'
  if (level === 2) return 'Add your address for Level 3'
  return 'Verify ID for Level 4'
}

/** Journey 3 only — compact account ladder (not a full-page checklist). */
export function AccountProgressPanel() {
  const { profile, updateProfile, setDateOfBirth, joinJourney, joinJourneyLab } = useShell()
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [fullName, setFullName] = useState(profile.fullName)
  const [dob, setDob] = useState(profile.dateOfBirth ?? '')
  const [address, setAddress] = useState(profile.address ?? '')

  if (!joinJourneyLab || joinJourney !== 3) return null

  const level = accountLevel(profile)
  const pct = Math.round((Math.min(level, 4) / 4) * 100)
  const currentMeta = ACCOUNT_LEVEL_META.find((row) => row.level === Math.min(level + 1, 4))

  const save = () => {
    updateProfile({
      phone: phone.trim() || null,
      fullName: hasFullName(fullName) ? fullName.trim() : profile.fullName,
      address: address.trim() || null,
    })
    if (dob) setDateOfBirth(dob)
  }

  return (
    <div
      data-name="account-progress"
      className="rounded-[10px] border border-border bg-card p-3 shadow-[0_0_16px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Account progress
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
            {level >= 4 ? 'Complete' : nextHint(level)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums text-foreground">{pct}%</p>
          <p className="text-[11px] tabular-nums text-muted-foreground">
            L{level}/4
          </p>
        </div>
      </div>

      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-muted-2">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="mt-3 flex items-center gap-1">
        {STEP_SHORT.map((label, i) => {
          const step = (i + 1) as AccountLevel
          const done = level >= step
          const current = level + 1 === step || (level === 0 && step === 1)
          return (
            <li key={label} className="flex min-w-0 flex-1 items-center gap-1">
              <div
                className={cn(
                  'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-md px-1 py-1.5',
                  current && 'bg-primary/10',
                )}
              >
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full text-[10px] font-bold',
                    done
                      ? 'bg-success text-success-foreground'
                      : current
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-muted-2 text-muted-foreground',
                  )}
                >
                  {done ? <IconCheck className="size-3" stroke={3} /> : step}
                </span>
                <span
                  className={cn(
                    'w-full truncate text-center text-[10px] font-medium',
                    done || current ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEP_SHORT.length - 1 ? (
                <IconChevronRight
                  className="size-3 shrink-0 text-muted-foreground/50"
                  stroke={2}
                  aria-hidden
                />
              ) : null}
            </li>
          )
        })}
      </ol>

      {level < 4 && currentMeta ? (
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
          Unlocks: {currentMeta.unlocks}
        </p>
      ) : null}

      {level < 4 ? (
        <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
          {level === 0 ? (
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
              className={fieldClass}
              inputMode="tel"
              aria-label="Phone"
            />
          ) : null}
          {level === 1 ? (
            <>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="First Name, Last Name"
                className={fieldClass}
                autoComplete="name"
                aria-label="Full Name"
              />
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={fieldClass}
                aria-label="Date of birth"
              />
            </>
          ) : null}
          {level === 2 ? (
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, state, zip"
              className={fieldClass}
              aria-label="Address"
            />
          ) : null}
          <div className="flex items-center gap-2">
            {level < 3 ? (
              <Button type="button" size="sm" className="h-8" onClick={save}>
                Save
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="h-8"
                disabled={profile.kycVerified}
                onClick={() => updateProfile({ kycVerified: true })}
              >
                {profile.kycVerified ? 'KYC verified' : 'Simulate KYC'}
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
