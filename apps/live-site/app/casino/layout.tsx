'use client'

import type { ReactNode } from 'react'
import { ShellFrame } from '@/components/site/shell-frame'

/** Shared shell so Lobby ↔ Live keeps sub-nav mounted (smooth thumb glide). */
export default function CasinoLayout({ children }: { children: ReactNode }) {
  return <ShellFrame loggedIn>{children}</ShellFrame>
}
