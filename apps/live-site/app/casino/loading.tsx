'use client'

import { usePathname } from 'next/navigation'
import { casinoSkeletonForPath } from '@/components/lumen/casino-lobby-skeleton'

/** Lobby only gets banner skeleton — every other casino path matches its layout. */
export default function Loading() {
  return casinoSkeletonForPath(usePathname())
}
