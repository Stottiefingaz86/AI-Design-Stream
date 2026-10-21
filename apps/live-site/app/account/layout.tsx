'use client'

import type { ReactNode } from 'react'
import { ShellFrame } from '@/components/site/shell-frame'

/** Account area — shared shell so section tabs stay mounted. */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return <ShellFrame loggedIn>{children}</ShellFrame>
}
