/** Security Central — Figma WIP OLtqQMwYLpOF0DfqMBK45a (BetOnline). */

export type TrustedDeviceKind = 'laptop' | 'phone' | 'desktop'

export type TrustedDevice = {
  id: string
  name: string
  kind: TrustedDeviceKind
  browserOs: string
  lastSeen: string
  /** When true, lastSeen renders as “Current Device” in success color. */
  isCurrent?: boolean
  location: string
  trustDate: string
}

export type SecurityRecommendation = {
  id: string
  status: 'warning' | 'success'
  message: string
  actionLabel: string
  action: 'change-password' | 'enable-2fa' | 'review-devices'
}

export const SECURITY_RECOMMENDATIONS: SecurityRecommendation[] = [
  {
    id: 'password',
    status: 'warning',
    message: 'Your current password is too weak. Set a stronger, more secure password.',
    actionLabel: 'Change',
    action: 'change-password',
  },
  {
    id: '2fa',
    status: 'warning',
    message: 'Enable 2-Factor Authentication to protect and keep your account more secure.',
    actionLabel: 'Enable',
    action: 'enable-2fa',
  },
  {
    id: 'devices',
    status: 'success',
    message: 'Manage your trusted devices that have login status and review your device history.',
    actionLabel: 'Review',
    action: 'review-devices',
  },
]

/** Demo ledger matching Figma table-trusted-devices filled samples. */
export const TRUSTED_DEVICES: TrustedDevice[] = [
  {
    id: 'd1',
    name: 'MacBook Pro',
    kind: 'laptop',
    browserOs: 'Chrome / MacOS',
    lastSeen: 'Current Device',
    isCurrent: true,
    location: 'United States',
    trustDate: '10/03/26',
  },
  {
    id: 'd2',
    name: 'iPhone 16',
    kind: 'phone',
    browserOs: 'Safari / iOS',
    lastSeen: '30 min ago',
    location: 'United States',
    trustDate: '10/02/26',
  },
  {
    id: 'd3',
    name: 'Galaxy A52',
    kind: 'phone',
    browserOs: 'Chrome / Android',
    lastSeen: '5 hours ago',
    location: 'United States',
    trustDate: '10/02/26',
  },
  {
    id: 'd4',
    name: 'Aorus Pro PC',
    kind: 'desktop',
    browserOs: 'Chrome / Windows',
    lastSeen: '20 hours ago',
    location: 'United States',
    trustDate: '09/25/26',
  },
  {
    id: 'd5',
    name: 'Aorus Pro PC',
    kind: 'desktop',
    browserOs: 'Firefox / Windows',
    lastSeen: '1 day ago',
    location: 'United States',
    trustDate: '09/25/26',
  },
  {
    id: 'd6',
    name: 'Galaxy A52',
    kind: 'phone',
    browserOs: 'Chrome / Android',
    lastSeen: '5 days ago',
    location: 'United States',
    trustDate: '09/15/26',
  },
  {
    id: 'd7',
    name: 'iPhone 16',
    kind: 'phone',
    browserOs: 'Safari / iOS',
    lastSeen: '10 days ago',
    location: 'United States',
    trustDate: '08/05/26',
  },
  {
    id: 'd8',
    name: 'Aorus Pro PC',
    kind: 'desktop',
    browserOs: 'Firefox / Windows',
    lastSeen: '15 days ago',
    location: 'United States',
    trustDate: '08/03/26',
  },
  {
    id: 'd9',
    name: 'Galaxy A52',
    kind: 'phone',
    browserOs: 'Chrome / Android',
    lastSeen: '30 days ago',
    location: 'United States',
    trustDate: '07/10/26',
  },
  {
    id: 'd10',
    name: 'iPhone 16',
    kind: 'phone',
    browserOs: 'Safari / iOS',
    lastSeen: '10/03/26',
    location: 'United States',
    trustDate: '07/03/26',
  },
]
