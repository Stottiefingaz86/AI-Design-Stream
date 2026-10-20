'use client';

import { useEffect, type ReactNode } from 'react';
import { PathnameProvider } from 'next/navigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { PokerLandingPage } from '@/components/lumen/poker-landing-page';
import { PokerLandingSkeleton } from '@/components/lumen/poker-landing-skeleton';
import { CashierSheet } from '../../../../apps/live-site/components/site/cashier-sheet';
import { ShellProvider, useShell } from '../../../../apps/live-site/components/site/shell-context';
import { ShellHeader } from '../../../../apps/live-site/components/site/shell-header';
import { ShellSidebar } from '../../../../apps/live-site/components/site/shell-sidebar';
import { UbcSheet } from '../../../../apps/live-site/components/site/shell-ubc';
import { SiteFooter } from '../../../../apps/live-site/components/site/site-footer';

/**
 * Poker_Landing-Page — live-site header + collapsed 96px sidebar + landing sections.
 * No casino sub-nav. Testing ground only until approved.
 */
export function PokerProductShell({ banner, lab }: { title?: string; banner?: ReactNode; lab?: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.brand = 'betonline';
    try {
      window.localStorage.setItem('lumen-shell-sidebar-expanded', '0');
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <PathnameProvider pathname="/poker">
      <ShellProvider loggedIn>
        <TooltipProvider delayDuration={0}>
          <PokerProductChrome banner={banner} lab={lab} />
        </TooltipProvider>
      </ShellProvider>
    </PathnameProvider>
  );
}

function PokerProductChrome({ banner, lab }: { banner?: ReactNode; lab?: ReactNode }) {
  const { navigating, drawerOpen, setDrawerOpen, cashierOpen, setCashierOpen } = useShell();

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
          <div className="flex min-h-full flex-col">
            <div className="flex-1 pb-24 lg:pb-0">
              {navigating ? <PokerLandingSkeleton /> : <PokerLandingPage />}
            </div>
            <SiteFooter />
          </div>
        </div>
      </div>
      <CashierSheet open={cashierOpen} onClose={() => setCashierOpen(false)} />
      <UbcSheet open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {lab}
    </div>
  );
}
