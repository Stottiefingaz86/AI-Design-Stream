'use client'

import { createContext, useContext, type ReactNode } from 'react'

/** Gallery preview frame — not the browser viewport. */
export type GalleryDevice = 'desktop' | 'tablet' | 'mobile'

const GalleryDeviceContext = createContext<GalleryDevice | null>(null)

export function GalleryDeviceProvider({
  device,
  children,
}: {
  device: GalleryDevice
  children: ReactNode
}) {
  return (
    <GalleryDeviceContext.Provider value={device}>{children}</GalleryDeviceContext.Provider>
  )
}

/** `null` outside `/lumen` previews — live site uses real media queries. */
export function useGalleryDevice(): GalleryDevice | null {
  return useContext(GalleryDeviceContext)
}

/** Treat tablet like mobile for chip tuck + product chips (< lg). */
export function galleryIsCompact(device: GalleryDevice | null): boolean | null {
  if (!device) return null
  return device === 'mobile' || device === 'tablet'
}
