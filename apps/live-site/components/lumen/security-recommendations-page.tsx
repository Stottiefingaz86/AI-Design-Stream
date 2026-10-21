'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  IconAlertCircle,
  IconChevronLeft,
  IconCircleCheck,
  IconShieldCheck,
} from '@tabler/icons-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  SECURITY_RECOMMENDATIONS,
  type SecurityRecommendation,
} from '@/lib/lumen/security-central'
import { cn } from '@/lib/utils'

/**
 * Security Recommendations — Figma WIP OLtqQMwYLpOF0DfqMBK45a
 * Desktop filled 8292:64869 · mobile 8292:64876
 */
export function SecurityRecommendationsPage({ className }: { className?: string }) {
  const router = useRouter()
  const [items, setItems] = useState(SECURITY_RECOMMENDATIONS)

  const runAction = (item: SecurityRecommendation) => {
    if (item.action === 'change-password') return

    if (item.action === 'enable-2fa') {
      toast.success('2-Factor Authentication enabled!')
      setItems((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? {
                ...row,
                status: 'success',
                message: '2-Factor Authentication is enabled on your account.',
                actionLabel: 'Done',
              }
            : row,
        ),
      )
      return
    }
    router.push('/account/security/trusted-devices')
  }

  return (
    <section
      data-name="section-security-recommendations"
      className={cn(
        'flex w-full flex-col gap-4 bg-background px-4 pb-14 pt-4 lg:px-6 lg:pt-6',
        className,
      )}
    >
      <Link
        href="/account/security"
        className="inline-flex h-9 w-fit items-center gap-1 rounded-full px-1 text-sm font-medium text-foreground transition-colors hover:bg-accent lg:hidden"
      >
        <IconChevronLeft className="size-4" stroke={2} />
        Back
      </Link>

      <div
        data-name="section-header-navigation"
        className="rounded-[10px] border border-border bg-card p-4 shadow-[0_0_16px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center gap-1 lg:gap-4">
          <Link
            href="/account/security"
            aria-label="Back to Security Central"
            className="hidden size-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent lg:inline-flex"
          >
            <IconChevronLeft className="size-4" stroke={2} />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <IconShieldCheck className="size-8 shrink-0 text-foreground" stroke={1.5} />
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-semibold leading-6 text-card-foreground">
                Security Recommendations
              </h1>
              <p className="text-sm leading-5 text-muted-foreground">
                Review the following security recommendations to keep your account up-to-date and
                help us protect you against fraud.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        data-name="module-security-recommendations"
        className="rounded-[10px] border border-border bg-card p-5 shadow-[0_0_16px_rgba(0,0,0,0.06)]"
      >
        <ul className="flex flex-col gap-4">
          {items.map((item, index) => (
            <li key={item.id}>
              {index > 0 ? <div className="mb-4 h-px w-full bg-border" /> : null}
              <div className="flex items-center gap-2.5">
                {item.status === 'warning' ? (
                  <IconAlertCircle
                    className="size-5 shrink-0 text-muted-foreground"
                    stroke={1.75}
                    aria-hidden
                  />
                ) : (
                  <IconCircleCheck
                    className="size-5 shrink-0 text-success"
                    stroke={1.75}
                    aria-hidden
                  />
                )}
                <p className="min-w-0 flex-1 text-sm leading-5 text-card-foreground">
                  {item.message}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-8 w-[75px] shrink-0 border border-border"
                  disabled={item.actionLabel === 'Done'}
                  onClick={() => runAction(item)}
                >
                  {item.actionLabel}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
