'use client'

import { usePathname } from 'next/navigation'
import { casinoSkeletonForPath } from '@/components/lumen/casino-lobby-skeleton'

export default function Loading() {
  return casinoSkeletonForPath(usePathname())
}
