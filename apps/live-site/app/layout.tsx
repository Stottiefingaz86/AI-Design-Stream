import type { Metadata } from 'next'
import Script from 'next/script'
import { Figtree } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { PassGate } from '@/components/site/pass-gate'
import { SiteArrivalLoader } from '@/components/site/site-arrival-loader'
import './globals.css'

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  /* 700/800 for lobby promo banner titles */
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BetOnline — live site (Lumen)',
  description: 'Pretend production site themed with the Lumen design system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-brand="betonline" className={figtree.variable} suppressHydrationWarning>
      <body className={figtree.className}>
        <Script src="/lumen-tip.js" strategy="beforeInteractive" />
        <Script src="/betonline-loader.js" strategy="beforeInteractive" />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="lumen-shell-theme">
          <PassGate>
            <SiteArrivalLoader />
            {children}
            <Toaster duration={4000} gap={14} position="bottom-right" visibleToasts={3} />
          </PassGate>
        </ThemeProvider>
      </body>
    </html>
  )
}
