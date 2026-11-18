import { useSyncExternalStore } from 'react'
import type { SoccerSlipPick } from '@/components/lumen/soccer-betslip'

/** Soccer betslip legs shared by the board and the event view (survives soft-nav + reload). */
const STORAGE_KEY = 'lumen-soccer-slip'
const EMPTY: SoccerSlipPick[] = []

let picks: SoccerSlipPick[] = EMPTY
let hydrated = false
/** Bumps only when a player adds a leg — never on hydrate / soft-nav remount. */
let addTick = 0
const listeners = new Set<() => void>()

function hydrate() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as SoccerSlipPick[]) : null
    if (Array.isArray(parsed)) picks = parsed
  } catch {
    picks = EMPTY
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function getSnapshot() {
  hydrate()
  return picks
}

function getServerSnapshot() {
  return EMPTY
}

export function setSoccerSlip(
  next: SoccerSlipPick[] | ((prev: SoccerSlipPick[]) => SoccerSlipPick[]),
) {
  hydrate()
  const before = picks.length
  picks = typeof next === 'function' ? next(picks) : next
  if (picks.length > before) addTick += 1
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(picks))
  } catch {
    /* private mode — keep in memory */
  }
  listeners.forEach((fn) => fn())
}

export function getSlipAddTick(): number {
  return addTick
}

export function useSlipAddTick(): number {
  return useSyncExternalStore(
    subscribe,
    () => addTick,
    () => 0,
  )
}

export function useSoccerSlip(): SoccerSlipPick[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/**
 * Betslip rule: one selection per market per event. A newer pick in the same market replaces the
 * existing leg in place (e.g. Spread -1 (-110) → -2 (-115) leaves only -2 (-115)); otherwise it's added on top.
 */
export function withOneLegPerMarket(
  prev: SoccerSlipPick[],
  next: SoccerSlipPick,
): SoccerSlipPick[] {
  const sameMarket = (p: SoccerSlipPick) =>
    p.eventLabel === next.eventLabel && p.market === next.market
  const at = prev.findIndex(sameMarket)
  if (at === -1) return [next, ...prev]
  return prev.map((p, i) => (i === at ? next : p)).filter((p, i) => i === at || !sameMarket(p))
}
