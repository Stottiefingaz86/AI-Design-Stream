'use client'

import { useEffect, useRef, useState, type ElementType, type TouchEvent } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  IconChevronLeft,
  IconChevronRight,
  IconLock,
  IconRefresh,
  IconSparkles,
  IconUserPlus,
  IconGift,
  IconRocket,
  IconCalendar,
} from '@tabler/icons-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

type FlipCard = {
  id: string
  backTitle: string
  title: string
  description: string
  subtitle?: string
  unlockTier?: string
  icon?: ElementType
  heroImage?: string
  accent?: string
}

/** Ported from BOL_SHADCN vip-rewards-flip-carousel — tokens remapped to live-site. */
const CARDS: FlipCard[] = [
  {
    id: 'vip-rewards',
    backTitle: 'VIP\nRewards',
    title: 'VIP\nRewards',
    description:
      'Become a VIP the moment you place your first bet. Climb every VIP rank from Bronze to Obsidian and unlock bigger rewards along the way.',
    heroImage: '/vip/flip-cards/crown-hero.gif',
  },
  {
    id: 'rakeback',
    backTitle: 'Rakeback',
    title: 'Rakeback',
    description: 'Claim a share of every bet back, every 15 minutes.',
    icon: IconRefresh,
    accent: 'var(--primary)',
  },
  {
    id: 'refer-a-friend',
    backTitle: 'Refer a\nFriend',
    title: 'Refer a Friend',
    description: 'Claim commission earned when friends you referred wager on sports and casino.',
    subtitle: 'Commission ready',
    icon: IconUserPlus,
    accent: 'var(--info)',
  },
  {
    id: 'monthly-reload',
    backTitle: 'Monthly\nReload',
    title: 'Monthly Reload',
    description: 'Reload bonus available once per month based on your VIP tier.',
    subtitle: '2 of 3 claimed',
    icon: IconCalendar,
    accent: 'var(--vip-rewards)',
  },
  {
    id: 'special-reload',
    backTitle: 'Special\nReload',
    title: 'Special Reload',
    description: 'Limited-time reload offers for VIP members.',
    subtitle: '0 of 7 claimed',
    icon: IconGift,
    accent: 'var(--featured)',
  },
  {
    id: 'free-spins',
    backTitle: 'Free Spins',
    title: 'Free Spins',
    description: '$1 per spin. Open the game to play your free spins.',
    icon: IconSparkles,
    accent: 'var(--success)',
  },
  {
    id: 'weekly-boost',
    backTitle: 'Weekly\nBoost',
    title: 'Weekly Boost',
    description: 'Boost your balance every week as you climb the VIP ladder.',
    unlockTier: 'SILVER',
    icon: IconRocket,
    accent: 'var(--warning)',
  },
  {
    id: 'monthly-boost',
    backTitle: 'Monthly\nBoost',
    title: 'Monthly Boost',
    description: 'Monthly VIP boost based on your tier and play.',
    unlockTier: 'PLATINUM',
    icon: IconRocket,
    accent: 'var(--vip-rewards)',
  },
]

