import { findNflEvent } from '@/lib/lumen/nfl-sport'
import { findSoccerEvent } from '@/lib/lumen/soccer-event'

export type SlipLiveMeta = {
  clock: string
  /** Away–home for NFL (@), home–away for soccer (vs). */
  score: string
  line: string
}

/** Live clock + score for a slip pick, resolved from the event seed. */
export function slipLiveMeta(pick: {
  eventId?: string
  sport?: 'soccer' | 'nfl'
  live?: boolean
}): SlipLiveMeta | null {
  if (!pick.live || !pick.eventId) return null
  if (pick.sport === 'nfl') {
    const found = findNflEvent(pick.eventId)
    const e = found?.event
    if (!e?.live || !e.score) return null
    const [home, away] = e.score
    const score = `${away}–${home}`
    return { clock: e.when, score, line: `${e.when} · ${score}` }
  }
  const found = findSoccerEvent(pick.eventId)
  const e = found?.event
  if (!e?.live || !e.score) return null
  const score = `${e.score[0]}–${e.score[1]}`
  return { clock: e.when, score, line: `${e.when} · ${score}` }
}
