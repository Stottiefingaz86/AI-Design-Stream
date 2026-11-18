'use client'

import { useEffect, useRef, useState } from 'react'
import { useShell } from '@/components/site/shell-context'
import {
  VIP_TIER_LABEL,
  VIP_TIER_NEXT,
  type VipTierId,
} from '@/lib/lumen/vip-hub'

export type VipCeremonyPhase = 'idle' | 'fill' | 'swap' | 'reset'

/**
 * Local ceremony for VIP progress widgets. Plays whenever `vipLevelUpSeq`
 * advances — including hub open after level-up while closed.
 */
export function useVipLevelUpCeremony() {
  const {
    vipTier,
    vipProgressPercent,
    vipProgressUpdatedLabel,
    vipLevelUpSeq,
  } = useShell()

  const [displayTier, setDisplayTier] = useState<VipTierId>(vipTier)
  const [displayPercent, setDisplayPercent] = useState(vipProgressPercent)
  const [phase, setPhase] = useState<VipCeremonyPhase>('idle')
  const playedSeq = useRef(0)
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  useEffect(() => () => clearTimers(), [])

  /* Keep in sync when not celebrating. */
  useEffect(() => {
    if (phase !== 'idle') return
    setDisplayTier(vipTier)
    setDisplayPercent(vipProgressPercent)
  }, [vipTier, vipProgressPercent, phase])

  useEffect(() => {
    if (vipLevelUpSeq <= 0 || vipLevelUpSeq <= playedSeq.current) return
    playedSeq.current = vipLevelUpSeq
    clearTimers()

    const from: VipTierId = 'bronze'
    const to: VipTierId = 'silver'

    setPhase('fill')
    setDisplayTier(from)
    setDisplayPercent(100)

    const t1 = window.setTimeout(() => {
      setPhase('swap')
    }, 420)
    const t2 = window.setTimeout(() => {
      setDisplayTier(to)
      setPhase('reset')
      setDisplayPercent(0)
    }, 900)
    const t3 = window.setTimeout(() => {
      /* Idle sync effect pulls live shell tier/percent — don’t hard-pin 0. */
      setPhase('idle')
    }, 1400)

    timers.current = [t1, t2, t3]
  }, [vipLevelUpSeq, vipTier])

  const nextTier = VIP_TIER_NEXT[displayTier]
  const levelLabel = `${VIP_TIER_LABEL[displayTier]} to ${VIP_TIER_LABEL[nextTier]}`
  const crownTone: 'bronze' | 'silver' =
    displayTier === 'bronze' ? 'bronze' : 'silver'
  const barTone: 'bronze' | 'silver' =
    displayTier === 'bronze' ? 'bronze' : 'silver'
  const celebrating = phase !== 'idle'

  return {
    displayPercent: celebrating ? displayPercent : vipProgressPercent,
    levelLabel,
    crownTone,
    barTone,
    phase,
    celebrating,
    updatedLabel: vipProgressUpdatedLabel,
    fromLabel: VIP_TIER_LABEL[displayTier],
    toLabel: VIP_TIER_LABEL[nextTier],
  }
}
