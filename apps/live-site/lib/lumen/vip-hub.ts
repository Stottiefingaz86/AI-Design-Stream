/** Loyalty Hub — Figma Loyalty-Hub_Revamp Bronze / Card_Click2Claim (909:955930). */

import type { LoyaltyClaimState } from '@/components/lumen/loyalty-reward-card'

export type VipRewardKind =
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
}

/** Bronze Click2Claim list — Figma 122:67501 / drawer instance */
export const VIP_REWARDS_SEED: VipReward[] = [
  {
    id: 'casino-rakeback',
    kind: 'rakeback',
    title: 'Casino Rakeback',
    amount: 0.2,
    state: 'enable',
    infoText:
      'Cashback on every casino bet - win or lose. Your reward builds with every spin and is ready to claim every 15 minutes.',
  },
  {
    id: 'refer-friend',
    kind: 'refer',
    title: 'Refer a Friend',
    subtitle: 'Commission ready',
    amount: 0.2,
    state: 'enable',
    infoText: 'Earn commission when friends you refer place qualifying bets.',
  },
  {
    id: 'monthly-reloads',
    kind: 'reloads',
    title: 'Monthly Reloads',
    subtitle: '2 of 3 claimed',
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
    subtitle: '2 of 5 claimed',
    amount: 1,
    state: 'enable',
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
]

export function claimableCount(rewards: VipReward[]) {
  return rewards.filter((r) => r.state === 'enable').length
}

export function formatClaimAmount(amount: number) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function claimButtonLabel(reward: VipReward) {
  if (reward.state === 'enable') return `Claim ${formatClaimAmount(reward.amount)}`
  if (reward.state === 'logout') return 'Login'
  if (reward.state === 'claimed') return 'Claimed'
  if (reward.state === 'landing') return 'Claiming reward'
  return reward.metaLabel ?? 'Claim'
}

/** Figma Tab-Menu — Benefits sits off-screen like casino mobile sub-nav. */
export const VIP_HUB_TABS = [
  'VIP',
  'Daily Races',
  'Bet & Get',
  'Cash Drop Code',
  'Benefits',
] as const
export type VipHubTab = (typeof VIP_HUB_TABS)[number]
