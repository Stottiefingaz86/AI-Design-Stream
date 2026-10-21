'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  IconAlertTriangleFilled,
  IconChevronRight,
  IconDevices,
  IconInfoCircle,
  IconKey,
  IconShieldCheck,
  IconShieldLock,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { LumenTooltip } from '@/components/ui/lumen-tooltip'
import { cn } from '@/lib/utils'

function LocatorCard({
  icon,
  title,
  description,
  trailing,
  onClick,
  href,
}: {
  icon: ReactNode
  title: ReactNode
  description: string
  trailing: ReactNode
  onClick?: () => void
  href?: string
}) {
  const body = (
    <>
      <span className="inline-flex size-8 shrink-0 items-center justify-center text-foreground">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2 text-base font-semibold leading-6 text-card-foreground">
          {title}
        </div>
        <p className="text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
      <div className="shrink-0">{trailing}</div>
    </>
  )

  const className = cn(
    'flex w-full items-center gap-4 rounded-[10px] border border-border bg-card p-4 text-left shadow-[0_0_16px_rgba(0,0,0,0.06)]',
    (onClick || href) && 'transition-colors hover:bg-accent/40',
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    )
  }

  return <div className={className}>{body}</div>
}

/**
 * Security Central home — Figma WIP OLtqQMwYLpOF0DfqMBK45a
 * Desktop section 8292:59539 · skeleton 8214:68763
 */
export function SecurityCentralPage({ className }: { className?: string }) {
  const [twoFaEnabled, setTwoFaEnabled] = useState(false)

  const toggle2fa = () => {
    setTwoFaEnabled((prev) => {
      const next = !prev
      toast.success(next ? '2-Factor Authentication enabled!' : '2-Factor Authentication disabled.')
      return next
    })
  }

  return (
    <section
      data-name="section-security-central"
      className={cn('w-full bg-background px-4 pb-14 pt-4 lg:px-6 lg:pt-6', className)}
    >
      <div className="mb-4 flex items-center gap-1.5">
        <h1 className="text-xl font-semibold leading-7 text-foreground lg:text-2xl lg:leading-8">
          Security Central
        </h1>
        <LumenTooltip label="Manage account security settings and trusted devices" side="bottom">
          <button
            type="button"
            aria-label="About Security Central"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <IconInfoCircle className="size-4" stroke={1.75} aria-hidden />
          </button>
        </LumenTooltip>
      </div>

      <div className="flex flex-col gap-3">
        <LocatorCard
          href="/account/security/recommendations"
          icon={<IconShieldCheck className="size-8" stroke={1.5} />}
          title="Security Recommendations"
          description="Access security settings to protect your account."
          trailing={
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary text-foreground">
              <IconChevronRight className="size-4" stroke={2} />
            </span>
          }
        />

        <LocatorCard
          href="/account/security/trusted-devices"
          icon={<IconDevices className="size-8" stroke={1.5} />}
          title="Trusted Devices"
          description="Devices where your account has been active."
          trailing={
            <span className="inline-flex size-10 items-center justify-center rounded-full text-foreground">
              <IconChevronRight className="size-4" stroke={2} />
            </span>
          }
        />

        <LocatorCard
          icon={<IconKey className="size-8" stroke={1.5} />}
          title="Change Password"
          description="Choose a strong password and do not use it on other accounts."
          trailing={
            <Button type="button" size="lg" className="h-9 w-[145px]">
              Change Password
            </Button>
          }
        />

        <LocatorCard
          icon={<IconShieldLock className="size-8" stroke={1.5} />}
          title={
            <>
              2-Factor Authentication
              <span
                className={cn(
                  'inline-flex h-5 items-center gap-0.5 rounded-full border px-1.5 text-xs font-medium',
                  twoFaEnabled
                    ? 'border-[color:var(--opacity-success-60)] bg-[color:var(--opacity-success-10)] text-success'
                    : 'border-[color:var(--opacity-warning-60)] bg-[color:var(--opacity-warning-10)] text-warning',
                )}
              >
                {!twoFaEnabled ? (
                  <IconAlertTriangleFilled className="size-3" aria-hidden />
                ) : null}
                {twoFaEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </>
          }
          description="Active 2-Factor Authentication to keep your account more secure."
          trailing={
            <Button type="button" size="lg" className="h-9 w-[145px]" onClick={toggle2fa}>
              {twoFaEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          }
        />
      </div>
    </section>
  )
}
