/** Loyalty Hub — Figma Loyalty-Hub_Revamp Bronze / Card_Click2Claim (909:955930). */

import type { LoyaltyClaimState } from '@/components/lumen/loyalty-reward-card'

export type VipRewardKind =
  | 'daily-spin'
  | 'rakeback'
  | 'refer'
  | 'reloads'
  | 'post-reload'
  | 'weekly-boost'
  | 'monthly-boost'
  | 'post-boost'
  | 'special-reload'
  | 'special-boost'
  | 'free-spins'
  | 'birthday'

export type VipReward = {
  id: string
  kind: VipRewardKind
  title: string
  subtitle?: string
  amount: number
  state: LoyaltyClaimState
  /** Countdown text or locked tier name */
  metaLabel?: string
  iconBadge?: string
  infoText: string
  /** Free-spins row — game tile + Play CTA */
  gameTitle?: string
  gameImageSrc?: string
  spinsRemaining?: number
  spinsTotal?: number
  /** Override claim button label (e.g. Play) */
  ctaLabel?: string
}

/** Welcome-offer free spins granted after first BTC deposit confirms. */
export const WELCOME_FREE_SPINS = {
  id: 'welcome-free-spins',
  kind: 'free-spins' as const,
  title: 'Free Spins',
  gameTitle: 'Chicken',
  gameImageSrc: '/games/originals/chicken.png',
  gameId: 'chicken',
  spinsRemaining: 100,
  spinsTotal: 100,
  amount: 0,
  infoText: 'Play these free spins on Chicken — from your welcome offer.',
}

/** Demo tiers — progress widgets + level-up ceremony. */
export type VipTierId = 'bronze' | 'silver' | 'gold'

export const VIP_TIER_LABEL: Record<VipTierId, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
}

export const VIP_TIER_NEXT: Record<VipTierId, VipTierId> = {
  bronze: 'silver',
  silver: 'gold',
  gold: 'gold',
}

/** Cash bonus granted when Bronze → Silver completes — hub row under progress. */
export const SILVER_LEVEL_UP_REWARD: VipReward = {
  id: 'silver-level-up',
  kind: 'special-boost',
  title: 'Level Up Bonus',
  amount: 25,
  state: 'enable',
  infoText: 'One-time cash bonus for reaching Silver VIP.',
}

export const SILVER_LEVEL_UP_ID = SILVER_LEVEL_UP_REWARD.id

/** Seed rows that unlock when the player hits Silver. */
export const VIP_SILVER_UNLOCK_IDS = ['post-monthly-reload', 'weekly-boost'] as const

export const VIP_SILVER_UNLOCKED_LABELS = [
  'Post-Monthly Reload',
  'Weekly Boost',
  'Level Up Bonus · $25.00',
] as const

/**
 * Fresh-join Click2Claim list — nothing claimable until the player earns it.
 * Rakeback: open/close casino games. RAF: copy/share on Refer a Friend.
 * Birthday: Add birthday → countdown pill → claim only on the day.
 */
