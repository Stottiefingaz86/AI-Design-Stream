'use client'

import {
  BellIcon,
  CrownIcon,
  Dice5Icon,
  HeartIcon,
  HomeIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
  WalletIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { ShellIcon, type ShellIconName } from '@/components/site/shell-icons'
import type { LumenStory } from './types'

const SWATCHES = [
  ['background', 'bg-background', 'text-foreground'],
  ['foreground', 'bg-foreground', 'text-background'],
  ['card', 'bg-card', 'text-card-foreground'],
  ['popover', 'bg-popover', 'text-popover-foreground'],
  ['primary', 'bg-primary', 'text-primary-foreground'],
  ['secondary', 'bg-secondary', 'text-secondary-foreground'],
  ['muted', 'bg-muted', 'text-muted-foreground'],
  ['accent', 'bg-accent', 'text-accent-foreground'],
  ['destructive', 'bg-destructive', 'text-destructive-foreground'],
  ['success', 'bg-success', 'text-success-foreground'],
  ['warning', 'bg-warning', 'text-warning-foreground'],
  ['border', 'bg-border', 'text-foreground'],
  ['input', 'bg-input', 'text-foreground'],
  ['ring', 'bg-ring', 'text-primary-foreground'],
] as const

const BRANDS = [
  ['BOL', 'BetOnline'],
  ['SB', 'SportsBetting'],
  ['TG', 'TigerGaming'],
  ['LV', 'LowVig'],
  ['WC', 'WelcomeBonus'],
  ['SS', 'SuperSlots'],
]

const LUCIDE = [
  ['home', HomeIcon],
  ['search', SearchIcon],
  ['heart', HeartIcon],
  ['user', UserIcon],
  ['wallet', WalletIcon],
  ['crown', CrownIcon],
  ['bell', BellIcon],
  ['menu', MenuIcon],
  ['dice', Dice5Icon],
] as const

const SHELL_ICONS: ShellIconName[] = [
  'library',
  'home',
  'dice',
  'football',
  'vip',
  'wallet',
  'search',
  'favorite',
  'bonus',
  'promos',
  'contests',
  'refer',
  'account',
  'crown',
]

export const FOUNDATION_STORIES: LumenStory[] = [
  {
    id: 'foundations-typography',
    title: 'Typography',
    group: 'Foundations',
    description: 'Figtree type scale — Typography shapes + raw Tailwind.',
    importPath: '@/components/ui/typography',
    code: `import { Typography } from '@/components/ui/typography'

<Typography shape="h1" weight="bold">Casino games, live dealers</Typography>
<Typography shape="small" variant="muted">Supporting copy</Typography>`,
    render: () => (
      <div className="flex max-w-xl flex-col gap-3 text-foreground">
        <Typography shape="h1" weight="bold">
          H1 · Casino games, live dealers, big wins
        </Typography>
        <Typography shape="h2" weight="bold">
          H2 · Play slots, live casino & table games
        </Typography>
        <Typography shape="h3" weight="semibold">
          H3 · Section heading
        </Typography>
        <Typography shape="h4" weight="semibold">
          H4 · Row title
        </Typography>
        <Typography shape="lead" variant="muted">
          Lead · banner titles and intros
        </Typography>
        <Typography shape="paragraph">Base · 16/24 body for SEO and descriptions.</Typography>
        <Typography shape="small">Small · 14/20 UI text, tables, nav.</Typography>
        <Typography shape="xs" variant="muted">
          XS · captions, meta, badges
        </Typography>
        <Typography shape="xxs" variant="muted">
          XXS · tile tags
        </Typography>
        <p className="font-mono text-sm">Mono · 0x2F3A · odds, hashes, codes</p>
      </div>
    ),
  },
  {
    id: 'foundations-colors',
    title: 'Colors',
    group: 'Foundations',
    description: 'Lumen semantic tokens — never raw hex in product UI.',
    importPath: 'app/lumen.css / globals',
    code: `<div className="bg-primary text-primary-foreground" />
<div className="bg-card border border-border" />
<div className="text-muted-foreground" />`,
    render: () => (
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {SWATCHES.map(([name, bg, fg]) => (
            <div
              key={name}
              className={`flex h-24 flex-col justify-between rounded-lg border border-border p-3 ${bg} ${fg}`}
            >
              <span className="text-xs font-medium">{name}</span>
              <span className="text-[10px] opacity-70">{bg}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Primary opacity
          </p>
          <div className="flex flex-wrap gap-2">
            {[10, 20, 30, 40, 50, 60].map((n) => (
              <div
                key={n}
                className="grid size-20 place-items-center rounded-lg bg-primary text-xs text-primary-foreground"
                style={{ opacity: n / 100 }}
              >
                {n}%
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'foundations-logos',
    title: 'Logos',
    group: 'Foundations',
    description: 'Brand wordmark codes — BetOnline family.',
    importPath: 'foundations / brand',
    code: `/* Brand marks — BOL shell lettermark / wordmark on live chrome */`,
    render: () => (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {BRANDS.map(([code, name]) => (
            <div
              key={code}
              className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6 hover:bg-muted"
            >
              <span className="text-2xl font-black tracking-tight text-primary">{code}</span>
              <span className="text-xs text-muted-foreground">{name}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 rounded-lg bg-[var(--header-inverted,#1a1a1a)] p-6">
          {BRANDS.map(([code]) => (
            <span key={code} className="text-xl font-black text-white">
              {code}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'foundations-screens',
    title: 'Screens',
    group: 'Foundations',
    description: 'Breakpoint frames — Desktop 1440 · Tablet 768 · Mobile 375.',
    importPath: 'foundations / screens',
    code: `/* Device toggle in gallery header also forces chrome breakpoints */`,
    render: () => (
      <div className="flex flex-col gap-6 overflow-x-auto">
        {[
          { name: 'Desktop', width: 1440 },
          { name: 'Tablet', width: 768 },
          { name: 'Mobile', width: 375 },
        ].map((f) => (
          <div key={f.name} className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">
              {f.name} · {f.width}px
            </p>
            <div
              className="rounded-lg border border-border bg-card p-4"
              style={{ width: Math.min(f.width, 720), maxWidth: '100%' }}
            >
              <div className="h-16 rounded bg-muted" />
              <p className="mt-3 text-sm">Content column at {f.name} width.</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'foundations-icons',
    title: 'Icons',
    group: 'Foundations',
    description: 'Lucide set + live ShellIcon marks (Figma exports).',
    importPath: '@/components/site/shell-icons',
    code: `import { ShellIcon } from '@/components/site/shell-icons'

<ShellIcon name="library" tone="token" className="size-6" />`,
    render: () => (
      <div className="space-y-8">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Lucide (generic)
          </p>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
            {LUCIDE.map(([name, Icon]) => {
              const Lucide = Icon
              return (
                <div
                  key={name}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 hover:bg-muted"
                >
                  {/* Lucide icons — types conflict with React 19; runtime is fine */}
                  {/* @ts-expect-error LucideIcon vs ReactNode */}
                  <Lucide className="size-5" />
                  <span className="text-xs text-muted-foreground">{name}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            ShellIcon (product — prefer these)
          </p>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
            {SHELL_ICONS.map((name) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2 rounded-[10px] border border-border bg-card p-3"
              >
                <ShellIcon name={name} tone="token" className="size-6 text-foreground" />
                <span className="truncate text-[10px] text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="icon" aria-label="Search">
            <ShellIcon name="search" tone="token" className="size-4" />
          </Button>
          <Button size="icon" variant="outline" aria-label="Wallet">
            <ShellIcon name="wallet" tone="token" className="size-4" />
          </Button>
          <Button size="icon" variant="secondary" aria-label="VIP">
            <ShellIcon name="crown" tone="token" className="size-4" />
          </Button>
        </div>
      </div>
    ),
  },
  {
    id: 'foundations-favicons',
    title: 'Favicons',
    group: 'Foundations',
    importPath: '/favicon.svg',
    code: `<img src="/favicon.svg" alt="" width={32} height={32} />`,
    render: () => (
      <div className="flex items-center gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/favicon.svg" alt="Favicon" width={32} height={32} className="rounded" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/favicon.svg" alt="Favicon 64" width={64} height={64} className="rounded-lg" />
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.svg" alt="" width={16} height={16} />
          <span className="text-sm">BetOnline · tab preview</span>
        </div>
      </div>
    ),
  },
  {
    id: 'foundations-shadows',
    title: 'Shadows',
    group: 'Foundations',
    description: 'Elevation + default content card shadow.',
    importPath: 'tokens / card recipe',
    code: `<div className="rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]" />`,
    render: () => (
      <div className="space-y-8">
        <div className="flex flex-wrap gap-8 bg-background p-4">
          {['sm', 'md', 'lg', 'xl'].map((level) => (
            <div
              key={level}
              className="grid h-28 w-40 place-items-center rounded-lg bg-card text-sm"
              style={{ boxShadow: `var(--shadow-${level}, 0 4px 16px rgba(0,0,0,0.12))` }}
            >
              shadow-{level}
            </div>
          ))}
        </div>
        <div className="rounded-[10px] border border-border bg-card p-5 shadow-[0_0_16px_rgba(0,0,0,0.06)]">
          <p className="text-sm font-semibold">Default content card</p>
          <p className="mt-1 text-xs text-muted-foreground">
            rounded-[10px] · border-border · bg-card · soft shadow
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'foundations-radius',
    title: 'Radius',
    group: 'Foundations',
    importPath: 'tokens',
    code: `rounded-lg · rounded-[10px] (cards) · rounded-full (pills)`,
    render: () => (
      <div className="flex flex-wrap items-end gap-4">
        {(
          [
            ['sm', 'rounded-sm'],
            ['md', 'rounded-md'],
            ['lg', 'rounded-lg'],
            ['10px', 'rounded-[10px]'],
            ['full', 'rounded-full'],
          ] as const
        ).map(([label, cls]) => (
          <div key={label} className="flex flex-col items-center gap-2">
            <div className={`size-16 bg-primary ${cls}`} />
            <span className="text-xs text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    ),
  },
]
