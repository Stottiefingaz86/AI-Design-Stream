/**
 * Event Back returns to the last sports list page the player was on
 * (Sports Home, soccer, football, My Bets) — not always the sport lobby.
 */
const KEY = 'lumen-sports-return'

export function isSportsEventPath(path: string): boolean {
  return /\/sports\/(?:soccer|football)\/event\//.test(path)
}

export function rememberSportsReturn(pathname: string) {
  if (typeof window === 'undefined') return
  const path = (pathname.split('?')[0] ?? '').replace(/\/$/, '') || '/'
  if (!path.startsWith('/sports')) return
  if (isSportsEventPath(path)) return
  try {
    window.sessionStorage.setItem(KEY, path === '/sports' ? '/sports' : path)
  } catch {
    /* private mode */
  }
}

export function sportsReturnHref(fallback: string): string {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return fallback
    const path = (raw.split('?')[0] ?? '').replace(/\/$/, '') || '/'
    if (!path.startsWith('/sports') || isSportsEventPath(path)) return fallback
    return path === '/sports' ? '/sports' : path
  } catch {
    return fallback
  }
}
