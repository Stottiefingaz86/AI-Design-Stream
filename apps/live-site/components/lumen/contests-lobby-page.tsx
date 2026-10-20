'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { IconAlertTriangle } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import {
  CONTEST_ART,
  CONTEST_CARDS,
  CONTEST_LEAGUE_LOGO,
  CONTEST_LOBBY_TABS,
  CONTEST_STATUS_CLASS,
  CONTEST_STATUS_ICON,
  type ContestCard,
  type ContestLobbyTabId,
} from '@/lib/lumen/contests'
import { cn } from '@/lib/utils'

const TILE_SPRING = { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.85 }
const PILL_COVER_MS = 240

function ContestLobbyTabs({
  active,
  onChange,
}: {
  active: ContestLobbyTabId
  onChange: (id: ContestLobbyTabId) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false })
  const [coveredId, setCoveredId] = useState<ContestLobbyTabId | null>(active)
  const firstCover = useRef(true)

  const measureThumb = useCallback(() => {
    const track = trackRef.current
    const btn = track?.querySelector<HTMLElement>('[data-sub-menu-pill][data-active="true"]')
    if (!track || !btn) return
    setThumb({ x: btn.offsetLeft, w: btn.offsetWidth, ready: true })
  }, [])

  useLayoutEffect(() => {
    measureThumb()
    const track = trackRef.current
    if (!track) return
    const ro = new ResizeObserver(measureThumb)
    ro.observe(track)
    return () => ro.disconnect()
  }, [active, measureThumb])

  useEffect(() => {
    if (firstCover.current) {
      firstCover.current = false
      setCoveredId(active)
      return
    }
    setCoveredId(null)
    const id = window.setTimeout(() => setCoveredId(active), PILL_COVER_MS)
    return () => window.clearTimeout(id)
  }, [active])

  return (
    <div data-name="contest-sub-menu" className="-mx-6 md:mx-0">
      <div className="min-w-0 w-full md:relative md:w-max md:max-w-full md:overflow-hidden md:rounded-full">
        <div className="scrollbar-hide w-full min-w-0 overflow-x-auto overflow-y-hidden">
          <div
            ref={trackRef}
            data-name="NavMenu"
            className="relative mx-6 flex h-12 w-max items-center gap-1 rounded-full bg-[var(--surface-muted-5)] p-0.5 md:mx-0"
            role="tablist"
            aria-label="Contest lobbies"
          >
            <span
              aria-hidden
              data-sub-menu-thumb=""
              className="pointer-events-none absolute top-0.5 h-11 rounded-full bg-primary transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                left: thumb.x,
                width: thumb.w,
                opacity: thumb.ready ? 1 : 0,
              }}
            />
            {CONTEST_LOBBY_TABS.map((tab) => {
              const on = active === tab.id
              const covered = coveredId === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  data-sub-menu-pill=""
                  data-active={on ? 'true' : 'false'}
                  data-covered={covered ? 'true' : undefined}
                  onClick={() => onChange(tab.id)}
                  className={cn(
                    'relative z-[1] flex h-11 items-center rounded-full px-2.5 text-sm leading-5 transition-colors duration-200',
                    on
                      ? covered
                        ? 'text-primary-foreground'
                        : 'text-foreground'
                      : 'text-foreground hover:bg-[var(--surface-muted-3)]',
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Status icon — mask so muted icons follow token color in light + dark. */
function ContestStatusIcon({
  icon,
  tone,
}: {
  icon: ContestCard['status']['icon']
  tone: ContestCard['status']['tone']
}) {
  const src = CONTEST_STATUS_ICON[icon]
  const useMask = tone === 'muted'
  if (useMask) {
    return (
      <span
        aria-hidden
        className="size-3 shrink-0 bg-current"
        style={{
          maskImage: `url(${src})`,
          WebkitMaskImage: `url(${src})`,
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
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={12} height={12} className="size-3 shrink-0" />
  )
}

function ContestStatusBadge({ status }: { status: ContestCard['status'] }) {
  const tone = CONTEST_STATUS_CLASS[status.tone]
  return (
    <span
      data-name="badge"
      className={cn(
        'relative z-[2] inline-flex h-5 w-max shrink-0 items-center gap-0.5 rounded-full border px-1.5 text-xs font-medium leading-4 backdrop-blur-[32px]',
        tone.badge,
        tone.text,
      )}
    >
      <ContestStatusIcon icon={status.icon} tone={status.tone} />
      {status.label}
    </span>
  )
}

/**
 * Corner art — Figma `Corner Image EXAMPLE` 175×238.
 * Crest deco shapes the soft divide (no light square). Player cutout on top.
 * Wide left fade so art blends into the card instead of a glowing panel.
 */
function ContestCornerArt({ art }: { art: ContestCard['art'] }) {
  const assets = CONTEST_ART[art]
  return (
    <div
      aria-hidden
      data-name="Corner Image EXAMPLE"
      className={cn(
        'pointer-events-none absolute -right-px -top-px z-0 h-[238px] w-[175px] overflow-hidden',
        /* Soft curved-ish divide — long fade, no hard light box */
        '[mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.35)_12%,#000_32%,#000_100%)]',
        '[-webkit-mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.35)_12%,#000_32%,#000_100%)]',
      )}
    >
      {/* Crest / stars only — faded so it doesn’t glow in dark mode */}
      <div
        className={cn(
          'absolute opacity-[0.14] dark:opacity-[0.1]',
          art === 'nfl' && 'left-[12%] right-[-70%] top-[-46px] aspect-[275/310]',
          art === 'nba' && 'inset-[-28%_-18%_-5%_3%]',
          art === 'ncaa' && 'inset-[-34%_-100%_-13%_10%]',
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={assets.deco}
          alt=""
          className={cn(
            'size-full max-w-none object-contain',
            art === 'ncaa' ? '-rotate-[19deg]' : '-rotate-[22deg]',
          )}
        />
      </div>

      {/* Player cutout */}
      {art === 'nfl' ? (
        <div className="absolute left-0 top-0 h-[237px] w-[174px] overflow-hidden">
          <div className="absolute left-[2.5%] right-[-35%] top-[calc(50%+52px)] h-[323px] -translate-y-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assets.player}
              alt=""
              className="absolute inset-0 size-full max-w-none object-contain object-top"
            />
          </div>
        </div>
      ) : art === 'nba' ? (
        <div className="absolute left-0 top-[-65px] h-[468px] w-[276px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={assets.player}
            alt=""
            className="absolute left-[-35%] top-[8%] h-[126%] w-[240%] max-w-none object-contain"
          />
        </div>
      ) : (
        <div className="absolute left-0 top-0 h-[282px] w-[218px] overflow-hidden">
          <div className="absolute inset-[-17%_-77%_-2%_-3%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={assets.player}
              alt=""
              className="absolute inset-0 size-full max-w-none object-contain object-top"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ContestCardView({ card }: { card: ContestCard }) {
  return (
    <motion.article
      data-name="card-base"
      whileHover={{ scale: 1.02, y: -4, zIndex: 10 }}
      whileTap={{ scale: 1.01, y: -1 }}
      transition={TILE_SPRING}
      className={cn(
        'group relative z-0 flex h-[238px] min-w-0 cursor-pointer flex-col overflow-hidden rounded-[10px] border bg-card py-4 pl-4 pr-[18px]',
        'shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]',
        'transition-[border-color,box-shadow] duration-150 hover:shadow-[0_0_20px_rgba(0,0,0,0.12)]',
        'motion-reduce:!transform-none',
        card.featured
          ? 'border-featured hover:border-featured'
          : 'border-border hover:border-foreground/15',
      )}
    >
      <ContestCornerArt art={card.art} />

      {/* Full-height column: info left + full-width button row (CTA bottom-right over art). */}
      <div
        data-name="Card Content"
        className="relative z-[1] flex h-full w-full flex-col justify-between"
      >
        <div data-name="Info" className="relative z-[2] flex w-full max-w-[203px] flex-col gap-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={CONTEST_LEAGUE_LOGO[card.league]}
                alt=""
                width={20}
                height={20}
                className="size-5 object-contain"
              />
              {card.hot ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/promotions/contest/icon-fire.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 shrink-0"
                />
              ) : null}
            </div>
            <div className="flex flex-col">
              <p className="truncate text-xl font-bold leading-7 text-foreground">{card.prize}</p>
              <p className="truncate text-sm font-medium leading-5 text-foreground">{card.title}</p>
            </div>
          </div>
          {/* Status tag — always rendered (Closes / Open / Pre-Sale / Opens / Ended) */}
          <ContestStatusBadge status={card.status} />
        </div>

        {/* Figma Buttons row — secondary left, primary flush bottom-right */}
        <div data-name="Buttons" className="relative z-[2] flex w-full items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            {card.secondary === 'results' ? (
              <Button type="button" variant="secondary" size="sm" className="h-7 rounded-full px-3">
                Results
              </Button>
            ) : (
              <Button type="button" variant="secondary" size="sm" className="h-7 rounded-full px-3">
                Rules
              </Button>
            )}
            {card.midAction ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-7 gap-1 rounded-full px-3"
              >
                {card.midAction.alert ? (
                  <IconAlertTriangle className="size-3.5 text-warning" stroke={2} aria-hidden />
                ) : null}
                {card.midAction.label}
              </Button>
            ) : null}
          </div>
          {card.cta ? (
            <Button type="button" size="sm" className="h-7 shrink-0 rounded-full px-3">
              {card.cta}
            </Button>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}

/** Promo26 Contest Main Lobby — 2142:301257. */
export function ContestsLobbyPage({ className }: { className?: string }) {
  const [tab, setTab] = useState<ContestLobbyTabId>('main')

  return (
    <div
      data-name="Contest"
      className={cn('flex w-full flex-col gap-7 bg-background px-6 pb-10 pt-6', className)}
    >
      <div className="flex flex-col gap-4">
        <Typography as="h1" shape="h2" weight="semibold">
          Contest
        </Typography>
        <ContestLobbyTabs active={tab} onChange={setTab} />
      </div>

      <div data-name="Cards" className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {CONTEST_CARDS.map((card) => (
          <ContestCardView key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}
