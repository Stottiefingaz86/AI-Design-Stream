/** Refer a Friend — Promo26_Revamp NEW Refer a Friend (1987:181019 / 4749:89556). */

export const RAF_REFERRAL_LINK = 'https://www.betonline.ag/?RAF=7NNSD1Q5'

export type RafCommission =
  | { kind: 'pending' }
  | { kind: 'earned'; amount: number }

export type RafReferralRow = {
  id: string
  name: string
  registered: string
  vip: string
  deposited: number
  wagered: number
  rate: number
  claimed: number
  commission: RafCommission
}

export const RAF_FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'earned', label: 'Earned' },
  { id: 'joined', label: 'Joined' },
] as const

export const RAF_SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'commission', label: 'Commission' },
  { id: 'wagered', label: 'Wagered' },
] as const

export type RafFilterId = (typeof RAF_FILTER_OPTIONS)[number]['id']
export type RafSortId = (typeof RAF_SORT_OPTIONS)[number]['id']

const NAMES = [
  'Christopher',
  'Noha',
  'Helen',
  'Maximiliano',
  'Sofia',
  'Marcus',
  'Priya',
  'Diego',
  'Ava',
  'Jordan',
] as const

const VIPS = ['-', 'Gold', 'Platinum I', 'Elite I', 'Silver', 'Bronze'] as const
const DATES = [
  '12/03/2025',
  '08/11/2025',
  '22/09/2025',
  '01/07/2025',
  '15/05/2025',
  '28/02/2025',
  '03/01/2025',
  '19/11/2024',
  '07/10/2024',
  '14/08/2024',
] as const

export const RAF_REFERRAL_ROWS: RafReferralRow[] = Array.from({ length: 24 }, (_, i) => {
  const pending = i % 3 === 0
  const deposited = pending ? 0 : [120, 450, 80, 1200, 35, 890][i % 6]!
  const wagered = pending ? 0 : [0, 2400, 560, 9800, 120, 4400][i % 6]!
  const rate = 10
  const claimed = pending ? 0 : [0, 2.75, 8.4, 12.2, 1.1, 5.5][i % 6]!
  return {
    id: `raf-${i + 1}`,
    name: NAMES[i % NAMES.length]!,
    registered: DATES[i % DATES.length]!,
    vip: VIPS[i % VIPS.length]!,
    deposited,
    wagered,
    rate,
    claimed,
    commission: pending
      ? { kind: 'pending' }
      : { kind: 'earned', amount: [2.75, 8.4, 12.2, 4.5, 1.25, 6.8][i % 6]! },
  }
})

export const RAF_STATS = {
  referralsSent: 79,
  joined: 10,
  lifetimeCommission: 20_000,
} as const

export function formatRafMoney(amount: number) {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 && amount >= 100 ? 0 : 2,
    maximumFractionDigits: 2,
  })
}

export function formatRafSigned(amount: number) {
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `+$${abs}`
}

export function filterRafRows(
  rows: RafReferralRow[],
  {
    search,
    filter,
    sort,
  }: {
    search: string
    filter: RafFilterId
    sort: RafSortId
  },
) {
  const q = search.trim().toLowerCase()
  let next = rows.filter((row) => {
    if (q && !row.name.toLowerCase().includes(q)) return false
    if (filter === 'pending') return row.commission.kind === 'pending'
    if (filter === 'earned') return row.commission.kind === 'earned'
    if (filter === 'joined') return row.deposited > 0 || row.wagered > 0
    return true
  })

  next = [...next].sort((a, b) => {
    if (sort === 'oldest') {
      return parseRafDate(a.registered) - parseRafDate(b.registered)
    }
    if (sort === 'commission') {
      const av = a.commission.kind === 'earned' ? a.commission.amount : 0
      const bv = b.commission.kind === 'earned' ? b.commission.amount : 0
      return bv - av
    }
    if (sort === 'wagered') return b.wagered - a.wagered
    return parseRafDate(b.registered) - parseRafDate(a.registered)
  })

  return next
}

function parseRafDate(value: string) {
  const [d, m, y] = value.split('/').map(Number)
  return Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1)
}
