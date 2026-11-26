'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconPlayerPause } from '@tabler/icons-react'
import { Typography } from '@/components/ui/typography'
import { useShell } from '@/components/site/shell-context'
import {
  ACTIVITY_ROWS,
  activityGameFromTitle,
  type CasinoLobbyGame,
} from '@/lib/lumen/casino-lobby-catalog'
import { cn } from '@/lib/utils'
import { useScrollEdgeFade } from '@/components/ui/edge-fade'
import { useSiteVersion } from '@/lib/lumen/site-versions'

/** Rainbet-style Live Wins — Lumen tokens, activity feed data, lobby bottom. */
const VISIBLE = 14
/** Faster than Activity table (~900ms) — social proof should feel busy. */
const TICK_MS = 650
/** Narrower than lobby shelves; art still uses lobby poster ratio 152/207. */
const CARD_W = 112
/** Soft hover spring — same as `CasinoGameTile`. */
const TILE_SPRING = { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.85 }
/** Enter: bouncier so new cards don’t opacity-flicker in. */
const ENTER_SPRING = { type: 'spring' as const, stiffness: 420, damping: 22, mass: 0.7 }

const DEMO_USERS = [
  'mone***',
  'Pock***',
  'junn***',
  'ace_***',
  'lux***',
  'nova***',
  'kira***',
  'bolt***',
  'rex***',
  'ivy***',
  'zen***',
  'fox***',
] as const

const WIN_TEMPLATES = ACTIVITY_ROWS.filter((r) => r.win)

type LiveWin = {
  id: string
  user: string
  crown: 'gold' | 'purple' | 'silver'
  game: string
  payout: string
  lobbyGame: CasinoLobbyGame
}

const VIP_CROWN_PATH =
  'M4.7063 17.875C4.24606 17.875 3.87297 17.5019 3.87297 17.0417V16.9583C3.87297 16.4981 4.24606 16.125 4.7063 16.125H15.2896C15.7499 16.125 16.123 16.4981 16.123 16.9583V17.0417C16.123 17.5019 15.7499 17.875 15.2896 17.875H4.7063ZM4.58435 14.8125C4.17459 14.8125 3.82564 14.5146 3.76134 14.1099L2.75734 7.79062C2.72817 7.79062 2.69536 7.79427 2.6589 7.80156C2.62244 7.80885 2.58963 7.8125 2.56047 7.8125C2.19588 7.8125 1.88599 7.6849 1.63078 7.42969C1.37557 7.17448 1.24797 6.86458 1.24797 6.5C1.24797 6.13542 1.37557 5.82552 1.63078 5.57031C1.88599 5.3151 2.19588 5.1875 2.56047 5.1875C2.92505 5.1875 3.23494 5.3151 3.49015 5.57031C3.74536 5.82552 3.87297 6.13542 3.87297 6.5C3.87297 6.60208 3.86203 6.69687 3.84015 6.78437C3.81828 6.87187 3.79276 6.95208 3.76359 7.025L6.19023 8.11213C6.36969 8.19253 6.58092 8.13652 6.69696 7.97777L9.23234 4.50937C9.07192 4.39271 8.94067 4.23958 8.83859 4.05C8.73651 3.86042 8.68546 3.65625 8.68546 3.4375C8.68546 3.07292 8.81307 2.76302 9.06828 2.50781C9.32349 2.2526 9.63338 2.125 9.99797 2.125C10.3625 2.125 10.6724 2.2526 10.9277 2.50781C11.1829 2.76302 11.3105 3.07292 11.3105 3.4375C11.3105 3.65625 11.2594 3.86042 11.1573 4.05C11.0553 4.23958 10.924 4.39271 10.7636 4.50937L13.299 7.97777C13.415 8.13652 13.6262 8.19253 13.8057 8.11213L16.2323 7.025C16.2032 6.95208 16.1777 6.87187 16.1558 6.78437C16.1339 6.69687 16.123 6.60208 16.123 6.5C16.123 6.13542 16.2506 5.82552 16.5058 5.57031C16.761 5.3151 17.0709 5.1875 17.4355 5.1875C17.8 5.1875 18.1099 5.3151 18.3652 5.57031C18.6204 5.82552 18.748 6.13542 18.748 6.5C18.748 6.86458 18.6204 7.17448 18.3652 7.42969C18.1099 7.6849 17.8 7.8125 17.4355 7.8125C17.4063 7.8125 17.3735 7.80885 17.337 7.80156C17.3006 7.79427 17.2678 7.79062 17.2386 7.79062L16.2346 14.1099C16.1703 14.5146 15.8213 14.8125 15.4116 14.8125H4.58435Z'

