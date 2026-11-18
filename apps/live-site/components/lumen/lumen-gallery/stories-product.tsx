'use client'

import { Suspense, useState, type ReactNode } from 'react'
import { BetHistoryPage } from '@/components/lumen/bet-history-page'
import { CasinoGameTile, PlayRandomTile } from '@/components/lumen/casino-game-tile'
import { CasinoLiveLobby } from '@/components/lumen/casino-live-page'
import { CasinoLiveWinsCarousel } from '@/components/lumen/casino-live-wins-carousel'
import { CasinoLobby } from '@/components/lumen/casino-lobby-page'
import { CasinoSlotsLobby } from '@/components/lumen/casino-slots-page'
import { CasinoTrendsLobby } from '@/components/lumen/casino-trends-page'
import { ContestsLobbyPage } from '@/components/lumen/contests-lobby-page'
import { DailyRacesPage } from '@/components/lumen/daily-races-page'
import { Error404Page } from '@/components/lumen/error-404-page'
import { Favorite } from '@/components/lumen/favorite'
import { FilterSelectBox } from '@/components/lumen/filter-select-box'
import { HomepageLobby } from '@/components/lumen/homepage-lobby-page'
import { LoyaltyRewardCard } from '@/components/lumen/loyalty-reward-card'
import { MyAccountPage } from '@/components/lumen/my-account-page'
import { MyBonusPage } from '@/components/lumen/my-bonus-page'
import { PaymentsPage } from '@/components/lumen/payments-page'
import { PokerLandingPage } from '@/components/lumen/poker-landing-page'
import { ProfileSettingsPage } from '@/components/lumen/profile-settings-page'
import { PromotionsLobbyPage } from '@/components/lumen/promotions-lobby-page'
import { ReferAFriendPage } from '@/components/lumen/refer-a-friend-page'
import { SecurityCentralPage } from '@/components/lumen/security-central-page'
import { ShelfSeeMore } from '@/components/lumen/shelf-see-more'
import { SoccerSportPage } from '@/components/lumen/soccer-sport-page'
import { TransactionsPage } from '@/components/lumen/transactions-page'
import { VipProgressCrown } from '@/components/lumen/vip-progress-crown'
import { VipTierProgressCard } from '@/components/lumen/vip-tier-progress-card'
import { CONTINUE_PLAYING, ORIGINALS_GAMES } from '@/lib/lumen/casino-lobby-catalog'
import { cn } from '@/lib/utils'
import type { LumenStory } from './types'

function PageTabs<T extends string>({
  tabs,
  value,
  onChange,
  file,
  children,
}: {
  tabs: readonly { id: T; label: string; file: string }[]
  value: T
  onChange: (id: T) => void
  file: string
  children: ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
              t.id === value
                ? 'border-primary/40 bg-primary/15 text-foreground'
                : 'border-border bg-secondary text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="font-mono text-[11px] text-muted-foreground">{file}</p>
      <div
        data-lumen-allow=""
        className="overflow-hidden rounded-[10px] border border-border bg-background"
      >
        {children}
      </div>
    </div>
  )
}

const ACCOUNT_TABS = [
  { id: 'my-account', label: 'My Account', file: 'my-account-page.tsx' },
  { id: 'my-bonus', label: 'My Bonus', file: 'my-bonus-page.tsx' },
  { id: 'transactions', label: 'Transactions', file: 'transactions-page.tsx' },
  { id: 'payments', label: 'Payments', file: 'payments-page.tsx' },
  { id: 'bet-history', label: 'Bet History', file: 'bet-history-page.tsx' },
  { id: 'security', label: 'Security', file: 'security-central-page.tsx' },
  { id: 'raf', label: 'Refer a Friend', file: 'refer-a-friend-page.tsx' },
  { id: 'settings', label: 'Profile settings', file: 'profile-settings-page.tsx' },
] as const

function AccountPageBody({ id }: { id: (typeof ACCOUNT_TABS)[number]['id'] }) {
  switch (id) {
    case 'my-account':
      return <MyAccountPage />
    case 'my-bonus':
      return <MyBonusPage />
    case 'transactions':
      return <TransactionsPage />
    case 'payments':
      return <PaymentsPage />
    case 'bet-history':
      return <BetHistoryPage />
    case 'security':
      return <SecurityCentralPage />
    case 'raf':
      return <ReferAFriendPage />
    case 'settings':
      return <ProfileSettingsPage />
    default:
      return <MyAccountPage />
  }
}

function AccountPagesDemo() {
  const [tab, setTab] = useState<(typeof ACCOUNT_TABS)[number]['id']>('my-account')
  const active = ACCOUNT_TABS.find((t) => t.id === tab) ?? ACCOUNT_TABS[0]
  return (
    <PageTabs tabs={ACCOUNT_TABS} value={tab} onChange={setTab} file={active.file}>
      <AccountPageBody id={tab} />
    </PageTabs>
  )
}

