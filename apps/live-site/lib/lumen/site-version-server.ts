import { cookies } from 'next/headers'
import { DEFAULT_SITE_VERSION, SITE_VERSIONS, type SiteVersionId } from '@/lib/lumen/site-versions-list'

/** Cookie version for server renders — lets V3 routes SSR without a V1 flash. */
export function serverSiteVersion(): SiteVersionId {
  const value = cookies().get('lumen-site-version')?.value
  return SITE_VERSIONS.some((v) => v.id === value) ? (value as SiteVersionId) : DEFAULT_SITE_VERSION
}