export const VIP_REWARDS_SEED: VipReward[] = [
  {
    id: 'daily-spin',
    kind: 'daily-spin',
    title: 'Daily Spin',
    amount: 0,
    state: 'enable',
    ctaLabel: 'Spin',
    subtitle: 'Available now',
    infoText: 'One spin per login. Cash or free spins.',
  },
  {
    id: 'casino-rakeback',
    kind: 'rakeback',
    title: 'Casino Rakeback',
    amount: 0,
    state: 'disabled',
    metaLabel: '$0.00',
    infoText:
      'Cashback on every casino bet - win or lose. Your reward builds with every spin and is ready to claim every 15 minutes.',
  },
  {
    id: 'refer-friend',
    kind: 'refer',
    title: 'Refer a Friend',
    amount: 0,
    state: 'disabled',
    metaLabel: '$0.00',
    infoText: 'Earn commission when friends you refer place qualifying bets.',
  },
  {
    id: 'monthly-reloads',
    kind: 'reloads',
    title: 'Monthly Reloads',
    amount: 0.01,
    state: 'disabled',
    metaLabel: '10 days',
    iconBadge: '30',
    infoText: 'Claim up to three Monthly Reloads each month when you deposit.',
  },
  {
    id: 'post-monthly-reload',
    kind: 'post-reload',
    title: 'Post-Monthly Reload',
    amount: 1,
    state: 'locked',
    metaLabel: 'Silver',
    iconBadge: '15',
    infoText: 'Extra reload credits available after your monthly reload cycle.',
  },
  {
    id: 'weekly-boost',
    kind: 'weekly-boost',
    title: 'Weekly Boost',
    amount: 15,
    state: 'locked',
    metaLabel: 'Silver',
    iconBadge: '7',
    infoText: 'Weekly Cash Boost unlocks at Silver VIP tier.',
  },
  {
    id: 'monthly-boost',
    kind: 'monthly-boost',
    title: 'Monthly Boost',
    amount: 5,
    state: 'locked',
    metaLabel: 'Platinum',
    iconBadge: '30',
    infoText: 'Monthly Cash Boost unlocks at Platinum VIP tier.',
  },
  {
    id: 'post-monthly-boost',
    kind: 'post-boost',
    title: 'Post-Monthly Boost',
    amount: 5,
    state: 'locked',
    metaLabel: 'Platinum',
    iconBadge: '15',
    infoText: 'Post-Monthly Boost unlocks at Platinum VIP tier.',
  },
  {
    id: 'birthday',
    kind: 'birthday',
    title: 'Birthday Reward',
    amount: 25,
    state: 'enable',
    infoText:
      'A birthday cash reward once a year. We collect date of birth here (not at join) so you can claim when the day arrives — same DOB later powers KYC for card deposits and withdrawals.',
  },
]

/** Whole days until next birthday (0 = today). ISO `YYYY-MM-DD`. */
export function daysUntilBirthday(iso: string): number {
  const parts = iso.split('-').map(Number)
  const month = parts[1]
  const day = parts[2]
  if (!month || !day) return 0
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let next = new Date(now.getFullYear(), month - 1, day)
  if (next.getMonth() !== month - 1) {
    next = new Date(now.getFullYear(), month - 1, day - 1)
  }
  if (next < today) {
    next = new Date(now.getFullYear() + 1, month - 1, day)
    if (next.getMonth() !== month - 1) {
      next = new Date(now.getFullYear() + 1, month - 1, day - 1)
    }
  }
  return Math.round((next.getTime() - today.getTime()) / 86_400_000)
}

/**
 * Cash claims only. “Add birthday” is enable but must not badge the crown;
 * birthday badges only when DOB is set and today is the day.
 */
export function claimableCount(rewards: VipReward[], dateOfBirth?: string | null) {
  return rewards.filter((r) => {
    if (r.state !== 'enable') return false
    if (r.kind === 'daily-spin') return true
    if (r.kind === 'free-spins') return true
    if (r.id === 'birthday') {
      return Boolean(dateOfBirth) && daysUntilBirthday(dateOfBirth!) === 0
    }
    return r.amount > 0
  }).length
}

/** Demo commission unlocked when the player copies or emails their RAF link. */
export const RAF_SHARE_COMMISSION = 40

export function formatClaimAmount(amount: number) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function claimButtonLabel(reward: VipReward) {
  if (reward.ctaLabel) return reward.ctaLabel
  if (reward.kind === 'daily-spin' && reward.state === 'enable') return 'Spin'
  if (reward.kind === 'free-spins' && reward.state === 'enable') return reward.ctaLabel ?? 'Play'
  if (reward.state === 'enable') return `Claim ${formatClaimAmount(reward.amount)}`
  if (reward.state === 'logout') return 'Login'
  if (reward.state === 'claimed') return 'Claimed'
  if (reward.state === 'landing') return 'Claiming reward'
  return reward.metaLabel ?? 'Claim'
}

/** Figma Tab-Menu — Benefits sits off-screen like casino mobile sub-nav. */
export const VIP_HUB_TABS = [
  'VIP',
  '$25k Daily Race',
  'Missions',
  'Cash Drop Code',
  'Benefits',
] as const
export type VipHubTab = (typeof VIP_HUB_TABS)[number]
