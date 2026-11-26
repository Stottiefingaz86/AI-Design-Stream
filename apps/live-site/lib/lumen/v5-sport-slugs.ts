import type { V5SportId } from '@/lib/lumen/v5-sportsbook'

/** URL segment → V5 sport (kept tiny so route files stay server-light). Football and Soccer have their own routes. */
export const V5_SPORT_SLUGS: Record<string, V5SportId> = {
  basketball: 'basketball',
  baseball: 'baseball',
  hockey: 'hockey',
  tennis: 'tennis',
  mma: 'mma',
  boxing: 'boxing',
  golf: 'golf',
  'horse-racing': 'horse-racing',
  lacrosse: 'lacrosse',
  pool: 'pool',
  rugby: 'rugby',
  'table-tennis': 'table-tennis',
  volleyball: 'volleyball',
}
