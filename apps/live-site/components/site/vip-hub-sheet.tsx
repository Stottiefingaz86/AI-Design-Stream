'use client'

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import {
  LoyaltyRewardCard,
  VipFigmaIcon,
  type LoyaltyClaimState,
} from '@/components/lumen/loyalty-reward-card'
import {
  claimButtonLabel,
  VIP_HUB_TABS,
  type VipHubTab,
  type VipReward,
  type VipRewardKind,
} from '@/lib/lumen/vip-hub'
import { useGrowProgress } from '@/lib/lumen/use-grow-progress'
import { useShell } from './shell-context'
import { useDragToClose } from './use-drag-to-close'
import { ShellIcon } from './shell-icons'
import { cn } from '@/lib/utils'

function useAnimatedOpen(open: boolean) {
  const [mounted, setMounted] = useState(false)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setShown(false)
      let timeout = 0
      const frame = window.requestAnimationFrame(() => {
        timeout = window.setTimeout(() => setShown(true), 24)
      })
      return () => {
        window.cancelAnimationFrame(frame)
        window.clearTimeout(timeout)
      }
    }
    setShown(false)
    const timer = window.setTimeout(() => setMounted(false), 320)
    return () => window.clearTimeout(timer)
  }, [open])

  return { mounted, shown }
}

export function VipHubSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { mounted, shown } = useAnimatedOpen(open)
  const [portalReady, setPortalReady] = useState(false)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!mounted || !portalReady) return null

  return createPortal(
    <>
      <DesktopVipHub open={shown} onClose={onClose} />
      <MobileVipHub open={shown} onClose={onClose} />
    </>,
    document.body,
  )
}

function DesktopVipHub({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      data-vip-hub-root="desktop"
      className={cn(
        'pointer-events-none fixed bottom-0 left-0 right-0 top-[68px] z-40 hidden lg:block',
        open && 'pointer-events-auto',
      )}
    >
      <button
        type="button"
        aria-label="Close VIP Hub"
        data-vip-hub-backdrop=""
        data-state={open ? 'open' : 'closed'}
        onClick={onClose}
        className="absolute inset-0 border-0 bg-black/60"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="VIP Hub"
        data-name="VIP Hub"
        data-brand="betonline"
        data-state={open ? 'open' : 'closed'}
        className="dark absolute inset-y-0 right-0 flex w-[384px] max-w-[384px] flex-col overflow-hidden border-l border-border bg-background text-foreground shadow-lg"
      >
        <VipHubChrome onClose={onClose} />
      </aside>
    </div>
  )
}

