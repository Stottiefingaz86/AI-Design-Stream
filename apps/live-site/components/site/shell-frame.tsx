'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ShellContent } from './shell-content'
import { useShell, ShellProvider } from './shell-context'
import { ShellSeo } from './shell-seo'
import { ShellDrawer } from './shell-drawer'
import { ShellSidebar } from './shell-sidebar'
import { SiteFooter } from './site-footer'
import { CashierSheet } from './cashier-sheet'
import { UbcSheet } from './shell-ubc'
import { VipHubSheet } from './vip-hub-sheet'
import { VipClaimToastHost } from '@/components/lumen/vip-claim-toast'
import { ShellMobileNav } from './shell-mobile-nav'
import { CasinoLobbySkeleton } from '@/components/lumen/casino-lobby-skeleton'
import { HomepageLobbySkeleton } from '@/components/lumen/homepage-lobby-skeleton'
import { PokerLandingSkeleton } from '@/components/lumen/poker-landing-skeleton'
import { ContestsLobbySkeleton } from '@/components/lumen/contests-lobby-skeleton'
import { MyBonusSkeleton } from '@/components/lumen/my-bonus-skeleton'
import { MyAccountSkeleton } from '@/components/lumen/my-account-skeleton'
import { BetHistorySkeleton } from '@/components/lumen/bet-history-skeleton'
import { PromotionsLobbySkeleton } from '@/components/lumen/promotions-lobby-skeleton'
import { CasinoSearchOverlay } from '@/components/lumen/casino-search-overlay'
import { GameLauncher } from '@/components/lumen/game-launcher'
import { CasinoSubNav } from './casino-subnav'
import { AccountSubNav } from './account-subnav'
import { ShellHeader } from './shell-header'
import { ShellProductChips } from './shell-product-chips'
import { isAccountPath } from './shell-nav'
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
  const pathname = usePathname()
  const {
    expanded,
    drawerOpen,
    setDrawerOpen,
    cashierOpen,
    setCashierOpen,
    vipHubOpen,
    setVipHubOpen,
    product,
    navigating,
    casinoSearchOpen,
    setCasinoSearchOpen,
    launchedGame,
    closeGameLauncher,
  } = useShell()

  /** Homepage_SHADCN — full-bleed content, no left rail (Figma). */
  const isHome = pathname === '/'

  return (
    <div
      data-name="Product Page"
      className="fixed inset-0 flex flex-col overflow-hidden bg-background font-sans text-foreground"
    >
      {isHome ? null : <ShellSidebar />}
      <ShellDrawer />
      <div
        data-shell-column=""
        className={cn(
          'flex h-full min-h-0 min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-in-out',
          !isHome && 'lg:pl-24',
          !isHome && expanded && 'lg:pl-64',
        )}
      >
        {/*
          Scroll phases:
          1) Quick-links (chips) sit in flow — first scroll pushes them away (no snap).
          2) Header + sub-nav stick together; only then does content frost under glass.
        */}
        <div id="shell-scroll" className="shell-scroll h-0 min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <ShellProductChips />
          {/* Above in-page z-50+ (e.g. VIP carousel CTA) so scroll content can’t paint over the header. */}
          <div data-shell-sticky-chrome="" className="sticky top-0 z-[70]">
            <ShellHeader />
            {pathname.startsWith('/casino') ? <CasinoSubNav glass sticky={false} motion /> : null}
            {isAccountPath(pathname) ? <AccountSubNav /> : null}
          </div>
          {/* Full-width column so footer bg bleeds edge-to-edge; page body stays max 1440. */}
          <div className="flex min-h-full w-full flex-col">
            <div className="mx-auto w-full max-w-[1440px] flex-1 pb-24 lg:pb-0">
              {navigating ? (
                isAccountPath(pathname) ? (
                  pathname.startsWith('/account/bet-history') ? (
                    <BetHistorySkeleton />
                  ) : (
                    <MyAccountSkeleton />
                  )
                ) : product === 'poker' ? (
                  <PokerLandingSkeleton />
                ) : product === 'promotions' ? (
                  pathname.startsWith('/promotions/my-bonus') ? (
                    <MyBonusSkeleton />
                  ) : pathname.startsWith('/promotions/contest') ? (
                    <ContestsLobbySkeleton />
                  ) : (
                    <PromotionsLobbySkeleton />
                  )
                ) : pathname === '/' ? (
                  <HomepageLobbySkeleton />
                ) : product === 'casino' ? (
                  <CasinoLobbySkeleton />
                ) : (
                  children ?? <ShellContent />
                )
              ) : (
                children ?? <ShellContent />
              )}
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
      <VipHubSheet open={vipHubOpen} onClose={() => setVipHubOpen(false)} />
      <VipClaimToastHost />
      {product === 'casino' ? (
        <CasinoSearchOverlay open={casinoSearchOpen} onClose={() => setCasinoSearchOpen(false)} />
      ) : null}
      {product === 'casino' || product === 'promotions' ? (
        <GameLauncher open={!!launchedGame} game={launchedGame} onClose={closeGameLauncher} />
      ) : null}
    </div>
  )
}
