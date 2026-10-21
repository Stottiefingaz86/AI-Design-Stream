/** Payments — Figma WIP pLN2feuHEdp8DAjwU0h2zw (section 6232:74153 · filters Type + Date Range). */

export type PaymentType = 'Deposit' | 'Withdrawal'

export type PaymentStatus = 'Approved' | 'Pending' | 'Declined'

export type PaymentRow = {
  id: string
  date: string
  type: PaymentType
  method: string
  descriptor: string
  /** Signed total amount in dollars (positive = deposit). */
  totalAmount: number
  detail: {
    dateTime: string
    currency: string
    amount: number
    fee: number
    status: PaymentStatus
  }
}

export const PAYMENT_FILTER_TYPES = ['Deposit', 'Withdrawal'] as const

export const PAYMENT_FILTER_DATE_RANGES = [
  'Custom',
  'Last 7 days',
  'Last 15 days',
  'Last 30 days',
] as const

export type PaymentFilters = {
  type: string
  dateRange: string
  dateFrom: string
  dateTo: string
}

export const EMPTY_PAYMENT_FILTERS: PaymentFilters = {
  type: '',
  dateRange: 'Last 30 days',
  dateFrom: '',
  dateTo: '',
}

export function paymentFiltersActiveCount(filters: PaymentFilters) {
  let n = 0
  if (filters.type) n += 1
  if (filters.dateRange && filters.dateRange !== 'Last 30 days') n += 1
  if (filters.dateRange === 'Custom' && (filters.dateFrom || filters.dateTo)) n += 1
  return n
}

export function formatPaymentAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  if (amount > 0) return `+$${abs}`
  if (amount < 0) return `-$${abs}`
  return `$${abs}`
}

export function formatMoney(amount: number) {
  return `$${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Positive totals use success badge; debits use muted secondary pill. */
export function paymentAmountStyle(amount: number): {
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

export function paymentStatusStyle(status: PaymentStatus): {
  backgroundColor: string
  borderColor: string
  color: string
} {
  if (status === 'Approved') {
    return {
      backgroundColor: 'var(--opacity-success-10)',
      borderColor: 'var(--opacity-success-60)',
      color: 'var(--success)',
    }
  }
  if (status === 'Declined') {
    return {
      backgroundColor: 'var(--destructive)',
      borderColor: 'var(--destructive)',
      color: 'var(--destructive-foreground)',
    }
  }
  return {
    backgroundColor: 'var(--secondary)',
    borderColor: 'var(--border)',
    color: 'var(--secondary-foreground)',
  }
}

export function filterPaymentRows(rows: PaymentRow[], filters: PaymentFilters) {
  return rows.filter((row) => {
    if (filters.type && row.type !== filters.type) return false
    return true
  })
}

/** Demo ledger matching Figma table-payments samples. */
export const PAYMENT_ROWS: PaymentRow[] = [
  {
    id: '71704595',
    date: '11/05/26',
    type: 'Withdrawal',
    method: 'Bitcoin (BTC)',
    descriptor: '-',
    totalAmount: -50,
    detail: {
      dateTime: '11/05/26 6:40 PM GMT-3',
      currency: 'USD',
      amount: 50,
      fee: 0,
      status: 'Approved',
    },
  },
  {
    id: '71704594',
    date: '11/05/26',
    type: 'Deposit',
    method: 'Credit Card',
    descriptor: 'TSW*Detail',
    totalAmount: 100,
    detail: {
      dateTime: '11/05/26 7:15 PM GMT-3',
      currency: 'USD',
      amount: 100,
      fee: 4,
      status: 'Approved',
    },
  },
  {
    id: '71704593',
    date: '11/04/26',
    type: 'Withdrawal',
    method: 'Litecoin (LTC)',
    descriptor: '-',
    totalAmount: -25,
    detail: {
      dateTime: '11/04/26 3:22 PM GMT-3',
      currency: 'USD',
      amount: 25,
      fee: 0,
      status: 'Approved',
    },
  },
  {
    id: '71704592',
    date: '11/03/26',
    type: 'Deposit',
    method: 'Credit Card',
    descriptor: 'RKL*Detail',
    totalAmount: 200,
    detail: {
      dateTime: '11/03/26 1:05 PM GMT-3',
      currency: 'USD',
      amount: 200,
      fee: 4,
      status: 'Approved',
    },
  },
  {
    id: '71704591',
    date: '11/03/26',
    type: 'Withdrawal',
    method: 'Bitcoin (BTC)',
    descriptor: '-',
    totalAmount: -50,
    detail: {
      dateTime: '11/03/26 9:11 AM GMT-3',
      currency: 'USD',
      amount: 50,
      fee: 0,
      status: 'Approved',
    },
  },
  {
    id: '71704590',
    date: '11/02/26',
    type: 'Deposit',
    method: 'Credit Card',
    descriptor: 'SAS*Detail',
    totalAmount: 300,
    detail: {
      dateTime: '11/02/26 8:45 PM GMT-3',
      currency: 'USD',
      amount: 300,
      fee: 4,
      status: 'Approved',
    },
  },
  {
    id: '71704589',
    date: '11/02/26',
    type: 'Withdrawal',
    method: 'Tether (USDT)',
    descriptor: '-',
    totalAmount: -150,
    detail: {
      dateTime: '11/02/26 2:00 PM GMT-3',
      currency: 'USD',
      amount: 150,
      fee: 0,
      status: 'Approved',
    },
  },
  {
    id: '71704588',
    date: '11/02/26',
    type: 'Deposit',
    method: 'Credit Card',
    descriptor: 'VFT*Detail',
    totalAmount: 50,
    detail: {
      dateTime: '11/02/26 12:08 PM GMT-3',
      currency: 'USD',
      amount: 50,
      fee: 4,
      status: 'Approved',
    },
  },
  {
    id: '71704587',
    date: '11/01/26',
    type: 'Withdrawal',
    method: 'Bitcoin (BTC)',
    descriptor: '-',
    totalAmount: -25,
    detail: {
      dateTime: '11/01/26 7:30 PM GMT-3',
      currency: 'USD',
      amount: 25,
      fee: 0,
      status: 'Approved',
    },
  },
  {
    id: '71704586',
    date: '11/01/26',
    type: 'Deposit',
    method: 'Credit Card',
    descriptor: 'RQW*Detail',
    totalAmount: 100,
    detail: {
      dateTime: '11/01/26 4:16 PM GMT-3',
      currency: 'USD',
      amount: 100,
      fee: 4,
      status: 'Approved',
    },
  },
]
