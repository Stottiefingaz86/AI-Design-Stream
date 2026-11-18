import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import localFont from 'next/font/local'
import { headers } from 'next/headers'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { PassGate } from '@/components/site/pass-gate'
import { SiteArrivalLoader } from '@/components/site/site-arrival-loader'
import { SiteShellRoot } from '@/components/site/site-shell-root'
import './globals.css'

/* Self-hosted — next/font/google was silently falling back to Arial when the
   Google fetch timed out in dev (3s). One variable file covers 400–900. */
const figtree = localFont({
  src: './fonts/Figtree-latin-var.woff2',
  variable: '--font-figtree',
  weight: '400 900',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BetOnline — live site (Lumen)',
  description: 'Pretend production site themed with the Lumen design system',
}

/** iOS Safari zooms focused inputs <16px and often stays zoomed — lock scale for the shell. */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const h = await headers()
  const isDesignAgent = h.get('x-design-agent') === '1'
  const isLumenGallery = h.get('x-lumen-gallery') === '1'

  /* Backoffice — no BetOnline boot loader, shell, footer, or toaster. Own desk. */
  if (isDesignAgent) {
    return (
      <html
        lang="en"
        data-design-agent-route=""
        className={figtree.variable}
        suppressHydrationWarning
      >
        <body className={figtree.className} style={{ background: '#0a0a0a', margin: 0 }}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="design-agent-theme"
          >
            <PassGate>{children}</PassGate>
          </ThemeProvider>
        </body>
      </html>
    )
  }

  /* Component library — Storybook-style gallery. Lumen tokens + ShellProvider for live demos. */
  if (isLumenGallery) {
    return (
      <html
        lang="en"
        data-brand="betonline"
        data-lumen-gallery=""
        className={figtree.variable}
        suppressHydrationWarning
      >
        <body className={figtree.className} style={{ background: '#121212', margin: 0 }}>
          <Script src="/lumen-tip.js" strategy="beforeInteractive" />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            storageKey="lumen-shell-theme-v2"
          >
            <PassGate>
              <SiteShellRoot>
                {children}
                <Toaster duration={4000} gap={14} position="bottom-right" visibleToasts={3} />
              </SiteShellRoot>
            </PassGate>
          </ThemeProvider>
        </body>
      </html>
    )
  }

  return (
    <html lang="en" data-brand="betonline" className={figtree.variable} suppressHydrationWarning>
      <body className={figtree.className}>
        {/*
          Static boot overlay — paints before React/PassGate hydrate.
          Critical layout is INLINE so it never lands in document flow above the shell.
          SiteArrivalLoader removes it after ≥ two logo loops.
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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="lumen-shell-theme-v2">
          <SiteArrivalLoader />
          <PassGate>
            <SiteShellRoot>
              {children}
              <Toaster duration={4000} gap={14} position="bottom-right" visibleToasts={3} />
            </SiteShellRoot>
          </PassGate>
        </ThemeProvider>
      </body>
    </html>
  )
}
