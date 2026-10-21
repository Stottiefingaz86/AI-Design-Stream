/** Transactions — Figma WIP l7SvxBUIiQKqrpfAvo1pMk (section 4192:122788 · filters 4192:131272). */

export type TxProduct =
  | 'SportsBook'
  | 'Live Betting'
  | 'Racebook'
  | 'Esports'
  | 'Contest'
  | 'Casino'
  | 'Poker'
  | 'Payments'

export type TxType =
  | 'Wager (Debit)'
  | 'Wager (Credit)'
  | 'Deposit'
  | 'Withdrawal'
  | 'Poker Transfer'
  | 'Adjustment'

export type TransactionRow = {
  id: string
  date: string
  type: TxType
  product: TxProduct
  description: string
  /** Signed amount in dollars (positive = credit / win). */
  amount: number
  detail: {
    comment: string
    transactionId: string
    acceptedDate: string
    gradedDate: string
  }
}

/** Figma Product select — SportsBook → Payments. */
export const TX_FILTER_PRODUCTS = [
  'SportsBook',
  'Live Betting',
  'Racebook',
  'Esports',
  'Contest',
  'Casino',
  'Poker',
  'Payments',
] as const

export const TX_FILTER_DATE_RANGES = [
  'Custom',
  'Last 7 days',
  'Last 15 days',
  'Last 30 days',
] as const

export const TX_TYPE_OPTIONS = [
  { id: '', label: 'All Transaction Type' },
  { id: 'wagers', label: 'Wagers' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'withdrawal', label: 'Withdrawal' },
  { id: 'poker-transfers', label: 'Poker Transfers' },
  { id: 'adjustment', label: 'Adjustment' },
] as const

export type TxFilters = {
  product: string
  dateRange: string
  dateFrom: string
  dateTo: string
  txType: string
}

export const EMPTY_TX_FILTERS: TxFilters = {
  product: '',
  dateRange: 'Last 30 days',
  dateFrom: '',
  dateTo: '',
  txType: '',
}

export function txFiltersActiveCount(filters: TxFilters) {
  let n = 0
  if (filters.product) n += 1
  if (filters.dateRange && filters.dateRange !== 'Last 30 days') n += 1
  if (filters.txType) n += 1
  if (filters.dateRange === 'Custom' && (filters.dateFrom || filters.dateTo)) n += 1
  return n
}

export function formatTxAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  if (amount > 0) return `+$${abs}`
  if (amount < 0) return `-$${abs}`
  return `$${abs}`
}

/** Positive credits use success badge; debits use muted secondary pill. */
export function txAmountStyle(amount: number): {
  backgroundColor: string
  borderColor: string
  color: string
} {
  if (amount > 0) {
    return {
      backgroundColor: 'var(--opacity-success-10)',
      borderColor: 'var(--opacity-success-60)',
      color: 'var(--success)',
    }
  }
  return {
    backgroundColor: 'var(--secondary)',
    borderColor: 'var(--border)',
    color: 'var(--secondary-foreground)',
  }
}

function matchesTxType(row: TransactionRow, txType: string) {
  if (!txType) return true
  switch (txType) {
    case 'wagers':
      return row.type === 'Wager (Debit)' || row.type === 'Wager (Credit)'
    case 'deposit':
      return row.type === 'Deposit'
    case 'withdrawal':
      return row.type === 'Withdrawal'
    case 'poker-transfers':
      return row.type === 'Poker Transfer'
    case 'adjustment':
      return row.type === 'Adjustment'
    default:
      return true
  }
}

export function filterTransactionRows(rows: TransactionRow[], filters: TxFilters) {
  return rows.filter((row) => {
    if (filters.product && row.product !== filters.product) return false
    if (!matchesTxType(row, filters.txType)) return false
    return true
  })
}

