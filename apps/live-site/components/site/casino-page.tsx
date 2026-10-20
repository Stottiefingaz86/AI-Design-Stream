'use client'

import { CasinoLobby } from '@/components/lumen/casino-lobby-page'

/** Live casino lobby — Casino-Lumen 69:47911. ShellFrame owns sub-nav + SEO. */
export function CasinoLobbyPage() {
  return <CasinoLobby />
}

/** @deprecated Use ShellFrame + CasinoLobby on the live route. */
export function CasinoPage() {
  return <CasinoLobby />
}

export { CasinoLobby }
