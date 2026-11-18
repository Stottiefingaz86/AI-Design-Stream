'use client'

import { useEffect } from 'react'
import { HomepageLobby } from '@/components/lumen/homepage-lobby-page'
import { useShell } from '@/components/site/shell-context'

/**
 * Design-lane preview: real shell + VIP Hub open on Benefits.
 * Matches BRDs that say “in the vip hub … benefits tab”.
 */
export function VipBenefitsPrototypePage() {
  const { setVipHubOpen } = useShell()

  useEffect(() => {
    const t = window.setTimeout(() => {
      setVipHubOpen(true, 'Benefits')
    }, 80)
    return () => window.clearTimeout(t)
  }, [setVipHubOpen])

  return <HomepageLobby />
}
