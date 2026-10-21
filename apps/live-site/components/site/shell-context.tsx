'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
import type { CasinoLobbyGame } from '@/lib/lumen/casino-lobby-catalog'
import { flashVipClaimToast } from '@/components/lumen/vip-claim-toast'
import { celebrateVipClaim } from '@/lib/lumen/vip-celebrate'
import {
  claimableCount,
  VIP_REWARDS_SEED,
  type VipHubTab,
  type VipReward,
} from '@/lib/lumen/vip-hub'
import { productFromPath, type ShellProduct } from './shell-nav'

const SIDEBAR_KEY = 'lumen-shell-sidebar-expanded'
const CLAIM_PRELOAD_MS = 1400
/** From claim press → balance roll-up (confetti + toast fire first at CLAIM_PRELOAD_MS). */
const BALANCE_ROLL_MS = 3000
/** Minimum time destination skeleton stays visible after the route lands. */
const SKELETON_MIN_MS = 420
/** Deep-link overlay — long enough to read the motion, short enough to feel snappy. */
const DEEP_LINK_MIN_MS = 1400

export type VipClaimToastState = { id: number; amount: number }

type ShellContextValue = {
  expanded: boolean
  toggle: () => void
  loggedIn: boolean
  setLoggedIn: (value: boolean) => void
  product: ShellProduct
  drawerOpen: boolean
  setDrawerOpen: (value: boolean) => void
  cashierOpen: boolean
  setCashierOpen: (value: boolean) => void
  vipHubOpen: boolean
  /** Open/close VIP Hub; optional tab deep-link (defaults to VIP). */
  setVipHubOpen: (value: boolean, tab?: VipHubTab) => void
  vipHubTab: VipHubTab
  navOpen: boolean
  setNavOpen: (value: boolean) => void
  navigating: boolean
  /** Destination path for the in-flight soft nav (skeleton keyed off this). */
  pendingHref: string | null
  /**
   * Soft-nav within the same chrome (top menu / chips / sub-nav).
   * Destination skeleton only — never the full-page BetOnline loader.
   */
  startNavigating: (href?: string) => void
  /**
   * Cross-context redirect (UBC → account, poker → promotions?filter=poker, etc.).
   * Shows the full-page BetOnline loader until the destination lands.
   */
  startDeepLink: (href: string) => void
  /** Full-viewport BetOnline loader (boot + deep links). */
  fullPageLoader: boolean
  casinoSearchOpen: boolean
  setCasinoSearchOpen: (value: boolean) => void
  launchedGame: CasinoLobbyGame | null
  launchGame: (game: CasinoLobbyGame) => void
  closeGameLauncher: () => void
  /** Settled wallet balance */
  balance: number
  /** Animated balance shown in chrome (NumberFlow) */
  displayBalance: number
  vipRewards: VipReward[]
  vipClaimCount: number
  claimVipReward: (id: string, button?: HTMLButtonElement | null) => void
  vipClaimToast: VipClaimToastState | null
  dismissVipClaimToast: () => void
}

function pathOnly(href: string) {
  return href.split('?')[0]?.split('#')[0] || href
}

function normalizePath(p: string) {
  const trimmed = p.replace(/\/+$/, '')
  return trimmed.length === 0 ? '/' : trimmed
}

const ShellContext = createContext<ShellContextValue | null>(null)

export function useShell() {
  const value = useContext(ShellContext)
  if (!value) {
    throw new Error('useShell must be used inside ShellProvider')
  }
  return value
}

/** Storybook / isolated chrome — null when no ShellProvider. */
export function useShellOptional() {
  return useContext(ShellContext)
}

let cachedExpanded: boolean | null = null

function readExpanded() {
  if (cachedExpanded !== null) return cachedExpanded
  if (typeof window === 'undefined') return false
  try {
    const value = window.localStorage.getItem(SIDEBAR_KEY)
    cachedExpanded = value === '1'
    return cachedExpanded
  } catch {
    cachedExpanded = false
    return false
  }
}

function writeExpanded(expanded: boolean) {
  cachedExpanded = expanded
  try {
    window.localStorage.setItem(SIDEBAR_KEY, expanded ? '1' : '0')
  } catch {
    /* ignore quota / private mode */
  }
}

