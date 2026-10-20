'use client'

import { useEffect, useState } from 'react'
import { JACKPOT_TIERS, type JackpotTierId } from '@/lib/lumen/casino-lobby-catalog'

type Amounts = Record<JackpotTierId, number>

function seedAmounts(): Amounts {
  return JACKPOT_TIERS.reduce((acc, tier) => {
    acc[tier.id] = tier.seedAmount
    return acc
  }, {} as Amounts)
}

/** Live rolling pots — same tick idea as BOL shadcn `tickAmounts`. */
export function useJackpotAmounts(intervalMs = 1200) {
  const [amounts, setAmounts] = useState<Amounts>(seedAmounts)

  useEffect(() => {
    const id = window.setInterval(() => {
      setAmounts((prev) => {
        const next = { ...prev }
        for (const tier of JACKPOT_TIERS) {
          const delta = tier.tickMin + Math.random() * (tier.tickMax - tier.tickMin)
          next[tier.id] = +(next[tier.id] + delta).toFixed(2)
        }
        return next
      })
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return amounts
}