function Crown({ tone }: { tone: LiveWin['crown'] }) {
  const fill = tone === 'gold' ? '#E39E3D' : tone === 'purple' ? '#A855F7' : '#94A3B8'
  return (
    <svg viewBox="0 0 20 20" className="size-3.5 shrink-0" aria-hidden>
      <path fill={fill} d={VIP_CROWN_PATH} />
    </svg>
  )
}

function formatWinAmount(payout: string) {
  return payout.replace(/^\+/, '')
}

function makeWin(seq: number): LiveWin {
  const template = WIN_TEMPLATES[seq % WIN_TEMPLATES.length]!
  const user = DEMO_USERS[seq % DEMO_USERS.length]!
  return {
    id: `lw-${seq}-${Date.now()}`,
    user,
    crown: template.crown,
    game: template.game,
    payout: template.payout,
    lobbyGame: activityGameFromTitle(template.game),
  }
}

function seedWins(): LiveWin[] {
  return Array.from({ length: VISIBLE }, (_, i) => {
    const template = WIN_TEMPLATES[i % WIN_TEMPLATES.length]!
    return {
      id: `lw-seed-${i}`,
      user: DEMO_USERS[i % DEMO_USERS.length]!,
      crown: template.crown,
      game: template.game,
      payout: template.payout,
      lobbyGame: activityGameFromTitle(template.game),
    }
  })
}

/**
 * Half-height of the center pause band vs `#shell-scroll` height.
 * Measure the **title**, not the tall card block — otherwise the shelf
 * looks “centered” whenever it’s on screen and never animates.
 */
const CENTER_PAUSE_RATIO = 0.12

/**
 * Rainbet Live Wins → Lumen: shelf title (no pill box) + win cards.
 * Title dead-center on page → pause; title above or below center → animate.
 * Pause icon whenever not streaming. Title tap = manual pause / force play.
 */