const CARD_W = 240
const CARD_H = 357
const FLIP_MS = 280
const MOVE_MS = 320
const REVEAL_AT_MS = 160
const VISIBLE_SIDE_DESKTOP = 2
const VISIBLE_SIDE_MOBILE = 1

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function arcPose(offset: number, compact: boolean, progress: number) {
  const abs = Math.abs(offset)

  if (compact) {
    const stepX = 252
    const rotStep = 16
    const endX = offset * stepX
    const endY = abs * 18
    const endRot = offset * rotStep
    const startX = offset * 280
    const startY = abs * 48 + (offset === 0 ? 180 : 0)
    const startRot = offset * 30
    const x = endX + (startX - endX) * (1 - progress)
    const y = endY + (startY - endY) * (1 - progress)
    const rotate = endRot + (startRot - endRot) * (1 - progress)
    const scaleBase = abs === 0 ? 1 : 0.92
    const scale = scaleBase * (0.88 + 0.12 * progress)
    return {
      x,
      y,
      rotate,
      scale,
      opacity: abs > VISIBLE_SIDE_MOBILE ? 0 : Math.min(1, 0.35 + progress * 0.65),
      zIndex: 40 - abs * 10,
    }
  }

  const radius = 520
  const settledStep = 28
  const enterStep = 54
  const endAngle = offset * settledStep
  const startAngle = offset === 0 ? 0 : Math.sign(offset) * (16 + abs * enterStep)
  const angle = endAngle + (startAngle - endAngle) * (1 - progress)
  const rad = (angle * Math.PI) / 180
  let x = radius * Math.sin(rad)
  let y = radius * (1 - Math.cos(rad)) * 0.42
  if (offset === 0) y += (1 - progress) * 260
  const scaleBase = abs === 0 ? 1 : abs === 1 ? 0.9 : 0.82
  const scale = scaleBase * (0.82 + 0.18 * progress)
  return {
    x,
    y,
    rotate: angle,
    scale,
    opacity: abs > VISIBLE_SIDE_DESKTOP ? 0 : Math.min(1, 0.15 + progress * 0.85),
    zIndex: 40 - abs * 10,
  }
}

