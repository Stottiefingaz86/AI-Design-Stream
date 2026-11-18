'use client'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { CasinoLobbyBannerRow } from '@/components/lumen/casino-lobby-banners'
import { PromoLobbyBanner } from '@/components/lumen/casino-lobby-banners'
import { ContestCardView } from '@/components/lumen/contests-lobby-page'
import { PromoCard } from '@/components/lumen/promotions-lobby-page'
import { CASINO_LOBBY_PROMO_BANNERS } from '@/lib/lumen/casino-lobby-promos'
import { CONTEST_CARDS } from '@/lib/lumen/contests'
import { PROMOTIONS_LOBBY_CARDS } from '@/lib/lumen/promotions-lobby'
import { AccountSubNav } from '@/components/site/account-subnav'
import { CasinoSubNav } from '@/components/site/casino-subnav'
import { SportsSubNav } from '@/components/site/sports-subnav'
import { ShellDrawer } from '@/components/site/shell-drawer'
import { ShellProductChips } from '@/components/site/shell-product-chips'
import { ShellSidebar } from '@/components/site/shell-sidebar'
import { ShellStickyChrome } from '@/components/site/shell-sticky-chrome'
import { useShell } from '@/components/site/shell-context'
import { CHIP_NAV, HEADER_NAV, OTHER_NAV } from '@/components/site/shell-nav'
import { cn } from '@/lib/utils'
import { useEffect, useState, type ReactNode } from 'react'
import type { LumenStory } from './types'

/** Previews stay in the library — block soft-nav / router pushes from chrome. */
function FreezeNav({ children }: { children: ReactNode }) {
  return (
    <div
      onClickCapture={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {children}
    </div>
  )
}

function MainNavPreview() {
  return (
    <nav
      aria-label="Main product nav"
      className="flex flex-wrap items-center gap-1 rounded-[10px] border border-border bg-[var(--header-inverted,#1a1a1a)] px-3 py-2"
    >
      {HEADER_NAV.map((item) => (
        <span
          key={item.label}
          className={cn(
            'rounded-md px-3 py-2 text-sm font-semibold text-[rgba(255,255,255,0.6)]',
            item.label === 'Casino' && 'text-primary',
          )}
        >
          {item.label}
        </span>
      ))}
      <span className="ml-1 rounded-md px-3 py-2 text-sm font-medium text-[rgba(255,255,255,0.6)]">
        Other ▾
      </span>
    </nav>
  )
}

function OpenLiveSheets() {
  const {
    openAuth,
    setCashierOpen,
    setVipHubOpen,
    setDrawerOpen,
    setNotificationsOpen,
    openDailySpin,
  } = useShell()

  return (
    <div data-lumen-allow="" className="flex flex-wrap gap-2">
      <Button type="button" onClick={() => openAuth('join')}>
        Auth · Join
      </Button>
      <Button type="button" variant="outline" onClick={() => openAuth('login')}>
        Auth · Login
      </Button>
      <Button type="button" variant="secondary" onClick={() => setCashierOpen(true)}>
        Cashier
      </Button>
      <Button type="button" variant="secondary" onClick={() => setVipHubOpen(true)}>
        VIP Hub
      </Button>
      <Button type="button" variant="outline" onClick={() => setDrawerOpen(true)}>
        UBC / drawer
      </Button>
      <Button type="button" variant="outline" onClick={() => setNotificationsOpen(true)}>
        Notifications
      </Button>
      <Button type="button" variant="outline" onClick={() => openDailySpin()}>
        Daily Spin
      </Button>
    </div>
  )
}

function MobileDrawerDemo() {
  const { setNavOpen } = useShell()
  useEffect(() => {
    /* Drawer portals to body + lg:hidden — force show while this story is open. */
    const style = document.createElement('style')
    style.setAttribute('data-lumen-gallery-drawer', '')
    style.textContent =
      'html[data-lumen-gallery] [data-shell-drawer]{display:flex!important;}'
    document.head.appendChild(style)
    return () => {
      style.remove()
      setNavOpen(false)
    }
  }, [setNavOpen])
  return (
    <div data-lumen-allow="" className="space-y-3">
      <Button type="button" onClick={() => setNavOpen(true)}>
        Open mobile drawer
      </Button>
      <p className="text-sm text-muted-foreground">
        Real ShellDrawer portal. Close with × or the scrim.
      </p>
      <ShellDrawer />
    </div>
  )
}

/** Scrollable host so useChromeChipsRevealed + sticky top motion actually run. */
function StickyChromeMotionDemo() {
  return (
    <div className="space-y-3">
      <p className="px-4 pt-4 text-sm text-muted-foreground sm:px-0 sm:pt-0">
        Phone frame (device = mobile). Scroll — quick links tuck down, scroll-up reveals them.
        Same as live: `#shell-scroll` + `top: -chipH` → `0`.
      </p>
      <FreezeNav>
        <div data-name="Product Page" className="bg-[#121212]">
          <div
            id="shell-scroll"
            className="shell-scroll h-[min(640px,75vh)] overflow-x-hidden overflow-y-auto"
          >
            <ShellStickyChrome subNav={<CasinoSubNav glass sticky={false} />} />
            <div className="space-y-3 px-4 py-6">
              <p className="text-sm font-semibold text-foreground">
                Scroll down — quick links close
              </p>
              <p className="text-xs text-muted-foreground">
                Keep scrolling, then scroll back up to watch them reveal.
              </p>
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="h-16 rounded-[10px] border border-border bg-card" />
              ))}
            </div>
          </div>
        </div>
      </FreezeNav>
    </div>
  )
}

function SheetPrimitiveDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div data-lumen-allow="" className="space-y-3">
      <Button type="button" onClick={() => setOpen(true)}>
        Open sheet
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="bg-background">
          <SheetHeader>
            <SheetTitle>Sheet</SheetTitle>
            <SheetDescription>Close uses rounded-lg + hover:bg-accent.</SheetDescription>
          </SheetHeader>
          <p className="mt-4 text-sm text-muted-foreground">
            Controlled open — same primitive as filters / account sheets.
          </p>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DrawerPrimitiveDemo() {
  const [open, setOpen] = useState(false)
  return (
    <div data-lumen-allow="" className="space-y-3">
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        Open drawer
      </Button>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Drawer</DrawerTitle>
            <DrawerDescription>Mobile bottom sheet pattern.</DrawerDescription>
          </DrawerHeader>
          <p className="px-4 pb-6 text-sm text-muted-foreground">
            Controlled open — drag handle or scrim to dismiss.
          </p>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export const SHELL_STORIES: LumenStory[] = [
  {
    id: 'shell-main-nav',
    title: 'Main nav',
    group: 'Shell',
    description: 'Header product tabs — Casino · Sports · Poker · Promotions · Other.',
    importPath: '@/components/site/shell-nav',
    code: `import { HEADER_NAV, OTHER_NAV } from '@/components/site/shell-nav'
import { ShellHeader } from '@/components/site/shell-header'

/* Live chrome: ShellHeader inside ShellFrame */`,
    demoHref: '/casino',
    render: () => (
      <div className="space-y-4">
        <MainNavPreview />
        <div className="rounded-[10px] border border-border bg-card p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Other menu
          </p>
          <ul className="grid gap-1 sm:grid-cols-2">
            {OTHER_NAV.map((item) => (
              <li
                key={item.label}
                className="rounded-md px-2 py-1.5 text-sm text-muted-foreground"
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground">
          shell-header.tsx · shell-nav.ts (HEADER_NAV / OTHER_NAV)
        </p>
      </div>
    ),
  },
  {
    id: 'shell-quick-links',
    title: 'Quick links (product chips)',
    group: 'Shell',
    description: 'Mobile/tablet product strip under the header — Home, Casino, Live Casino…',
    importPath: '@/components/site/shell-product-chips',
    code: `import { ShellProductChips } from '@/components/site/shell-product-chips'
import { CHIP_NAV } from '@/components/site/shell-nav'

<ShellProductChips />`,
    demoHref: '/',
    render: () => (
      <div className="space-y-4 overflow-hidden rounded-[10px] border border-border">
        <FreezeNav>
          <ShellProductChips className="!block lg:!block" />
        </FreezeNav>
        <div className="border-t border-border p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            CHIP_NAV
          </p>
          <div className="flex flex-wrap gap-2">
            {CHIP_NAV.map((c) => (
              <span
                key={c.label}
                className="rounded-md border border-border bg-secondary px-2 py-1 text-xs text-foreground"
              >
                {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'shell-casino-subnav',
    title: 'Casino sub-nav',
    group: 'Shell',
    description: 'Glass pill track — Lobby, Slots, Live, Originals…',
    importPath: '@/components/site/casino-subnav',
    code: `import { CasinoSubNav } from '@/components/site/casino-subnav'

<CasinoSubNav glass sticky />`,
    render: () => (
      <FreezeNav>
        <div className="overflow-hidden rounded-[10px] border border-border">
          <CasinoSubNav glass sticky={false} />
        </div>
      </FreezeNav>
    ),
  },
  {
    id: 'shell-sports-subnav',
    title: 'Sports sub-nav',
    group: 'Shell',
    importPath: '@/components/site/sports-subnav',
    code: `import { SportsSubNav } from '@/components/site/sports-subnav'

<SportsSubNav />`,
    render: () => (
      <FreezeNav>
        <div className="overflow-hidden rounded-[10px] border border-border">
          <SportsSubNav />
        </div>
      </FreezeNav>
    ),
  },
  {
    id: 'shell-account-subnav',
    title: 'Account sub-nav',
    group: 'Shell',
    description: 'Mobile account section pills — same sliding thumb as casino.',
    importPath: '@/components/site/account-subnav',
    code: `import { AccountSubNav } from '@/components/site/account-subnav'

<AccountSubNav />`,
    render: () => (
      <FreezeNav>
        <div className="max-w-lg overflow-hidden rounded-[10px] border border-border">
          <AccountSubNav />
        </div>
      </FreezeNav>
    ),
  },
  {
    id: 'shell-sidebar',
    title: 'Sidebar',
    group: 'Shell',
    description: 'Desktop left rail — live ShellSidebar (Casino Lobby uses library icon).',
    importPath: '@/components/site/shell-sidebar',
    code: `import { ShellSidebar } from '@/components/site/shell-sidebar'`,
    render: () => (
      <FreezeNav>
        <div
          className={cn(
            'relative h-[520px] overflow-hidden rounded-[10px] border border-border bg-[#121212]',
            /* Unstick fixed + show below lg so the gallery can preview the rail */
            '[&_aside[data-name=sidebar-container]]:!relative [&_aside[data-name=sidebar-container]]:!inset-auto',
            '[&_aside[data-name=sidebar-container]]:!flex [&_aside[data-name=sidebar-container]]:!h-full',
            '[&_aside[data-name=sidebar-container]]:!w-64',
          )}
        >
          <ShellSidebar />
        </div>
      </FreezeNav>
    ),
  },
  {
    id: 'shell-drawer',
    title: 'Mobile drawer',
    group: 'Shell',
    description: 'Live ShellDrawer portal — same hamburger menu as the site.',
    importPath: '@/components/site/shell-drawer',
    code: `import { ShellDrawer } from '@/components/site/shell-drawer'
import { useShell } from '@/components/site/shell-context'

setNavOpen(true)`,
    render: () => <MobileDrawerDemo />,
  },
  {
    id: 'shell-sticky-chrome',
    title: 'Sticky chrome',
    group: 'Shell',
    description:
      'Mobile quick-links tuck/reveal — scroll this preview. Down → chips slide away (top: -chipH). Up → same block slides down until quick-links are fully revealed (top: 0). Needs #shell-scroll + ShellStickyChrome.',
    importPath: '@/components/site/shell-sticky-chrome',
    code: `import { ShellStickyChrome } from '@/components/site/shell-sticky-chrome'
import { CasinoSubNav } from '@/components/site/casino-subnav'
import { useChromeChipsRevealed } from '@/components/site/shell-scroll'

/* Scroll lives on #shell-scroll — not window.
 * Mobile: sticky top = -chipH (chips above fold). Scroll-up → top = 0 (reveal).
 * useChromeChipsRevealed() listens on #shell-scroll; ShellStickyChrome sets top. */

<div id="shell-scroll" className="shell-scroll h-[480px] overflow-y-auto">
  <ShellStickyChrome subNav={<CasinoSubNav glass sticky={false} />} />
  {/* tall page content… */}
</div>`,
    render: () => <StickyChromeMotionDemo />,
  },
  {
    id: 'sheets-live',
    title: 'Live sheets & modals',
    group: 'Sheets & drawers',
    description: 'Same portals as the demo — tap to open Auth, Cashier, VIP Hub, UBC, Notifications, Daily Spin.',
    importPath: '@/components/site/shell-frame',
    code: `import { AuthModal } from '@/components/site/auth-modal'
import { CashierSheet } from '@/components/site/cashier-sheet'
import { VipHubSheet } from '@/components/site/vip-hub-sheet'
import { NotificationsSheet } from '@/components/site/notifications-sheet'
import { UbcSheet } from '@/components/site/shell-ubc'
import { DailySpinModal } from '@/components/lumen/daily-spin-modal'
import { ChurnRescueModal } from '@/components/site/churn-rescue-modal'
import { useShell } from '@/components/site/shell-context'

const { openAuth, setCashierOpen, setVipHubOpen } = useShell()`,
    demoHref: '/',
    render: () => (
      <div className="space-y-4">
        <OpenLiveSheets />
        <p className="text-xs text-muted-foreground">
          Opens the real site sheets mounted in this library host (not prototypes).
        </p>
      </div>
    ),
  },
  {
    id: 'sheets-primitive',
    title: 'Sheet primitive',
    group: 'Sheets & drawers',
    importPath: '@/components/ui/sheet',
    code: `import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useState } from 'react'

const [open, setOpen] = useState(false)
<Sheet open={open} onOpenChange={setOpen}>
  <Button type="button" onClick={() => setOpen(true)}>Open sheet</Button>
  <SheetContent>…</SheetContent>
</Sheet>`,
    render: () => <SheetPrimitiveDemo />,
  },
  {
    id: 'drawer-primitive',
    title: 'Drawer primitive',
    group: 'Sheets & drawers',
    importPath: '@/components/ui/drawer',
    code: `import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { useState } from 'react'

const [open, setOpen] = useState(false)
<Drawer open={open} onOpenChange={setOpen}>
  <Button onClick={() => setOpen(true)}>Open drawer</Button>
  <DrawerContent>…</DrawerContent>
</Drawer>`,
    render: () => <DrawerPrimitiveDemo />,
  },
  {
    id: 'promo-lobby-banners',
    title: 'Promo lobby banners',
    group: 'Promo & banners',
    description: 'Casino / promotions strip banners — live PromoLobbyBanner.',
    importPath: '@/components/lumen/casino-lobby-banners',
    code: `import { PromoLobbyBanner, CasinoLobbyBannerRow } from '@/components/lumen/casino-lobby-banners'
import { CASINO_LOBBY_PROMO_BANNERS } from '@/lib/lumen/casino-lobby-promos'

<CasinoLobbyBannerRow banners={CASINO_LOBBY_PROMO_BANNERS} />`,
    demoHref: '/casino',
    render: () => (
      <div className="space-y-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {CASINO_LOBBY_PROMO_BANNERS.slice(0, 3).map(({ id, ...banner }) => (
            <PromoLobbyBanner key={id} {...banner} />
          ))}
        </div>
        <p className="font-mono text-[11px] text-muted-foreground">
          Also: CasinoLobbyBannerRow · VIP / Race widgets on lobby when logged in
        </p>
      </div>
    ),
  },
  {
    id: 'promo-banner-row',
    title: 'Lobby banner row',
    group: 'Promo & banners',
    importPath: '@/components/lumen/casino-lobby-banners',
    code: `import { CasinoLobbyBannerRow } from '@/components/lumen/casino-lobby-banners'`,
    demoHref: '/casino',
    render: () => (
      <div className="-mx-2 overflow-x-auto">
        <CasinoLobbyBannerRow
          promos={CASINO_LOBBY_PROMO_BANNERS}
          vip={false}
          dailyRaces={false}
        />
      </div>
    ),
  },
  {
    id: 'promo-cards',
    title: 'Promo cards',
    group: 'Promo & banners',
    description:
      'All Promotions grid cards — image, title, body, spring hover. Live on /promotions.',
    importPath: '@/components/lumen/promotions-lobby-page',
    code: `import { PromoCard } from '@/components/lumen/promotions-lobby-page'
import { PROMOTIONS_LOBBY_CARDS } from '@/lib/lumen/promotions-lobby'

<PromoCard title={…} body={…} imageSrc={…} />`,
    demoHref: '/promotions',
    render: () => (
      <div className="space-y-3">
        <p className="font-mono text-[11px] text-muted-foreground">
          promotions-lobby-page.tsx · PROMOTIONS_LOBBY_CARDS
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROMOTIONS_LOBBY_CARDS.slice(0, 6).map((card) => (
            <PromoCard
              key={card.id}
              title={card.title}
              body={card.body}
              imageSrc={card.imageSrc}
            />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'contest-cards',
    title: 'Contest cards',
    group: 'Promo & banners',
    description:
      'Contest lobby cards — prize, status badge, rules/entry CTAs, corner art. Live on /promotions/contest.',
    importPath: '@/components/lumen/contests-lobby-page',
    code: `import { ContestCardView } from '@/components/lumen/contests-lobby-page'
import { CONTEST_CARDS } from '@/lib/lumen/contests'

<ContestCardView card={CONTEST_CARDS[0]} />`,
    demoHref: '/promotions/contest',
    render: () => (
      <div className="space-y-3">
        <p className="font-mono text-[11px] text-muted-foreground">
          contests-lobby-page.tsx · CONTEST_CARDS
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CONTEST_CARDS.slice(0, 6).map((card) => (
            <ContestCardView key={card.id} card={card} />
          ))}
        </div>
      </div>
    ),
  },
]