function MobileVipHub({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { sheetRef, offset, dragging, bind } = useDragToClose(open, onClose)
  const backdrop = open ? Math.max(0, 1 - offset / 320) : 0

  return (
    <div
      data-vip-hub-root="mobile"
      className={cn(
        'pointer-events-none fixed inset-0 z-[200] lg:hidden',
        open && 'pointer-events-auto',
      )}
    >
      <button
        type="button"
        aria-label="Close VIP Hub"
        data-vip-hub-backdrop=""
        data-state={open ? 'open' : 'closed'}
        onClick={onClose}
        className="absolute inset-0 border-0 bg-black/60"
        style={dragging ? { opacity: backdrop, transition: 'none' } : undefined}
      />
      <aside
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="VIP Hub"
        data-name="VIP Hub"
        data-brand="betonline"
        data-state={open ? 'open' : 'closed'}
        data-dragging={dragging ? 'true' : undefined}
        {...bind}
        className="dark absolute inset-x-0 bottom-0 flex max-h-[calc(100svh-112px)] flex-col overflow-hidden rounded-t-[10px] bg-background text-foreground shadow-[0_0_16px_rgba(0,0,0,0.06)]"
        style={offset > 0 ? { transform: `translateY(${offset}px)`, transition: 'none' } : undefined}
      >
        <div
          data-drag-handle=""
          className="flex w-full shrink-0 cursor-grab touch-none items-center justify-center px-4 pb-1 pt-2 active:cursor-grabbing"
          aria-label="Drag down to close"
        >
          <span />
        </div>
        <VipHubChrome onClose={onClose} />
      </aside>
    </div>
  )
}

/**
 * Cashier-style chrome: header + tabs fixed, body is the only vertical scroller.
 * (Nested h-full panels were clipping content and blocking scroll.)
 */
function VipHubChrome({ onClose }: { onClose: () => void }) {
  const { vipRewards, claimVipReward, vipHubOpen, vipHubTab } = useShell()
  const [tab, setTab] = useState<VipHubTab>(vipHubTab)

  useEffect(() => {
    if (vipHubOpen) setTab(vipHubTab)
  }, [vipHubOpen, vipHubTab])

  return (
    <>
      <div className="flex shrink-0 flex-col gap-4 pb-3 pt-2 lg:pt-6">
        {/* Desktop only — mobile dismisses via drag handle / backdrop */}
        <header
          data-name="Navigation / Close Sheet"
          className="hidden items-center gap-1.5 px-4 pr-6 lg:flex"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close VIP Hub"
            className="shell-chrome-btn inline-flex size-7 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-accent"
          >
            <ShellIcon name="drawer" tone="token" className="size-4 text-foreground" />
          </button>
          <p className="min-w-0 flex-1 cursor-default select-none text-sm font-medium leading-5 text-foreground">
            VIP Hub
          </p>
        </header>

        {/* Tabs bleed to drawer edge — grey capsule scrolls off-screen */}
        <VipTabMenu active={tab} onChange={setTab} />
      </div>

      <div
        data-vip-hub-scroll=""
        className="shell-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4 pb-6"
      >
        {tab === 'VIP' ? (
          <div className="flex flex-col gap-3">
            <VipProgressCard />
            <div data-name="Click2Claim" className="flex flex-col gap-3">
              {vipRewards.map((reward) => (
                <VipClaimRow key={reward.id} reward={reward} onClaim={claimVipReward} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyVipTab label={tab} />
        )}
      </div>
    </>
  )
}

/**
 * Figma Tab-Menu: VIP flush in grey capsule, capsule may peek off the right edge.
 * Chevrons select previous/next tab; active tab scrolls left so following tabs appear.
 */
function VipTabMenu({ active, onChange }: { active: VipHubTab; onChange: (tab: VipHubTab) => void }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false })
  const activeIndex = VIP_HUB_TABS.indexOf(active)
  const canGoBack = activeIndex > 0
  const canGoNext = activeIndex >= 0 && activeIndex < VIP_HUB_TABS.length - 1

  const measureThumb = useCallback(() => {
    const track = trackRef.current
    const btn = track?.querySelector<HTMLElement>('[data-vip-tab][data-active="true"]')
    if (!track || !btn) {
      setThumb((prev) => (prev.ready ? { x: 0, w: 0, ready: false } : prev))
      return
    }
    setThumb({ x: btn.offsetLeft, w: btn.offsetWidth, ready: true })
  }, [])

  const scrollActiveIntoView = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      const scroller = scrollRef.current
      const btn = trackRef.current?.querySelector<HTMLElement>('[data-vip-tab][data-active="true"]')
      if (!scroller || !btn) return

      const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth)
      if (maxScroll <= 0) return

      /* Shift strip left as you advance so the next tabs come into view */
      if (activeIndex <= 0) {
        scroller.scrollTo({ left: 0, behavior })
        return
      }
      if (activeIndex >= VIP_HUB_TABS.length - 2) {
        scroller.scrollTo({ left: maxScroll, behavior })
        return
      }
      /* Pin active tab near the left edge (desktop chevron gutter when present) */
      const desktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
      const gutter = desktop && canGoBack ? 40 : 8
      scroller.scrollTo({
        left: Math.min(maxScroll, Math.max(0, btn.offsetLeft - gutter)),
        behavior,
      })
    },
    [activeIndex, canGoBack],
  )

  useLayoutEffect(() => {
    measureThumb()
    const track = trackRef.current
    if (!track) return
    const ro = new ResizeObserver(() => measureThumb())
    ro.observe(track)
    return () => ro.disconnect()
  }, [active, measureThumb])

  useLayoutEffect(() => {
    scrollActiveIntoView('smooth')
  }, [active, scrollActiveIntoView])

  const goTab = (dir: -1 | 1) => {
    const next = VIP_HUB_TABS[activeIndex + dir]
    if (next) onChange(next)
  }

  /* Desktop only — never show chevrons on mobile (swipe / tap tabs instead) */
  const chevronClass = cn(
    'absolute top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full lg:inline-flex',
    'border border-border/60 bg-background/90 text-foreground shadow-sm backdrop-blur-md',
    'outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-ring',
  )

  return (
    <div data-name="Tab-Menu" className="group/vip-tabs relative min-w-0 shrink-0">
      {/* pl-4 aligns capsule with header; grey capsule may peek off the right edge */}
      <div
        ref={scrollRef}
        data-vip-tab-scroll=""
        className={cn(
          'scrollbar-hide w-full min-w-0 overflow-x-auto overflow-y-hidden pl-4',
          canGoNext && 'lg:pr-11',
          canGoBack && 'lg:pl-12',
        )}
      >
        <div
          ref={trackRef}
          data-name="tab-menu-solid-inverted"
          role="tablist"
          aria-label="VIP Hub sections"
          className="relative flex h-12 w-max items-center gap-1 rounded-full bg-[var(--surface-muted-5,rgba(255,255,255,0.1))] p-0.5"
        >
          <span
            aria-hidden
            data-vip-tab-thumb=""
            className="pointer-events-none absolute top-0.5 bottom-0.5 z-0 rounded-full bg-vip-rewards transition-[left,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ left: thumb.x, width: thumb.w, opacity: thumb.ready ? 1 : 0 }}
          />
          {VIP_HUB_TABS.map((item) => {
            const selected = active === item
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={selected}
                data-vip-tab=""
                data-active={selected ? 'true' : 'false'}
                onClick={() => onChange(item)}
                className={cn(
                  'relative z-10 inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-transparent px-4 text-sm leading-none whitespace-nowrap transition-colors duration-300',
                  selected
                    ? 'text-vip-rewards-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item}
              </button>
            )
          })}
        </div>
      </div>

      {canGoBack ? (
        <button
          type="button"
          aria-label="Previous tab"
          data-vip-tab-scroll-back=""
          className={cn(chevronClass, 'left-1')}
          onClick={() => goTab(-1)}
        >
          <IconChevronLeft className="size-4" strokeWidth={2} />
        </button>
      ) : null}
      {canGoNext ? (
        <button
          type="button"
          aria-label="Next tab"
          data-vip-tab-scroll-more=""
          className={cn(chevronClass, 'right-1')}
          onClick={() => goTab(1)}
        >
          <IconChevronRight className="size-4" strokeWidth={2} />
        </button>
      ) : null}
    </div>
  )
}

