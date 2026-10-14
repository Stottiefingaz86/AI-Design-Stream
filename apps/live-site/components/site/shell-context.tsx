'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname } from 'next/navigation'
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
  navOpen: boolean
  setNavOpen: (value: boolean) => void
  navigating: boolean
}

const ShellContext = createContext<ShellContextValue | null>(null)

export function useShell() {
  const value = useContext(ShellContext)
  if (!value) {
    throw new Error('useShell must be used inside ShellProvider')
  }
  return value
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
}: {
  children: ReactNode
  loggedIn?: boolean
}) {
  const pathname = usePathname()
  const product = productFromPath(pathname)
  const [expanded, setExpanded] = useState(readExpanded)
  const [loggedIn, setLoggedIn] = useState(loggedInProp)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [navigating, setNavigating] = useState(true)

  useEffect(() => {
    setNavigating(true)
    const timer = window.setTimeout(() => setNavigating(false), 360)
    return () => {
      window.clearTimeout(timer)
      setNavigating(false)
    }
  }, [pathname])

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
      navOpen,
      setNavOpen,
      navigating,
    }),
    [drawerOpen, expanded, loggedIn, navOpen, navigating, product, toggle]
  )

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}
