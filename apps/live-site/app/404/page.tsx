'use client'

import { Error404Page } from '@/components/lumen/error-404-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** Preview route — open `/404` on the live site while we iterate. */
export default function Page() {
  return (
    <ShellFrame hideSeo>
      <Error404Page />
    </ShellFrame>
  )
}