export function CasinoLiveWinsCarousel({ className }: { className?: string }) {
  const { launchGame } = useShell()
  const [playing, setPlaying] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [finePointer, setFinePointer] = useState(false)
  /** True only when the title sits in the page center band. */
  const [centered, setCentered] = useState(false)
  /** User tapped play while centered — keep streaming until they pause or leave center. */
  const [forcePlay, setForcePlay] = useState(false)
  const [wins, setWins] = useState<LiveWin[]>(seedWins)
  const [launchingId, setLaunchingId] = useState<string | null>(null)
  const seqRef = useRef(VISIBLE)
  const launchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  /* V5 only — fade the edge that has more wins to scroll to (V1–V3 unchanged). */
  const railFade = useScrollEdgeFade(scrollerRef, useSiteVersion() === 'v5')
  const hoverPaused = finePointer && hovered
  const armed = playing && !hoverPaused
  /**
   * Desktop (fine pointer): stream whenever armed — pause only on hover / title tap.
   * Touch: also pause when the title sits in the scroll-center band (mobile).
   */
  const streaming = finePointer
    ? armed
    : armed && (!centered || forcePlay)

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setFinePointer(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    const header = headerRef.current
    const root = document.getElementById('shell-scroll')
    if (!header || !root) return

    let raf = 0
    const measure = () => {
      raf = 0
      const rootRect = root.getBoundingClientRect()
      const headerRect = header.getBoundingClientRect()
      const rootMid = rootRect.top + rootRect.height / 2
      const titleMid = headerRect.top + headerRect.height / 2
      const band = rootRect.height * CENTER_PAUSE_RATIO
      const nextCentered = Math.abs(titleMid - rootMid) <= band
      setCentered((prev) => (prev === nextCentered ? prev : nextCentered))
      if (!nextCentered) setForcePlay(false)
    }
    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(measure)
    }

    measure()
    root.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      root.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!streaming) return
    const tick = window.setInterval(() => {
      seqRef.current += 1
      setWins((prev) => [makeWin(seqRef.current), ...prev].slice(0, VISIBLE))
      const scroller = scrollerRef.current
      if (scroller && scroller.scrollLeft > 0) {
        scroller.scrollTo({ left: 0, behavior: 'smooth' })
      }
    }, TICK_MS)
    return () => window.clearInterval(tick)
  }, [streaming])

  useEffect(() => {
    return () => {
      if (launchTimer.current) clearTimeout(launchTimer.current)
    }
  }, [])

  const onLaunch = (win: LiveWin, originEl: HTMLElement) => {
    if (launchingId) return
    setLaunchingId(win.id)
    launchGame(win.lobbyGame, originEl)
    if (launchTimer.current) clearTimeout(launchTimer.current)
    launchTimer.current = setTimeout(() => setLaunchingId(null), 900)
  }

  /** Pause icon → always play. Live → pause. Center auto-pause won’t block resume. */
  const togglePlaying = () => {
    if (streaming) {
      setPlaying(false)
      setForcePlay(false)
      return
    }
    setPlaying(true)
    setHovered(false)
    if (centered) setForcePlay(true)
  }

  return (
    <section
      ref={sectionRef}
      data-name="live-wins"
      aria-label="Live Wins"
      className={cn('py-2', className)}
      onMouseEnter={() => {
        if (finePointer) setHovered(true)
      }}
      onMouseLeave={() => {
        if (finePointer) setHovered(false)
      }}
    >
      {/* Shelf title — no box / no focus ring chrome. */}
      <header
        ref={headerRef}
        className="mb-3 flex h-9 items-center gap-2 px-6"
      >
        <button
          type="button"
          aria-label={streaming ? 'Live Wins — tap to pause' : 'Live Wins — tap to resume'}
          aria-pressed={streaming}
          onClick={togglePlaying}
          className="inline-flex min-h-9 min-w-0 items-center gap-2 text-left text-foreground outline-none focus:outline-none focus-visible:outline-none"
        >
          {/* Fixed slot so dot ↔ pause doesn’t shift the title. */}
          <span className="relative inline-flex size-3.5 shrink-0 items-center justify-center" aria-hidden>
            {streaming ? (
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
            ) : (
              <IconPlayerPause
                className="size-3.5 text-muted-foreground"
                stroke={1.75}
              />
            )}
          </span>
          <Typography as="span" shape="h4" weight="semibold" className="truncate">
            Live Wins
          </Typography>
        </button>
      </header>

      <div
        ref={scrollerRef}
        data-name="live-wins-rail"
        className="scrollbar-hide overflow-x-auto overscroll-x-contain"
        style={railFade}
      >
        {/* py room so tile lift (y: -6) isn’t clipped */}
        <div className="flex w-max gap-2.5 px-6 py-3">
          {/* No layout/popLayout — those caused the enter flicker; spring only on the new card. */}
          <AnimatePresence initial={false}>
            {wins.map((win) => {
              const launching = launchingId === win.id
              return (
                <motion.button
                  key={win.id}
                  type="button"
                  data-casino-game-id={win.lobbyGame.id}
                  initial={{ opacity: 0, x: -44, scale: 0.82 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    transition: ENTER_SPRING,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
                  }}
                  whileHover={
                    launching
                      ? undefined
                      : { scale: 1.04, y: -6, zIndex: 10, transition: TILE_SPRING }
                  }
                  whileTap={
                    launching
                      ? undefined
                      : { scale: 1.015, y: -2, transition: TILE_SPRING }
                  }
                  onClick={(e) => onLaunch(win, e.currentTarget)}
                  disabled={!!launchingId && !launching}
                  aria-busy={launching}
                  aria-label={`Play ${win.game} — ${win.user} won ${formatWinAmount(win.payout)}`}
                  className={cn(
                    'relative z-0 flex shrink-0 flex-col gap-1.5 rounded-[10px] border border-border bg-card p-1.5 text-left',
                    'shadow-[0_0_16px_rgba(0,0,0,0.06)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    'motion-reduce:!transform-none',
                    launching && 'ring-1 ring-border',
                  )}
                  style={{ width: CARD_W }}
                >
                  {/* Lobby poster ratio — same as CasinoGameTile (152×207), not square. */}
                  <span className="relative aspect-[152/207] w-full overflow-hidden rounded-lg bg-surface-muted-2">
                    <img
                      src={win.lobbyGame.imageSrc}
                      alt=""
                      className={cn(
                        'size-full object-cover',
                        launching && 'opacity-40',
                      )}
                    />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-1.5 pb-1.5 pt-5">
                      <span className="block truncate text-[11px] font-semibold leading-tight text-white">
                        {win.game}
                      </span>
                    </span>
                    {launching ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                        <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      </span>
                    ) : null}
                  </span>
                  <span className="flex min-w-0 items-center gap-1 px-0.5">
                    <Crown tone={win.crown} />
                    <span className="min-w-0 truncate text-[11px] leading-4 text-muted-foreground">
                      {win.user}
                    </span>
                  </span>
                  <span className="px-0.5 text-sm font-semibold tabular-nums leading-none text-success">
                    {formatWinAmount(win.payout)}
                  </span>
                </motion.button>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
