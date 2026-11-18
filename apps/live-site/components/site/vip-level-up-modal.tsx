'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { IconCheck, IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useShell } from '@/components/site/shell-context'
import { VIP_SILVER_UNLOCKED_LABELS } from '@/lib/lumen/vip-hub'
import { cn } from '@/lib/utils'

/** Congrats overlay when Bronze → Silver completes — claim lives in VIP Hub. */
export function VipLevelUpModal() {
  const {
    vipLevelUpModalOpen,
    dismissVipLevelUpModal,
    setVipHubOpen,
  } = useShell()
  const [portalReady, setPortalReady] = useState(false)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  if (!portalReady || !vipLevelUpModalOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[240] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={dismissVipLevelUpModal}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vip-level-up-title"
        className={cn(
          'relative z-10 flex w-full max-w-[400px] flex-col overflow-hidden rounded-[14px]',
          'border border-border bg-background text-foreground shadow-[0_24px_80px_rgba(0,0,0,0.55)]',
          'animate-in fade-in-0 zoom-in-95 duration-300',
        )}
      >
        <button
          type="button"
          onClick={dismissVipLevelUpModal}
          aria-label="Close"
          className="absolute right-2.5 top-2.5 z-20 inline-flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent"
        >
          <IconX className="size-4" />
        </button>

        <div className="flex flex-col items-center px-6 pb-6 pt-10 text-center">
          <div className="relative mb-4">
            <span className="absolute inset-0 -m-3 rounded-full bg-[var(--vip-rewards-silver-400,#b4b2b2)]/20 blur-xl" />
            <Image
              src="/shell/figma/vip/crown-silver.svg"
              alt=""
              width={72}
              height={72}
              className="relative size-[72px]"
              unoptimized
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Level up
          </p>
          <h2
            id="vip-level-up-title"
            className="mt-1.5 text-[22px] font-bold tracking-tight text-foreground"
          >
            Congratulations
          </h2>
          <p className="mt-2 text-sm leading-5 text-muted-foreground">
            You just leveled up to{' '}
            <span className="font-semibold text-foreground">Silver</span>. These
            rewards are unlocked:
          </p>

          <ul className="mt-5 w-full space-y-2 text-left">
            {VIP_SILVER_UNLOCKED_LABELS.map((label) => (
              <li
                key={label}
                className="flex items-center gap-2.5 rounded-[10px] border border-border bg-card px-3 py-2.5"
              >
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--vip-rewards-silver-400,#b4b2b2)]/15 text-[var(--vip-rewards-silver-300,#d8d6d6)]">
                  <IconCheck className="size-3.5" strokeWidth={2.5} />
                </span>
                <span className="text-sm font-medium text-foreground">{label}</span>
              </li>
            ))}
          </ul>

          <Button
            type="button"
            className="mt-6 h-12 w-full text-sm font-semibold"
            onClick={() => {
              dismissVipLevelUpModal()
              setVipHubOpen(true)
            }}
          >
            Open VIP Hub
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
