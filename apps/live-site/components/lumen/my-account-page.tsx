'use client'

import { useEffect, useState } from 'react'
import { IconInfoCircle } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { LumenTooltip } from '@/components/ui/lumen-tooltip'
import { useShell } from '@/components/site/shell-context'
import {
  MY_ACCOUNT_DEMO,
  VIP_LEVEL_COLOR,
  formatAccountMoney,
} from '@/lib/lumen/my-account'
import { cn } from '@/lib/utils'

const ASSET = '/shell/figma/account'

async function writeClipboard(text: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.left = '-9999px'
  document.body.appendChild(area)
  area.select()
  document.execCommand('copy')
  document.body.removeChild(area)
}

/**
 * My Account home — Figma WIP g9GQH9F448CL9RAsR4qUri
 * Desktop loaded 2111:33136 · Mobile loaded 2111:33143
 */
export function MyAccountPage() {
  const { displayBalance, setCashierOpen } = useShell()
  const [copied, setCopied] = useState(false)
  const vipColor = VIP_LEVEL_COLOR[MY_ACCOUNT_DEMO.vipLevel]
  const balance = formatAccountMoney(displayBalance || MY_ACCOUNT_DEMO.availableBalance)
  const freeBet = formatAccountMoney(MY_ACCOUNT_DEMO.freeBet)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copyId = async () => {
    try {
      await writeClipboard(MY_ACCOUNT_DEMO.accountId)
      setCopied(true)
      /* lumen-tip has no mouseleave — clear the stuck “Copy” tip so only Copied! shows. */
      const tip = document.getElementById('lumen-tip')
      if (tip) {
        tip.classList.remove('is-on')
        tip.style.display = 'none'
      }
    } catch {
      setCopied(false)
    }
  }

  return (
    <section
      data-name="section-my-account"
      className="flex w-full flex-col gap-4 bg-background px-4 pb-6 pt-4 lg:gap-4 lg:px-6 lg:pb-10 lg:pt-6"
    >
      <div className="flex items-center gap-1.5">
        <h1 className="text-xl font-semibold leading-7 text-foreground lg:text-2xl lg:leading-8">
          My Account
        </h1>
        <LumenTooltip label="Account overview and wallet summary" side="bottom">
          <button
            type="button"
            aria-label="About My Account"
            className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <IconInfoCircle className="size-4" stroke={1.75} aria-hidden />
          </button>
        </LumenTooltip>
      </div>

      <div
        data-name="module-home"
        className="rounded-[10px] border border-border bg-card p-4 shadow-[0_0_16px_rgba(0,0,0,0.06)]"
      >
        <div className="flex flex-col gap-4">
          {/* User row — desktop: actions on the right; mobile: actions below stats */}
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${ASSET}/user.svg`}
              alt=""
              width={32}
              height={32}
              className="size-8 shrink-0 brightness-0 dark:invert"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold leading-6 text-card-foreground">
                {MY_ACCOUNT_DEMO.displayName}
              </p>
              <div className="relative flex items-center gap-1">
                <p className="text-sm font-medium leading-5 text-muted-foreground">
                  {MY_ACCOUNT_DEMO.accountId}
                </p>
                <div className="relative">
                  {/* Hover tip only when idle — drop data-tip while Copied! is up so tips never stack. */}
                  <button
                    type="button"
                    onClick={copyId}
                    aria-label={copied ? 'Account ID copied' : 'Copy account ID'}
                    {...(copied ? {} : { 'data-tip': 'Copy', 'data-tip-side': 'top' })}
                    className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${ASSET}/copy.svg`}
                      alt=""
                      width={16}
                      height={16}
                      className="size-4 brightness-0 opacity-60 dark:invert"
                    />
                  </button>
                  {copied ? (
                    <span
                      role="status"
                      className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium leading-4 text-background"
                    >
                      Copied!
                      <span
                        aria-hidden
                        className="absolute left-1/2 top-full size-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-foreground"
                      />
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="hidden shrink-0 items-center gap-4 lg:flex">
              <Button
                type="button"
                variant="secondary"
                className="h-10 w-[150px] gap-2 rounded-lg border border-border px-6"
                onClick={() => setCashierOpen(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${ASSET}/withdraw-arrow.svg`}
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 brightness-0 dark:invert"
                />
                Withdraw
              </Button>
              <Button
                type="button"
                className="h-10 w-[150px] gap-2 rounded-lg px-6"
                onClick={() => setCashierOpen(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${ASSET}/deposit-dollar.svg`}
                  alt=""
                  width={16}
                  height={16}
                  className="size-4"
                />
                Deposit
              </Button>
            </div>
          </div>

          {/* Stats — desktop horizontal / mobile stacked */}
          <div
            className={cn(
              'rounded-lg border border-border bg-secondary px-6 py-5',
              'flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-14',
            )}
          >
            <Stat label="Available Balance" value={balance} />
            <Divider className="hidden lg:block" vertical />
            <Divider className="lg:hidden" />
            <Stat label="Free Bet" value={freeBet} />
            <Divider className="hidden lg:block" vertical />
            <Divider className="lg:hidden" />
            <div className="flex w-full flex-col gap-0.5 lg:w-[100px] lg:shrink-0">
              <p className="text-sm font-medium leading-5 text-muted-foreground">VIP Level</p>
              <div className="flex items-center gap-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${ASSET}/vip-crown.svg`}
                  alt=""
                  width={18}
                  height={18}
                  className="size-[18px]"
                />
                <p
                  className="text-base font-medium leading-6"
                  style={{ color: vipColor }}
                >
                  {MY_ACCOUNT_DEMO.vipLevel}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile CTAs — Deposit first per Figma 2111:33143 */}
          <div className="flex flex-col gap-3 lg:hidden">
            <Button
              type="button"
              className="h-10 w-full gap-2 rounded-lg px-6"
              onClick={() => setCashierOpen(true)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${ASSET}/deposit-dollar.svg`}
                alt=""
                width={16}
                height={16}
                className="size-4"
              />
              Deposit
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-10 w-full gap-2 rounded-lg border border-border px-6"
              onClick={() => setCashierOpen(true)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${ASSET}/withdraw-arrow.svg`}
                alt=""
                width={16}
                height={16}
                className="size-4 brightness-0 dark:invert"
              />
              Withdraw
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full flex-col gap-0.5 lg:w-[120px] lg:shrink-0">
      <p className="text-sm font-medium leading-5 text-muted-foreground">{label}</p>
      <p className="text-base font-medium leading-6 text-secondary-foreground">{value}</p>
    </div>
  )
}

function Divider({ vertical, className }: { vertical?: boolean; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'bg-border',
        vertical ? 'w-px self-stretch' : 'h-px w-full',
        className,
      )}
    />
  )
}
