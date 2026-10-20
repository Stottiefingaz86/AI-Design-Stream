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
import { productFromPath, type ShellProduct } from './shell-nav'

const SIDEBAR_KEY = 'lumen-shell-sidebar-expanded'

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
  navOpen: boolean
  setNavOpen: (value: boolean) => void
  navigating: boolean
  startNavigating: () => void
  casinoSearchOpen: boolean
  setCasinoSearchOpen: (value: boolean) => void
  launchedGame: CasinoLobbyGame | null
  launchGame: (game: CasinoLobbyGame) => void
  closeGameLauncher: () => void
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
  const [navOpen, setNavOpen] = useState(false)
  const [casinoSearchOpen, setCasinoSearchOpen] = useState(false)
  const [launchedGame, setLaunchedGame] = useState<CasinoLobbyGame | null>(null)
  const [navigating, setNavigating] = useState(true)
  const timerRef = React.useRef<number | null>(null)

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

  const value = useMemo(
    () => ({
      expanded,
      toggle,
      loggedIn,
      setLoggedIn,
      product,
      drawerOpen,
      setDrawerOpen,
      cashierOpen,
      setCashierOpen,
      navOpen,
      setNavOpen,
      navigating: forceSkeleton || navigating,
      startNavigating,
      casinoSearchOpen,
      setCasinoSearchOpen,
      launchedGame,
      launchGame,
      closeGameLauncher,
    }),
    [
      cashierOpen,
      casinoSearchOpen,
      closeGameLauncher,
      drawerOpen,
      expanded,
      forceSkeleton,
      launchGame,
      launchedGame,
      loggedIn,
      navOpen,
      navigating,
      product,
      startNavigating,
      toggle,
    ]
  )

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}
