'use client'

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { IconCake, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  LoyaltyRewardCard,
  VipFigmaIcon,
  type LoyaltyClaimState,
} from '@/components/lumen/loyalty-reward-card'
import {
  claimButtonLabel,
  daysUntilBirthday,
  SILVER_LEVEL_UP_ID,
  VIP_HUB_TABS,
  type VipHubTab,
  type VipReward,
  type VipRewardKind,
} from '@/lib/lumen/vip-hub'
import { useGrowProgress } from '@/lib/lumen/use-grow-progress'
import { useVipLevelUpCeremony } from '@/lib/lumen/use-vip-level-up-ceremony'
import {
  VipProgressBarFill,
  VipProgressCrown,
} from '@/components/lumen/vip-progress-crown'
import { CashDropPanel } from '@/components/lumen/cash-drop-panel'
import { DailyRacesPanel } from '@/components/lumen/daily-races-panel'
import { MissionsPanel } from '@/components/lumen/missions-panel'
import { useShell } from './shell-context'
import { useDragToClose } from './use-drag-to-close'
import { useBackdropClose } from './use-tap-action'
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
  const closeBackdrop = useBackdropClose(open, onClose)
  return (
    <div
      data-vip-hub-root="desktop"
      data-open={open ? 'true' : 'false'}
      className={cn(
        'pointer-events-none fixed bottom-0 left-0 right-0 top-[68px] z-40 hidden lg:block',
        open && 'pointer-events-auto',
      )}
      aria-hidden={!open}
      {...(!open ? ({ inert: '' } as import('react').HTMLAttributes<HTMLDivElement>) : {})}
    >
      <button
        type="button"
        aria-label="Close VIP Hub"
        data-vip-hub-backdrop=""
        data-state={open ? 'open' : 'closed'}
        onClick={closeBackdrop}
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
  const closeBackdrop = useBackdropClose(open, onClose)
  const backdrop = open ? Math.max(0, 1 - offset / 320) : 0

  return (
    <div
      data-vip-hub-root="mobile"
      data-open={open ? 'true' : 'false'}
      className={cn(
        'pointer-events-none fixed inset-0 z-[200] lg:hidden',
        open && 'pointer-events-auto',
      )}
      aria-hidden={!open}
      {...(!open ? ({ inert: '' } as import('react').HTMLAttributes<HTMLDivElement>) : {})}
    >
      <button
        type="button"
        aria-label="Close VIP Hub"
        data-vip-hub-backdrop=""
        data-state={open ? 'open' : 'closed'}
        onClick={closeBackdrop}
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
  const { vipRewards, claimVipReward, vipHubOpen, vipHubTab, loggedIn } = useShell()
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
            className="shell-chrome-btn inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors duration-200 ease-in-out hover:bg-accent"
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
            {loggedIn ? <VipProgressCard /> : null}
            <div data-name="Click2Claim" className="flex flex-col gap-3">
              {/* Level-up bonus directly under progress; removed after claim. */}
              {vipRewards
                .filter((reward) => reward.id !== 'birthday')
                .slice()
                .sort((a, b) => {
                  if (a.id === SILVER_LEVEL_UP_ID) return -1
                  if (b.id === SILVER_LEVEL_UP_ID) return 1
                  return 0
                })
                .map((reward) => (
                  <VipClaimRow
                    key={reward.id}
                    reward={reward}
                    loggedOut={!loggedIn}
                    onClaim={claimVipReward}
                  />
                ))}
              {/* Birthday sits at the bottom — DOB collected here, not at join. */}
              <BirthdayRewardRow loggedOut={!loggedIn} />
            </div>
          </div>
        ) : tab === '$25k Daily Race' ? (
          <DailyRacesPanel />
        ) : tab === 'Missions' ? (
          <MissionsPanel />
        ) : tab === 'Cash Drop Code' ? (
          <CashDropPanel />
        ) : (
          /* Benefits + other unmerged tabs stay empty on demo until Chris says Merge. */
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
                data-tour={`vip-tab-${item}`}
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

/** Figma Progress Bar — crown 52 · shared shell % · level-up crown swap */
function VipProgressCard() {
  const {
    displayPercent,
    levelLabel,
    crownTone,
    barTone,
    updatedLabel,
  } = useVipLevelUpCeremony()
  const grown = useGrowProgress(displayPercent)

  return (
    <section
      data-name="Progress Bar"
      className="cursor-default select-none rounded-[10px] border border-border bg-card p-5 shadow-[0_0_16px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-start gap-3">
        <VipProgressCrown tone={crownTone} size={52} className="size-[52px]" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 text-sm font-semibold leading-5 text-foreground">
              {levelLabel}
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
            <VipProgressBarFill percent={grown} tone={barTone} />
          </div>
          <p className="text-[10px] leading-[14px] text-muted-foreground">
            {updatedLabel}
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
  loggedOut = false,
  onClaim,
}: {
  reward: VipReward
  /** Logged-out hub — claimable/disabled rows show Login CTA. */
  loggedOut?: boolean
  onClaim: (id: string, button: HTMLButtonElement | null) => void
}) {
  const { openAuth } = useShell()
  const btnRef = useRef<HTMLButtonElement>(null)
  const showLogin =
    loggedOut && (reward.state === 'enable' || reward.state === 'disabled' || reward.state === 'logout')
  const displayReward: VipReward = showLogin ? { ...reward, state: 'logout' } : reward
  const isFreeSpins = reward.kind === 'free-spins'
  const isLevelUp = reward.id === SILVER_LEVEL_UP_ID
  const spins = reward.spinsRemaining ?? reward.spinsTotal ?? 0
  /* Small portrait tile — same ~3:4 as lobby game tiles / DVD case. */
  const icon =
    isFreeSpins && reward.gameImageSrc ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={reward.gameImageSrc}
        alt=""
        width={32}
        height={44}
        className="h-11 w-8 rounded-md object-cover"
      />
    ) : isLevelUp ? (
      <Image
        src="/shell/figma/vip/crown.svg"
        alt=""
        width={24}
        height={24}
        className="size-6"
        unoptimized
      />
    ) : (
      <RewardGlyph kind={reward.kind} />
    )

  return (
    <div data-tour={`vip-reward-${reward.id}`}>
      <LoyaltyRewardCard
        rewardInfo={{
          icon,
          iconClassName: isFreeSpins ? 'h-11 w-8' : undefined,
          title: reward.title,
          subtitle: isFreeSpins ? undefined : reward.subtitle,
          subtitleNode: isFreeSpins ? (
            <>
              <span className="font-semibold text-foreground">{spins}</span>
              {' Free Spins'}
            </>
          ) : undefined,
          infoText: reward.infoText,
          infoLabel: 'More information',
          termsLabel: 'Terms and Conditions',
        }}
        action={{
          state: displayReward.state as LoyaltyClaimState,
          label: claimButtonLabel(displayReward),
          buttonRef: btnRef,
          onClick: () => {
            if (showLogin) {
              openAuth('login')
              return
            }
            onClaim(reward.id, btnRef.current)
          },
        }}
      />
    </div>
  )
}

function takeDigits(raw: string, max = 2) {
  return raw.replace(/\D/g, '').slice(0, max)
}

/** Card-expiry clamp — typing 7 becomes 07; 70 never sticks. */
function clampMonthDigits(raw: string): string {
  const d = takeDigits(raw)
  if (d.length === 0) return ''
  if (d.length === 1) {
    if (Number(d) > 1) return `0${d}`
    return d
  }
  const n = Number(d)
  if (n === 0) return '01'
  if (n > 12) return '12'
  return d
}

function maxDayForMonth(mm: string): number {
  const month = Number(mm)
  if (!Number.isFinite(month) || month < 1 || month > 12) return 31
  /* Non-leap Feb ceiling while typing — full year validates on save. */
  if (month === 2) return 29
  return new Date(2024, month, 0).getDate()
}

function clampDayDigits(raw: string, mm: string): string {
  const max = maxDayForMonth(mm)
  const d = takeDigits(raw)
  if (d.length === 0) return ''
  if (d.length === 1) {
    /* 4–9 → 04–09 so “70” can’t happen */
    if (Number(d) > 3) return `0${d}`
    return d
  }
  const n = Number(d)
  if (n === 0) return '01'
  if (n > max) return String(max).padStart(2, '0')
  return d
}

/** MM / DD / YY — card-expiry style; 2 digits auto-advances to the next segment. */
function DobMmDdYy({
  mm,
  dd,
  yy,
  onMm,
  onDd,
  onYy,
  error,
}: {
  mm: string
  dd: string
  yy: string
  onMm: (v: string) => void
  onDd: (v: string) => void
  onYy: (v: string) => void
  error?: string
}) {
  const mmRef = useRef<HTMLInputElement>(null)
  const ddRef = useRef<HTMLInputElement>(null)
  const yyRef = useRef<HTMLInputElement>(null)

  const segmentClass = cn(
    'w-9 bg-transparent text-center text-sm tabular-nums text-foreground',
    'placeholder:text-muted-foreground',
    'focus:outline-none',
  )

  return (
    <div>
      <label className="mb-2 block text-[13px] font-medium text-foreground" htmlFor="vip-dob-mm">
        Date of birth
      </label>
      <div
        className={cn(
          'flex h-11 items-center justify-center gap-1.5 rounded-lg border border-input bg-popover px-3',
          'focus-within:border-white focus-within:ring-1 focus-within:ring-white',
        )}
      >
        <input
          ref={mmRef}
          id="vip-dob-mm"
          type="text"
          inputMode="numeric"
          autoComplete="bday-month"
          placeholder="MM"
          maxLength={2}
          value={mm}
          aria-label="Month"
          className={segmentClass}
          onChange={(e) => {
            const next = clampMonthDigits(e.target.value)
            onMm(next)
            if (next.length === 2) ddRef.current?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' && (e.currentTarget.selectionStart ?? 0) >= mm.length) {
              e.preventDefault()
              ddRef.current?.focus()
            }
          }}
        />
        <span className="select-none text-sm text-muted-foreground" aria-hidden>
          /
        </span>
        <input
          ref={ddRef}
          type="text"
          inputMode="numeric"
          autoComplete="bday-day"
          placeholder="DD"
          maxLength={2}
          value={dd}
          aria-label="Day"
          className={segmentClass}
          onChange={(e) => {
            const next = clampDayDigits(e.target.value, mm)
            onDd(next)
            if (next.length === 2) yyRef.current?.focus()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && dd === '') {
              e.preventDefault()
              mmRef.current?.focus()
            }
            if (e.key === 'ArrowLeft' && (e.currentTarget.selectionStart ?? 0) === 0) {
              e.preventDefault()
              mmRef.current?.focus()
            }
            if (e.key === 'ArrowRight' && (e.currentTarget.selectionStart ?? 0) >= dd.length) {
              e.preventDefault()
              yyRef.current?.focus()
            }
          }}
        />
        <span className="select-none text-sm text-muted-foreground" aria-hidden>
          /
        </span>
        <input
          ref={yyRef}
          type="text"
          inputMode="numeric"
          autoComplete="bday-year"
          placeholder="YY"
          maxLength={2}
          value={yy}
          aria-label="Year"
          className={segmentClass}
          onChange={(e) => {
            onYy(takeDigits(e.target.value))
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && yy === '') {
              e.preventDefault()
              ddRef.current?.focus()
            }
            if (e.key === 'ArrowLeft' && (e.currentTarget.selectionStart ?? 0) === 0) {
              e.preventDefault()
              ddRef.current?.focus()
            }
          }}
        />
      </div>
      {error ? <p className="mt-1.5 text-xs text-primary">{error}</p> : null}
    </div>
  )
}