function CardBack({ title, frameOnly = false }: { title: string; frameOnly?: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[color-mix(in_oklch,var(--vip-rewards)_65%,#ceac33)] bg-[#1a1a1a] shadow-[0_10px_60px_rgba(0,0,0,0.85)]">
      <Image src="/vip/flip-cards/card-back.png" alt="" fill className="object-cover" sizes="240px" />
      {!frameOnly ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6">
          <div className="relative h-[56px] w-[96px] shrink-0">
            <Image src="/vip/flip-cards/bol-mark.svg" alt="" fill className="object-contain" sizes="96px" />
          </div>
          <p className="max-w-[168px] whitespace-pre-line break-words text-center text-[18px] font-bold uppercase leading-[1.05] tracking-wide text-white">
            {title}
          </p>
        </div>
      ) : null}
    </div>
  )
}

function CardFront({ card, compact = false }: { card: FlipCard; compact?: boolean }) {
  const Icon = card.icon
  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-white shadow-[0_18px_50px_rgba(0,0,0,0.55)]">
      <div className="absolute left-3 top-3 size-5">
        <Image src="/vip/flip-cards/corner-crown.svg" alt="" width={20} height={20} className="size-5" />
      </div>
      <div className="absolute bottom-3 right-3 size-5 rotate-180">
        <Image src="/vip/flip-cards/corner-crown.svg" alt="" width={20} height={20} className="size-5" />
      </div>
      <div className="absolute inset-3">
        <Image
          src="/vip/flip-cards/card-borders.svg"
          alt=""
          fill
          className="object-fill opacity-80"
          sizes="216px"
        />
      </div>
      <div
        className={cn(
          'absolute inset-0 flex flex-col items-center justify-center text-center',
          compact ? 'gap-3 px-6' : 'gap-3 px-5',
        )}
      >
        {card.heroImage ? (
          <div className={cn('relative shrink-0', compact ? 'h-[96px] w-[124px]' : 'h-[78px] w-[102px]')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.heroImage} alt="" className="h-full w-full object-contain" />
          </div>
        ) : Icon ? (
          <div
            className="flex size-12 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: card.accent ?? 'var(--primary)' }}
          >
            <Icon className="size-6" aria-hidden />
          </div>
        ) : null}
        <h3
          className={cn(
            'break-words text-[#2d2e2c]',
            compact ? 'max-w-[180px]' : 'max-w-[160px]',
            card.heroImage
              ? cn(
                  'whitespace-pre-line font-black uppercase tracking-tight',
                  compact ? 'text-[28px] leading-[0.92]' : 'text-[26px] leading-[0.95]',
                )
              : 'text-[16px] font-bold leading-snug',
          )}
        >
          {card.title}
        </h3>
        <p
          className={cn(
            'text-[#2d2e2c]/70',
            compact ? 'max-w-[188px] text-[12px] leading-[1.35]' : 'max-w-[168px] text-[11px] leading-snug',
          )}
        >
          {card.description}
        </p>
        {card.unlockTier ? (
          <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-md bg-[#1c1d1c] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
            <IconLock className="size-3.5" strokeWidth={2} aria-hidden />
            {card.unlockTier}
          </span>
        ) : null}
      </div>
    </div>
  )
}

function CenterFlipCard({
  card,
  faceUp,
  compact = false,
}: {
  card: FlipCard
  faceUp: boolean
  compact?: boolean
}) {
  return (
    <div className="h-full w-full [perspective:1000px]">
      <motion.div
        className="relative h-full w-full"
        initial={false}
        animate={{ rotateY: faceUp ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28, mass: 0.7 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <CardBack title={card.backTitle} />
        </div>
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <CardFront card={card} compact={compact} />
        </div>
      </motion.div>
    </div>
  )
}

export function VipRewardsFlipCarousel({
  className,
  onExplore,
}: {
  className?: string
  onExplore?: () => void
}) {
  const isMobile = useIsMobile()
  const [active, setActive] = useState(0)
  const [faceUp, setFaceUp] = useState(false)
  const [busy, setBusy] = useState(false)
  const [entered, setEntered] = useState(false)
  const [intro, setIntro] = useState(true)
  const stageRef = useRef<HTMLDivElement>(null)
  const n = CARDS.length
  const compact = Boolean(isMobile)
  const progress = entered ? 1 : 0

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setEntered(true)
          io.disconnect()
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!entered) return
    const flipTimer = window.setTimeout(() => setFaceUp(true), 520)
    const introTimer = window.setTimeout(() => setIntro(false), 1100)
    return () => {
      window.clearTimeout(flipTimer)
      window.clearTimeout(introTimer)
    }
  }, [entered])

  const goTo = async (index: number) => {
    if (busy || !entered) return
    if (index === active) {
      if (!faceUp) setFaceUp(true)
      return
    }
    setBusy(true)
    setFaceUp(false)
    setActive(index)
    await wait(REVEAL_AT_MS)
    setFaceUp(true)
    await wait(Math.max(MOVE_MS, FLIP_MS) - REVEAL_AT_MS + 40)
    setBusy(false)
  }

  const go = (dir: -1 | 1) => {
    void goTo((active + dir + n) % n)
  }

  const touchStartX = useRef<number | null>(null)
  const swipedRef = useRef(false)

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
    swipedRef.current = false
  }

  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStartX.current
    touchStartX.current = null
    if (start == null || busy || !entered) return
    const end = e.changedTouches[0]?.clientX
    if (end == null) return
    const dx = end - start
    if (Math.abs(dx) < 48) return
    swipedRef.current = true
    go(dx < 0 ? 1 : -1)
  }

  const selectCard = (index: number) => {
    if (swipedRef.current) {
      swipedRef.current = false
      return
    }
    void goTo(index)
  }

  const shortestOffset = (index: number) => {
    let d = index - active
    if (d > n / 2) d -= n
    if (d < -n / 2) d += n
    return d
  }

  const visibleSide = compact ? VISIBLE_SIDE_MOBILE : VISIBLE_SIDE_DESKTOP
  const cardScale = compact ? 0.96 : 0.86
  const cardW = CARD_W * cardScale
  const cardH = CARD_H * cardScale
  const stageTop = compact ? 36 : 48
  const arcBottomPad = compact ? 40 : 64
  const stageHeight = stageTop + cardH + arcBottomPad

  const arrowBtnClass = cn(
    'absolute z-50 flex size-8 items-center justify-center rounded-md',
    'border border-border bg-secondary text-foreground backdrop-blur-sm',
    'transition-colors hover:bg-muted',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-50',
  )

  return (
    <div className={cn('mb-2 w-full max-w-full min-w-0 px-6', className)}>
      <div className="w-full max-w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card/80">
        <div
          className={cn(
            'flex w-full min-w-0 flex-col items-center',
            compact ? 'gap-4 px-0 pb-5 pt-5' : 'gap-4 px-4 pb-8 pt-6',
          )}
        >
          <div
            ref={stageRef}
            className="relative w-full max-w-full touch-pan-y overflow-visible"
            style={{ height: stageHeight }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {!compact ? (
              <div
                className="pointer-events-none absolute inset-x-0 z-50"
                style={{ top: stageTop, height: cardH }}
              >
                <button
                  type="button"
                  aria-label="Previous card"
                  disabled={busy || !entered}
                  onClick={() => go(-1)}
                  className={cn(arrowBtnClass, 'pointer-events-auto left-2 top-1/2 -translate-y-1/2')}
                >
                  <IconChevronLeft className="size-4" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  aria-label="Next card"
                  disabled={busy || !entered}
                  onClick={() => go(1)}
                  className={cn(arrowBtnClass, 'pointer-events-auto right-2 top-1/2 -translate-y-1/2')}
                >
                  <IconChevronRight className="size-4" strokeWidth={2} />
                </button>
              </div>
            ) : null}

            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ width: cardW, height: cardH, top: stageTop }}
            >
              {CARDS.map((card, index) => {
                const offset = shortestOffset(index)
                const abs = Math.abs(offset)
                if (abs > visibleSide + 1) return null
                const isCenter = offset === 0
                const pose = arcPose(offset, compact, progress)

                return (
                  <motion.button
                    key={card.id}
                    type="button"
                    disabled={busy || !entered || abs > visibleSide}
                    aria-label={isCenter ? `${card.title} (selected)` : `Show ${card.title}`}
                    aria-current={isCenter ? 'true' : undefined}
                    onClick={() => selectCard(index)}
                    className={cn(
                      'absolute left-0 top-0 h-full w-full appearance-none border-0 bg-transparent p-0 text-left',
                      !isCenter && entered && 'cursor-pointer',
                      busy && 'cursor-wait',
                    )}
                    initial={false}
                    animate={{
                      x: pose.x,
                      y: pose.y,
                      rotate: pose.rotate,
                      scale: pose.scale,
                      opacity: pose.opacity,
                      zIndex: pose.zIndex,
                    }}
                    transition={
                      entered
                        ? {
                            type: 'spring',
                            stiffness: intro ? (abs === 0 ? 200 : 180) : 280,
                            damping: intro ? 24 : 28,
                            mass: intro ? 0.95 : 0.75,
                            delay: intro ? abs * 0.06 : 0,
                          }
                        : { duration: 0 }
                    }
                    style={{
                      pointerEvents: entered && abs <= visibleSide ? 'auto' : 'none',
                    }}
                    whileHover={
                      !isCenter && entered && !busy && !compact
                        ? { scale: pose.scale * 1.03 }
                        : undefined
                    }
                  >
                    {isCenter ? (
                      <CenterFlipCard card={card} faceUp={faceUp && entered} compact={compact} />
                    ) : (
                      <CardBack title={card.backTitle} frameOnly={compact} />
                    )}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {onExplore ? (
            <button
              type="button"
              onClick={onExplore}
              className={cn(
                'relative z-[60] h-10 shrink-0 rounded-md bg-primary font-bold uppercase tracking-wider text-primary-foreground transition-[filter] duration-150 hover:brightness-110',
                compact ? 'mx-4 w-[calc(100%-2rem)] text-[11px]' : 'w-full max-w-[240px] text-xs',
              )}
            >
              Explore VIP Rewards
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
