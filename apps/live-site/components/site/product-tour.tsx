'use client'

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { usePathname, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { IconX } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useShell } from '@/components/site/shell-context'
import {
  V2_PROMOTIONS_TOUR_SEEN_KEY,
  endProductTour,
  getActiveProductTour,
  getV2PromotionsTour,
  shouldForceV2PromotionsTour,
  startProductTour,
  subscribeProductTour,
  type ActiveProductTour,
  type ProductTourAction,
  type ProductTourStep,
} from '@/lib/lumen/product-tours'
import { useSiteVersion } from '@/lib/lumen/site-versions'
import { cn } from '@/lib/utils'

const TARGET_TIMEOUT_MS = 4000
const OPTIONAL_TIMEOUT_MS = 700
const HOLE_PAD = 6
const CARD_W = 300
const CARD_GAP = 12
const EDGE = 12

type Rect = { top: number; left: number; width: number; height: number }

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function visibleMatch(selector: string): HTMLElement | null {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector))
  return (
    nodes.find((el) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) return false
      return el.checkVisibility ? el.checkVisibility({ checkVisibilityCSS: true }) : true
    }) ?? null
  )
}

async function waitForTarget(
  selector: string,
  isCancelled: () => boolean,
  timeoutMs = TARGET_TIMEOUT_MS,
) {
  const start = performance.now()
  while (performance.now() - start < timeoutMs) {
    if (isCancelled()) return null
    const el = visibleMatch(selector)
    /* Sheets slide in — wait until the element stops moving before spotlighting. */
    if (el) {
      const a = el.getBoundingClientRect()
      await sleep(120)
      const b = el.getBoundingClientRect()
      if (Math.abs(a.left - b.left) < 1 && Math.abs(a.top - b.top) < 1) return el
      continue
    }
    await sleep(80)
  }
  return null
}

function sameRect(a: Rect | null, b: Rect | null) {
  if (!a || !b) return a === b
  return (
    Math.abs(a.top - b.top) < 0.5 &&
    Math.abs(a.left - b.left) < 0.5 &&
    Math.abs(a.width - b.width) < 0.5 &&
    Math.abs(a.height - b.height) < 0.5
  )
}

function cardPosition(hole: Rect | null, cardH: number) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const width = Math.min(CARD_W, vw - EDGE * 2)
  if (!hole) {
    return {
      top: Math.max(EDGE, (vh - cardH) / 2),
      left: (vw - width) / 2,
      width,
    }
  }
  const below = hole.top + hole.height + CARD_GAP
  const above = hole.top - CARD_GAP - cardH
  const top =
    below + cardH <= vh - EDGE
      ? below
      : above >= EDGE
        ? above
        : Math.min(Math.max(EDGE, below), vh - cardH - EDGE)
  const centred = hole.left + hole.width / 2 - width / 2
  const left = Math.min(Math.max(EDGE, centred), vw - width - EDGE)
  return { top, left, width }
}

/**
 * Intercom-triggered product tours — spotlight + coachmark over the live shell.
 * Tap the highlighted element (or Next) to advance; the last tap passes through.
 */