/** Parse MM/DD/YY → ISO `YYYY-MM-DD`, or null if incomplete/invalid. */
function parseDobMmDdYy(mm: string, dd: string, yy: string): string | null {
  if (mm.length !== 2 || dd.length !== 2 || yy.length !== 2) return null
  const month = Number(mm)
  const day = Number(dd)
  const yyNum = Number(yy)
  if (!Number.isFinite(month) || !Number.isFinite(day) || !Number.isFinite(yyNum)) return null
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const nowY = new Date().getFullYear()
  const fullYear = yyNum > nowY % 100 ? 1900 + yyNum : 2000 + yyNum
  const date = new Date(fullYear, month - 1, day)
  if (
    date.getFullYear() !== fullYear ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  if (date.getTime() > Date.now()) return null
  return `${fullYear}-${mm}-${dd}`
}

function birthdayCountdownLabel(iso: string): string {
  const days = daysUntilBirthday(iso)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day'
  /* Same muted card pattern as Monthly Reloads “10 days”. */
  return `${days} days`
}

/** Birthday reward — last in the list; asks for DOB before claim when missing. */
function BirthdayRewardRow({ loggedOut = false }: { loggedOut?: boolean }) {
  const { vipRewards, claimVipReward, profile, setDateOfBirth } = useShell()
  const reward = vipRewards.find((r) => r.id === 'birthday')
  const btnRef = useRef<HTMLButtonElement>(null)
  const [askingDob, setAskingDob] = useState(false)
  const [mm, setMm] = useState('')
  const [dd, setDd] = useState('')
  const [yy, setYy] = useState('')
  const [dobError, setDobError] = useState<string | undefined>()

  if (!reward) return null

  if (loggedOut) {
    return <VipClaimRow reward={reward} loggedOut onClaim={claimVipReward} />
  }

  const hasDob = Boolean(profile.dateOfBirth)
  const daysLeft = hasDob && profile.dateOfBirth ? daysUntilBirthday(profile.dateOfBirth) : null
  const isBirthdayToday = daysLeft === 0
  const canClaim = hasDob && isBirthdayToday && reward.state === 'enable'

  if (askingDob && !hasDob) {
    return (
      <article
        data-name="Card_BirthdayDob"
        className="flex w-full flex-col gap-3 rounded-[10px] border border-border bg-card p-5 shadow-[0_0_16px_rgba(0,0,0,0.06)]"
      >
        <div className="flex items-center gap-2">
          <IconCake className="size-6 shrink-0 text-foreground" stroke={1.75} aria-hidden />
          <p className="min-w-0 flex-1 text-sm font-semibold leading-5 text-foreground">
            Add your birthday
          </p>
        </div>
        <DobMmDdYy
          mm={mm}
          dd={dd}
          yy={yy}
          error={dobError}
          onMm={(v) => {
            setMm(v)
            /* Re-clamp day if month shrinks max (e.g. 31 → Feb). */
            if (dd.length === 2) setDd(clampDayDigits(dd, v))
            setDobError(undefined)
          }}
          onDd={(v) => {
            setDd(v)
            setDobError(undefined)
          }}
          onYy={(v) => {
            setYy(v)
            setDobError(undefined)
          }}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 flex-1"
            onClick={() => {
              setAskingDob(false)
              setDobError(undefined)
              setMm('')
              setDd('')
              setYy('')
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="h-9 flex-1"
            onClick={() => {
              const iso = parseDobMmDdYy(mm, dd, yy)
              if (!iso) {
                setDobError('Enter a valid MM / DD / YY')
                return
              }
              const ageMs = Date.now() - new Date(iso).getTime()
              const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000)
              if (ageYears < 18) {
                setDobError('You must be 18 or older')
                return
              }
              setDateOfBirth(iso)
              setAskingDob(false)
              setMm('')
              setDd('')
              setYy('')
            }}
          >
            Save
          </Button>
        </div>
      </article>
    )
  }

  const claimedOrLanding = reward.state === 'claimed' || reward.state === 'landing'
  /* Countdown uses disabled (muted card, no lock) — same pattern as Monthly Reloads “10 days”. */
  const displayState: LoyaltyClaimState = claimedOrLanding
    ? (reward.state as LoyaltyClaimState)
    : !hasDob
      ? 'enable'
      : canClaim
        ? 'enable'
        : 'disabled'

  return (
    <LoyaltyRewardCard
      rewardInfo={{
        icon: <IconCake className="size-6 text-foreground" stroke={1.75} aria-hidden />,
        title: reward.title,
        infoText: reward.infoText,
        infoLabel: 'More information',
        termsLabel: 'Terms and Conditions',
      }}
      action={{
        state: displayState,
        label: !hasDob
          ? 'Add birthday'
          : canClaim
            ? claimButtonLabel(reward)
            : claimedOrLanding
              ? claimButtonLabel(reward)
              : birthdayCountdownLabel(profile.dateOfBirth!),
        buttonRef: btnRef,
        onClick: () => {
          if (!hasDob) {
            setAskingDob(true)
            return
          }
          if (canClaim) {
            claimVipReward(reward.id, btnRef.current)
          }
        },
      }}
    />
  )
}

const KIND_ICON: Partial<Record<VipRewardKind, Parameters<typeof VipFigmaIcon>[0]['name']>> = {
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

/** Mini Daily Spin wheel — brand red / cream only (no jackpot neon). */
function DailySpinGlyph({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('relative inline-flex size-6 shrink-0 items-center justify-center', className)}
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none">
        <circle cx="12" cy="12" r="10.2" fill="#1a1a1a" />
        <circle
          cx="12"
          cy="12"
          r="9.6"
          fill="none"
          stroke="#d4af37"
          strokeWidth="1.15"
        />
        <path d="M12 12 L12 2.8 A9.2 9.2 0 0 1 18.5 5.5 Z" fill="#ee3536" />
        <path d="M12 12 L18.5 5.5 A9.2 9.2 0 0 1 21.2 12 Z" fill="#f3ebe0" />
        <path d="M12 12 L21.2 12 A9.2 9.2 0 0 1 18.5 18.5 Z" fill="#ee3536" />
        <path d="M12 12 L18.5 18.5 A9.2 9.2 0 0 1 12 21.2 Z" fill="#f3ebe0" />
        <path d="M12 12 L12 21.2 A9.2 9.2 0 0 1 5.5 18.5 Z" fill="#ee3536" />
        <path d="M12 12 L5.5 18.5 A9.2 9.2 0 0 1 2.8 12 Z" fill="#f3ebe0" />
        <path d="M12 12 L2.8 12 A9.2 9.2 0 0 1 5.5 5.5 Z" fill="#ee3536" />
        <path d="M12 12 L5.5 5.5 A9.2 9.2 0 0 1 12 2.8 Z" fill="#f3ebe0" />
        <circle cx="12" cy="12" r="2.1" fill="#d4af37" />
        <circle cx="12" cy="12" r="1.2" fill="#f0d78c" />
        <path d="M12 1.2 L13.4 3.6 H10.6 Z" fill="#ee3536" />
      </svg>
    </span>
  )
}

function RewardGlyph({ kind }: { kind: VipRewardKind }) {
  if (kind === 'birthday') {
    return <IconCake className="size-6 text-foreground" stroke={1.75} aria-hidden />
  }
  if (kind === 'daily-spin') {
    return <DailySpinGlyph />
  }
  const name = KIND_ICON[kind]
  if (!name) return <IconCake className="size-6 text-foreground" stroke={1.75} aria-hidden />
  return <VipFigmaIcon name={name} />
}
