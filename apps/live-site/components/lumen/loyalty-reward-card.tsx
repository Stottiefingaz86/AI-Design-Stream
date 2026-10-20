'use client'

import React, { type ReactNode, type Ref } from 'react'
import { IconCheck, IconLoader2, IconLock } from '@tabler/icons-react'
import { SpotlightOverlay, useCursorSpotlight } from '@/components/lumen/cursor-spotlight'
import { LoyaltyInfoTip } from '@/components/lumen/loyalty-info-tip'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Figma `Card_Click2Claim` (Loyalty-Hub_Revamp / Bronze drawer)
 * Card 343×76|88 · pad 20 · icon 24 · Lumen Button md 109×36
 * Glow/confetti/sound are separate — this component is Figma + Lumen only.
 */

export type LoyaltyClaimState =
  | 'enable'
  | 'landing'
  | 'claimed'
  | 'disabled'
  | 'logout'
  | 'locked'

export type LoyaltyRewardInfo = {
  icon?: ReactNode
  title: string
  subtitle?: string
  infoText?: string
  infoLabel?: string
  termsLabel?: string
  onTermsClick?: () => void
}

export type LoyaltyRewardAction = {
  state: LoyaltyClaimState
  label: string
  buttonRef?: Ref<HTMLButtonElement>
  onClick?: () => void
}

/** Figma Button size=md: 109×36, px-16, radius-8 */
const CTA =
  'h-9 w-[109px] min-w-[109px] max-w-[109px] shrink-0 gap-2 rounded-lg px-4 disabled:opacity-100'

export function LoyaltyRewardCard({
  rewardInfo,
  action,
  className,
}: {
  rewardInfo: LoyaltyRewardInfo
  action: LoyaltyRewardAction
  className?: string
}) {
  const { state, label, buttonRef, onClick } = action
  const interactive = state === 'enable' || state === 'logout'
  const [tipOpen, setTipOpen] = React.useState(false)
  const { ref, handleMouseMove, handleMouseLeave, spotlightSurfaceStyle } = useCursorSpotlight()

  return (
    <article
      ref={ref}
      data-name="Card_Click2Claim"
      data-state={state}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={spotlightSurfaceStyle}
      className={cn(
        'group relative flex w-full cursor-default select-none items-center gap-2.5 rounded-[10px] border border-border bg-card p-5 shadow-[0_0_16px_rgba(0,0,0,0.06)]',
        /* overflow-hidden clips the fixed tip in some WebKit stacks — keep visible when open */
        tipOpen ? 'z-30 overflow-visible' : 'overflow-hidden',
        className,
      )}
    >
      {/* BOL SHAD animation only — cursor red glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[10px]">
        <SpotlightOverlay mixPercent={22} />
      </div>

      <div className="relative z-10 flex min-w-0 flex-1 items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center text-foreground">{rewardInfo.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-semibold leading-5 text-foreground">{rewardInfo.title}</p>
            {rewardInfo.infoText ? (
              <LoyaltyInfoTip
                title={rewardInfo.title}
                body={rewardInfo.infoText}
                termsLabel={rewardInfo.termsLabel}
                onTermsClick={rewardInfo.onTermsClick}
                label={rewardInfo.infoLabel ?? 'More information'}
                onOpenChange={setTipOpen}
              />
            ) : null}
          </div>
          {rewardInfo.subtitle ? (
            <p className="truncate text-sm leading-5 text-muted-foreground">{rewardInfo.subtitle}</p>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 shrink-0">
        <ClaimActionButton
          ref={buttonRef}
          state={state}
          label={label}
          onClick={interactive ? onClick : undefined}
        />
      </div>
    </article>
  )
}

const ClaimActionButton = React.forwardRef<
  HTMLButtonElement,
  {
    state: LoyaltyClaimState
    label: string
    onClick?: () => void
  }
>(function ClaimActionButton({ state, label, onClick }, ref) {
  /* Figma: enable = primary · landing = primary + spinner (same 109×36) · claimed = secondary · disabled = secondary-inverted · locked = primary disabled */

  if (state === 'landing') {
    return (
      <Button
        ref={ref}
        type="button"
        size="lg"
        disabled
        aria-busy
        aria-label="Claiming reward"
        className={cn(CTA, 'bg-primary text-primary-foreground hover:bg-primary')}
      >
        <IconLoader2 className="size-4 animate-spin" strokeWidth={2} />
      </Button>
    )
  }

  if (state === 'claimed') {
    return (
      <Button
        ref={ref}
        type="button"
        size="lg"
        disabled
        variant="secondary"
        className={cn(CTA, 'text-muted-foreground')}
      >
        <IconCheck className="size-4" strokeWidth={2.25} />
        Claimed
      </Button>
    )
  }

  if (state === 'disabled') {
    return (
      <Button
        ref={ref}
        type="button"
        size="lg"
        disabled
        variant="secondary"
        className={cn(CTA, 'text-foreground')}
      >
        {label}
      </Button>
    )
  }

  if (state === 'locked') {
    return (
      <Button
        ref={ref}
        type="button"
        size="lg"
        disabled
        className={cn(CTA, 'bg-primary/40 text-primary-foreground hover:bg-primary/40')}
      >
        <IconLock className="size-4" strokeWidth={2.25} />
        {label}
      </Button>
    )
  }

  return (
    <Button ref={ref} type="button" size="lg" onClick={onClick} className={cn(CTA, 'cursor-pointer')}>
      {label}
    </Button>
  )
})

/** Figma SVG as Lumen `foreground` token (mask — img cannot use currentColor). */
export function VipFigmaIcon({
  name,
  className,
}: {
  name:
    | 'transactions-filled'
    | 'user-plus'
    | 'monthly-reload'
    | 'post-monthly-reload'
    | 'weekly-boost'
    | 'monthly-boost-30'
    | 'monthly-boost-15'
    | 'demand-reload'
    | 'demand-boost'
    | 'cherries'
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-6 shrink-0 bg-foreground', className)}
      style={{
        maskImage: `url(/shell/figma/vip/${name}.svg)`,
        WebkitMaskImage: `url(/shell/figma/vip/${name}.svg)`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}
