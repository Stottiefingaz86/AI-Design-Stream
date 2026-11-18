'use client'

import { Error404Page } from '@/components/lumen/error-404-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** App Router 404 — Figma Error Frame, no SEO block. */
export default function NotFound() {
  return (
    <ShellFrame hideSeo>
      <Error404Page />
    </ShellFrame>
  )
}
