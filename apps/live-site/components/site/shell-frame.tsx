'use client'

import type { ReactNode } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ShellContent } from './shell-content'
import { ShellHeader } from './shell-header'
import { useShell, ShellProvider } from './shell-context'
import { ShellSeo } from './shell-seo'
import { ShellDrawer } from './shell-drawer'
import { ShellSidebar } from './shell-sidebar'
import { SiteFooter } from './site-footer'
import { UbcSheet } from './shell-ubc'
import { ShellMobileNav } from './shell-mobile-nav'
import { cn } from '@/lib/utils'

/**
 * Figma 🐚 Shell — casino / sports / poker / promotions
 * Viewport-locked chrome: header stays put, page scrolls under it,
 * footer stays at the end of the page (and docks to the bottom on short pages).
 */
export function ShellFrame({
  children,
  loggedIn = true,
}: {
  children?: ReactNode
  loggedIn?: boolean
}) {
  return (
    <ShellProvider loggedIn={loggedIn}>
      <TooltipProvider delayDuration={200}>
        <ShellChrome>{children}</ShellChrome>
      </TooltipProvider>
    </ShellProvider>
  )
}

function ShellChrome({ children }: { children?: ReactNode }) {
  const { expanded, drawerOpen, setDrawerOpen } = useShell()

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
        <ShellHeader />
        <div id="shell-scroll" className="shell-scroll h-0 min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <div className="flex min-h-full flex-col">
            <div className="flex-1 pb-24 lg:pb-0">
              {children ?? <ShellContent />}
              <ShellSeo />
            </div>
            <SiteFooter />
          </div>
        </div>
      </div>
      <ShellMobileNav />
      <UbcSheet open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