export function ProductTourHost() {
  const tour = useSyncExternalStore(subscribeProductTour, getActiveProductTour, () => null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <>
      {/* Keep arrival logic out of the portal tree; never suspend the host. */}
      <Suspense fallback={null}>
        <V2PromotionsArrivalTour />
      </Suspense>
      {mounted
        ? createPortal(
            <div data-product-tour-root="">
              <AnimatePresence>
                {tour ? <TourRunner key={tour.runId} tour={tour} /> : null}
              </AnimatePresence>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

/** V2 only — once on /promotions. Replay with `?tour=1` or `?tour=v2-promotions`. */
function V2PromotionsArrivalTour() {
  const pathname = usePathname()
  const version = useSiteVersion()

  useEffect(() => {
    ;(window as Window & { __lumenStartV2PromoTour?: () => void }).__lumenStartV2PromoTour = () => {
      try {
        window.localStorage.removeItem(V2_PROMOTIONS_TOUR_SEEN_KEY)
      } catch {
        /* ignore */
      }
      startProductTour(getV2PromotionsTour())
    }
    return () => {
      delete (window as Window & { __lumenStartV2PromoTour?: () => void }).__lumenStartV2PromoTour
    }
  }, [])

  useEffect(() => {
    if (pathname !== '/promotions' && pathname !== '/promotions/') return
    /* Read search in the effect — avoids useSearchParams suspending ProductTourHost. */
    const force = shouldForceV2PromotionsTour(window.location.search)
    const onV2 = version === 'v2' || document.documentElement.dataset.siteVersion === 'v2'
    if (!onV2) {
      if (force) {
        console.warn(
          '[promo tour] Site is not on V2. Switch version in Intercom Home, or open with ?v=2',
        )
      }
      return
    }
    try {
      if (!force && window.localStorage.getItem(V2_PROMOTIONS_TOUR_SEEN_KEY) === '1') return
    } catch {
      if (!force) return
    }
    /* Mark seen only when starting — Strict Mode remounts would clear a pre-set timer. */
    const id = window.setTimeout(
      () => {
        if (getActiveProductTour()) return
        try {
          if (!force && window.localStorage.getItem(V2_PROMOTIONS_TOUR_SEEN_KEY) === '1') return
          window.localStorage.setItem(V2_PROMOTIONS_TOUR_SEEN_KEY, '1')
        } catch {
          /* still show the tour if storage is blocked */
        }
        startProductTour(getV2PromotionsTour())
      },
      force ? 400 : 800,
    )
    return () => window.clearTimeout(id)
  }, [pathname, version])

  return null
}

function TourRunner({ tour }: { tour: ActiveProductTour }) {
  const router = useRouter()
  const pathname = usePathname()
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname
  const { setVipHubOpen, setCashierOpen, setIntercomOpen, setNavOpen, startNavigating } = useShell()

  useEffect(() => {
    return () => {
      setNavOpen(false)
    }
  }, [setNavOpen])

  const [index, setIndex] = useState(0)
  const [hole, setHole] = useState<Rect | null>(null)
  const [resolving, setResolving] = useState(true)
  const [cardH, setCardH] = useState(160)
  const targetRef = useRef<HTMLElement | null>(null)
  const directionRef = useRef<1 | -1>(1)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIntercomOpen(false)
  }, [setIntercomOpen])

  const runAction = useCallback(
    async (action: ProductTourAction) => {
      switch (action.type) {
        case 'close-sheets':
          setVipHubOpen(false)
          setCashierOpen(false)
          return
        case 'vip-hub': {
          setVipHubOpen(true, action.tab)
          /* Context tab only syncs on change — click it in case the player switched tabs. */
          const tab = await waitForTarget(`[data-tour="vip-tab-${action.tab}"]`, () => false)
          if (tab && tab.getAttribute('aria-selected') !== 'true') tab.click()
          return
        }
        case 'cashier':
          setCashierOpen(true)
          return
        case 'route': {
          setVipHubOpen(false)
          setCashierOpen(false)
          if (pathnameRef.current === action.href) return
          startNavigating(action.href)
          router.push(action.href)
          /* Old page tiles can match the selector until the route swaps. */
          const start = performance.now()
          while (
            pathnameRef.current !== action.href &&
            performance.now() - start < TARGET_TIMEOUT_MS
          ) {
            await sleep(60)
          }
          await sleep(200)
          return
        }
        case 'click': {
          const el = await waitForTarget(action.selector, () => false)
          if (el && el.getAttribute('aria-selected') !== 'true') el.click()
          return
        }
        case 'nav': {
          /* Desktop sidebar is always on screen — drawer only matters under lg. */
          if (window.matchMedia('(min-width: 1024px)').matches) {
            if (!action.open) setNavOpen(false)
            return
          }
          setNavOpen(action.open)
          if (action.open) await sleep(280)
          return
        }
      }
    },
    [router, setCashierOpen, setNavOpen, setVipHubOpen, startNavigating],
  )

  /* Optional steps that never resolve are dropped so "1 of N" stays honest. */
  const [steps, setSteps] = useState<ProductTourStep[]>(tour.steps)
  const step = steps[index]

  /* Resolve the current step: run pre-actions, find target, scroll it into view. */
  useEffect(() => {
    if (!step) return
    let cancelled = false
    const isCancelled = () => cancelled
    setResolving(true)
    targetRef.current = null
    ;(async () => {
      for (const action of step.before ?? []) {
        if (cancelled) return
        await runAction(action)
      }
      if (step.center || !step.target) {
        if (cancelled) return
        targetRef.current = null
        setHole(null)
        setResolving(false)
        return
      }
      const el = await waitForTarget(
        step.target,
        isCancelled,
        step.optional ? OPTIONAL_TIMEOUT_MS : TARGET_TIMEOUT_MS,
      )
      if (cancelled) return
      if (!el && step.optional) {
        if (steps.length === 1) {
          endProductTour()
          return
        }
        setSteps(steps.filter((_, i) => i !== index))
        if (directionRef.current === -1 && index > 0) setIndex(index - 1)
        else if (index >= steps.length - 1) endProductTour()
        return
      }
      if (el) {
        el.scrollIntoView({
          block: 'center',
          inline: 'nearest',
          behavior: 'smooth',
        })
        await sleep(320)
      }
      if (cancelled) return
      targetRef.current = el
      setResolving(false)
    })()
    return () => {
      cancelled = true
    }
  }, [step, steps, index, runAction])

  /* Follow the target every frame — sheets, sticky chrome and scroll all move it. */
  useEffect(() => {
    if (resolving) return
    let raf = 0
    let last: Rect | null = null
    const tick = () => {
      const el = targetRef.current
      let next: Rect | null = null
      if (el && el.isConnected) {
        const r = el.getBoundingClientRect()
        next = {
          top: r.top - HOLE_PAD,
          left: r.left - HOLE_PAD,
          width: r.width + HOLE_PAD * 2,
          height: r.height + HOLE_PAD * 2,
        }
      }
      if (!sameRect(last, next)) {
        last = next
        setHole(next)
      }
      raf = window.requestAnimationFrame(tick)
    }
    tick()
    return () => window.cancelAnimationFrame(raf)
  }, [resolving, index])

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setCardH(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  })

  const isLast = index === steps.length - 1

  const goNext = useCallback(() => {
    directionRef.current = 1
    if (index >= steps.length - 1) {
      endProductTour()
      return
    }
    setIndex(index + 1)
  }, [index, steps.length])

  const goBack = useCallback(() => {
    if (index === 0) return
    directionRef.current = -1
    setIndex(index - 1)
  }, [index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') endProductTour()
      else if (e.key === 'ArrowRight' || e.key === 'Enter') goNext()
      else if (e.key === 'ArrowLeft') goBack()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goBack])

  const onBlockerClick = (e: ReactMouseEvent) => {
    if (!hole) return
    const inside =
      e.clientX >= hole.left &&
      e.clientX <= hole.left + hole.width &&
      e.clientY >= hole.top &&
      e.clientY <= hole.top + hole.height
    if (!inside) return
    if (isLast) {
      const el = targetRef.current
      endProductTour()
      el?.click()
      return
    }
    goNext()
  }

  /* Steps that resolve to nothing get a centred card — the answer still lands. */
  const showCard = Boolean(step && !resolving)
  const pos = showCard ? cardPosition(hole, cardH) : null
  const counted = steps.length > 1

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onBlockerClick}
      role="presentation"
    >
      {hole ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute rounded-[12px] ring-1 ring-white/30"
          style={{ boxShadow: '0 0 0 9999px var(--backdrop)' }}
          initial={false}
          animate={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
        ></motion.div>
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[var(--backdrop)]" />
      )}

      <AnimatePresence mode="wait">
        {showCard && pos && step ? (
          <motion.div
            key={`${tour.id}-${index}`}
            ref={cardRef}
            role="dialog"
            aria-label={step.title}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute flex flex-col gap-3 rounded-[10px] border border-border bg-popover p-4 text-popover-foreground shadow-[0_16px_48px_rgba(0,0,0,0.45)]"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <div className="flex items-start gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {counted ? (
                  <p className="text-xs leading-4 text-muted-foreground">
                    {index + 1} of {steps.length}
                  </p>
                ) : null}
                <p className="text-sm font-semibold leading-5 text-foreground">{step.title}</p>
                <p className="text-sm leading-5 text-muted-foreground">{step.body}</p>
              </div>
              <button
                type="button"
                aria-label="Close tour"
                onClick={endProductTour}
                className="-mr-1.5 -mt-1.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
              >
                <IconX className="size-4" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              {counted ? (
                <div className="flex items-center gap-1.5" aria-hidden>
                  {steps.map((s, i) => (
                    <span
                      key={`${s.target}-${i}-${s.title}`}
                      className={cn(
                        'size-1.5 rounded-full transition-colors duration-200',
                        i === index ? 'bg-primary' : 'bg-[var(--surface-muted-5)]',
                      )}
                    />
                  ))}
                </div>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                {index > 0 ? (
                  <Button variant="outline" onClick={goBack}>
                    Back
                  </Button>
                ) : null}
                <Button onClick={goNext}>{step.cta ?? (isLast ? 'Done' : 'Next')}</Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}
