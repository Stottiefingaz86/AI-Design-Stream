'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import NumberFlow from '@number-flow/react'
import { IconMaximize, IconMinimize, IconSettings, IconX } from '@tabler/icons-react'
import { Favorite } from '@/components/lumen/favorite'
import { JACKPOT_TIERS, type CasinoLobbyGame, type JackpotTierId } from '@/lib/lumen/casino-lobby-catalog'
import { useJackpotAmounts } from '@/lib/lumen/use-jackpot-amounts'
import { cn } from '@/lib/utils'

/** Ticker colors — Figma 130:436517. Mega is the gradient; Must Drop is vip-rewards. */
const TICKER_TIER_CLASS: Record<(typeof JACKPOT_TIERS)[number]['tone'], string> = {
  must: 'text-[#edc555]',
  mini: 'text-[#22c55e]',
  minor: 'text-[#06b6d4]',
  major: 'text-[#ec4899]',
  mega: 'bg-gradient-to-r from-[#ed9a63] via-[#eca545] to-[#d36913] bg-clip-text text-transparent',
}

/** Dropdown tier colors — Must Drop is the gradient; Mega is vip-level-1. */
const DROPDOWN_TIER_CLASS: Record<(typeof JACKPOT_TIERS)[number]['tone'], string> = {
  must: 'bg-gradient-to-r from-[#ed9a63] via-[#eca545] to-[#d36913] bg-clip-text text-transparent',
  mini: 'text-[#22c55e]',
  minor: 'text-[#06b6d4]',
  major: 'text-[#ec4899]',
  mega: 'text-[#eaaf6d]',
}

const MUST_DROP_BG =
  'bg-[linear-gradient(90deg,#792400_0%,#a66336_25%,#a65615_50%,#c48633_75%,#792f00_100%)]'

const MUST_DROP_START = JACKPOT_TIERS.find((tier) => tier.tone === 'must')?.countdown ?? '00:38:18'

function parseHms(value: string) {
  const [hours = 0, minutes = 0, seconds = 0] = value.split(':').map((part) => Number(part) || 0)
  return hours * 3600 + minutes * 60 + seconds
}

function formatHms(total: number) {
  const safe = Math.max(0, total)
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const seconds = safe % 60
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, '0')).join(':')
}

