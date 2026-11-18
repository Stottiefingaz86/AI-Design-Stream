'use client'

import type { ReactNode } from 'react'
import { ShellProvider } from './shell-context'
import { VipLevelUpModal } from './vip-level-up-modal'

/**
 * One ShellProvider for the whole live site — survives soft-nav between
 * `/`, `/casino`, `/sports`, account, etc. Without this, each ShellFrame
 * remounted a fresh provider and wiped login/profile on every route change.
 * Level-up modal lives here so route chrome remounts can’t swallow it.
 */
export function SiteShellRoot({ children }: { children: ReactNode }) {
  return (
    <ShellProvider>
      {children}
      <VipLevelUpModal />
    </ShellProvider>
  )
}
