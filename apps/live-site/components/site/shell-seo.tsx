'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useShell } from './shell-context'
import type { ShellProduct } from './shell-nav'

type SeoSection = {
  id: string
  title: string
  body: readonly string[]
  list?: readonly string[]
  after?: string
}

type SeoDoc = {
  sections: readonly SeoSection[]
  toc: readonly { id: string; label: string }[]
}

const CASINO_SEO: SeoDoc = {
  sections: [
    {
      id: 'casino-games',
      title: 'Casino Games: Play Slots, Live Casino & Table Games Online',
      body: [
        'Looking for a trusted place to play online casino games? BetOnline brings together thousands of slots, live dealer tables, and classic casino favorites in one lobby. From progressive jackpots to high-volatility video slots, blackjack, roulette, baccarat, and craps, everything is built for fast discovery on desktop and mobile.',
        'New and returning players can jump straight into popular titles, filter by category, or open live casino rooms with real dealers streaming in real time. Crypto and local payment options make deposits simple, so you spend less time funding and more time playing.',
      ],
    },
    {
      id: 'different',
      title: 'What makes BetOnline different?',
      body: [
        'BetOnline pairs a full sportsbook with a deep casino product, VIP rewards, and 24/7 support. Competitive odds, transparent banking, and promotions built around real play give you a complete wagering experience, not a stripped-down casino clone.',
      ],
    },
    {
      id: 'live-casino',
      title: 'Live casino, slots, and table games explained',
      body: [
        'Our casino lobby covers slots from top studios plus blackjack, roulette, baccarat, keno, and video poker. Live casino tables stream professional dealers so you get floor-game atmosphere without leaving home.',
        'Prefer sports? Switch into the sportsbook for NFL, NBA, MLB, NHL, soccer, MMA, and live in-play markets, then come back to casino for a different pace of play.',
      ],
    },
    {
      id: 'bonus',
      title: 'Bonus features, themes & games on BetOnline',
      body: ['Explore casino categories packed with bonus rounds, free spins, and feature-rich titles:'],
      list: [
        'Progressive jackpot slots and branded video slots with free-spin features',
        'Live blackjack, roulette, and baccarat tables',
        'Classic table games including craps, keno, and video poker',
        'Sportsbook and casino cross-play with shared wallet and VIP progression',
      ],
    },
    {
      id: 'responsible',
      title: 'Responsible gambling tools on your account',
      body: ['Stay in control with tools aligned to our responsible gaming guidelines:'],
      list: [
        'Loss limits',
        'Wager limits',
        'Deposit limits',
        'Cooling-off periods',
        'Break in play',
        'exclusion',
      ],
      after: 'Need help adjusting limits? Contact live support anytime from your account.',
    },
    {
      id: 'banking',
      title: 'Deposits and withdrawals on BetOnline',
      body: [
        'Fund your wallet with cards, bank options, and popular cryptocurrencies. Withdrawals move through the same secure banking flow, with clear status updates so you always know where your money stands on BetOnline.ag.',
      ],
    },
    {
      id: 'sports',
      title: 'Sports betting odds and live markets',
      body: [
        'Bet pre-match or in-play across major leagues and props. Deep markets, live scoring, and same-wallet casino play make BetOnline a one-stop destination for sports and casino.',
      ],
    },
  ],
  toc: [
    { id: 'casino-games', label: 'BetOnline Casino Games: Play Slots, Live Casino & Table Games Online' },
    { id: 'different', label: 'What makes BetOnline different?' },
    { id: 'live-casino', label: 'Live casino, slots, and table games explained' },
    { id: 'bonus', label: 'Bonus features, themes & games on BetOnline' },
    { id: 'responsible', label: 'Responsible gambling tools on your account' },
    { id: 'banking', label: 'Deposits and withdrawals on BetOnline' },
    { id: 'sports', label: 'Sports betting odds and live markets' },
  ],
}

const POKER_SEO: SeoDoc = {
  sections: [
    {
      id: 'poker-platform',
      title: 'BetOnline Poker: Play Online or Download the App',
      body: [
        'BetOnline Poker brings cash games, tournaments, and table tools into one platform — play in your browser or download the app for iOS, Windows, and Android. Jump into a hand in seconds, or install the client for the full desktop experience.',
        'Whether you are grinding cash tables or hunting tournament overlays, the lobby is built for fast discovery on desktop and mobile with the same wallet you already use across BetOnline.',
      ],
    },
    {
      id: 'poker-features',
      title: 'Poker features built for serious play',
      body: ['Tools and table options that keep pots interesting and decisions clear:'],
      list: [
        'All-In Cashout to protect winning hands before the river',
        'Straddle, bomb pot discard, and throwables for bigger action',
        'Heads-up display overlays with key table stats',
        'Triple Threat tournaments with multiple ways to cash',
      ],
    },
    {
      id: 'poker-start',
      title: 'Getting started at BetOnline Poker',
      body: [
        'Create an account, deposit and claim a poker promo, then log in via the app or Play Online. Pick a nickname, transfer funds to your poker wallet, and take a seat — five steps from sign-up to your first hand.',
      ],
    },
    {
      id: 'poker-integrity',
      title: 'Fair play and game integrity',
      body: [
        'Our Game Integrity team works around the clock against bots, multi-accounting, collusion, and seating scripts so every table stays human and competitive. Report suspicious play and we investigate promptly.',
      ],
    },
    {
      id: 'responsible',
      title: 'Responsible gambling tools on your account',
      body: ['Stay in control with tools aligned to our responsible gaming guidelines:'],
      list: [
        'Loss limits',
        'Wager limits',
        'Deposit limits',
        'Cooling-off periods',
        'Break in play',
        'exclusion',
      ],
      after: 'Need help adjusting limits? Contact live support anytime from your account.',
    },
    {
      id: 'banking',
      title: 'Deposits, withdrawals, and your poker wallet',
      body: [
        'Fund your BetOnline wallet with cards, bank options, and popular cryptocurrencies, then transfer to poker when you are ready to play. Withdrawals use the same secure banking flow with clear status updates on BetOnline.ag.',
      ],
    },
  ],
  toc: [
    { id: 'poker-platform', label: 'BetOnline Poker: Play Online or Download the App' },
    { id: 'poker-features', label: 'Poker features built for serious play' },
    { id: 'poker-start', label: 'Getting started at BetOnline Poker' },
    { id: 'poker-integrity', label: 'Fair play and game integrity' },
    { id: 'responsible', label: 'Responsible gambling tools on your account' },
    { id: 'banking', label: 'Deposits, withdrawals, and your poker wallet' },
  ],
}

