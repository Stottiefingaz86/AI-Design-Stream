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
import { usePathname, useRouter } from 'next/navigation'
import type { CasinoLobbyGame } from '@/lib/lumen/casino-lobby-catalog'
import { flashVipClaimToast } from '@/components/lumen/vip-claim-toast'
import { toast } from '@/components/ui/sonner'
import {
  celebrateVipClaim,
  fireJoinWelcomeConfetti,
  flyRakebackCoinsToVip,
  originFromTileEl,
  playMessengerPopSound,
  playVipClaimSound,
  resolveRakebackOrigin,
  type RakebackOrigin,
} from '@/lib/lumen/vip-celebrate'
import {
  DAILY_SPIN_ID,
  type DailySpinSegment,
} from '@/lib/lumen/daily-spin'
import {
  claimableCount,
  RAF_SHARE_COMMISSION,
  SILVER_LEVEL_UP_REWARD,
  VIP_REWARDS_SEED,
  VIP_SILVER_UNLOCK_IDS,
  WELCOME_FREE_SPINS,
  type VipHubTab,
  type VipReward,
  type VipTierId,
} from '@/lib/lumen/vip-hub'
import {
  notificationFromToast,
  seedNotifications,
  type InboxNotification,
} from '@/lib/lumen/notifications'
import { productFromPath, type ShellProduct } from './shell-nav'
import {
  accountLevel,
  hasFullName,
  isJoinJourneyLabEnabled,
  readJoinJourney,
  writeJoinJourney,
  type AccountLevel,
  type JoinJourneyId,
} from '@/lib/lumen/join-journeys'

const SIDEBAR_KEY = 'lumen-shell-sidebar-expanded'
/** Survives layout remount when leaving `/designagent` back to the demo site. */
const SESSION_LOGGED_IN_KEY = 'lumen-shell-demo-logged-in'
const PROFILE_KEY = 'lumen-shell-demo-profile'
const NICKNAME_KEY = 'lumen-shell-demo-nickname'
const LAST_PLAYED_KEY = 'lumen-shell-last-played'
const FAVORITES_KEY = 'lumen-shell-favorites'
const CLAIM_PRELOAD_MS = 1400
/** After confetti + redeem sound — toast (messenger pop) waits so they don’t clash. */
const CLAIM_TOAST_AFTER_CELEBRATE_MS = 1100
/** From claim press → balance roll-up (confetti first, then toast, then roll). */
const BALANCE_ROLL_MS = 3000
const DEPOSIT_DEMO_AMOUNT = 50
const DEPOSIT_REQUIRED_CONFIRMATIONS = 2
/** Demo BTC poll timeline after copy address. */
const DEPOSIT_WAIT_MS = 2000
const DEPOSIT_DETECT_MS = 3500
const DEPOSIT_CONF1_MS = 5500
const DEPOSIT_CONF2_MS = 8000
/** Demo stake deducted when closing a casino game launcher (cash play). */
const SESSION_GAME_STAKE = 10
/** Free-spins session burns this many spins on close (row stays until 0). */
const FREE_SPINS_PER_SESSION = 10
/** Demo rakeback earned when closing a casino game launcher. */
const SESSION_RAKEBACK_AMOUNT = 1.72
/** VIP Bronze→Silver bump — 5 open/close sessions reach 100%. */
const SESSION_VIP_PROGRESS_BUMP = 20
/** After close — toast when wallet is under this (demo). */
const LOW_BALANCE_THRESHOLD = 10
/** Free spins granted when they deposit from the low-balance toast. */
export const LOW_BALANCE_FREE_SPINS = 50
/** First churn rescue after this many consecutive losses. */
const LOSS_STREAK_FOR_CHURN = 3
/** Next churn rescue only after this many total session losses (not every streak). */
const LOSS_TOTAL_FOR_SECOND_CHURN = 20
/** Beat after launcher closes before balance rolls down (NumberFlow). */
const SESSION_STAKE_ROLL_MS = 280
/** Beat after launcher closes before low-balance / churn UI. */
const POST_SESSION_UI_DELAY_MS = 900
/** Let the bar land on 100% before crown swap + modal. */
const LEVEL_UP_PROMOTE_DELAY_MS = 520
/** Post-join wallet close → welcome inbox delay. */
const POST_JOIN_INTERCOM_DELAY_MS = 2500
/** Brief beat after launcher unmounts so VIP chrome is painted before coins fly. */
const RAKEBACK_FLY_DELAY_MS = 80
/** Brief beat after land so SEO doesn’t flash under empty paint — keep snappy. */
const SKELETON_MIN_MS = 80
/** Casino soft-nav — clear as soon as the destination path lands. */
const CASINO_SOFT_HOLD_MS = 0
/** Deep-link overlay — long enough to read the motion, short enough to feel snappy. */
const DEEP_LINK_MIN_MS = 1400

export type DepositTrackStage = 'waiting' | 'detected' | 'confirming' | 'confirmed'
export type DepositChannel = 'crypto' | 'card'

export type DepositTracker = {
  stage: DepositTrackStage
  confirmations: number
  required: number
  amountUsd: number
  /** Crypto coin name or card label (e.g. Mastercard **** 0740). */
  coinLabel: string
  channel: DepositChannel
  startedAt: number
}

export type StartDepositTrackingOptions = {
  label?: string
  amountUsd?: number
  channel?: DepositChannel
}

export type VipClaimToastState = {
  id: number
  amount: number
  kind?: 'vip-claim' | 'deposit' | 'deposit-polling' | 'rakeback' | 'low-balance'
  confirmations?: number
  required?: number
  /** Welcome / top-up free spins granted with this deposit (or offered). */
  freeSpins?: number
}

export type AuthModalView = 'login' | 'join' | 'verify' | 'welcome'

/** Card / bank billing KYC — collected in cashier before first credit-card deposit. */
export type BillingKyc = {
  firstName: string
  lastName: string
  addressLine1: string
  city: string
  state: string
  postalCode: string
  mobile: string
}

/** Lightweight player profile — join is lean; DOB/billing collected later (VIP / KYC). */
export type PlayerProfile = {
  email: string
  /** Public handle — Nickname from Verify / Username on journey 4. Used on leaderboards. */
  fullName: string
  /** Unique account ID shown in UBC / My Account (e.g. B954663). Never show email there. */
  accountId: string
  /** Mobile — journey-3 Level 1. */
  phone: string | null
  /** ISO date `YYYY-MM-DD` — collected in VIP Birthday reward, reused for KYC. */
  dateOfBirth: string | null
  /** Legacy single-line address — mirrored from billing when saved. */
  address: string | null
  /** Required before credit-card deposit. */
  billing: BillingKyc | null
  /** Journey-3 Level 4 demo flag. */
  kycVerified: boolean
}

const EMPTY_PROFILE: PlayerProfile = {
  email: '',
  fullName: '',
  accountId: '',
  phone: null,
  dateOfBirth: null,
  address: null,
  billing: null,
  kycVerified: false,
}


/** Demo account IDs — `B` + 6 digits (e.g. B954663). Stable from seed when provided. */
export function generateAccountId(seed?: string): string {
  let n: number
  if (seed && seed.trim()) {
    let h = 2166136261
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    n = 100000 + (h >>> 0) % 900000
  } else {
    n = 100000 + Math.floor(Math.random() * 900000)
  }
  return `B${n}`
}

export function hasCompleteBillingKyc(billing: BillingKyc | null | undefined): boolean {
  if (!billing) return false
  return (
    billing.firstName.trim().length > 0 &&
    billing.lastName.trim().length > 0 &&
    billing.addressLine1.trim().length > 0 &&
    billing.city.trim().length > 0 &&
    billing.state.trim().length > 0 &&
    billing.postalCode.trim().length > 0 &&
    billing.mobile.trim().length >= 7
  )
}

export type ProfileGateReason =
  | 'sports-name'
  | 'sports-level'
  | 'vip-claim'
  | 'card-cashier'

export type ProfileGateRequest = {
  reason: ProfileGateReason
}

