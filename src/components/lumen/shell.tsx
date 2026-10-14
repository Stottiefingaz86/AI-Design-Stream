import type { ReactNode } from 'react';
import { Button } from './index';
import { Icon, IconButton, type IconName } from './data';

/**
 * 🐚 Shell — studio prototype chrome only (PrototypeMock).
 * The live product chrome lives in `apps/live-site/components/site/shell-*.tsx`.
 * Storybook Lumen/Shell/* stories import those files. Do not add a second dock,
 * drawer, UBC or mobile tab strip here.
 */

export const SHELL_NAV = ['Casino', 'Sports', 'Live Betting', 'Poker', 'Promotions'];

export function Header({ brand = 'BETONLINE', active = 'Casino', loggedIn = true, balance = '$100,000.00', onMenu }: { brand?: string; active?: string; loggedIn?: boolean; balance?: string; onMenu?: () => void }) {
  return (
    <header className="bg-header-inverted text-foreground-inverted">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center gap-4 px-4 md:px-6">
        {onMenu ? <IconButton icon="menu" label="Menu" variant="ghost" /> : null}
        <span className="text-lg font-black uppercase tracking-tight">
          <span className="text-primary">{brand.slice(0, 3)}</span>
          {brand.slice(3)}
        </span>
        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {SHELL_NAV.map((n) => (
            <a key={n} href="#" onClick={(e) => e.preventDefault()} className={`rounded-md px-3 py-2 text-sm font-medium transition hover:bg-surface-muted-2-inverted ${n === active ? 'text-primary' : ''}`}>
              {n}
            </a>
          ))}
          <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium hover:bg-surface-muted-2-inverted">
            Other <span className="text-muted-foreground-inverted">▾</span>
          </a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {loggedIn ? (
            <>
              <span className="inline-flex h-9 items-stretch overflow-hidden rounded-md bg-surface-muted-2-inverted text-sm">
                <span className="flex items-center px-3 font-medium">{balance}</span>
                <span className="flex items-center bg-surface-muted-1-inverted px-2.5">
                  <Icon name="wallet" size="sm" />
                </span>
              </span>
              <IconButton icon="crown" label="VIP rewards" variant="vip" />
              <IconButton icon="user" label="Account" variant="secondary" />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm">
                Log in
              </Button>
              <Button size="sm">Join now</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const SIDEBAR_GROUPS: { icon: IconName; label: string }[][] = [
  [{ icon: 'home', label: 'Home' }],
  [
    { icon: 'dice', label: 'Casino' },
    { icon: 'clock', label: 'Live betting' },
    { icon: 'cup', label: 'Promotions' },
    { icon: 'star', label: 'Favourites' },
  ],
  [
    { icon: 'football', label: 'Soccer' },
    { icon: 'basketball', label: 'Basketball' },
    { icon: 'tennis', label: 'Tennis' },
    { icon: 'baseball', label: 'Baseball' },
  ],
];

export function Sidebar({ active = 'Home', collapsed = true }: { active?: string; collapsed?: boolean }) {
  return (
    <aside className={`flex ${collapsed ? 'w-24' : 'w-56'} shrink-0 flex-col items-stretch gap-2 border-r border-sidebar-border-inverted bg-sidebar-inverted py-3 text-sidebar-foreground-inverted`}>
      {SIDEBAR_GROUPS.map((group, gi) => (
        <div key={gi} className="flex flex-col gap-1 px-3">
          {gi > 0 ? <span className="mx-2 my-1 h-px bg-border-inverted" aria-hidden /> : null}
          {group.map((it) => (
            <a key={it.label} href="#" onClick={(e) => e.preventDefault()} title={it.label} className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${collapsed ? 'justify-center' : ''} ${it.label === active ? 'bg-primary text-primary-foreground' : 'hover:bg-sidebar-accent-inverted'}`}>
              <Icon name={it.icon} />
              {!collapsed ? it.label : null}
            </a>
          ))}
        </div>
      ))}
    </aside>
  );
}

/** Pill sub-menu under the header (casino lobby). */
export function SubMenu({ items, active = items[0] }: { items: string[]; active?: string }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-3">
      <IconButton icon="search" label="Search" variant="outline" size="sm" />
      <IconButton icon="heart" label="Favourites" variant="outline" size="sm" />
      {items.map((it) => (
        <button key={it} type="button" className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium transition ${it === active ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-accent'}`}>
          {it}
        </button>
      ))}
    </div>
  );
}

export function SeoBlock({ heading, paragraphs, toc }: { heading: string; paragraphs: string[]; toc: string[] }) {
  return (
    <section className="rounded-lg border border-border bg-card p-6 text-card-foreground">
      <div className="grid gap-8 md:grid-cols-[1fr_16rem]">
        <div>
          <h2 className="text-xl font-semibold">{heading}</h2>
          {paragraphs.map((p, i) => (
            <p key={i} className="mt-3 text-sm text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
        <aside className="text-sm">
          <h3 className="font-semibold">On this page</h3>
          <ul className="mt-2 flex flex-col gap-2 text-muted-foreground">
            {toc.map((t) => (
              <li key={t} className="hover:text-foreground">
                {t}
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <div className="mt-4 flex justify-center">
        <Button variant="outline" size="sm">
          Show more ⌄
        </Button>
      </div>
    </section>
  );
}

const FOOTER_COLUMNS: Record<string, string[]> = {
  'Quick Links': ['About Us', 'Refer a Friend', 'Rules', 'Banking', 'Privacy Policy', 'Affiliates', 'Terms & Conditions', 'Responsible Games'],
  Casino: ['Play Casino', 'Blackjack', 'Baccarat', 'Craps', 'Roulette', 'Keno', 'Slots', 'Video Poker'],
  Sports: ['Sportsbook', 'NFL Betting Odds', 'NBA Betting Odds', 'MLB Betting Odds', 'NHL Betting Odds', 'NCAAB Betting Odds', 'Super Bowl Betting Odds', 'Boxing Betting Odds'],
  Poker: ['Play Poker', 'Download', 'Texas Holdem', 'Omaha Poker'],
  Racebook: ['Horse Betting', 'Kentucky Derby', 'Preakness Stakes', 'Belmont Stakes', 'Breeders Cup'],
  Other: ['VIP Rewards', 'News Room', 'Why BetOnline', 'BetOnline Vs Competition', 'Bet TV'],
  Support: ['Live Chat', 'Help Center'],
};

export function Footer({ brand = 'BetOnline', compact = false }: { brand?: string; compact?: boolean }) {
  const cols = compact ? Object.entries(FOOTER_COLUMNS).slice(0, 4) : Object.entries(FOOTER_COLUMNS);
  return (
    <footer className="bg-footer-inverted text-foreground-inverted">
      <div className="mx-auto flex max-w-screen-2xl flex-col gap-8 px-4 py-8 md:px-6">
        <div className={`grid gap-6 ${compact ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-7'}`}>
          {cols.map(([title, links]) => (
            <div key={title} className="flex flex-col gap-2 text-xs">
              <h4 className="text-sm font-semibold">{title}</h4>
              {links.map((l) => (
                <a key={l} href="#" onClick={(e) => e.preventDefault()} className="text-muted-foreground-inverted hover:text-foreground-inverted">
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div>
          <Button size="sm">Need Help?</Button>
        </div>
        <div className="max-w-md">
          <h4 className="flex items-center gap-2 text-sm font-semibold">A Trusted & Safe Experience ✓</h4>
          <p className="mt-1 text-xs text-muted-foreground-inverted">At {brand}, our company&apos;s guiding principle is to establish long-lasting, positive relationships with our customers and within the online gaming community for over 25+ years.</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground-inverted">
          <div className="flex items-center gap-3">
            <span>Official Partners</span>
            {['LALIGA', 'LFA', 'matchroom', 'GOLDEN BOY'].map((p) => (
              <span key={p} className="rounded border border-border-inverted px-2 py-1 font-semibold uppercase">
                {p}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {['₿', 'Ξ', 'Ł', 'VISA', 'MC', 'AMEX', '18+'].map((p) => (
              <span key={p} className="inline-flex h-6 min-w-8 items-center justify-center rounded bg-surface-muted-2-inverted px-1.5 text-xs font-bold">
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground-inverted">
          <span>Copyright ©2026 {brand}. All rights reserved.</span>
          <span>10/13/2026, 21:00 PM</span>
        </div>
      </div>
    </footer>
  );
}

/** Full shell: header + optional sidebar + content + footer. Compose pages inside. */
export function Shell({ children, sidebar = true, loggedIn = true, active = 'Casino', footer = true, brand = 'BETONLINE' }: { children: ReactNode; sidebar?: boolean; loggedIn?: boolean; active?: string; footer?: boolean; brand?: string }) {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
      <Header active={active} loggedIn={loggedIn} brand={brand} />
      <div className="flex flex-1">
        {sidebar ? <Sidebar /> : null}
        <main className="min-w-0 flex-1 px-4 py-4 md:px-6">{children}</main>
      </div>
      {footer ? <Footer /> : null}
    </div>
  );
}