const SPORTS_SEO: SeoDoc = {
  sections: [
    {
      id: 'sports-home',
      title: 'Sports betting odds and live markets',
      body: [
        'Bet pre-match or in-play across NFL, NBA, MLB, NHL, soccer, MMA, and more. Deep markets, live scoring, and same-wallet play across sports and casino make BetOnline a one-stop sportsbook.',
      ],
    },
    {
      id: 'different',
      title: 'What makes BetOnline different?',
      body: [
        'BetOnline pairs a full sportsbook with casino, poker, VIP rewards, and 24/7 support. Competitive odds, transparent banking, and promotions built around real play.',
      ],
    },
    {
      id: 'responsible',
      title: 'Responsible gambling tools on your account',
      body: ['Stay in control with tools aligned to our responsible gaming guidelines:'],
      list: [
        'Loss limits',
        'Wager limits',
        'Deposit limits',
        'Cooling-off periods',
        'Break in play',
        'exclusion',
      ],
      after: 'Need help adjusting limits? Contact live support anytime from your account.',
    },
    {
      id: 'banking',
      title: 'Deposits and withdrawals on BetOnline',
      body: [
        'Fund your wallet with cards, bank options, and popular cryptocurrencies. Withdrawals move through the same secure banking flow with clear status updates on BetOnline.ag.',
      ],
    },
  ],
  toc: [
    { id: 'sports-home', label: 'Sports betting odds and live markets' },
    { id: 'different', label: 'What makes BetOnline different?' },
    { id: 'responsible', label: 'Responsible gambling tools on your account' },
    { id: 'banking', label: 'Deposits and withdrawals on BetOnline' },
  ],
}

const PROMOTIONS_SEO: SeoDoc = {
  sections: [
    {
      id: 'promos',
      title: 'BetOnline promotions, bonuses, and VIP rewards',
      body: [
        'Explore deposit matches, reload offers, contests, and VIP Hub rewards in one place. Promotions are built around real play across sports, casino, and poker with the same BetOnline wallet.',
      ],
    },
    {
      id: 'responsible',
      title: 'Responsible gambling tools on your account',
      body: ['Stay in control with tools aligned to our responsible gaming guidelines:'],
      list: [
        'Loss limits',
        'Wager limits',
        'Deposit limits',
        'Cooling-off periods',
        'Break in play',
        'exclusion',
      ],
      after: 'Need help adjusting limits? Contact live support anytime from your account.',
    },
  ],
  toc: [
    { id: 'promos', label: 'BetOnline promotions, bonuses, and VIP rewards' },
    { id: 'responsible', label: 'Responsible gambling tools on your account' },
  ],
}

function seoForProduct(product: ShellProduct): SeoDoc {
  if (product === 'poker') return POKER_SEO
  if (product === 'sports') return SPORTS_SEO
  if (product === 'promotions') return PROMOTIONS_SEO
  return CASINO_SEO
}

/** Figma SEO — collapsed 196px clip + Show more. Copy follows active product. */
export function ShellSeo() {
  const { product } = useShell()
  const { sections, toc } = seoForProduct(product)
  const [open, setOpen] = useState(false)

  return (
    <section data-name="SEO" className="bg-background px-6 pb-6">
      <div className="flex w-full flex-col gap-3 rounded-lg border-b border-border bg-card p-6">
        <div className={cn('relative overflow-hidden', open ? 'h-auto' : 'h-[196px]')}>
          <div className="flex items-start justify-center gap-14">
            <div className="flex min-w-0 flex-1 flex-col gap-7">
              {sections.map((section) => (
                <article key={section.id} id={section.id} className="flex flex-col gap-3">
                  <h2 className="text-xl font-semibold leading-7 text-foreground">{section.title}</h2>
                  <div className="flex flex-col gap-3">
                    {section.body.map((paragraph) => (
                      <p key={paragraph.slice(0, 24)} className="text-sm font-normal leading-5 text-foreground">
                        {paragraph}
                      </p>
                    ))}
                    {section.list ? (
                      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-5 text-foreground">
                        {section.list.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                    {section.after ? (
                      <p className="text-sm leading-5 text-foreground">{section.after}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
            <nav className="hidden w-[380px] shrink-0 pt-10 lg:block" aria-label="On this page">
              <p className="mb-3 text-sm font-bold leading-5 text-foreground">On this page</p>
              <ul className="flex flex-col gap-3">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="text-sm font-medium leading-5 text-foreground hover:underline">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-md border-border bg-card px-4 text-sm font-medium text-foreground"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Show less' : 'Show more'}
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
      </div>
    </section>
  )
}