type ShellContextValue = {
  expanded: boolean
  toggle: () => void
  loggedIn: boolean
  setLoggedIn: (value: boolean) => void
  /** Last launched game while logged in — null when logged out or never played. */
  lastPlayedGame: CasinoLobbyGame | null
  /** Saved favourite game ids (logged-in only). */
  favoriteGameIds: string[]
  isFavorite: (gameId: string) => boolean
  toggleFavorite: (game: CasinoLobbyGame) => void
  favoriteGames: CasinoLobbyGame[]
  /** Join / login modal */
  authOpen: boolean
  authView: AuthModalView
  openAuth: (view?: AuthModalView) => void
  closeAuth: () => void
  setAuthView: (view: AuthModalView) => void
  completeLogin: (input?: { email?: string; username?: string }) => void
  /** Welcome → Let's Go → logged in → open cashier for first deposit. */
  completeJoin: (input: { email: string; fullName?: string }) => void
  profile: PlayerProfile
  setDateOfBirth: (isoDate: string) => void
  /** Patch profile fields (journey lab / My Account progress). */
  updateProfile: (patch: Partial<PlayerProfile>) => void
  /** Card deposit KYC — first/last, address, state, zip, mobile. */
  saveBillingKyc: (billing: BillingKyc) => void
  /**
   * Local-only join proposals (1 default / 2 sports name gate / 3 account levels).
   * Always `1` when lab is off (hosted).
   */
  joinJourney: JoinJourneyId
  setJoinJourney: (id: JoinJourneyId) => void
  joinJourneyLab: boolean
  /** Derived account level for journey 3 (0–4). */
  accountLevel: AccountLevel
  /** Journey 2/3 — sports need a real Full Name (and L2+ on journey 3). */
  canPlaceSportsBets: boolean
  /** Journey 3 — card / fiat withdraw need L3+. */
  canUseCardCashier: boolean
  /** Journey 3 — VIP cash claims need L2 (name + DOB) at minimum. */
  canClaimVipRewards: boolean
  /**
   * Open the profile-gate modal (sports name / level unlock).
   * `reason` drives copy.
   */
  profileGate: ProfileGateRequest | null
  openProfileGate: (reason: ProfileGateReason) => void
  closeProfileGate: () => void
  /** RAF copy / email / social share — unlocks Refer a Friend commission. */
  earnReferShare: () => void
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
  /** Optional originEl = tile/card clicked — coins fly from there on close. */
  launchGame: (
    game: CasinoLobbyGame,
    originEl?: HTMLElement | null,
    opts?: { freeSpins?: boolean },
  ) => void
  closeGameLauncher: () => void
  /** Settled wallet balance */
  balance: number
  /** Animated balance shown in chrome (NumberFlow) */
  displayBalance: number
  /**
   * Debit the wallet (sports place, etc.). Returns false when underfunded —
   * caller should open cashier instead.
   */
  spendBalance: (amount: number) => boolean
  vipRewards: VipReward[]
  vipClaimCount: number
  claimVipReward: (id: string, button?: HTMLButtonElement | null) => void
  /** Daily Spin wheel modal (VIP Hub). */
  dailySpinOpen: boolean
  openDailySpin: () => void
  closeDailySpin: () => void
  /** Settle wheel result — cash / free spins / miss. */
  resolveDailySpin: (
    segment: DailySpinSegment,
    button?: HTMLButtonElement | null,
  ) => void
  /**
   * Same celebrate → toast → balance roll as VIP hub cash claims.
   * Used by Missions (and any one-shot cash claim outside the VIP list).
   */
  claimMissionReward: (amount: number, button?: HTMLButtonElement | null) => void
  vipClaimToast: VipClaimToastState | null
  dismissVipClaimToast: () => void
  /** Low-balance toast → Deposit — arms free-spins top-up on next credit. */
  openDepositFromLowBalance: () => void
  /** After 3 losses — recommended games rescue. */
  churnRescueOpen: boolean
  dismissChurnRescue: () => void
  /** Bumps to re-trigger the header VIP crown shake after rakeback lands. */
  vipIconPulse: number
  /** Shared VIP tier progress (0–100) — hub, banners, hero. */
  vipProgressPercent: number
  /** Short label under progress bars (e.g. “Just now”). */
  vipProgressUpdatedLabel: string
  /** Current VIP tier (Bronze → Silver after 5 game sessions). */
  vipTier: VipTierId
  /** Bumps when a tier-up ceremony should play on every progress widget. */
  vipLevelUpSeq: number
  vipLevelUpModalOpen: boolean
  dismissVipLevelUpModal: () => void
  /** After join — floating welcome offer in cashier until dismissed or deposit lands. */
  welcomeOfferOpen: boolean
  dismissWelcomeOffer: () => void
  /** Intercom messenger panel. */
  intercomOpen: boolean
  setIntercomOpen: (open: boolean) => void
  /** True while streaming the post-join welcome pitch in Intercom. */
  intercomWelcomePending: boolean
  /** True while Laura’s Silver level-up congrats is in Intercom. */
  intercomLevelUpPending: boolean
  /** True while Laura’s Instant VIP Match / status-match pitch is in Intercom. */
  intercomVipMatchPending: boolean
  /** Open Intercom with the VIP status-match conversation (Match Status Now). */
  openVipStatusMatch: () => void
  /** Live deposit poll — crypto or card (survives closing the wallet). */
  depositTracker: DepositTracker | null
  /** Demo: crypto copy / card Deposit → poll → credit + welcome free spins. */
  startDepositTracking: (coinLabelOrOpts?: string | StartDepositTrackingOptions) => void
  clearDepositTracker: () => void
  /** Sports betslip — count for mobile dock badge; open requested from dock tap. */
  sportsBetCount: number
  setSportsBetCount: (count: number) => void
  sportsBetslipOpenTick: number
  openSportsBetslip: () => void
  /** True while the soccer betslip drawer is open — hides mobile dock. */
  sportsBetslipOpen: boolean
  setSportsBetslipOpen: (open: boolean) => void
  /** Toast history inbox (UBC Notifications). */
  notifications: InboxNotification[]
  unreadNotificationCount: number
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  dismissNotification: (id: string) => void
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

function readSessionLoggedIn(): boolean | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(SESSION_LOGGED_IN_KEY)
    if (value === '1') return true
    if (value === '0') return false
    return null
  } catch {
    return null
  }
}

function writeSessionLoggedIn(value: boolean) {
  try {
    window.localStorage.setItem(SESSION_LOGGED_IN_KEY, value ? '1' : '0')
  } catch {
    /* ignore quota / private mode */
  }
}

function readStoredProfile(): PlayerProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>
    if (!parsed || typeof parsed !== 'object') return null
    return {
      ...EMPTY_PROFILE,
      email: typeof parsed.email === 'string' ? parsed.email : '',
      fullName: typeof parsed.fullName === 'string' ? parsed.fullName : '',
      accountId: typeof parsed.accountId === 'string' ? parsed.accountId : '',
      phone: parsed.phone ?? null,
      dateOfBirth: parsed.dateOfBirth ?? null,
      address: parsed.address ?? null,
      billing: parsed.billing ?? null,
      kycVerified: Boolean(parsed.kycVerified),
    }
  } catch {
    return null
  }
}

function writeStoredProfile(profile: PlayerProfile | null) {
  try {
    if (!profile) {
      window.localStorage.removeItem(PROFILE_KEY)
      return
    }
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    if (sanitizeNickname(profile.fullName)) writeStoredNickname(profile.fullName)
  } catch {
    /* ignore */
  }
}

function looksLikeAccountId(value: string) {
  return /^B\d{5,}$/i.test(value.trim())
}

function sanitizeNickname(value: string) {
  const n = value.trim()
  if (!n || looksLikeAccountId(n)) return ''
  return n
}

function readStoredNickname(): string {
  if (typeof window === 'undefined') return ''
  try {
    return sanitizeNickname(window.localStorage.getItem(NICKNAME_KEY) || '')
  } catch {
    return ''
  }
}

function writeStoredNickname(nickname: string) {
  try {
    const n = sanitizeNickname(nickname)
    if (!n) return
    window.localStorage.setItem(NICKNAME_KEY, n)
  } catch {
    /* ignore */
  }
}



function readStoredGame(key: string): CasinoLobbyGame | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CasinoLobbyGame
    if (!parsed?.id || !parsed?.imageSrc || !parsed?.title) return null
    return parsed
  } catch {
    return null
  }
}

function writeStoredGame(key: string, game: CasinoLobbyGame | null) {
  try {
    if (!game) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, JSON.stringify(game))
  } catch {
    /* ignore */
  }
}

function readStoredFavorites(): CasinoLobbyGame[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CasinoLobbyGame[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((g) => g?.id && g?.imageSrc && g?.title)
  } catch {
    return []
  }
}

function writeStoredFavorites(games: CasinoLobbyGame[]) {
  try {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(games))
  } catch {
    /* ignore */
  }
}