/** Demo ledger matching Figma table-transactions samples. */
export const TRANSACTION_ROWS: TransactionRow[] = [
  {
    id: '843120151',
    date: '11/05/26',
    type: 'Wager (Debit)',
    product: 'Casino',
    description: 'Wager Loss',
    amount: -180,
    detail: {
      comment: '-',
      transactionId: '843120151',
      acceptedDate: '11/05/26 07:14 PM',
      gradedDate: '11/05/26 10:02 PM',
    },
  },
  {
    id: '843120150',
    date: '11/05/26',
    type: 'Wager (Credit)',
    product: 'SportsBook',
    description: 'Wager Won',
    amount: 50,
    detail: {
      comment: '-',
      transactionId: '843120150',
      acceptedDate: '11/05/26 08:32 PM',
      gradedDate: '11/05/26 11:07 PM',
    },
  },
  {
    id: '843120149',
    date: '11/04/26',
    type: 'Wager (Debit)',
    product: 'Casino',
    description: 'Wager Loss',
    amount: -80,
    detail: {
      comment: '-',
      transactionId: '843120149',
      acceptedDate: '11/04/26 03:22 PM',
      gradedDate: '11/04/26 06:40 PM',
    },
  },
  {
    id: '843120148',
    date: '11/03/26',
    type: 'Wager (Credit)',
    product: 'SportsBook',
    description: 'Wager Won',
    amount: 20,
    detail: {
      comment: '-',
      transactionId: '843120148',
      acceptedDate: '11/03/26 01:05 PM',
      gradedDate: '11/03/26 04:18 PM',
    },
  },
  {
    id: '843120147',
    date: '11/03/26',
    type: 'Wager (Debit)',
    product: 'Casino',
    description: 'Wager Loss',
    amount: -100,
    detail: {
      comment: '-',
      transactionId: '843120147',
      acceptedDate: '11/03/26 09:11 AM',
      gradedDate: '11/03/26 12:30 PM',
    },
  },
  {
    id: '843120146',
    date: '11/02/26',
    type: 'Wager (Credit)',
    product: 'SportsBook',
    description: 'Wager Won',
    amount: 75,
    detail: {
      comment: '-',
      transactionId: '843120146',
      acceptedDate: '11/02/26 08:45 PM',
      gradedDate: '11/02/26 11:20 PM',
    },
  },
  {
    id: '843120145',
    date: '11/02/26',
    type: 'Wager (Debit)',
    product: 'Casino',
    description: 'Wager Loss',
    amount: -10,
    detail: {
      comment: '-',
      transactionId: '843120145',
      acceptedDate: '11/02/26 02:00 PM',
      gradedDate: '11/02/26 05:12 PM',
    },
  },
  {
    id: '843120144',
    date: '11/02/26',
    type: 'Wager (Credit)',
    product: 'SportsBook',
    description: 'Wager Won',
    amount: 50,
    detail: {
      comment: '-',
      transactionId: '843120144',
      acceptedDate: '11/02/26 12:08 PM',
      gradedDate: '11/02/26 03:55 PM',
    },
  },
  {
    id: '843120143',
    date: '11/01/26',
    type: 'Wager (Debit)',
    product: 'Casino',
    description: 'Wager Loss',
    amount: -200,
    detail: {
      comment: '-',
      transactionId: '843120143',
      acceptedDate: '11/01/26 07:30 PM',
      gradedDate: '11/01/26 10:44 PM',
    },
  },
  {
    id: '843120142',
    date: '11/01/26',
    type: 'Wager (Credit)',
    product: 'SportsBook',
    description: 'Wager Won',
    amount: 45,
    detail: {
      comment: '-',
      transactionId: '843120142',
      acceptedDate: '11/01/26 04:16 PM',
      gradedDate: '11/01/26 08:02 PM',
    },
  },
  {
    id: '843120141',
    date: '10/30/26',
    type: 'Deposit',
    product: 'SportsBook',
    description: 'Deposit',
    amount: 500,
    detail: {
      comment: 'Card ending 4242',
      transactionId: '843120141',
      acceptedDate: '10/30/26 11:00 AM',
      gradedDate: '10/30/26 11:00 AM',
    },
  },
  {
    id: '843120140',
    date: '10/28/26',
    type: 'Withdrawal',
    product: 'Casino',
    description: 'Withdrawal',
    amount: -250,
    detail: {
      comment: 'Bank transfer',
      transactionId: '843120140',
      acceptedDate: '10/28/26 02:20 PM',
      gradedDate: '10/28/26 02:20 PM',
    },
  },
]
