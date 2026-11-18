/** Dial codes for auth SMS — ISO 3166-1 alpha-2 + E.164 prefix. */

export type DialCountry = {
  iso: string
  name: string
  dial: string
}

export const DIAL_COUNTRIES: DialCountry[] = [
  { iso: 'US', name: 'United States', dial: '+1' },
  { iso: 'CA', name: 'Canada', dial: '+1' },
  { iso: 'GB', name: 'United Kingdom', dial: '+44' },
  { iso: 'IE', name: 'Ireland', dial: '+353' },
  { iso: 'AU', name: 'Australia', dial: '+61' },
  { iso: 'NZ', name: 'New Zealand', dial: '+64' },
  { iso: 'MX', name: 'Mexico', dial: '+52' },
  { iso: 'BR', name: 'Brazil', dial: '+55' },
  { iso: 'AR', name: 'Argentina', dial: '+54' },
  { iso: 'CL', name: 'Chile', dial: '+56' },
  { iso: 'CO', name: 'Colombia', dial: '+57' },
  { iso: 'PE', name: 'Peru', dial: '+51' },
  { iso: 'DE', name: 'Germany', dial: '+49' },
  { iso: 'FR', name: 'France', dial: '+33' },
  { iso: 'ES', name: 'Spain', dial: '+34' },
  { iso: 'IT', name: 'Italy', dial: '+39' },
  { iso: 'PT', name: 'Portugal', dial: '+351' },
  { iso: 'NL', name: 'Netherlands', dial: '+31' },
  { iso: 'BE', name: 'Belgium', dial: '+32' },
  { iso: 'AT', name: 'Austria', dial: '+43' },
  { iso: 'CH', name: 'Switzerland', dial: '+41' },
  { iso: 'SE', name: 'Sweden', dial: '+46' },
  { iso: 'NO', name: 'Norway', dial: '+47' },
  { iso: 'DK', name: 'Denmark', dial: '+45' },
  { iso: 'FI', name: 'Finland', dial: '+358' },
  { iso: 'PL', name: 'Poland', dial: '+48' },
  { iso: 'CZ', name: 'Czechia', dial: '+420' },
  { iso: 'RO', name: 'Romania', dial: '+40' },
  { iso: 'HU', name: 'Hungary', dial: '+36' },
  { iso: 'GR', name: 'Greece', dial: '+30' },
  { iso: 'TR', name: 'Türkiye', dial: '+90' },
  { iso: 'UA', name: 'Ukraine', dial: '+380' },
  { iso: 'RU', name: 'Russia', dial: '+7' },
  { iso: 'IN', name: 'India', dial: '+91' },
  { iso: 'PK', name: 'Pakistan', dial: '+92' },
  { iso: 'BD', name: 'Bangladesh', dial: '+880' },
  { iso: 'PH', name: 'Philippines', dial: '+63' },
  { iso: 'VN', name: 'Vietnam', dial: '+84' },
  { iso: 'TH', name: 'Thailand', dial: '+66' },
  { iso: 'MY', name: 'Malaysia', dial: '+60' },
  { iso: 'SG', name: 'Singapore', dial: '+65' },
  { iso: 'ID', name: 'Indonesia', dial: '+62' },
  { iso: 'JP', name: 'Japan', dial: '+81' },
  { iso: 'KR', name: 'South Korea', dial: '+82' },
  { iso: 'CN', name: 'China', dial: '+86' },
  { iso: 'HK', name: 'Hong Kong', dial: '+852' },
  { iso: 'TW', name: 'Taiwan', dial: '+886' },
  { iso: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { iso: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { iso: 'IL', name: 'Israel', dial: '+972' },
  { iso: 'ZA', name: 'South Africa', dial: '+27' },
  { iso: 'NG', name: 'Nigeria', dial: '+234' },
  { iso: 'KE', name: 'Kenya', dial: '+254' },
  { iso: 'EG', name: 'Egypt', dial: '+20' },
  { iso: 'GH', name: 'Ghana', dial: '+233' },
  { iso: 'JM', name: 'Jamaica', dial: '+1' },
  { iso: 'TT', name: 'Trinidad and Tobago', dial: '+1' },
  { iso: 'CR', name: 'Costa Rica', dial: '+506' },
  { iso: 'PA', name: 'Panama', dial: '+507' },
  { iso: 'DO', name: 'Dominican Republic', dial: '+1' },
  { iso: 'PR', name: 'Puerto Rico', dial: '+1' },
]

const BY_ISO = new Map(DIAL_COUNTRIES.map((c) => [c.iso, c]))

export const DEFAULT_DIAL_COUNTRY = 'US'

export function getDialCountry(iso: string): DialCountry {
  return BY_ISO.get(iso.toUpperCase()) ?? BY_ISO.get(DEFAULT_DIAL_COUNTRY)!
}

/** Regional-indicator flag emoji from ISO alpha-2. */
export function flagEmoji(iso: string): string {
  const code = iso.trim().toUpperCase()
  if (code.length !== 2) return '🏳️'
  return String.fromCodePoint(
    ...[...code].map((ch) => 127397 + ch.charCodeAt(0)),
  )
}

export function resolveDialCountryIso(raw: string | null | undefined): string {
  const iso = (raw ?? '').trim().toUpperCase()
  if (!iso || iso === 'XX' || iso === 'T1') return DEFAULT_DIAL_COUNTRY
  return BY_ISO.has(iso) ? iso : DEFAULT_DIAL_COUNTRY
}

/** National digits only — strip dial prefix if the user pasted a full number. */
export function normalizeNationalNumber(raw: string, dial: string): string {
  let digits = raw.replace(/\D/g, '')
  const dialDigits = dial.replace(/\D/g, '')
  if (digits.startsWith(dialDigits) && digits.length > dialDigits.length + 3) {
    digits = digits.slice(dialDigits.length)
  }
  return digits.slice(0, 15)
}

export function formatE164(dial: string, national: string): string {
  const n = national.replace(/\D/g, '')
  if (!n) return dial
  return `${dial} ${n}`
}
