import {
  LAST_GAME_PLAYED,
  pickRandomLobbyGame,
  type CasinoLobbyGame,
} from '@/lib/lumen/casino-lobby-catalog'
import type { ShellNavAction } from './shell-nav'

export function gameForNavAction(action: ShellNavAction): CasinoLobbyGame {
  if (action === 'launch-last-game') return LAST_GAME_PLAYED
  return pickRandomLobbyGame()
}
