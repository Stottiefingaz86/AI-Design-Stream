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
  startNavigating: () => void
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
  const [navigating, setNavigating] = useState(true)
  const [balance, setBalance] = useState(10)
  const [displayBalance, setDisplayBalance] = useState(10)
  const [vipRewards, setVipRewards] = useState<VipReward[]>(() =>
    VIP_REWARDS_SEED.map((r) => ({ ...r })),
  )
  const [vipClaimToast, setVipClaimToast] = useState<VipClaimToastState | null>(null)
  const timerRef = React.useRef<number | null>(null)
  const claimTimersRef = React.useRef<Map<string, number>>(new Map())
  const balanceTimersRef = React.useRef<number[]>([])
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

  const startNavigating = useCallback(() => {
    setNavigating(true)
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setNavigating(false), 520)
  }, [])

  useEffect(() => {
    startNavigating()
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [pathname, startNavigating])

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
      startNavigating,
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
      cashierOpen,
      launchGame,
      launchedGame,
      loggedIn,
      navOpen,
      navigating,
      openCashier,
      openDrawer,
      openVipHub,
      product,
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
