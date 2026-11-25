/**
 * Site versions — V1 is the live site (short-term goals). Later versions branch
 * from it with `useSiteVersion()` so each one can add features or rearrange
 * without touching V1. Add a row here and the Intercom Home tab lists it.
 */
export const SITE_VERSIONS = [
  { id: 'v1', label: 'V1', name: 'Current site', description: 'Short-term goals' },
  { id: 'v2', label: 'V2', name: 'Next site', description: 'Challenges, raffles and races' },
  { id: 'v3', label: 'V3', name: 'Markets', description: 'Sports plus prediction markets' },
  { id: 'v5', label: 'V5', name: 'Deploy test', description: 'Checks both repos and Vercel' },
] as const

export type SiteVersionId = (typeof SITE_VERSIONS)[number]['id']
export type SiteVersion = (typeof SITE_VERSIONS)[number]

export const DEFAULT_SITE_VERSION: SiteVersionId = 'v1'