/** Figma Progress Bar — crown 52 · bronze-400 fill · grows 0→% on mount */
function VipProgressCard() {
  const percent = 25
  const grown = useGrowProgress(percent)

  return (
    <section
      data-name="Progress Bar"
      className="cursor-default select-none rounded-[10px] border border-border bg-card p-5 shadow-[0_0_16px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-start gap-3">
        <Image
          src="/shell/figma/vip/crown.svg"
          alt=""
          width={52}
          height={52}
          className="size-[52px] shrink-0"
          unoptimized
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 text-sm font-semibold leading-5 text-foreground">
              Bronze to Silver
            </p>
            <p className="shrink-0 text-sm font-medium leading-5 tabular-nums text-muted-foreground">
              {Math.round(grown)}%
            </p>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-muted-4,rgba(255,255,255,0.12))]"
            role="progressbar"
            aria-valuenow={Math.round(grown)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="VIP tier progress"
          >
            <div
              className="h-full rounded-full bg-[var(--vip-rewards-bronze-400,#e39e3d)]"
              style={{ width: `${grown}%` }}
            />
          </div>
          <p className="text-[10px] leading-[14px] text-muted-foreground">
            Updated 24/25/2024, 8:00 PM ET
          </p>
        </div>
      </div>
    </section>
  )
}

function EmptyVipTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[10px] border border-border bg-card px-6 py-12 text-center">
      <Image src="/shell/figma/vip/crown.svg" alt="" width={40} height={40} className="opacity-40" unoptimized />
      <p className="text-sm text-muted-foreground">{label} will appear here</p>
    </div>
  )
}

function VipClaimRow({
  reward,
  onClaim,
}: {
  reward: VipReward
  onClaim: (id: string, button: HTMLButtonElement | null) => void
}) {
  const btnRef = useRef<HTMLButtonElement>(null)

  return (
    <LoyaltyRewardCard
      rewardInfo={{
        icon: <RewardGlyph kind={reward.kind} />,
        title: reward.title,
        subtitle: reward.subtitle,
        infoText: reward.infoText,
        infoLabel: 'More information',
        termsLabel: 'Terms and Conditions',
      }}
      action={{
        state: reward.state as LoyaltyClaimState,
        label: claimButtonLabel(reward),
        buttonRef: btnRef,
        onClick: () => onClaim(reward.id, btnRef.current),
      }}
    />
  )
}

const KIND_ICON: Record<VipRewardKind, Parameters<typeof VipFigmaIcon>[0]['name']> = {
  rakeback: 'transactions-filled',
  refer: 'user-plus',
  reloads: 'monthly-reload',
  'post-reload': 'post-monthly-reload',
  'weekly-boost': 'weekly-boost',
  'monthly-boost': 'monthly-boost-30',
  'post-boost': 'monthly-boost-15',
  'special-reload': 'demand-reload',
  'special-boost': 'demand-boost',
  'free-spins': 'cherries',
}

function RewardGlyph({ kind }: { kind: VipRewardKind }) {
  return <VipFigmaIcon name={KIND_ICON[kind]} />
}
