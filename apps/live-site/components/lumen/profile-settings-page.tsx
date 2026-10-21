'use client'

import { IconInfoCircle } from '@tabler/icons-react'
import { LumenTooltip } from '@/components/ui/lumen-tooltip'
import {
  PROFILE_DETAIL_FIELDS,
  PROFILE_PERSONAL_DETAILS,
} from '@/lib/lumen/profile-settings'
import { cn } from '@/lib/utils'

const ASSET = '/shell/figma/account'

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full flex-col gap-0.5 lg:w-[200px]">
      <p className="text-[10px] font-semibold uppercase leading-[14px] text-muted-foreground">
        {label}
      </p>
      <p className="text-sm leading-5 text-secondary-foreground">{value}</p>
    </div>
  )
}

/**
 * Profile Settings — Figma WIP FkOhqSjo1EeNzvEvh4iM8s
 * Desktop filled 11129:29784 · mobile 11129:29791 · skeleton 11129:28318
 */
export function ProfileSettingsPage({ className }: { className?: string }) {
  const details = PROFILE_PERSONAL_DETAILS

  return (
    <section
      data-name="section-profile-settings"
      className={cn(
        'flex w-full flex-col gap-4 bg-background px-4 pb-14 pt-4 lg:px-6 lg:pt-6',
        className,
      )}
    >
      <div className="flex items-center gap-1.5">
        <h1 className="text-xl font-semibold leading-7 text-foreground lg:text-2xl lg:leading-8">
          Profile Settings
        </h1>
        <LumenTooltip label="View your personal account information" side="bottom">
          <button
            type="button"
            aria-label="About Profile Settings"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <IconInfoCircle className="size-4" stroke={1.75} aria-hidden />
          </button>
        </LumenTooltip>
      </div>

      <div
        data-name="module-personal-details"
        className="rounded-[10px] border border-border bg-card p-4 shadow-[0_0_16px_rgba(0,0,0,0.06)]"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${ASSET}/shield-person.svg`}
              alt=""
              width={32}
              height={32}
              className="size-8 shrink-0 brightness-0 dark:invert"
            />
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold leading-6 text-card-foreground">
                Personal Details
              </p>
              <p className="text-sm leading-5 text-muted-foreground">
                View your personal account information.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-secondary p-5">
            {/* Mobile: single column */}
            <div className="flex flex-col gap-6 lg:hidden">
              {PROFILE_DETAIL_FIELDS.map((field) => (
                <DetailField key={field.key} label={field.label} value={details[field.key]} />
              ))}
            </div>

            {/* Desktop: three columns */}
            <div className="hidden gap-24 lg:flex">
              <div className="flex flex-col gap-6">
                <DetailField label="First Name" value={details.firstName} />
                <DetailField label="Last Name" value={details.lastName} />
                <DetailField label="Email Address" value={details.email} />
              </div>
              <div className="flex flex-col gap-6">
                <DetailField label="Mobile Number" value={details.mobile} />
                <DetailField label="Country" value={details.country} />
                <DetailField label="State" value={details.state} />
              </div>
              <div className="flex flex-col gap-6">
                <DetailField label="Address" value={details.address} />
                <DetailField label="City" value={details.city} />
                <DetailField label="Zip Code" value={details.zipCode} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
