import { CasinoWallpaperSkeleton } from '@/components/lumen/casino-lobby-skeleton'

export default function Loading() {
  return (
    <CasinoWallpaperSkeleton
      title="All Slots"
      withTop10
      top10Title="Top 10 Slots"
      withProviders
    />
  )
}
