'use client';

import { useEffect, type ReactNode } from 'react';
import { PathnameProvider } from 'next/navigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CashierSheet } from '../../../../apps/live-site/components/site/cashier-sheet';
import { ShellProvider, useShell } from '../../../../apps/live-site/components/site/shell-context';
import { ShellHeader } from '../../../../apps/live-site/components/site/shell-header';
import { ShellSidebar } from '../../../../apps/live-site/components/site/shell-sidebar';
import { UbcSheet } from '../../../../apps/live-site/components/site/shell-ubc';
import { CasinoLobby } from '@/components/lumen/casino-lobby-page';
import { CasinoBannerSkeleton, CasinoOriginalsShelfSkeleton } from '@/components/lumen/casino-lobby-skeleton';
import { CasinoSearchOverlay } from '../../../../apps/live-site/components/lumen/casino-search-overlay';
import { CasinoSubNav, type CasinoSubNavOptions } from './CasinoSubNav';

/**
 * Casino-Lumen Product Page — live-site header-brand + collapsed 96px sidebar
 * + Figma sub-menu. Same chrome as the shipped shell. Live stays locked.
 */
export function CasinoProductShell({
  banner,
  belowBanners,
  lab,
  subNav,
}: {
  title?: string;
  banner?: ReactNode;
  /** Lobby content under the banner row (testing ground only until approved). */
  belowBanners?: ReactNode;
  lab?: ReactNode;
  subNav?: CasinoSubNavOptions;
}) {
  useEffect(() => {
    document.documentElement.dataset.brand = 'betonline';
    try {
      window.localStorage.setItem('lumen-shell-sidebar-expanded', '0');
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <PathnameProvider pathname="/casino">
      <ShellProvider loggedIn>
        <TooltipProvider delayDuration={0}>
          <CasinoProductChrome banner={banner} belowBanners={belowBanners} lab={lab} subNav={subNav} />
        </TooltipProvider>
      </ShellProvider>
    </PathnameProvider>
  );
}

function CasinoProductChrome({
  banner,
  belowBanners,
  lab,
  subNav,
}: {
  banner?: ReactNode;
  belowBanners?: ReactNode;
  lab?: ReactNode;
  subNav?: CasinoSubNavOptions;
}) {
  const {
    navigating,
    drawerOpen,
    setDrawerOpen,
    cashierOpen,
    setCashierOpen,
    casinoSearchOpen,
    setCasinoSearchOpen,
  } = useShell();

  return (
    <div
      data-name="Product Page"
      className="fixed inset-0 flex flex-col overflow-hidden bg-background font-sans text-foreground [&_aside[data-name=sidebar-container]]:!w-24"
    >
      {banner}
      <ShellSidebar />
      <div
        data-shell-column=""
        className="flex h-full min-h-0 min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-in-out lg:pl-24"
      >
        <ShellHeader />
        <div id="shell-scroll" className="shell-scroll h-0 min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          {navigating ? (
            <div className="w-full py-4">
              <CasinoBannerSkeleton />
              <CasinoOriginalsShelfSkeleton />
            </div>
          ) : (
            <>
              <CasinoSubNav glass sticky {...subNav} />
              <CasinoLobby />
              {belowBanners}
            </>
          )}
        </div>
      </div>
      <CashierSheet open={cashierOpen} onClose={() => setCashierOpen(false)} />
      <UbcSheet open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <CasinoSearchOverlay open={casinoSearchOpen} onClose={() => setCasinoSearchOpen(false)} />
      {lab}
    </div>
  );
}

