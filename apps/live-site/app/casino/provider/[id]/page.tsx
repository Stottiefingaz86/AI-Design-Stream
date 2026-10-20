'use client'

import { notFound, useParams } from 'next/navigation'
import { CasinoWallpaperPage } from '@/components/lumen/casino-wallpaper-page'
import { getProviderWallpaper } from '@/lib/lumen/casino-wallpaper'

/** Provider wallpaper — BetSoft, VIG, Originals, etc. */
export default function Page() {
  const params = useParams<{ id: string }>()
  const id = typeof params.id === 'string' ? params.id : ''
  const config = getProviderWallpaper(id)
  if (!config) notFound()

  return <CasinoWallpaperPage config={config} fallbackHref="/casino" />
}