export function ShellProvider({
  children,
  loggedIn: loggedInProp = false,
  forceSkeleton = false,
}: {
  children: ReactNode
  loggedIn?: boolean
  /** Keep chrome on skeletons (Next `loading.tsx`) until the real page mounts. */
  forceSkeleton?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const pathnameRef = React.useRef(pathname)
  pathnameRef.current = pathname
  const [expanded, setExpanded] = useState(readExpanded)
  const [loggedIn, setLoggedInState] = useState(loggedInProp)
  const [lastPlayedStored, setLastPlayedStored] = useState<CasinoLobbyGame | null>(null)
  const [favoriteGamesStored, setFavoriteGamesStored] = useState<CasinoLobbyGame[]>([])
  const setLoggedIn = useCallback((value: boolean) => {
    setLoggedInState(value)
    writeSessionLoggedIn(value)
    if (!value) {
      /* UI clears; storage kept so login restores last game / hearts. */
      return
    }
    setLastPlayedStored(readStoredGame(LAST_PLAYED_KEY))
    setFavoriteGamesStored(readStoredFavorites())
  }, [])
  /* Backoffice uses a separate root layout — remounting ShellProvider wiped in-memory
   * login and dumped people on the logged-out marketing homepage. Restore from storage. */
  useEffect(() => {
    if (loggedInProp) {
      writeSessionLoggedIn(true)
      setLastPlayedStored(readStoredGame(LAST_PLAYED_KEY))
      setFavoriteGamesStored(readStoredFavorites())
      const stored = readStoredProfile()
      if (stored) setProfile(stored)
      return
    }
    if (readSessionLoggedIn() === true) {
      setLoggedInState(true)
      setLastPlayedStored(readStoredGame(LAST_PLAYED_KEY))
      setFavoriteGamesStored(readStoredFavorites())
      const stored = readStoredProfile()
      if (stored) setProfile(stored)
    }
  }, [loggedInProp])

  const lastPlayedGame = loggedIn ? lastPlayedStored : null
  const favoriteGames = loggedIn ? favoriteGamesStored : []
  const favoriteGameIds = useMemo(
    () => favoriteGames.map((g) => g.id),
    [favoriteGames],
  )
  const [authOpen, setAuthOpen] = useState(false)
  const [authView, setAuthView] = useState<AuthModalView>('join')
  const [profile, setProfile] = useState<PlayerProfile>(EMPTY_PROFILE)
  const [joinJourneyLab, setJoinJourneyLab] = useState(false)
  const [joinJourney, setJoinJourneyState] = useState<JoinJourneyId>(1)
  const [profileGate, setProfileGate] = useState<ProfileGateRequest | null>(null)

  useEffect(() => {
    const enabled = isJoinJourneyLabEnabled()
    setJoinJourneyLab(enabled)
    if (enabled) setJoinJourneyState(readJoinJourney())
  }, [])

  const setJoinJourney = useCallback((id: JoinJourneyId) => {
    if (!isJoinJourneyLabEnabled()) return
    setJoinJourneyState(id)
    writeJoinJourney(id)
  }, [])

  const openProfileGate = useCallback((reason: ProfileGateReason) => {
    setProfileGate({ reason })
  }, [])

  const closeProfileGate = useCallback(() => {
    setProfileGate(null)
  }, [])

  const updateProfile = useCallback((patch: Partial<PlayerProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }))
  }, [])

  /* Sessions from before Account ID — mint once when logged in. */
  useEffect(() => {
    if (!loggedIn) return
    setProfile((prev) => {
      if (prev.accountId.trim()) return prev
      return {
        ...prev,
        accountId: generateAccountId(prev.email || prev.fullName || 'player'),
      }
    })
  }, [loggedIn])

  /* Keep nickname + account ID across refresh / soft-nav remounts.
   * Nickname also mirrored to NICKNAME_KEY so a wiped profile still recovers. */
  useEffect(() => {
    if (!loggedIn) return
    const stored = readStoredProfile()
    const rawNick = stored?.fullName.trim() || profile.fullName.trim()
    const backupNick =
      sanitizeNickname(rawNick) || readStoredNickname()
    if ((!profile.fullName.trim() || looksLikeAccountId(profile.fullName)) && backupNick) {
      setProfile((prev) => {
        const next = {
          ...prev,
          fullName: backupNick,
          email: prev.email.trim() || stored?.email || prev.email,
          accountId:
            prev.accountId.trim() || stored?.accountId || prev.accountId,
        }
        writeStoredProfile(next)
        writeStoredNickname(backupNick)
        return next
      })
      return
    }
    /* One-time recovery after wipe — Chris’s signup nickname when nothing else is stored. */
    if ((!profile.fullName.trim() || looksLikeAccountId(profile.fullName)) && !backupNick) {
      const recovered = 'stottiefingaz'
      setProfile((prev) => {
        const next = { ...prev, fullName: recovered }
        writeStoredProfile(next)
        writeStoredNickname(recovered)
        return next
      })
      return
    }
    if (!profile.fullName.trim() && !profile.accountId.trim() && !profile.email.trim()) return
    writeStoredProfile(profile)
    if (sanitizeNickname(profile.fullName)) writeStoredNickname(profile.fullName)
  }, [loggedIn, profile])


  const level = accountLevel(profile)
  const canPlaceSportsBets =
    joinJourney === 1 ||
    joinJourney === 4 ||
    joinJourney === 5 ||
    (joinJourney === 2 && hasFullName(profile.fullName)) ||
    (joinJourney === 3 && level >= 2)
  const canUseCardCashier = joinJourney !== 3 || level >= 3
  const canClaimVipRewards =
    joinJourney !== 3 || (level >= 2 && hasFullName(profile.fullName))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [cashierOpen, setCashierOpen] = useState(false)
  const [welcomeOfferOpen, setWelcomeOfferOpen] = useState(false)
  const [intercomOpen, setIntercomOpenState] = useState(false)
  const [intercomWelcomePending, setIntercomWelcomePending] = useState(false)
  const [intercomLevelUpPending, setIntercomLevelUpPending] = useState(false)
  const [intercomVipMatchPending, setIntercomVipMatchPending] = useState(false)
  /**
   * Armed after Join → Let's Go opens the wallet. Next wallet close (any path)
   * schedules Laura's welcome toast — state not ref so no close-path can miss it.
   */
  const [postJoinWelcomeArmed, setPostJoinWelcomeArmed] = useState(false)
  const postJoinWelcomeArmedRef = React.useRef(false)
  const intercomOpenTimerRef = React.useRef<number | null>(null)
  const cashierWasOpenRef = React.useRef(false)
  const welcomeToastScheduledRef = React.useRef(false)

  const schedulePostJoinWelcomeToast = React.useCallback(() => {
    if (welcomeToastScheduledRef.current) return
    if (depositCreditedRef.current) return
    /* Poll in flight — balance toast owns the moment; don’t pitch Deposit now. */
    const live = depositTrackerRef.current
    if (live && live.stage !== 'confirmed') return
    if (!postJoinWelcomeArmedRef.current) return

    postJoinWelcomeArmedRef.current = false
    setPostJoinWelcomeArmed(false)
    welcomeToastScheduledRef.current = true
    setIntercomWelcomePending(true)

    if (intercomOpenTimerRef.current) {
      window.clearTimeout(intercomOpenTimerRef.current)
    }
    intercomOpenTimerRef.current = window.setTimeout(() => {
      intercomOpenTimerRef.current = null
      welcomeToastScheduledRef.current = false
      try {
        playMessengerPopSound()
      } catch {
        /* cosmetic */
      }
      setIntercomOpenState(true)
    }, POST_JOIN_INTERCOM_DELAY_MS)
  }, [])
  const [depositTracker, setDepositTracker] = useState<DepositTracker | null>(null)
  const depositTimersRef = React.useRef<number[]>([])
  const depositCreditedRef = React.useRef(false)
  const depositAmountRef = React.useRef(DEPOSIT_DEMO_AMOUNT)
  const depositTrackerRef = React.useRef<DepositTracker | null>(null)
  depositTrackerRef.current = depositTracker
  const cashierOpenRef = React.useRef(false)
  cashierOpenRef.current = cashierOpen
  const [vipHubOpen, setVipHubOpen] = useState(false)
  const [vipHubTab, setVipHubTab] = useState<VipHubTab>('VIP')
  const [dailySpinOpen, setDailySpinOpen] = useState(false)
  /** Join → show Daily Spin first; open cashier when the spin dialog closes. */
  const cashierAfterDailySpinRef = React.useRef(false)
  const [navOpen, setNavOpen] = useState(false)
  const [casinoSearchOpen, setCasinoSearchOpen] = useState(false)
  const [launchedGame, setLaunchedGame] = useState<CasinoLobbyGame | null>(null)
  const [navigating, setNavigating] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  /* Soft-nav destination drives product chrome (sidebar) before the route lands. */
  const product = productFromPath(pendingHref ?? pathname)
  /** Deep-link overlay only — boot is `SiteArrivalLoader` in the root layout. */
  const [fullPageLoader, setFullPageLoader] = useState(false)
  /* Start at $0 — journeys (e.g. deposit arrived → toast under balance → roll-up) build from empty. */
  const [balance, setBalance] = useState(0)
  const [displayBalance, setDisplayBalance] = useState(0)
  const [vipRewards, setVipRewards] = useState<VipReward[]>(() =>
    VIP_REWARDS_SEED.map((r) => ({ ...r })),
  )
  const [vipClaimToast, setVipClaimToast] = useState<VipClaimToastState | null>(null)
  const [notifications, setNotifications] = useState<InboxNotification[]>(() =>
    seedNotifications(),
  )
  const [notificationsOpen, setNotificationsOpenState] = useState(false)
  const lastInboxToastIdRef = React.useRef<number | null>(null)
  const [churnRescueOpen, setChurnRescueOpen] = useState(false)
  const [vipIconPulse, setVipIconPulse] = useState(0)
  const [vipProgressPercent, setVipProgressPercent] = useState(0)
  const [vipProgressUpdatedLabel, setVipProgressUpdatedLabel] = useState('Not started yet')
  const [vipTier, setVipTier] = useState<VipTierId>('bronze')
  const [vipLevelUpSeq, setVipLevelUpSeq] = useState(0)
  const [vipLevelUpModalOpen, setVipLevelUpModalOpen] = useState(false)
  const vipProgressPercentRef = React.useRef(0)
  vipProgressPercentRef.current = vipProgressPercent
  const vipTierRef = React.useRef<VipTierId>('bronze')
  vipTierRef.current = vipTier
  const balanceRef = React.useRef(0)
  balanceRef.current = balance
  const levelUpPendingRef = React.useRef(false)
  const levelUpTimerRef = React.useRef<number | null>(null)
  /** Level-up bonus is removed after claim — don’t re-grant on hub reopen. */
  const silverLevelUpClaimedRef = React.useRef(false)
  /** Deposit from low-balance toast → top-up free spins on credit. */
  const lowBalanceOfferArmedRef = React.useRef(false)
  /** Stable id for the in-flight deposit poll toast (one sound for the whole poll). */
  const depositPollToastIdRef = React.useRef<number | null>(null)
  const lossStreakRef = React.useRef(0)
  /** Lifetime closes this login — second churn waits until 20. */
  const totalLossesRef = React.useRef(0)
  const churnShownOnceRef = React.useRef(false)
  const churnShownAt20Ref = React.useRef(false)
  const postSessionUiTimerRef = React.useRef<number | null>(null)
  /** True when the open launcher was started from VIP Free Spins (no cash stake). */
  const freeSpinsSessionRef = React.useRef(false)
  /** After free-spins close off `/casino`, soft-nav to lobby once. */
  const exitToCasinoOnCloseRef = React.useRef(false)
  const [sportsBetCount, setSportsBetCount] = useState(0)
  const [sportsBetslipOpenTick, setSportsBetslipOpenTick] = useState(0)
  const [sportsBetslipOpen, setSportsBetslipOpen] = useState(false)
  const openSportsBetslip = useCallback(() => {
    setSportsBetslipOpenTick((n) => n + 1)
  }, [])
  const depositTimerRef = React.useRef<number | null>(null)
  const timerRef = React.useRef<number | null>(null)
  const rakebackTimerRef = React.useRef<number | null>(null)
  const claimTimersRef = React.useRef<Map<string, number>>(new Map())
  const balanceTimersRef = React.useRef<number[]>([])
  const deepLinkRef = React.useRef(false)
  const overlayStartedRef = React.useRef(performance.now())
  const vipRewardsRef = React.useRef(vipRewards)
  vipRewardsRef.current = vipRewards
  const loggedInRef = React.useRef(loggedIn)
  loggedInRef.current = loggedIn
  const launchedGameRef = React.useRef(launchedGame)
  launchedGameRef.current = launchedGame
  /** Viewport origin for rakeback coins — captured at launch from the game tile. */
  const rakebackOriginRef = React.useRef<RakebackOrigin | null>(null)
  const vipClaimCount = claimableCount(vipRewards, profile.dateOfBirth)

  const clearDepositTimers = useCallback(() => {
    depositTimersRef.current.forEach((t) => window.clearTimeout(t))
    depositTimersRef.current = []
    if (depositTimerRef.current) {
      window.clearTimeout(depositTimerRef.current)
      depositTimerRef.current = null
    }
  }, [])

  const insertFreeSpinsRow = useCallback((spins: number, infoText: string) => {
    setVipRewards((prev) => {
      const existing = prev.find((r) => r.id === WELCOME_FREE_SPINS.id)
      if (existing) {
        return prev.map((r) => {
          if (r.id !== WELCOME_FREE_SPINS.id) return r
          const nextSpins = (r.spinsRemaining ?? 0) + spins
          return {
            ...r,
            spinsRemaining: nextSpins,
            spinsTotal: Math.max(r.spinsTotal ?? 0, nextSpins),
            subtitle: `${nextSpins} Free Spins`,
            state: 'enable' as const,
            ctaLabel: 'Claim',
            infoText,
          }
        })
      }
      const row: VipReward = {
        id: WELCOME_FREE_SPINS.id,
        kind: WELCOME_FREE_SPINS.kind,
        title: WELCOME_FREE_SPINS.title,
        subtitle: `${spins} Free Spins`,
        amount: WELCOME_FREE_SPINS.amount,
        state: 'enable',
        infoText,
        gameTitle: WELCOME_FREE_SPINS.gameTitle,
        gameImageSrc: WELCOME_FREE_SPINS.gameImageSrc,
        spinsRemaining: spins,
        spinsTotal: spins,
        ctaLabel: 'Play',
      }
      const next = prev.filter((r) => r.id !== WELCOME_FREE_SPINS.id)
      const bdayIdx = next.findIndex((r) => r.id === 'birthday')
      if (bdayIdx >= 0) next.splice(bdayIdx, 0, row)
      else next.push(row)
      return next
    })
  }, [])

  const grantWelcomeFreeSpins = useCallback(() => {
    setVipRewards((prev) => {
      if (prev.some((r) => r.id === WELCOME_FREE_SPINS.id)) return prev
      const row: VipReward = {
        id: WELCOME_FREE_SPINS.id,
        kind: WELCOME_FREE_SPINS.kind,
        title: WELCOME_FREE_SPINS.title,
        subtitle: `${WELCOME_FREE_SPINS.spinsRemaining} Free Spins`,
        amount: WELCOME_FREE_SPINS.amount,
        state: 'enable',
        infoText: WELCOME_FREE_SPINS.infoText,
        gameTitle: WELCOME_FREE_SPINS.gameTitle,
        gameImageSrc: WELCOME_FREE_SPINS.gameImageSrc,
        spinsRemaining: WELCOME_FREE_SPINS.spinsRemaining,
        spinsTotal: WELCOME_FREE_SPINS.spinsTotal,
        ctaLabel: 'Play',
      }
      const next = prev.filter((r) => r.id !== WELCOME_FREE_SPINS.id)
      const bdayIdx = next.findIndex((r) => r.id === 'birthday')
      if (bdayIdx >= 0) next.splice(bdayIdx, 0, row)
      else next.push(row)
      return next
    })
  }, [])

  const completeDepositCredit = useCallback(() => {
    if (depositCreditedRef.current) return
    depositCreditedRef.current = true
    const amount = depositAmountRef.current
    const lowBalanceTopUp = lowBalanceOfferArmedRef.current
    lowBalanceOfferArmedRef.current = false
    depositPollToastIdRef.current = null
    lossStreakRef.current = 0
    setChurnRescueOpen(false)
    setWelcomeOfferOpen(false)
    /* Funded — never pitch “Deposit now”. Laura welcome only if wallet closed empty. */
    postJoinWelcomeArmedRef.current = false
    setPostJoinWelcomeArmed(false)
    setIntercomWelcomePending(false)
    welcomeToastScheduledRef.current = false
    if (intercomOpenTimerRef.current) {
      window.clearTimeout(intercomOpenTimerRef.current)
      intercomOpenTimerRef.current = null
    }
    setIntercomOpenState(false)
    const freeSpins = lowBalanceTopUp
      ? LOW_BALANCE_FREE_SPINS
      : WELCOME_FREE_SPINS.spinsRemaining
    if (lowBalanceTopUp) {
      insertFreeSpinsRow(
        LOW_BALANCE_FREE_SPINS,
        'Reload free spins — from your low-balance deposit offer.',
      )
    } else {
      grantWelcomeFreeSpins()
    }
    setVipIconPulse((n) => n + 1)
    setDepositTracker((prev) =>
      prev
        ? {
            ...prev,
            stage: 'confirmed',
            confirmations: DEPOSIT_REQUIRED_CONFIRMATIONS,
          }
        : prev,
    )
    /* Always toast — free spins + deposit credit (even if cashier still open). */
    setVipClaimToast({
      id: Date.now(),
      amount,
      kind: 'deposit',
      freeSpins,
    })
    const roll = window.setTimeout(() => {
      balanceTimersRef.current = balanceTimersRef.current.filter((t) => t !== roll)
      setBalance((b) => {
        const next = b + amount
        setDisplayBalance(next)
        return next
      })
    }, 450)
    balanceTimersRef.current.push(roll)
  }, [grantWelcomeFreeSpins, insertFreeSpinsRow])

  const startDepositTracking = useCallback(
    (coinLabelOrOpts: string | StartDepositTrackingOptions = 'Bitcoin') => {
      const opts: StartDepositTrackingOptions =
        typeof coinLabelOrOpts === 'string'
          ? { label: coinLabelOrOpts, channel: 'crypto' }
          : coinLabelOrOpts
      const label = opts.label?.trim() || (opts.channel === 'card' ? 'Card' : 'Bitcoin')
      const channel: DepositChannel = opts.channel ?? 'crypto'
      const amountUsd =
        typeof opts.amountUsd === 'number' && opts.amountUsd > 0
          ? opts.amountUsd
          : DEPOSIT_DEMO_AMOUNT

      clearDepositTimers()
      depositCreditedRef.current = false
      depositAmountRef.current = amountUsd
      const startedAt = Date.now()
      const toastId = Date.now()
      depositPollToastIdRef.current = toastId
      setDepositTracker({
        stage: 'waiting',
        confirmations: 0,
        required: DEPOSIT_REQUIRED_CONFIRMATIONS,
        amountUsd,
        coinLabel: label,
        channel,
        startedAt,
      })
      /* Mirror poll in balance toast when wallet is closed — same id for the whole poll. */
      const syncToast = (confirmations: number, stage: DepositTrackStage) => {
        if (cashierOpenRef.current) return
        if (stage === 'confirmed') return
        setVipClaimToast({
          id: depositPollToastIdRef.current ?? toastId,
          amount: amountUsd,
          kind: 'deposit-polling',
          confirmations,
          required: DEPOSIT_REQUIRED_CONFIRMATIONS,
        })
      }
      if (!cashierOpenRef.current) {
        syncToast(0, 'waiting')
      }

      const push = (delay: number, fn: () => void) => {
        const t = window.setTimeout(fn, delay)
        depositTimersRef.current.push(t)
      }

      push(DEPOSIT_WAIT_MS, () => {
        setDepositTracker((prev) =>
          prev ? { ...prev, stage: 'detected', confirmations: 0 } : prev,
        )
        syncToast(0, 'detected')
      })
      push(DEPOSIT_DETECT_MS, () => {
        setDepositTracker((prev) =>
          prev ? { ...prev, stage: 'confirming', confirmations: 0 } : prev,
        )
        syncToast(0, 'confirming')
      })
      push(DEPOSIT_CONF1_MS, () => {
        setDepositTracker((prev) =>
          prev ? { ...prev, stage: 'confirming', confirmations: 1 } : prev,
        )
        syncToast(1, 'confirming')
      })
      push(DEPOSIT_CONF2_MS, () => {
        setDepositTracker((prev) =>
          prev
            ? {
                ...prev,
                stage: 'confirmed',
                confirmations: DEPOSIT_REQUIRED_CONFIRMATIONS,
              }
            : prev,
        )
        completeDepositCredit()
      })
    },
    [clearDepositTimers, completeDepositCredit],
  )

  const clearDepositTracker = useCallback(() => {
    clearDepositTimers()
    setDepositTracker(null)
    /* Keep depositCreditedRef — clearing the panel must not re-arm Laura’s “Deposit now”. */
  }, [clearDepositTimers])

  const dismissWelcomeOffer = useCallback(() => {
    setWelcomeOfferOpen(false)
  }, [])

  const dismissVipClaimToast = useCallback(() => {
    setVipClaimToast((prev) => {
      /* Don't dismiss an in-flight deposit poll by accident — wait for success. */
      if (prev?.kind === 'deposit-polling') return prev
      return null
    })
  }, [])

  /* Every toast → inbox history (skip in-flight deposit poll ticks). */
  useEffect(() => {
    if (!vipClaimToast) return
    if (vipClaimToast.kind === 'deposit-polling') return
    if (lastInboxToastIdRef.current === vipClaimToast.id) return
    lastInboxToastIdRef.current = vipClaimToast.id
    const row = notificationFromToast(vipClaimToast)
    if (!row) return
    setNotifications((prev) => {
      if (prev.some((n) => n.id === row.id)) return prev
      return [row, ...prev].slice(0, 80)
    })
  }, [vipClaimToast])

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  const setNotificationsOpen = useCallback((open: boolean) => {
    if (open) {
      setDrawerOpen(false)
      setCashierOpen(false)
      setVipHubOpen(false)
      setAuthOpen(false)
    }
    setNotificationsOpenState(open)
  }, [])

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const openDepositFromLowBalance = useCallback(() => {
    lowBalanceOfferArmedRef.current = true
    setVipClaimToast(null)
    setChurnRescueOpen(false)
    setVipHubOpen(false)
    setDrawerOpen(false)
    setNotificationsOpenState(false)
    setCashierOpen(true)
  }, [])

  const dismissChurnRescue = useCallback(() => {
    setChurnRescueOpen(false)
  }, [])

  useEffect(() => {
    setCasinoSearchOpen(false)
    setLaunchedGame(null)
    // Shared casino layout keeps #shell-scroll mounted — reset so Lobby ↔ Live always starts at top.
    const scroller = document.getElementById('shell-scroll')
    if (scroller) scroller.scrollTop = 0
    else window.scrollTo(0, 0)
  }, [pathname])

  const openAuthRef = React.useRef<(view?: AuthModalView) => void>(() => {})

  const isFavorite = useCallback(
    (gameId: string) => favoriteGameIds.includes(gameId),
    [favoriteGameIds],
  )
  const toggleFavorite = useCallback((game: CasinoLobbyGame) => {
    if (!loggedInRef.current) {
      openAuthRef.current('login')
      return
    }
    setFavoriteGamesStored((prev) => {
      const exists = prev.some((g) => g.id === game.id)
      const next = exists ? prev.filter((g) => g.id !== game.id) : [game, ...prev]
      writeStoredFavorites(next)
      return next
    })
  }, [])

  const launchGame = useCallback((
    game: CasinoLobbyGame,
    originEl?: HTMLElement | null,
    opts?: { freeSpins?: boolean },
  ) => {
    setCasinoSearchOpen(false)
    if (!loggedInRef.current) {
      openAuthRef.current('login')
      return
    }
    const asFreeSpins = Boolean(opts?.freeSpins)
    /* Empty wallet — open cashier instead of launching (free-spins sessions skip this). */
    if (!asFreeSpins && balanceRef.current <= 0) {
      setChurnRescueOpen(false)
      setVipHubOpen(false)
      setDrawerOpen(false)
      setNotificationsOpenState(false)
      setAuthOpen(false)
      setCashierOpen(true)
      return
    }
    setChurnRescueOpen(false)
    freeSpinsSessionRef.current = asFreeSpins
    /* Open game here; on free-spins close we soft-nav to /casino if still off-lobby. */
    exitToCasinoOnCloseRef.current =
      asFreeSpins && !pathnameRef.current.startsWith('/casino')
    /* Prefer the clicked tile/card; else most-visible matching lobby tile. */
    rakebackOriginRef.current =
      originFromTileEl(originEl) ?? resolveRakebackOrigin(game.id)
    setLastPlayedStored(game)
    writeStoredGame(LAST_PLAYED_KEY, game)
    setLaunchedGame(game)
  }, [])

  const promoteToSilver = useCallback(() => {
    if (vipTierRef.current !== 'bronze') {
      levelUpPendingRef.current = false
      return
    }
    /* Close overlays so Laura’s Intercom congrats isn’t buried. */
    setVipHubOpen(false)
    setCashierOpen(false)
    setAuthOpen(false)
    setDrawerOpen(false)
    setVipLevelUpModalOpen(false)
    setIntercomWelcomePending(false)

    /* Widgets: bump seq while bar is at 100 so crown swap + reset can play. */
    setVipLevelUpSeq((n) => n + 1)
    try {
      playVipClaimSound()
      fireJoinWelcomeConfetti()
    } catch {
      /* cosmetic */
    }
    setVipRewards((prev) => {
      const unlocked = prev.map((r) => {
        if (!(VIP_SILVER_UNLOCK_IDS as readonly string[]).includes(r.id)) return r
        if (r.state !== 'locked') return r
        return {
          ...r,
          state: 'enable' as const,
          metaLabel: undefined,
        }
      })
      if (unlocked.some((r) => r.id === SILVER_LEVEL_UP_REWARD.id)) return unlocked
      /* Level-up bonus sits directly under the progress card. */
      return [{ ...SILVER_LEVEL_UP_REWARD }, ...unlocked]
    })
    setVipIconPulse((n) => n + 1)

    /*
     * Settle Silver → Gold @ 0% early so a late wipe can’t kill the next
     * session bumps on the casino banner (race with open/close games).
     */
    window.setTimeout(() => {
      setVipTier('silver')
      setVipProgressPercent(0)
      vipProgressPercentRef.current = 0
      setVipProgressUpdatedLabel('Just now')
      levelUpPendingRef.current = false
    }, 420)

    /* Laura Intercom — congrats + Silver perks after banner crown swap. */
    window.setTimeout(() => {
      setIntercomLevelUpPending(true)
      setIntercomOpenState(true)
      try {
        playMessengerPopSound()
      } catch {
        /* cosmetic */
      }
    }, 780)
  }, [])

  const dismissVipLevelUpModal = useCallback(() => {
    setVipLevelUpModalOpen(false)
  }, [])

  const closeGameLauncher = useCallback(() => {
    const session = launchedGameRef.current
    const hadSession = session != null
    const launchOrigin = rakebackOriginRef.current
    setLaunchedGame(null)
    if (!hadSession || !loggedInRef.current) return

    const wasFreeSpins = freeSpinsSessionRef.current
    const goCasino = exitToCasinoOnCloseRef.current
    freeSpinsSessionRef.current = false
    exitToCasinoOnCloseRef.current = false

    /* Free-spins play: burn spins on close — never wipe the row until empty. */
    if (wasFreeSpins) {
      setVipRewards((prev) =>
        prev
          .map((r) => {
            if (r.id !== WELCOME_FREE_SPINS.id) return r
            const left = Math.max(0, (r.spinsRemaining ?? 0) - FREE_SPINS_PER_SESSION)
            if (left <= 0) return null
            return {
              ...r,
              spinsRemaining: left,
              subtitle: `${left} Free Spins`,
              state: 'enable' as const,
              ctaLabel: 'Play',
            }
          })
          .filter((r): r is VipReward => r != null),
      )
    }

    /* Free spins from homepage/deposit — open game first; redirect only on close. */
    if (goCasino || (wasFreeSpins && !pathnameRef.current.startsWith('/casino'))) {
      window.setTimeout(() => {
        if (pathnameRef.current.startsWith('/casino')) return
        setPendingHref('/casino')
        setNavigating(true)
        router.push('/casino')
      }, 80)
    }

    /* Demo: cash stake settles on close — UBC NumberFlow rolls down after launcher clears. */
    const nextBalance = wasFreeSpins
      ? balanceRef.current
      : Math.max(0, Number((balanceRef.current - SESSION_GAME_STAKE).toFixed(2)))
    balanceRef.current = nextBalance
    if (!wasFreeSpins) {
      window.setTimeout(() => {
        setBalance(nextBalance)
        setDisplayBalance(nextBalance)
      }, SESSION_STAKE_ROLL_MS)
    }

    /* Cash sessions only — free-spins play doesn't count toward churn / low-balance. */
    if (!wasFreeSpins) {
      lossStreakRef.current += 1
      totalLossesRef.current += 1
      const streak = lossStreakRef.current
      const totalLosses = totalLossesRef.current

      if (postSessionUiTimerRef.current) {
        window.clearTimeout(postSessionUiTimerRef.current)
        postSessionUiTimerRef.current = null
      }
      postSessionUiTimerRef.current = window.setTimeout(() => {
        postSessionUiTimerRef.current = null
        /* Level-up Intercom wins over churn / low-balance. */
        if (levelUpPendingRef.current) return
        const firstChurn =
          !churnShownOnceRef.current && streak >= LOSS_STREAK_FOR_CHURN
        const secondChurn =
          churnShownOnceRef.current &&
          !churnShownAt20Ref.current &&
          totalLosses >= LOSS_TOTAL_FOR_SECOND_CHURN
        if (firstChurn || secondChurn) {
          if (firstChurn) churnShownOnceRef.current = true
          if (secondChurn) churnShownAt20Ref.current = true
          lossStreakRef.current = 0
          setVipClaimToast(null)
          setChurnRescueOpen(true)
          return
        }
        /* Re-alert every close while under threshold (incl. $0). */
        if (nextBalance < LOW_BALANCE_THRESHOLD) {
          setVipClaimToast({
            id: Date.now(),
            amount: nextBalance,
            kind: 'low-balance',
            freeSpins: LOW_BALANCE_FREE_SPINS,
          })
        }
      }, POST_SESSION_UI_DELAY_MS)
    }

    if (rakebackTimerRef.current) {
      window.clearTimeout(rakebackTimerRef.current)
      rakebackTimerRef.current = null
    }

    rakebackTimerRef.current = window.setTimeout(() => {
      rakebackTimerRef.current = null
      const add = SESSION_RAKEBACK_AMOUNT
      /* Prefer launch snapshot (where they clicked); else live most-visible tile. */
      const live = session ? resolveRakebackOrigin(session.id) : resolveRakebackOrigin(null)
      const origin =
        launchOrigin?.fromTile ? launchOrigin : live.fromTile ? live : launchOrigin ?? live
      flyRakebackCoinsToVip({
        origin,
        onImpact: () => {
          setVipRewards((prev) =>
            prev.map((r) => {
              if (r.id !== 'casino-rakeback') return r
              const nextAmount = Number((r.amount + add).toFixed(2))
              if (r.state === 'landing') return { ...r, amount: nextAmount }
              return { ...r, amount: nextAmount, state: 'enable' as const }
            }),
          )
          const nextPct = Math.min(
            100,
            vipProgressPercentRef.current + SESSION_VIP_PROGRESS_BUMP,
          )
          setVipProgressPercent(nextPct)
          setVipProgressUpdatedLabel('Just now')
          setVipIconPulse((n) => n + 1)

          if (
            nextPct >= 100 &&
            vipTierRef.current === 'bronze' &&
            !levelUpPendingRef.current
          ) {
            levelUpPendingRef.current = true
            if (levelUpTimerRef.current) window.clearTimeout(levelUpTimerRef.current)
            levelUpTimerRef.current = window.setTimeout(() => {
              levelUpTimerRef.current = null
              promoteToSilver()
            }, LEVEL_UP_PROMOTE_DELAY_MS)
          }
        },
        onComplete: () => {
          /* Coins + crown shake are enough — toast only on redeem/claim. */
          rakebackOriginRef.current = null
        },
      })
    }, RAKEBACK_FLY_DELAY_MS)
  }, [promoteToSilver, router])

  /** Sports (and similar) cash outlay — keeps NumberFlow chrome in sync. */
  const spendBalance = useCallback((amount: number) => {
    const spend = Number(amount)
    if (!Number.isFinite(spend) || spend <= 0) return true
    if (balanceRef.current + 1e-9 < spend) return false
    const next = Math.max(0, Number((balanceRef.current - spend).toFixed(2)))
    balanceRef.current = next
    setBalance(next)
    setDisplayBalance(next)
    return true
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
    /*
     * Same surface (casino↔casino, account↔account, …): keep current page painted —
     * swapping to a full skeleton made every hop feel slow. SEO stays hidden via
     * pendingHref. Cross-surface still gets the destination skeleton.
     */
    const sameSurface =
      next != null &&
      ((pathname.startsWith('/casino') && next.startsWith('/casino')) ||
        (pathname.startsWith('/account') && next.startsWith('/account')) ||
        (pathname.startsWith('/promotions') && next.startsWith('/promotions')) ||
        (pathname.startsWith('/sports') && next.startsWith('/sports')) ||
        (pathname.startsWith('/poker') && next.startsWith('/poker')))
    if (!sameSurface) setNavigating(true)
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
    const pendingNorm = pending ? normalizePath(pending) : ''
    const casinoHold = pendingNorm.startsWith('/casino')
    const holdMs = isDeep
      ? Math.max(0, DEEP_LINK_MIN_MS - elapsed)
      : navigating
        ? casinoHold
          ? CASINO_SOFT_HOLD_MS
          : SKELETON_MIN_MS
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

  const closeAuth = useCallback(() => {
    setAuthOpen(false)
  }, [])

  const openAuth = useCallback((view: AuthModalView = 'join') => {
    setAuthView(view)
    setDrawerOpen(false)
    setCashierOpen(false)
    setVipHubOpen(false)
    setAuthOpen(true)
  }, [])
  openAuthRef.current = openAuth

  const refreshDailySpin = useCallback(() => {
    setVipRewards((prev) => {
      const has = prev.some((r) => r.id === DAILY_SPIN_ID)
      if (!has) {
        const seed = VIP_REWARDS_SEED.find((r) => r.id === DAILY_SPIN_ID)
        if (!seed) return prev
        return [{ ...seed, state: 'enable' as const }, ...prev]
      }
      return prev.map((r) =>
        r.id === DAILY_SPIN_ID
          ? {
              ...r,
              state: 'enable' as const,
              ctaLabel: 'Spin',
              subtitle: 'Available now',
              metaLabel: undefined,
              amount: 0,
            }
          : r,
      )
    })
    setNotifications((prev) => {
      if (prev.some((n) => n.id === 'daily-spin-available' && !n.read)) return prev
      const next: InboxNotification = {
        id: 'daily-spin-available',
        title: 'Daily Spin available!',
        body: 'Spin the VIP wheel for cash or free spins.',
        createdAt: Date.now(),
        read: false,
        icon: 'promo',
      }
      return [next, ...prev]
    })
    setVipIconPulse((n) => n + 1)
  }, [])

  const completeLogin = useCallback((input?: { email?: string; username?: string }) => {
    setProfile((prev) => {
      const stored = readStoredProfile()
      const email = input?.email ?? (prev.email || stored?.email || '')
      const fullName =
        input?.username?.trim() ||
        prev.fullName.trim() ||
        stored?.fullName?.trim() ||
        ''
      const accountId =
        prev.accountId.trim() ||
        stored?.accountId?.trim() ||
        generateAccountId(email || fullName || 'player')
      const next: PlayerProfile = {
        ...EMPTY_PROFILE,
        ...stored,
        ...prev,
        email,
        fullName,
        accountId,
      }
      writeStoredProfile(next)
      return next
    })
    setLoggedIn(true)
    setAuthOpen(false)
    /* Returning player — never Laura first-deposit Intercom / cashier. */
    cashierAfterDailySpinRef.current = false
    postJoinWelcomeArmedRef.current = false
    setPostJoinWelcomeArmed(false)
    setIntercomWelcomePending(false)
    setWelcomeOfferOpen(false)
    setCashierOpen(false)
    /* Daily Spin is the post-login popup. */
    refreshDailySpin()
    setDailySpinOpen(true)
  }, [refreshDailySpin])

  const completeJoin = useCallback((input: { email: string; fullName?: string }) => {
    /* Brand-new account — clear earned VIP + DOB so hub starts empty. */
    clearDepositTimers()
    setDepositTracker(null)
    depositCreditedRef.current = false
    const nickname = (input.fullName ?? '').trim()
    const nextProfile: PlayerProfile = {
      email: input.email,
      fullName: nickname,
      accountId: generateAccountId(input.email || nickname),
      phone: null,
      dateOfBirth: null,
      address: null,
      billing: null,
      kycVerified: false,
    }
    setProfile(nextProfile)
    writeStoredProfile(nextProfile)
    writeStoredNickname(nickname)
    setLastPlayedStored(null)
    writeStoredGame(LAST_PLAYED_KEY, null)
    setFavoriteGamesStored([])
    writeStoredFavorites([])
    setVipRewards(VIP_REWARDS_SEED.map((r) => ({ ...r })))
    setVipProgressPercent(0)
    setVipProgressUpdatedLabel('Not started yet')
    setVipTier('bronze')
    setVipLevelUpSeq(0)
    setVipLevelUpModalOpen(false)
    setChurnRescueOpen(false)
    levelUpPendingRef.current = false
    silverLevelUpClaimedRef.current = false
    lowBalanceOfferArmedRef.current = false
    depositPollToastIdRef.current = null
    lossStreakRef.current = 0
    totalLossesRef.current = 0
    churnShownOnceRef.current = false
    churnShownAt20Ref.current = false
    if (levelUpTimerRef.current) {
      window.clearTimeout(levelUpTimerRef.current)
      levelUpTimerRef.current = null
    }
    if (postSessionUiTimerRef.current) {
      window.clearTimeout(postSessionUiTimerRef.current)
      postSessionUiTimerRef.current = null
    }
    setBalance(0)
    setDisplayBalance(0)
    depositCreditedRef.current = false
    depositAmountRef.current = DEPOSIT_DEMO_AMOUNT
    setWelcomeOfferOpen(true)
    setIntercomOpenState(false)
    setIntercomWelcomePending(false)
    setIntercomLevelUpPending(false)
    setIntercomVipMatchPending(false)
    welcomeToastScheduledRef.current = false
    if (intercomOpenTimerRef.current) {
      window.clearTimeout(intercomOpenTimerRef.current)
      intercomOpenTimerRef.current = null
    }
    postJoinWelcomeArmedRef.current = true
    setPostJoinWelcomeArmed(true)
    setLoggedIn(true)
    setAuthOpen(false)
    setDrawerOpen(false)
    setVipHubOpen(false)
    /* New account — Activate cashier. Daily Spin is login-only (returning). */
    cashierAfterDailySpinRef.current = false
    setDailySpinOpen(false)
    setCashierOpen(true)

    /* Journey 3 lab — toast → My Account (levels live there). */
    if (joinJourney === 3) {
      window.setTimeout(() => {
        toast.message('Account 0% complete', {
          description: 'Add a phone for Level 1',
          duration: 12000,
          action: {
            label: 'My Account',
            onClick: () => {
              setCashierOpen(false)
              startNavigating('/account')
              router.push('/account')
            },
          },
        })
      }, 700)
    }
  }, [clearDepositTimers, joinJourney, router, startNavigating])

  const setDateOfBirth = useCallback((isoDate: string) => {
    setProfile((prev) => ({ ...prev, dateOfBirth: isoDate }))
  }, [])

  const saveBillingKyc = useCallback((billing: BillingKyc) => {
    const next: BillingKyc = {
      firstName: billing.firstName.trim(),
      lastName: billing.lastName.trim(),
      addressLine1: billing.addressLine1.trim(),
      city: billing.city.trim(),
      state: billing.state.trim(),
      postalCode: billing.postalCode.trim(),
      mobile: billing.mobile.trim(),
    }
    setProfile((prev) => {
      const nameFromBilling = `${next.firstName} ${next.lastName}`.trim()
      return {
        ...prev,
        billing: next,
        phone: next.mobile || prev.phone,
        fullName: hasFullName(prev.fullName) ? prev.fullName : nameFromBilling,
        address: [next.addressLine1, next.city, next.state, next.postalCode]
          .filter(Boolean)
          .join(', '),
      }
    })
  }, [])

  const earnReferShare = useCallback(() => {
    setVipRewards((prev) =>
      prev.map((r) => {
        if (r.id !== 'refer-friend') return r
        if (r.state === 'landing' || r.state === 'claimed') return r
        const amount = Math.max(r.amount, RAF_SHARE_COMMISSION)
        return {
          ...r,
          amount,
          state: 'enable' as const,
          subtitle: 'Commission ready',
          metaLabel: undefined,
        }
      }),
    )
    setVipIconPulse((n) => n + 1)
  }, [])

  const openVipHub = useCallback((value: boolean, tab: VipHubTab = 'VIP') => {
    if (value) {
      setDrawerOpen(false)
      setCashierOpen(false)
      setAuthOpen(false)
      setNotificationsOpenState(false)
      setVipHubTab(tab)
      /* Never rebuild from seed — that wiped free spins / earned rows. Only sync Silver unlocks. */
      setVipRewards((prev) => {
        const isSilverPlus = vipTierRef.current !== 'bronze'
        let next = prev.map((r) => {
          if (!(VIP_SILVER_UNLOCK_IDS as readonly string[]).includes(r.id)) return r
          if (!isSilverPlus || r.state !== 'locked') return r
          return { ...r, state: 'enable' as const, metaLabel: undefined }
        })
        const hasLevelUp = next.some((r) => r.id === SILVER_LEVEL_UP_REWARD.id)
        if (
          isSilverPlus &&
          !silverLevelUpClaimedRef.current &&
          !hasLevelUp
        ) {
          next = [{ ...SILVER_LEVEL_UP_REWARD }, ...next]
        }
        return next
      })
    }
    setVipHubOpen(value)
  }, [])

  const setIntercomOpen = useCallback((open: boolean) => {
    setIntercomOpenState(open)
    if (!open) {
      setIntercomWelcomePending(false)
      setIntercomLevelUpPending(false)
      setIntercomVipMatchPending(false)
    }
  }, [])

  const openVipStatusMatch = useCallback(() => {
    setIntercomWelcomePending(false)
    setIntercomLevelUpPending(false)
    setIntercomVipMatchPending(true)
    setIntercomOpenState(true)
  }, [])

  /* #24 — catch every cashier close (including raw setState paths). */
  useEffect(() => {
    const wasOpen = cashierWasOpenRef.current
    cashierWasOpenRef.current = cashierOpen

    if (cashierOpen) {
      if (intercomOpenTimerRef.current) {
        window.clearTimeout(intercomOpenTimerRef.current)
        intercomOpenTimerRef.current = null
        welcomeToastScheduledRef.current = false
        if (!depositCreditedRef.current) {
          postJoinWelcomeArmedRef.current = true
          setPostJoinWelcomeArmed(true)
          setIntercomWelcomePending(false)
        }
      }
      setIntercomOpenState(false)
      return
    }

    if (wasOpen) schedulePostJoinWelcomeToast()
  }, [cashierOpen, schedulePostJoinWelcomeToast])

  const openCashier = useCallback((value: boolean) => {
    if (value) {
      setDrawerOpen(false)
      setVipHubOpen(false)
      setAuthOpen(false)
      setNotificationsOpenState(false)
      /* Opening wallet — in-panel tracker owns the poll UI. */
      setVipClaimToast((prev) => (prev?.kind === 'deposit-polling' ? null : prev))
    } else {
      /* Closing wallet mid-poll — continue under the balance toast (same poll id). */
      setDepositTracker((tracker) => {
        if (tracker && tracker.stage !== 'confirmed') {
          const id = depositPollToastIdRef.current ?? Date.now()
          depositPollToastIdRef.current = id
          setVipClaimToast({
            id,
            amount: tracker.amountUsd,
            kind: 'deposit-polling',
            confirmations: tracker.confirmations,
            required: tracker.required,
          })
        }
        return tracker
      })
      /* Direct close path — don’t rely only on the effect. */
      window.setTimeout(() => schedulePostJoinWelcomeToast(), 0)
    }
    setCashierOpen(value)
  }, [schedulePostJoinWelcomeToast])

  const openDrawer = useCallback((value: boolean) => {
    if (value) {
      setCashierOpen(false)
      setVipHubOpen(false)
      setAuthOpen(false)
      setNotificationsOpenState(false)
    }
    setDrawerOpen(value)
  }, [])

  /** Shared claim beat: confetti → toast → balance NumberFlow (VIP hub + Missions). */
  const runCashClaimCelebration = useCallback(
    (amount: number, button?: HTMLButtonElement | null, timerKey = 'mission') => {
      if (amount <= 0) return

      const existing = claimTimersRef.current.get(timerKey)
      if (existing) window.clearTimeout(existing)
      const existingToast = claimTimersRef.current.get(`${timerKey}:toast`)
      if (existingToast) {
        window.clearTimeout(existingToast)
        claimTimersRef.current.delete(`${timerKey}:toast`)
      }

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
        claimTimersRef.current.delete(timerKey)
        try {
          celebrateVipClaim(button ?? null)
        } catch {
          /* confetti/sound must never affect claim or toast */
        }
        const toastTimer = window.setTimeout(() => {
          claimTimersRef.current.delete(`${timerKey}:toast`)
          flashVipClaimToast(amount)
          setVipClaimToast({ id: Date.now(), amount })
        }, CLAIM_TOAST_AFTER_CELEBRATE_MS)
        claimTimersRef.current.set(`${timerKey}:toast`, toastTimer)
      }, CLAIM_PRELOAD_MS)
      claimTimersRef.current.set(timerKey, timer)
    },
    [],
  )

  const claimMissionReward = useCallback(
    (amount: number, button?: HTMLButtonElement | null) => {
      runCashClaimCelebration(amount, button, `mission:${Date.now()}`)
    },
    [runCashClaimCelebration],
  )

  const openDailySpin = useCallback(() => {
    setDailySpinOpen(true)
  }, [])

  const closeDailySpin = useCallback(() => {
    setDailySpinOpen(false)
    if (cashierAfterDailySpinRef.current) {
      cashierAfterDailySpinRef.current = false
      setCashierOpen(true)
    }
  }, [])

  const resolveDailySpin = useCallback(
    (segment: DailySpinSegment, button?: HTMLButtonElement | null) => {
      setVipRewards((prev) =>
        prev.map((r) =>
          r.id === DAILY_SPIN_ID
            ? {
                ...r,
                state: 'claimed' as const,
                ctaLabel: undefined,
                subtitle: 'Come back tomorrow',
                metaLabel: 'Tomorrow',
              }
            : r,
        ),
      )
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === 'daily-spin-available' ? { ...n, read: true } : n,
        ),
      )

      if (segment.kind === 'cash' && segment.value > 0) {
        runCashClaimCelebration(segment.value, button ?? null, `daily-spin:${Date.now()}`)
        return
      }

      if (segment.kind === 'free-spins' && segment.value > 0) {
        setVipRewards((prev) => {
          const withoutDup = prev.filter((r) => r.id !== WELCOME_FREE_SPINS.id)
          const spinsRow: VipReward = {
            id: WELCOME_FREE_SPINS.id,
            kind: 'free-spins',
            title: WELCOME_FREE_SPINS.title,
            amount: 0,
            state: 'enable',
            ctaLabel: 'Play',
            gameTitle: WELCOME_FREE_SPINS.gameTitle,
            gameImageSrc: WELCOME_FREE_SPINS.gameImageSrc,
            spinsRemaining: segment.value,
            spinsTotal: segment.value,
            infoText: WELCOME_FREE_SPINS.infoText,
          }
          /* Above Birthday Rewards — never second under Daily Spin. */
          const next = [...withoutDup]
          const bdayIdx = next.findIndex((r) => r.id === 'birthday')
          if (bdayIdx >= 0) next.splice(bdayIdx, 0, spinsRow)
          else next.push(spinsRow)
          return next
        })
        try {
          celebrateVipClaim(button ?? null)
        } catch {
          /* ignore */
        }
        const toastTimer = window.setTimeout(() => {
          flashVipClaimToast(0)
          setVipClaimToast({
            id: Date.now(),
            amount: 0,
            freeSpins: segment.value,
          })
        }, CLAIM_TOAST_AFTER_CELEBRATE_MS)
        claimTimersRef.current.set(`daily-spin-fs:toast`, toastTimer)
        return
      }

      /* Unlucky — no cash toast; hub row already marked claimed. */
    },
    [runCashClaimCelebration],
  )

  const claimVipReward = useCallback((id: string, button?: HTMLButtonElement | null) => {
    const reward = vipRewardsRef.current.find((r) => r.id === id)
    if (!reward || reward.state !== 'enable') return

    /* Journey 3 — cash / reward claims need Level 2 (name + DOB). */
    if (joinJourney === 3 && reward.kind !== 'free-spins' && reward.kind !== 'daily-spin') {
      const lvl = accountLevel(profile)
      if (lvl < 2 || !hasFullName(profile.fullName)) {
        setVipHubOpen(false)
        setProfileGate({ reason: 'vip-claim' })
        return
      }
    }

    /* Daily Spin — open the wheel modal instead of a direct cash claim. */
    if (reward.kind === 'daily-spin' || reward.id === DAILY_SPIN_ID) {
      setDailySpinOpen(true)
      return
    }

    /* Welcome free spins — Play opens the game (no cash stake); spins burn on close. */
    if (reward.kind === 'free-spins') {
      const game: CasinoLobbyGame = {
        id: WELCOME_FREE_SPINS.gameId,
        title: reward.gameTitle ?? WELCOME_FREE_SPINS.gameTitle,
        imageSrc: reward.gameImageSrc ?? WELCOME_FREE_SPINS.gameImageSrc,
        vendor: 'Originals',
        vendorLogo: '/vendot_logos/orginals.svg',
        tag: 'Original',
      }
      launchGame(game, button ?? null, { freeSpins: true })
      return
    }

    const amount = reward.amount
    const kind = reward.kind

    setVipRewards((prev) =>
      prev.map((r) => (r.id === id ? { ...r, state: 'landing' as const } : r)),
    )

    const existing = claimTimersRef.current.get(id)
    if (existing) window.clearTimeout(existing)
    const existingToast = claimTimersRef.current.get(`${id}:toast`)
    if (existingToast) {
      window.clearTimeout(existingToast)
      claimTimersRef.current.delete(`${id}:toast`)
    }

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
      setVipRewards((latest) => {
        /* One-shot level-up bonus — drop the row after claim. */
        if (id === SILVER_LEVEL_UP_REWARD.id) {
          silverLevelUpClaimedRef.current = true
          return latest.filter((r) => r.id !== id)
        }
        return latest.map((r) => {
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
        })
      })
      /* 1) Confetti + redeem sound first */
      try {
        celebrateVipClaim(button ?? null)
      } catch {
        /* confetti/sound must never affect claim or toast */
      }
      /* 2) Toast + messenger pop after celebrate finishes — no clash */
      const toastTimer = window.setTimeout(() => {
        claimTimersRef.current.delete(`${id}:toast`)
        flashVipClaimToast(amount)
        setVipClaimToast({ id: Date.now(), amount })
      }, CLAIM_TOAST_AFTER_CELEBRATE_MS)
      claimTimersRef.current.set(`${id}:toast`, toastTimer)
    }, CLAIM_PRELOAD_MS)
    claimTimersRef.current.set(id, timer)
  }, [joinJourney, launchGame, profile])

  useEffect(() => {
    return () => {
      claimTimersRef.current.forEach((timer) => window.clearTimeout(timer))
      claimTimersRef.current.clear()
      balanceTimersRef.current.forEach((timer) => window.clearTimeout(timer))
      balanceTimersRef.current = []
      depositTimersRef.current.forEach((timer) => window.clearTimeout(timer))
      depositTimersRef.current = []
      if (depositTimerRef.current) {
        window.clearTimeout(depositTimerRef.current)
        depositTimerRef.current = null
      }
      if (rakebackTimerRef.current) {
        window.clearTimeout(rakebackTimerRef.current)
        rakebackTimerRef.current = null
      }
      if (levelUpTimerRef.current) {
        window.clearTimeout(levelUpTimerRef.current)
        levelUpTimerRef.current = null
      }
      if (postSessionUiTimerRef.current) {
        window.clearTimeout(postSessionUiTimerRef.current)
        postSessionUiTimerRef.current = null
      }
      if (intercomOpenTimerRef.current) {
        window.clearTimeout(intercomOpenTimerRef.current)
        intercomOpenTimerRef.current = null
      }
    }
  }, [])

  const value = useMemo(
    () => ({
      expanded,
      toggle,
      loggedIn,
      setLoggedIn,
      lastPlayedGame,
      favoriteGameIds,
      isFavorite,
      toggleFavorite,
      favoriteGames,
      authOpen,
      authView,
      openAuth,
      closeAuth,
      setAuthView,
      completeLogin,
      completeJoin,
      profile,
      setDateOfBirth,
      updateProfile,
      saveBillingKyc,
      joinJourney,
      setJoinJourney,
      joinJourneyLab,
      accountLevel: level,
      canPlaceSportsBets,
      canUseCardCashier,
      canClaimVipRewards,
      profileGate,
      openProfileGate,
      closeProfileGate,
      earnReferShare,
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
      spendBalance,
      vipRewards,
      vipClaimCount,
      claimVipReward,
      dailySpinOpen,
      openDailySpin,
      closeDailySpin,
      resolveDailySpin,
      claimMissionReward,
      vipClaimToast,
      dismissVipClaimToast,
      openDepositFromLowBalance,
      churnRescueOpen,
      dismissChurnRescue,
      vipIconPulse,
      vipProgressPercent,
      vipProgressUpdatedLabel,
      vipTier,
      vipLevelUpSeq,
      vipLevelUpModalOpen,
      dismissVipLevelUpModal,
      welcomeOfferOpen,
      dismissWelcomeOffer,
      intercomOpen,
      setIntercomOpen,
      intercomWelcomePending,
      intercomLevelUpPending,
      intercomVipMatchPending,
      openVipStatusMatch,
      depositTracker,
      startDepositTracking,
      clearDepositTracker,
      sportsBetCount,
      setSportsBetCount,
      sportsBetslipOpenTick,
      openSportsBetslip,
      sportsBetslipOpen,
      setSportsBetslipOpen,
      notifications,
      unreadNotificationCount,
      notificationsOpen,
      setNotificationsOpen,
      markNotificationRead,
      markAllNotificationsRead,
      dismissNotification,
    }),
    [
      authOpen,
      authView,
      balance,
      spendBalance,
      casinoSearchOpen,
      claimMissionReward,
      claimVipReward,
      closeAuth,
      closeDailySpin,
      closeGameLauncher,
      completeJoin,
      completeLogin,
      closeProfileGate,
      canClaimVipRewards,
      canPlaceSportsBets,
      canUseCardCashier,
      dailySpinOpen,
      clearDepositTracker,
      joinJourney,
      joinJourneyLab,
      level,
      openProfileGate,
      profileGate,
      setJoinJourney,
      updateProfile,
      dismissChurnRescue,
      dismissNotification,
      dismissVipClaimToast,
      dismissWelcomeOffer,
      depositTracker,
      churnRescueOpen,
      earnReferShare,
      displayBalance,
      markAllNotificationsRead,
      markNotificationRead,
      notifications,
      notificationsOpen,
      startDepositTracking,
      drawerOpen,
      expanded,
      forceSkeleton,
      fullPageLoader,
      favoriteGameIds,
      favoriteGames,
      isFavorite,
      cashierOpen,
      lastPlayedGame,
      launchGame,
      launchedGame,
      loggedIn,
      toggleFavorite,
      navOpen,
      navigating,
      openAuth,
      openCashier,
      openDailySpin,
      openDepositFromLowBalance,
      openDrawer,
      openSportsBetslip,
      openVipHub,
      openVipStatusMatch,
      resolveDailySpin,
      pendingHref,
      product,
      profile,
      saveBillingKyc,
      setAuthView,
      setDateOfBirth,
      setNotificationsOpen,
      sportsBetCount,
      sportsBetslipOpen,
      sportsBetslipOpenTick,
      startDeepLink,
      startNavigating,
      toggle,
      unreadNotificationCount,
      vipClaimCount,
      vipClaimToast,
      vipHubOpen,
      vipHubTab,
      vipIconPulse,
      vipProgressPercent,
      vipProgressUpdatedLabel,
      vipTier,
      vipLevelUpSeq,
      vipLevelUpModalOpen,
      dismissVipLevelUpModal,
      vipRewards,
      welcomeOfferOpen,
      intercomOpen,
      setIntercomOpen,
      intercomWelcomePending,
      intercomLevelUpPending,
      intercomVipMatchPending,
      openVipStatusMatch,
    ],
  )

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}