const CASINO_TABS = [
  { id: 'lobby', label: 'Lobby', file: 'casino-lobby-page.tsx' },
  { id: 'slots', label: 'Slots', file: 'casino-slots-page.tsx' },
  { id: 'live', label: 'Live', file: 'casino-live-page.tsx' },
  { id: 'trends', label: 'Trends', file: 'casino-trends-page.tsx' },
  { id: 'wins', label: 'Live Wins', file: 'casino-live-wins-carousel.tsx' },
] as const

function CasinoPagesDemo() {
  const [tab, setTab] = useState<(typeof CASINO_TABS)[number]['id']>('lobby')
  const active = CASINO_TABS.find((t) => t.id === tab) ?? CASINO_TABS[0]
  return (
    <PageTabs tabs={CASINO_TABS} value={tab} onChange={setTab} file={active.file}>
      {tab === 'lobby' ? <CasinoLobby /> : null}
      {tab === 'slots' ? <CasinoSlotsLobby /> : null}
      {tab === 'live' ? <CasinoLiveLobby /> : null}
      {tab === 'trends' ? <CasinoTrendsLobby /> : null}
      {tab === 'wins' ? (
        <div className="p-4">
          <CasinoLiveWinsCarousel />
        </div>
      ) : null}
    </PageTabs>
  )
}

const PRODUCT_TABS = [
  { id: 'home', label: 'Homepage', file: 'homepage-lobby-page.tsx' },
  { id: 'promos', label: 'Promotions', file: 'promotions-lobby-page.tsx' },
  { id: 'races', label: 'Daily Races', file: 'daily-races-page.tsx' },
  { id: 'contests', label: 'Contests', file: 'contests-lobby-page.tsx' },
  { id: 'soccer', label: 'Soccer', file: 'soccer-sport-page.tsx' },
  { id: 'poker', label: 'Poker', file: 'poker-landing-page.tsx' },
  { id: '404', label: '404', file: 'error-404-page.tsx' },
] as const

function ProductPagesDemo() {
  const [tab, setTab] = useState<(typeof PRODUCT_TABS)[number]['id']>('home')
  const active = PRODUCT_TABS.find((t) => t.id === tab) ?? PRODUCT_TABS[0]
  return (
    <PageTabs tabs={PRODUCT_TABS} value={tab} onChange={setTab} file={active.file}>
      {tab === 'home' ? <HomepageLobby /> : null}
      {tab === 'promos' ? (
        <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
          <PromotionsLobbyPage />
        </Suspense>
      ) : null}
      {tab === 'races' ? <DailyRacesPage /> : null}
      {tab === 'contests' ? <ContestsLobbyPage /> : null}
      {tab === 'soccer' ? <SoccerSportPage /> : null}
      {tab === 'poker' ? <PokerLandingPage /> : null}
      {tab === '404' ? <Error404Page /> : null}
    </PageTabs>
  )
}

