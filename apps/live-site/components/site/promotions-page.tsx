'use client'

import { PromotionsLobbyPage } from '@/components/lumen/promotions-lobby-page'
import { ShellFrame } from './shell-frame'

/** Live promotions — Promo26_Revamp 8:16195. Prefer app/promotions/page.tsx. */
export function PromotionsPage() {
  return (
    <ShellFrame loggedIn>
      <PromotionsLobbyPage />
    </ShellFrame>
  )
}
