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
        {/*
          Static boot overlay — paints before React/PassGate hydrate.
          Critical layout is INLINE so it never lands in document flow above the shell.
          SiteArrivalLoader removes it after ≥ one logo loop.
        */}
        <div
          id="site-boot-loader"
          role="alertdialog"
          aria-busy="true"
          aria-label="Loading"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            /* Dark-mode page bg — don’t wait for ThemeProvider / .dark class. */
            background: '#1a1a1a',
          }}
          dangerouslySetInnerHTML={{
            __html: '<betonline-loader duration="2400" style="--loader-width:min(320px,72vw)"></betonline-loader>',
          }}
        />
        <Script src="/lumen-tip.js" strategy="beforeInteractive" />
        <Script src="/betonline-loader.js" strategy="beforeInteractive" />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="lumen-shell-theme">
          <SiteArrivalLoader />
          <PassGate>
            {children}
            <Toaster duration={4000} gap={14} position="bottom-right" visibleToasts={3} />
          </PassGate>
        </ThemeProvider>
      </body>
    </html>
  )
}
