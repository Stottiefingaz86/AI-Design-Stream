/** Demo profile for My Account home — Figma WIP My Account 2111:33136. */

export type VipLevel = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'

export const MY_ACCOUNT_DEMO = {
  displayName: 'Nicolás',
  accountId: 'B5873033',
  availableBalance: 100_000,
  freeBet: 500,
  vipLevel: 'Gold' as VipLevel,
}

/** Figma `color/vip-level-3` for Gold. */
export const VIP_LEVEL_COLOR: Record<VipLevel, string> = {
  Bronze: '#cd7f32',
  Silver: '#a8a9ad',
  Gold: '#c4af3e',
  Platinum: '#8e9aab',
  Diamond: '#7ec8e3',
}

export const ACCOUNT_SECTIONS = [
  { label: 'My Account', href: '/account' },
  { label: 'Bet History', href: '/account/bet-history' },
  { label: 'Transactions', href: '/account/transactions' },
  { label: 'Payments', href: '/account/payments' },
  { label: 'Security Central', href: '/account/security' },
  { label: 'Profile Settings', href: '/account/settings' },
] as const

export function formatAccountMoney(value: number) {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
