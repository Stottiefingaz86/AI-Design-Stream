'use client'

import { PromotionsLobbyPage } from '@/components/lumen/promotions-lobby-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** Promo26_Revamp 8:16195 — promotions lobby inside the shipped shell. */
export default function Page() {
  return (
    <ShellFrame loggedIn>
      <PromotionsLobbyPage />
    </ShellFrame>
  )
}
