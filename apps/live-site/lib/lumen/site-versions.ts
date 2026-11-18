import { useSyncExternalStore } from 'react'

/**
 * Site versions — V1 is the live site (short-term goals). Later versions branch
 * from it with `useSiteVersion()` so each one can add features or rearrange
 * without touching V1. Add a row here and the Intercom Home tab lists it.
 */
export const SITE_VERSIONS = [
  { id: 'v1', label: 'V1', name: 'Current site', description: 'Short-term goals' },
  { id: 'v2', label: 'V2', name: 'Next site', description: 'Challenges, raffles and races' },
] as const

export type SiteVersionId = (typeof SITE_VERSIONS)[number]['id']
export type SiteVersion = (typeof SITE_VERSIONS)[number]

export const DEFAULT_SITE_VERSION: SiteVersionId = 'v1'

const COOKIE = 'lumen-site-version'
const ONE_YEAR_S = 60 * 60 * 24 * 365

function isVersionId(value: string | null | undefined): value is SiteVersionId {
  return SITE_VERSIONS.some((v) => v.id === value)
}

function readCookie(): SiteVersionId {
  if (typeof document === 'undefined') return DEFAULT_SITE_VERSION
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`))
  const value = match ? decodeURIComponent(match[1]) : null
  return isVersionId(value) ? value : DEFAULT_SITE_VERSION
}

type Listener = () => void
const listeners = new Set<Listener>()
let current: SiteVersionId | null = null

function get(): SiteVersionId {
  if (current === null) current = readCookie()
  return current
}

export function setSiteVersion(id: SiteVersionId) {
  current = id
  document.cookie = `${COOKIE}=${id}; path=/; max-age=${ONE_YEAR_S}; samesite=lax`
  document.documentElement.dataset.siteVersion = id
  listeners.forEach((l) => l())
}

/** Saves the version and reloads so the whole site boots in it. */
export function switchSiteVersion(id: SiteVersionId) {
  setSiteVersion(id)
  const url = new URL(window.location.href)
  url.searchParams.delete('v')
  window.location.replace(url.toString())
}

/** `?v=v2` (or `?v=2`) opens the site on that version — shareable review links. */
export function applySiteVersionFromUrl() {
  const raw = new URLSearchParams(window.location.search).get('v')
  const id = raw && /^\d+$/.test(raw) ? `v${raw}` : raw
  if (isVersionId(id) && id !== get()) setSiteVersion(id)
  else document.documentElement.dataset.siteVersion = get()
}

function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useSiteVersion(): SiteVersionId {
  return useSyncExternalStore(subscribe, get, () => DEFAULT_SITE_VERSION)
}

export function getSiteVersion(id: SiteVersionId): SiteVersion {
  return SITE_VERSIONS.find((v) => v.id === id) ?? SITE_VERSIONS[0]
}
