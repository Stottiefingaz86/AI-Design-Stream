'use client'

import { notFound, useParams } from 'next/navigation'
import { CasinoWallpaperPage } from '@/components/lumen/casino-wallpaper-page'
import { getCategoryWallpaper } from '@/lib/lumen/casino-wallpaper'

/** Category wallpaper — Megaways, Staff Picks, Exclusive, New, etc. */
export default function Page() {
  const params = useParams<{ slug: string }>()
  const slug = typeof params.slug === 'string' ? params.slug : ''
  const config = getCategoryWallpaper(slug)
  if (!config) notFound()

  return <CasinoWallpaperPage config={config} fallbackHref="/casino" />
}
