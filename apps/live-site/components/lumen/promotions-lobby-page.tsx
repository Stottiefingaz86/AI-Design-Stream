'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CasinoLobbyBannerRow } from '@/components/lumen/casino-lobby-banners'
import { Typography } from '@/components/ui/typography'
import {
  PROMO_FILTERS,
  PROMOTIONS_LOBBY_BANNERS,
  PROMOTIONS_LOBBY_CARDS,
  type PromoFilterId,
} from '@/lib/lumen/promotions-lobby'
import { cn } from '@/lib/utils'

function filterFromSearch(raw: string | null): PromoFilterId {
  if (raw && PROMO_FILTERS.some((f) => f.id === raw)) return raw as PromoFilterId
  return 'all'
}

const TILE_SPRING = { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.85 }

/** Match thumb travel (~300ms) so label goes white only once the red covers it. */
const PILL_COVER_MS = 240

function PromoFilterTrack({
  active,
  onChange,
}: {
  active: PromoFilterId
  onChange: (id: PromoFilterId) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumb, setThumb] = useState({ x: 0, w: 0, ready: false })
  const [coveredId, setCoveredId] = useState<PromoFilterId | null>(active)
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
    /*
      Mobile: gray w-max capsule scrolls as one unit (edge-bleed like casino subnav).
      Desktop: clip shell caps the track so it sits as a fixed chip.
    */
    <div data-name="promo-sub-menu" className="-mx-6 mb-6 md:mx-0">
      <div className="min-w-0 w-full md:relative md:w-max md:max-w-full md:overflow-hidden md:rounded-full">
        <div
          data-name="sub-menu-scroll"
          className="scrollbar-hide w-full min-w-0 overflow-x-auto overflow-y-hidden"
        >
          <div
            ref={trackRef}
            data-name="sub-menu-pill-track"
            className="relative mx-6 flex h-12 w-max items-center gap-1 rounded-full bg-secondary p-0.5 md:mx-0"
            role="tablist"
            aria-label="Promotion categories"
          >
            <span
              aria-hidden
              data-sub-menu-thumb=""
              className="pointer-events-none absolute top-0.5 h-11 rounded-full bg-primary transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ left: thumb.x, width: thumb.w, opacity: thumb.ready ? 1 : 0 }}
            />
            {PROMO_FILTERS.map((item) => {
              const on = item.id === active
              const covered = item.id === coveredId
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  data-sub-menu-pill=""
                  data-active={on ? 'true' : 'false'}
                  data-covered={covered ? 'true' : 'false'}
                  onClick={() => onChange(item.id)}
                  className={cn(
                    'shell-chrome-btn relative z-10 h-11 shrink-0 rounded-full bg-transparent px-4 text-sm leading-5',
                    covered
                      ? 'font-medium text-primary-foreground'
                      : 'font-normal text-muted-foreground hover:bg-[var(--surface-muted-3)] hover:text-foreground dark:hover:bg-accent',
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function PromoCard({
  title,
  body,
  imageSrc,
}: {
  title: string
  body: string
  imageSrc: string
}) {
  return (
    <motion.article
      whileHover={{ scale: 1.02, y: -4, zIndex: 10 }}
      whileTap={{ scale: 1.01, y: -1 }}
      transition={TILE_SPRING}
      className={cn(
        'group relative z-0 flex cursor-pointer flex-col overflow-hidden rounded-[10px] border border-border bg-card',
        'shadow-[0_0_16px_0_rgba(0,0,0,0.06)]',
        'transition-[border-color,box-shadow] duration-150 hover:border-foreground/15 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)]',
        'motion-reduce:!transform-none',
      )}
    >
      <div className="flex w-full flex-col gap-6 pb-6">
        <div className="aspect-[280/140] w-full overflow-hidden bg-surface-muted-3">
          <img
            src={imageSrc}
            alt=""
            className="size-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col gap-2 px-6">
          <Typography as="h3" shape="paragraph" weight="semibold" className="truncate text-base leading-6">
            {title}
          </Typography>
          <Typography as="p" shape="small" variant="muted" className="line-clamp-2">
            {body}
          </Typography>
        </div>
      </div>
    </motion.article>
  )
}

/** Promo26_Revamp 8:16195 — banner carousel + All Promotions grid. */
export function PromotionsLobbyPage({ className }: { className?: string }) {
  const searchParams = useSearchParams()
  const urlFilter = filterFromSearch(searchParams.get('filter'))
  const [filter, setFilter] = useState<PromoFilterId>(urlFilter)

  /* Poker (and other) deep links → ?filter=poker keeps the pill highlighted. */
  useEffect(() => {
    setFilter(urlFilter)
  }, [urlFilter])

  const cards = useMemo(() => {
    if (filter === 'all') return PROMOTIONS_LOBBY_CARDS
    return PROMOTIONS_LOBBY_CARDS.filter((card) => card.category === filter)
  }, [filter])

  return (
    <div data-name="promotions_lobby" className={cn('w-full bg-background pt-6', className)}>
      {/* Figma banner strip — VIP Progress + Daily Races + promo cards. */}
      <CasinoLobbyBannerRow promos={PROMOTIONS_LOBBY_BANNERS} />

      <section className="px-6 pb-14 pt-8">
        <Typography as="h1" shape="h2" weight="semibold" className="mb-4">
          All Promotions
        </Typography>
        <PromoFilterTrack active={filter} onChange={setFilter} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card) => (
            <PromoCard key={card.id} title={card.title} body={card.body} imageSrc={card.imageSrc} />
          ))}
        </div>
        {cards.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No promotions in this category yet.
          </p>
        ) : null}
      </section>
    </div>
  )
}
