import { redirect } from 'next/navigation'

/** Legacy desk URL — Lumen gallery lives at `/lumen`. */
export default function StorybookRedirectPage() {
  redirect('/lumen')
}
