/**
 * Local-only join journey lab (1 / 2 / 3 / 4 / 5).
 * Never enable on hosted prod — hostname must be loopback.
 */

export type JoinJourneyId = 1 | 2 | 3 | 4 | 5

export type AccountLevel = 0 | 1 | 2 | 3 | 4

export const JOIN_JOURNEY_STORAGE_KEY = 'bol-join-journey-lab'

export function isJoinJourneyLabEnabled(): boolean {
  /* Local Next only — never on Vercel / production hosts. */
  if (process.env.NODE_ENV === 'production') return false
  if (typeof window === 'undefined') return process.env.NODE_ENV === 'development'
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return true
  /* LAN / custom hosts while running `next dev`. */
  return process.env.NODE_ENV === 'development'
}

export function readJoinJourney(): JoinJourneyId {
  if (!isJoinJourneyLabEnabled()) return 1
  try {
    const raw = sessionStorage.getItem(JOIN_JOURNEY_STORAGE_KEY)
    const n = Number(raw)
    if (n === 2 || n === 3 || n === 4 || n === 5) return n
  } catch {
    /* ignore */
  }
  return 1
}

export function writeJoinJourney(id: JoinJourneyId) {
  if (!isJoinJourneyLabEnabled()) return
  try {
    sessionStorage.setItem(JOIN_JOURNEY_STORAGE_KEY, String(id))
  } catch {
    /* ignore */
  }
}

export type ProfileForLevel = {
  email: string
  fullName: string
  phone: string | null
  dateOfBirth: string | null
  address: string | null
  billing: { addressLine1: string } | null
  kycVerified: boolean
}

/** Level 1 needs email + password (assumed after join) + phone. */
export function accountLevel(profile: ProfileForLevel): AccountLevel {
  const emailOk = profile.email.trim().length > 0
  const phoneOk = (profile.phone ?? '').trim().length >= 7
  const nameOk = profile.fullName.trim().split(/\s+/).filter(Boolean).length >= 2
  const dobOk = Boolean(profile.dateOfBirth)
  const addressOk =
    Boolean(profile.address?.trim()) ||
    Boolean(profile.billing?.addressLine1?.trim())
  const kycOk = profile.kycVerified

  if (!emailOk) return 0
  if (!phoneOk) return 0
  if (!nameOk || !dobOk) return 1
  if (!addressOk) return 2
  if (!kycOk) return 3
  return 4
}

export const ACCOUNT_LEVEL_META: {
  level: AccountLevel
  title: string
  needs: string
  unlocks: string
}[] = [
  {
    level: 1,
    title: 'Level 1 · Profile',
    needs: 'Email, password, phone',
    unlocks: 'Crypto deposit & withdraw · casino play · no sportsbook yet',
  },
  {
    level: 2,
    title: 'Level 2 · Identity',
    needs: 'Date of birth + Full Name',
    unlocks: 'Reward perks · sportsbook bets',
  },
  {
    level: 3,
    title: 'Level 3 · Address',
    needs: 'Residential address',
    unlocks: 'Credit card deposits · non-crypto withdrawals',
  },
  {
    level: 4,
    title: 'Level 4 · Full KYC',
    needs: 'Verified ID',
    unlocks: 'Premium support · higher deposit & payout limits',
  },
]

export function hasFullName(fullName: string) {
  return fullName.trim().split(/\s+/).filter(Boolean).length >= 2
}