function useMustDropCountdown(start = MUST_DROP_START) {
  const [left, setLeft] = useState(() => parseHms(start))

  useEffect(() => {
    const id = window.setInterval(() => {
      setLeft((current) => (current <= 0 ? 0 : current - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [])

  return formatHms(left)
}

/** Dropdown notes — same order as ticker. */
const INFO_NOTES: Record<JackpotTierId, { noteName: string; description: string }> = {
  must: {
    noteName: 'Must Drop (time)',
    description:
      'A shared pool that is guaranteed to drop before the countdown ends. Any opted-in player on a qualifying spin can win it when it drops.',
  },
  mini: {
    noteName: 'Mini',
    description: 'Hits often — keeps the action going. Won randomly on opted-in spins. Most frequent tier.',
  },
  minor: {
    noteName: 'Minor',
    description:
      'Regular wins across the lobby. Won randomly on opted-in spins. Mid-frequency wins with a larger pool than Mini.',
  },
  major: {
    noteName: 'Major',
    description:
      'Bigger pools, bigger moments. Won randomly on opted-in spins. Less common than Mini/Minor; higher payout.',
  },
  mega: {
    noteName: 'Mega',
    description:
      'Life-changing top tier. Won randomly on opted-in spins. Rarest tier with the largest shared pool.',
  },
}

const INFO_TIERS = JACKPOT_TIERS.map((tier) => ({
  ...tier,
  ...INFO_NOTES[tier.id],
}))

function SwitchControl({
  checked,
  onCheckedChange,
  ariaLabel,
  size = 'md',
}: {
  checked: boolean
  onCheckedChange: (next: boolean) => void
  ariaLabel: string
  size?: 'sm' | 'md'
}) {
  const track = size === 'sm' ? 'h-[18px] w-8' : 'h-5 w-10'
  const thumb = size === 'sm' ? 'size-4' : 'size-[18px]'
  const onLeft = size === 'sm' ? 'left-[14px]' : 'left-[21px]'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onCheckedChange(!checked)}
      className="shrink-0 outline-none"
    >
      <span
        className={cn(
          'relative block rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors',
          track,
          checked ? 'bg-[#ee3536]' : 'bg-[rgba(255,255,255,0.24)]',
        )}
      >
        <span
          className={cn(
            'absolute top-px rounded-full bg-white transition-transform',
            thumb,
            checked ? onLeft : 'left-px',
          )}
        />
      </span>
    </button>
  )
}

function LauncherAmount({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-baseline tabular-nums', className)}>
      <span>$</span>
      <NumberFlow
        value={value}
        isolate
        format={{ minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }}
        transformTiming={{ duration: 550, easing: 'ease-out' }}
      />
    </span>
  )
}

function JackpotRow({
  className,
  countdown,
  amounts,
}: {
  className?: string
  countdown: string
  amounts: Record<JackpotTierId, number>
}) {
  return (
    <div
      data-name="jackpot-row"
      className={cn('flex h-8 w-full shrink-0 items-center', className)}
      role="list"
      aria-label="Jackpot tiers"
    >
      {JACKPOT_TIERS.map((item, index) => {
        const isMust = item.tone === 'must'
        return (
          <div
            key={item.id}
            className={cn(
              'flex h-full min-w-0 items-stretch',
              isMust ? 'flex-1' : 'hidden flex-1 md:flex',
            )}
          >
            {index > 0 ? <span className="w-px shrink-0 self-stretch bg-white/[0.08]" aria-hidden /> : null}
            <div
              data-name="jackpot-label"
              role="listitem"
              className={cn(
                'flex h-full min-w-0 flex-1 items-center justify-center gap-1 px-2 text-sm font-bold leading-5',
                isMust && MUST_DROP_BG,
                isMust && 'jackpot-must-drop-shake',
              )}
            >
              {isMust ? (
                <>
                  <img src="/casino/jackpot-fire.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
                  <span className={TICKER_TIER_CLASS.must}>{item.label.toUpperCase()}</span>
                  <LauncherAmount value={amounts[item.id]} className="text-white" />
                  <span className="text-[10px] font-semibold leading-[14px] text-[#edc555] tabular-nums">
                    in {countdown}
                  </span>
                </>
              ) : (
                <>
                  <span className={TICKER_TIER_CLASS[item.tone]}>{item.label.toUpperCase()}</span>
                  <LauncherAmount value={amounts[item.id]} className="text-[rgba(255,255,255,0.87)]" />
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Figma Jackpot Info panel — opt-in, ticker, live amounts. */
function JackpotInfoPanel({
  optIn,
  onOptInChange,
  ticker,
  onTickerChange,
  countdown,
  amounts,
  spinCost = '$0.35',
}: {
  optIn: boolean
  onOptInChange: (next: boolean) => void
  ticker: boolean
  onTickerChange: (next: boolean) => void
  countdown: string
  amounts: Record<JackpotTierId, number>
  spinCost?: string
}) {
  return (
    <div
      data-name="Jackpot Info"
      className="shell-scroll flex max-h-[min(460px,70vh)] w-full flex-col overflow-y-auto overscroll-contain rounded-lg border border-white/[0.08] bg-[#2c2c2c] px-1 py-2 text-[rgba(255,255,255,0.87)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
    >
      <div className="flex items-center gap-2 px-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-normal leading-5">Jackpot opt-in</p>
          <p className="text-xs leading-4 text-[rgba(255,255,255,0.6)]">
            Opt in to all tiers at once. Each adds <span className="font-bold">{spinCost}</span> to your stake per spin
          </p>
        </div>
        <SwitchControl checked={optIn} onCheckedChange={onOptInChange} ariaLabel="Jackpot opt-in" />
      </div>
      <div className="my-2 h-px w-full bg-white/[0.08]" aria-hidden />

      <div className="flex items-center gap-2 px-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-normal leading-5">Jackpot Ticker</p>
          <p className="text-xs leading-4 text-[rgba(255,255,255,0.6)]">Hide the live amounts below the header</p>
        </div>
        <SwitchControl checked={ticker} onCheckedChange={onTickerChange} ariaLabel="Jackpot ticker" />
      </div>
      <div className="my-2 h-px w-full bg-white/[0.08]" aria-hidden />

      <div className="flex flex-col gap-2 px-2">
        <p className="text-sm font-normal leading-5">Live Jackpots</p>
        <ul className="flex flex-col gap-2">
          {INFO_TIERS.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-[10px] border border-white/[0.08] bg-[rgba(250,250,250,0.05)] px-4 py-3"
            >
              <div className="min-w-0">
                <p className={cn('text-xs font-medium leading-4', DROPDOWN_TIER_CLASS[item.tone])}>{item.label}</p>
                {item.tone === 'must' ? (
                  <p className="text-xs font-normal leading-4 text-[rgba(255,255,255,0.6)] tabular-nums">in {countdown}</p>
                ) : null}
              </div>
              <LauncherAmount
                value={amounts[item.id]}
                className="shrink-0 text-xs font-medium leading-4 text-[rgba(255,255,255,0.87)]"
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="my-2 h-px w-full bg-white/[0.08]" aria-hidden />

      <div className="flex flex-col gap-2 px-2">
        <p className="text-sm font-normal leading-5">Jackpot Info</p>
        <ul className="flex flex-col gap-2">
          {INFO_TIERS.map((item) => (
            <li key={`${item.id}-note`} className="flex flex-col gap-1">
              <p className={cn('text-xs font-medium leading-4', DROPDOWN_TIER_CLASS[item.tone])}>{item.noteName}</p>
              <p className="text-xs font-normal leading-4 text-[rgba(255,255,255,0.6)]">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function OptInPill({
  enabled,
  onToggle,
  label = '+$0.35/spin',
  infoOpen,
  onInfoOpenChange,
  ticker,
  onTickerChange,
  countdown,
  amounts,
}: {
  enabled: boolean
  onToggle: (next: boolean) => void
  label?: string
  infoOpen: boolean
  onInfoOpenChange: (open: boolean) => void
  ticker: boolean
  onTickerChange: (next: boolean) => void
  countdown: string
  amounts: Record<JackpotTierId, number>
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState<{ top: number; left: number; width: number } | null>(null)

  useEffect(() => {
    if (!infoOpen) {
      setBox(null)
      return
    }
    const place = () => {
      const anchor = rootRef.current
      if (!anchor) return
      const rect = anchor.getBoundingClientRect()
      const width = Math.min(320, window.innerWidth - 16)
      const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8)
      const top = rect.bottom + 8
      setBox({ top, left, width })
    }
    place()
    const onPointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      onInfoOpenChange(false)
    }
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
    }
  }, [infoOpen, onInfoOpenChange])

  return (
    <div
      ref={rootRef}
      data-name="button-optin"
      className={cn(
        'relative z-20 flex items-center overflow-visible rounded-full border border-white/[0.08] bg-[rgba(250,250,250,0.05)] py-px',
        infoOpen && 'shadow-[0_0_0_3px_rgba(163,163,163,0.3)]',
      )}
    >
      <button
        type="button"
        className="inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-xs font-medium text-[rgba(255,255,255,0.87)] transition-colors hover:bg-white/5"
        aria-label="Jackpot Info"
        aria-expanded={infoOpen}
        aria-haspopup="dialog"
        onClick={() => onInfoOpenChange(!infoOpen)}
      >
        {label}
        <IconSettings className="size-3.5 opacity-70" aria-hidden />
      </button>
      <span className="h-4 w-px shrink-0 bg-white/[0.08]" aria-hidden />
      <div className="flex items-center px-2">
        <SwitchControl checked={enabled} onCheckedChange={onToggle} ariaLabel="Opt into jackpot" size="sm" />
      </div>

      {infoOpen && box
        ? createPortal(
            <div
              ref={menuRef}
              data-jackpot-dropdown=""
              data-name="jackpot-info-dropdown"
              role="dialog"
              aria-label="Jackpot Info"
              className="fixed z-[400] w-[min(320px,calc(100vw-1rem))]"
              style={{ top: box.top, left: box.left, width: box.width }}
            >
              <JackpotInfoPanel
                optIn={enabled}
                onOptInChange={onToggle}
                ticker={ticker}
                onTickerChange={onTickerChange}
                countdown={countdown}
                amounts={amounts}
              />
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

/**
 * Full-viewport game launcher — portaled to `document.body` with `data-casino-game-root`.
 * Always dark. Header: centered title, opt-in + Jackpot Info, fullscreen, favourite, close.
 */
export function GameLauncher({
  open,
  game,
  spinLabel = 'Jackpot opt-in',
  onClose,
  onFavoriteChange,
}: {
  open: boolean
  game: CasinoLobbyGame | null
  spinLabel?: string
  onClose: () => void
  onFavoriteChange?: (next: boolean) => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [optIn, setOptIn] = useState(false)
  const [ticker, setTicker] = useState(true)
  const [infoOpen, setInfoOpen] = useState(false)
  const mustDropCountdown = useMustDropCountdown()
  const amounts = useJackpotAmounts()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === rootRef.current)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  const toggleFullscreen = () => {
    const el = rootRef.current
    if (!el) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
      return
    }
    void el.requestFullscreen()
  }

  useEffect(() => {
    if (!open) {
      setInfoOpen(false)
      return
    }
    const scroll = document.getElementById('shell-scroll')
    const prevBody = document.body.style.overflow
    const prevScroll = scroll instanceof HTMLElement ? scroll.style.overflow : ''
    document.body.style.overflow = 'hidden'
    if (scroll instanceof HTMLElement) scroll.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (document.fullscreenElement) return
      if (infoOpen) setInfoOpen(false)
      else onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevBody
      if (scroll instanceof HTMLElement) scroll.style.overflow = prevScroll
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, infoOpen])

  if (!mounted || !open || !game) return null

  return createPortal(
    <div
      ref={rootRef}
      data-casino-game-root=""
      data-name="game-launcher"
      data-testid="game-launcher"
      data-brand="betonline"
      className="dark fixed inset-0 z-[320] flex flex-col bg-[#0a0a0a] p-3 text-[rgba(255,255,255,0.87)] sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={game.title}
    >
      <div
        data-name="jackpot-header"
        className="relative z-10 flex w-full shrink-0 flex-col overflow-visible rounded-[14px] border border-white/[0.08] bg-[#212121]"
      >
        {/*
          Desktop: 3-col grid keeps the title truly centered.
          Mobile: favourite + title left, controls right.
        */}
        <div className="relative z-20 grid grid-cols-[1fr_auto] items-center gap-2 overflow-visible p-2 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex min-w-0 items-center gap-2 md:justify-start">
            <Favorite
              inline
              title={game.title}
              onFavoriteChange={onFavoriteChange}
              className="md:hidden"
            />
            <p className="min-w-0 truncate text-xs font-medium leading-4 text-[rgba(255,255,255,0.87)] md:hidden">
              {game.title}
            </p>
            {/* Balance left actions width so the center title stays centered on desktop */}
            <span className="hidden md:block" aria-hidden />
          </div>

          <p className="hidden text-center text-sm font-medium leading-5 text-[rgba(255,255,255,0.87)] md:block">
            {game.title}
          </p>

          <div className="flex items-center justify-end gap-6">
            <OptInPill
              enabled={optIn}
              onToggle={setOptIn}
              label={spinLabel}
              infoOpen={infoOpen}
              onInfoOpenChange={setInfoOpen}
              ticker={ticker}
              onTickerChange={setTicker}
              countdown={mustDropCountdown}
              amounts={amounts}
            />
            <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              aria-pressed={fullscreen}
              onClick={toggleFullscreen}
              className="inline-flex size-7 items-center justify-center rounded-lg p-1.5 text-[rgba(255,255,255,0.87)] transition-colors hover:bg-white/10"
            >
              {fullscreen ? <IconMinimize className="size-4" /> : <IconMaximize className="size-4" />}
            </button>
            <Favorite
              inline
              title={game.title}
              onFavoriteChange={onFavoriteChange}
              className="hidden md:inline-flex"
            />
            <button
              type="button"
              aria-label="Close game"
              onClick={onClose}
              className="inline-flex size-7 items-center justify-center rounded-lg p-1.5 text-[rgba(255,255,255,0.87)] transition-colors hover:bg-white/10"
            >
              <IconX className="size-4" />
            </button>
            </div>
          </div>
        </div>

        {ticker ? (
          <>
            <div className="h-px w-full bg-white/[0.08]" aria-hidden />
            <JackpotRow countdown={mustDropCountdown} amounts={amounts} />
          </>
        ) : null}
      </div>

      <div
        data-name="game-viewport"
        className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-[14px] bg-black sm:mt-4"
      >
        {game.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={game.imageSrc} alt="" className="absolute inset-0 size-full object-cover" />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center bg-black/45">
          <p className="rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            Click to continue
          </p>
        </div>
      </div>
    </div>,
    document.body,
  )
}