export const PRODUCT_STORIES: LumenStory[] = [
  {
    id: 'mol-game-tile',
    title: 'Casino game tile',
    group: 'Casino',
    description: '152×207 poster — live on lobby shelves.',
    importPath: '@/components/lumen/casino-game-tile',
    code: `import { CasinoGameTile, PlayRandomTile } from '@/components/lumen/casino-game-tile'
import { ORIGINALS_GAMES } from '@/lib/lumen/casino-lobby-catalog'

<CasinoGameTile game={ORIGINALS_GAMES[0]} hideTitle onLaunch={launchGame} />`,
    demoHref: '/casino',
    render: () => (
      <div className="flex flex-wrap gap-3 p-2">
        {ORIGINALS_GAMES.slice(0, 4).map((game) => (
          <CasinoGameTile key={game.id} game={game} hideTitle className="!h-[207px] !w-[152px]" />
        ))}
        <PlayRandomTile />
      </div>
    ),
  },
  {
    id: 'mol-favorite',
    title: 'Favorite',
    group: 'Casino',
    importPath: '@/components/lumen/favorite',
    code: `import { Favorite } from '@/components/lumen/favorite'

<Favorite inline isFavorited={false} title="Plinko" />`,
    render: () => (
      <div className="flex items-center gap-4 rounded-[10px] border border-border bg-card p-4">
        <Favorite inline title="Plinko" />
        <Favorite inline isFavorited title="Dice" />
      </div>
    ),
  },
  {
    id: 'mol-filter-select',
    title: 'Filter select',
    group: 'Casino',
    description: 'Trends / Account desk / RAF.',
    importPath: '@/components/lumen/filter-select-box',
    code: `import { FilterSelectBox } from '@/components/lumen/filter-select-box'`,
    render: () => {
      const Demo = () => {
        const [sort, setSort] = useState('newest')
        return (
          <div className="max-w-xs">
            <FilterSelectBox
              label="Sort by"
              value={sort}
              onChange={setSort}
              options={[
                { id: 'newest', label: 'Newest' },
                { id: 'az', label: 'A–Z' },
                { id: 'popular', label: 'Popular' },
              ]}
            />
          </div>
        )
      }
      return <Demo />
    },
  },
  {
    id: 'mol-shelf-see-more',
    title: 'Shelf See More',
    group: 'Casino',
    importPath: '@/components/lumen/shelf-see-more',
    code: `import { ShelfSeeMore } from '@/components/lumen/shelf-see-more'

<ShelfSeeMore href="/casino/category/originals" />`,
    render: () => <ShelfSeeMore href="/casino/category/originals" />,
  },
  {
    id: 'casino-continue',
    title: 'Continue Playing',
    group: 'Casino',
    description: 'Last-10 rail + Play Random — logged-in only on demo.',
    importPath: '@/lib/lumen/casino-lobby-catalog',
    code: `import { CONTINUE_PLAYING } from '@/lib/lumen/casino-lobby-catalog'
import { ContinuePlayingShelf } from '@/components/lumen/casino-lobby-page'`,
    demoHref: '/casino',
    render: () => (
      <div className="flex gap-3 overflow-x-auto p-1 pb-2">
        {CONTINUE_PLAYING.map((game) => (
          <CasinoGameTile
            key={game.id}
            game={game}
            hideTitle
            className="!h-[207px] !w-[152px] shrink-0"
          />
        ))}
      </div>
    ),
  },
  {
    id: 'casino-pages',
    title: 'Casino pages',
    group: 'Casino',
    description: 'Live Lobby · Slots · Live · Trends · Live Wins — same modules as :3000.',
    importPath: '@/components/lumen/casino-lobby-page',
    code: `import { CasinoLobby } from '@/components/lumen/casino-lobby-page'
import { CasinoSlotsLobby } from '@/components/lumen/casino-slots-page'
import { CasinoLiveLobby } from '@/components/lumen/casino-live-page'

<CasinoLobby />`,
    demoHref: '/casino',
    render: () => <CasinoPagesDemo />,
  },
  {
    id: 'rewards-tier-progress',
    title: 'VIP tier progress',
    group: 'Rewards',
    description: 'Live on casino lobby banners when logged in.',
    importPath: '@/components/lumen/vip-tier-progress-card',
    code: `import { VipTierProgressCard } from '@/components/lumen/vip-tier-progress-card'

<VipTierProgressCard />`,
    demoHref: '/casino',
    render: () => (
      <div className="max-w-md">
        <VipTierProgressCard />
      </div>
    ),
  },
  {
    id: 'rewards-crown',
    title: 'VIP progress crown',
    group: 'Rewards',
    importPath: '@/components/lumen/vip-progress-crown',
    code: `import { VipProgressCrown } from '@/components/lumen/vip-progress-crown'

<VipProgressCrown tone="bronze" />`,
    render: () => (
      <div className="flex items-center gap-4">
        <VipProgressCrown tone="bronze" size={40} />
        <VipProgressCrown tone="silver" size={48} />
      </div>
    ),
  },
  {
    id: 'rewards-loyalty-card',
    title: 'Loyalty reward card',
    group: 'Rewards',
    description: 'VIP Hub claim rows — live.',
    importPath: '@/components/lumen/loyalty-reward-card',
    code: `import { LoyaltyRewardCard } from '@/components/lumen/loyalty-reward-card'

<LoyaltyRewardCard
  rewardInfo={{ title: 'Rakeback', subtitle: '$12.40' }}
  action={{ state: 'enable', label: 'Claim', onClick: () => {} }}
/>`,
    render: () => (
      <div className="max-w-md">
        <LoyaltyRewardCard
          rewardInfo={{ title: 'Rakeback', subtitle: '$12.40', infoText: 'Earn as you play.' }}
          action={{ state: 'enable', label: 'Claim', onClick: () => {} }}
        />
      </div>
    ),
  },
  {
    id: 'account-pages',
    title: 'Account pages',
    group: 'Account',
    description:
      'Live account modules — My Account, My Bonus, Transactions, Payments, Bet History, Security, RAF, Profile. Switch tabs to preview each page.',
    importPath: '@/components/lumen/my-account-page',
    code: `import { MyAccountPage } from '@/components/lumen/my-account-page'
import { MyBonusPage } from '@/components/lumen/my-bonus-page'
import { TransactionsPage } from '@/components/lumen/transactions-page'
import { PaymentsPage } from '@/components/lumen/payments-page'
import { BetHistoryPage } from '@/components/lumen/bet-history-page'
import { SecurityCentralPage } from '@/components/lumen/security-central-page'
import { ReferAFriendPage } from '@/components/lumen/refer-a-friend-page'
import { ProfileSettingsPage } from '@/components/lumen/profile-settings-page'

<MyAccountPage />`,
    render: () => <AccountPagesDemo />,
  },
  {
    id: 'pages-product',
    title: 'Product pages',
    group: 'Pages',
    description:
      'Live Homepage · Promotions · Daily Races · Contests · Soccer · Poker · 404 — same as :3000.',
    importPath: '@/components/lumen/homepage-lobby-page',
    code: `import { HomepageLobby } from '@/components/lumen/homepage-lobby-page'
import { PromotionsLobbyPage } from '@/components/lumen/promotions-lobby-page'
import { ContestsLobbyPage } from '@/components/lumen/contests-lobby-page'

<HomepageLobby />`,
    demoHref: '/',
    render: () => <ProductPagesDemo />,
  },
]