export function ShellProvider({
  children,
  loggedIn: loggedInProp = true,
  forceSkeleton = false,
}: {
  children: ReactNode
  loggedIn?: boolean
  /** Keep chrome on skeletons (Next `loading.tsx`) until the real page mounts. */
  forceSkeleton?: boolean
}) {
  const pathname = usePathname()
  const product = productFromPath(pathname)
  const [expanded, setExpanded] = useState(readExpanded)
  const [loggedIn, setLoggedIn] = useState(loggedInProp)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [cashierOpen, setCashierOpen] = useState(false)
  const [vipHubOpen, setVipHubOpen] = useState(false)
  const [vipHubTab, setVipHubTab] = useState<VipHubTab>('VIP')
  const [navOpen, setNavOpen] = useState(false)
  const [casinoSearchOpen, setCasinoSearchOpen] = useState(false)
  const [launchedGame, setLaunchedGame] = useState<CasinoLobbyGame | null>(null)
  const [navigating, setNavigating] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  /** Deep-link overlay only — boot is `SiteArrivalLoader` in the root layout. */
  const [fullPageLoader, setFullPageLoader] = useState(false)
  const [balance, setBalance] = useState(10)
  const [displayBalance, setDisplayBalance] = useState(10)
  const [vipRewards, setVipRewards] = useState<VipReward[]>(() =>
    VIP_REWARDS_SEED.map((r) => ({ ...r })),
  )
  const [vipClaimToast, setVipClaimToast] = useState<VipClaimToastState | null>(null)
  const timerRef = React.useRef<number | null>(null)
  const claimTimersRef = React.useRef<Map<string, number>>(new Map())
  const balanceTimersRef = React.useRef<number[]>([])
  const deepLinkRef = React.useRef(false)
  const overlayStartedRef = React.useRef(performance.now())
  const vipRewardsRef = React.useRef(vipRewards)
  vipRewardsRef.current = vipRewards
  const vipClaimCount = claimableCount(vipRewards)

  const dismissVipClaimToast = useCallback(() => {
    setVipClaimToast(null)
  }, [])

  useEffect(() => {
    setCasinoSearchOpen(false)
    setLaunchedGame(null)
    // Shared casino layout keeps #shell-scroll mounted — reset so Lobby ↔ Live always starts at top.
    const scroller = document.getElementById('shell-scroll')
    if (scroller) scroller.scrollTop = 0
    else window.scrollTo(0, 0)
  }, [pathname])

  const launchGame = useCallback((game: CasinoLobbyGame) => {
    setCasinoSearchOpen(false)
    setLaunchedGame(game)
  }, [])

  const closeGameLauncher = useCallback(() => {
    setLaunchedGame(null)
  }, [])

  const startNavigating = useCallback((href?: string) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    deepLinkRef.current = false
    const next = href ? pathOnly(href) : null
    if (next && next === pathname) return
    if (next) setPendingHref(next)
    /* Casino non-lobby: track pending (hide SEO) but skip skeleton — lazy-load content. */
    const normalized = next ? normalizePath(next) : null
    const skipSkeleton =
      normalized != null && normalized.startsWith('/casino') && normalized !== '/casino'
    if (!skipSkeleton) setNavigating(true)
  }, [pathname])

  const startDeepLink = useCallback((href: string) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    const next = pathOnly(href)
    if (next === pathname && !href.includes('?')) return
    deepLinkRef.current = true
    overlayStartedRef.current = performance.now()
    setFullPageLoader(true)
    setNavigating(false)
    setPendingHref(next)
  }, [pathname])

  /* Clear pending / skeleton / deep-link overlay once the destination route has landed. */
  useEffect(() => {
    if (!navigating && !pendingHref && !deepLinkRef.current) return
    const pending = pendingHref
    /* Exact match only — never treat /account/payments as “landed” for /account. */
    const landed = !pending || normalizePath(pathname) === normalizePath(pending)
    if (!landed) return
    if (timerRef.current) window.clearTimeout(timerRef.current)

    const isDeep = deepLinkRef.current
    const elapsed = performance.now() - overlayStartedRef.current
    const holdMs = isDeep
      ? Math.max(0, DEEP_LINK_MIN_MS - elapsed)
      : navigating
        ? SKELETON_MIN_MS
        : 0

    timerRef.current = window.setTimeout(() => {
      setNavigating(false)
      setPendingHref(null)
      if (isDeep) {
        deepLinkRef.current = false
        setFullPageLoader(false)
      }
      timerRef.current = null
    }, holdMs)
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [pathname, navigating, pendingHref])

  const toggle = useCallback(() => {
    setExpanded((open) => {
      const next = !open
      writeExpanded(next)
      return next
    })
  }, [])

  const openVipHub = useCallback((value: boolean, tab: VipHubTab = 'VIP') => {
    if (value) {
      setDrawerOpen(false)
      setCashierOpen(false)
      setVipHubTab(tab)
      /* Fresh Figma seed each open so Claim CTAs stay testable (unsticks landing too). */
      setVipRewards(VIP_REWARDS_SEED.map((r) => ({ ...r })))
    }
    setVipHubOpen(value)
  }, [])

  const openCashier = useCallback((value: boolean) => {
    if (value) {
      setDrawerOpen(false)
      setVipHubOpen(false)
    }
    setCashierOpen(value)
  }, [])

  const openDrawer = useCallback((value: boolean) => {
    if (value) {
      setCashierOpen(false)
      setVipHubOpen(false)
    }
    setDrawerOpen(value)
  }, [])

  const claimVipReward = useCallback((id: string, button?: HTMLButtonElement | null) => {
    const reward = vipRewardsRef.current.find((r) => r.id === id)
    if (!reward || reward.state !== 'enable') return

    const amount = reward.amount
    const kind = reward.kind

    setVipRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, state: 'landing' as const } : r)),
    )

    const existing = claimTimersRef.current.get(id)
    if (existing) window.clearTimeout(existing)

    /* Balance rolls after BALANCE_ROLL_MS from press — after confetti + toast. */
    const balanceTimer = window.setTimeout(() => {
      balanceTimersRef.current = balanceTimersRef.current.filter((t) => t !== balanceTimer)
      setBalance((b) => {
        const next = b + amount
        setDisplayBalance(next)
        return next
      })
    }, BALANCE_ROLL_MS)
    balanceTimersRef.current.push(balanceTimer)

    const timer = window.setTimeout(() => {
      claimTimersRef.current.delete(id)
      setVipRewards((latest) =>
        latest.map((r) => {
          if (r.id !== id) return r
          if (kind === 'reloads' || kind === 'post-reload') {
            return {
              ...r,
              state: 'disabled' as const,
              metaLabel: kind === 'reloads' ? '10 days' : '15 days',
              subtitle: kind === 'reloads' ? '3 of 3 claimed' : '3 of 5 claimed',
            }
          }
          return { ...r, state: 'claimed' as const }
        }),
      )
      /* Confetti + toast first; balance waits until BALANCE_ROLL_MS */
      flashVipClaimToast(amount)
      setVipClaimToast({ id: Date.now(), amount })
      try {
        celebrateVipClaim(button ?? null)
      } catch {
        /* confetti/sound must never affect claim or toast */
      }
    }, CLAIM_PRELOAD_MS)
    claimTimersRef.current.set(id, timer)
  }, [])

  useEffect(() => {
    return () => {
      claimTimersRef.current.forEach((timer) => window.clearTimeout(timer))
      claimTimersRef.current.clear()
      balanceTimersRef.current.forEach((timer) => window.clearTimeout(timer))
      balanceTimersRef.current = []
    }
  }, [])

  const value = useMemo(
    () => ({
      expanded,
      toggle,
      loggedIn,
      setLoggedIn,
      product,
      drawerOpen,
      setDrawerOpen: openDrawer,
      cashierOpen,
      setCashierOpen: openCashier,
      vipHubOpen,
      setVipHubOpen: openVipHub,
      vipHubTab,
      navOpen,
      setNavOpen,
      navigating: forceSkeleton || navigating,
      pendingHref,
      startNavigating,
      startDeepLink,
      fullPageLoader,
      casinoSearchOpen,
      setCasinoSearchOpen,
      launchedGame,
      launchGame,
      closeGameLauncher,
      balance,
      displayBalance,
      vipRewards,
      vipClaimCount,
      claimVipReward,
      vipClaimToast,
      dismissVipClaimToast,
    }),
    [
      balance,
      casinoSearchOpen,
      claimVipReward,
      closeGameLauncher,
      dismissVipClaimToast,
      displayBalance,
      drawerOpen,
      expanded,
      forceSkeleton,
      fullPageLoader,
      cashierOpen,
      launchGame,
      launchedGame,
      loggedIn,
      navOpen,
      navigating,
      openCashier,
      openDrawer,
      openVipHub,
      pendingHref,
      product,
      startDeepLink,
      startNavigating,
      toggle,
      vipClaimCount,
      vipClaimToast,
      vipHubOpen,
      vipHubTab,
      vipRewards,
    ],
  )

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}
