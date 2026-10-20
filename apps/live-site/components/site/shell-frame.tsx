'use client'

import type { ReactNode } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ShellContent } from './shell-content'
import { useShell, ShellProvider } from './shell-context'
import { ShellSeo } from './shell-seo'
import { ShellDrawer } from './shell-drawer'
import { ShellSidebar } from './shell-sidebar'
import { SiteFooter } from './site-footer'
import { CashierSheet } from './cashier-sheet'
import { UbcSheet } from './shell-ubc'
import { ShellMobileNav } from './shell-mobile-nav'
import { CasinoLobbySkeleton } from '@/components/lumen/casino-lobby-skeleton'
import { CasinoSearchOverlay } from '@/components/lumen/casino-search-overlay'
import { GameLauncher } from '@/components/lumen/game-launcher'
import { CasinoSubNav } from './casino-subnav'
import { ShellHeader } from './shell-header'
import { cn } from '@/lib/utils'

/**
 * Figma 🐚 Shell — casino / sports / poker / promotions
 * Viewport-locked chrome: header stays put, page scrolls under it,
 * footer stays at the end of the page (and docks to the bottom on short pages).
 */
export function ShellFrame({
  children,
  loggedIn = true,
  skeleton = false,
}: {
  children?: ReactNode
  loggedIn?: boolean
  skeleton?: boolean
}) {
  return (
    <ShellProvider loggedIn={loggedIn} forceSkeleton={skeleton}>
      <TooltipProvider delayDuration={0}>
        <ShellChrome>{children}</ShellChrome>
      </TooltipProvider>
    </ShellProvider>
  )
}

function ShellChrome({ children }: { children?: ReactNode }) {
  const {
    expanded,
    drawerOpen,
    setDrawerOpen,
    cashierOpen,
    setCashierOpen,
    product,
    navigating,
    casinoSearchOpen,
    setCasinoSearchOpen,
    launchedGame,
    closeGameLauncher,
  } = useShell()

  return (
    <div
      data-name="Product Page"
      className="fixed inset-0 flex flex-col overflow-hidden bg-background font-sans text-foreground"
    >
      <ShellSidebar />
      <ShellDrawer />
      <div
        data-shell-column=""
        className={cn(
          'flex h-full min-h-0 min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-in-out lg:pl-24',
          expanded && 'lg:pl-64'
        )}
      >
        {/* Header (chips + bar) outside scroll — chips hide/show without sticky flicker. */}
        <ShellHeader />
        <div id="shell-scroll" className="shell-scroll h-0 min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          {/* Large screens: content column max 1440, centered in the shell (header stays full-bleed). */}
          <div className="mx-auto flex min-h-full w-full max-w-[1440px] flex-col">
            <div className="flex-1 pb-24 lg:pb-0">
              {product === 'casino' ? <CasinoSubNav glass sticky motion /> : null}
              {product === 'casino' && navigating ? <CasinoLobbySkeleton /> : (children ?? <ShellContent />)}
              {/* Never flash SEO under the sub-nav while the page body is empty/loading. */}
              {!navigating ? <ShellSeo /> : null}
            </div>
            <SiteFooter />
          </div>
        </div>
      </div>
      <ShellMobileNav />
      <CashierSheet open={cashierOpen} onClose={() => setCashierOpen(false)} />
      <UbcSheet open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {product === 'casino' ? (
        <CasinoSearchOverlay open={casinoSearchOpen} onClose={() => setCasinoSearchOpen(false)} />
      ) : null}
      {product === 'casino' ? (
        <GameLauncher open={!!launchedGame} game={launchedGame} onClose={closeGameLauncher} />
      ) : null}
    </div>
  )
}
