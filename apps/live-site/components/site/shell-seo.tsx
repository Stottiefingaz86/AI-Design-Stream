'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SECTIONS = [
  {
    id: 'casino-games',
    title: 'H2 Casino Games: Play Slots, Live Casino & Table Games Online',
    body: [
      'Looking for a trusted place to play online casino games? BrandName brings together thousands of slots, live dealer tables, and classic casino favorites in one lobby. From progressive jackpots to high-volatility video slots, blackjack, roulette, baccarat, and craps, everything is built for fast discovery on desktop and mobile.',
      'New and returning players can jump straight into popular titles, filter by category, or open live casino rooms with real dealers streaming in real time. Crypto and local payment options make deposits simple, so you spend less time funding and more time playing.',
    ],
  },
  {
    id: 'different',
    title: 'H2 What makes BetOnline different?',
    body: [
      'BetOnline pairs a full sportsbook with a deep casino product, VIP rewards, and 24/7 support. Competitive odds, transparent banking, and promotions built around real play give you a complete wagering experience, not a stripped-down casino clone.',
    ],
  },
  {
    id: 'live-casino',
    title: 'H2 Live casino, slots, and table games explained',
    body: [
      'Our casino lobby covers slots from top studios plus blackjack, roulette, baccarat, keno, and video poker. Live casino tables stream professional dealers so you get floor-game atmosphere without leaving home.',
      'Prefer sports? Switch into the sportsbook for NFL, NBA, MLB, NHL, soccer, MMA, and live in-play markets, then come back to casino for a different pace of play.',
    ],
  },
  {
    id: 'bonus',
    title: 'H2 Bonus features, themes & games on BetOnline',
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
    title: 'H2 Responsible gambling tools on your account',
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
    title: 'H2 Deposits and withdrawals on BetOnline',
    body: [
      'Fund your wallet with cards, bank options, and popular cryptocurrencies. Withdrawals move through the same secure banking flow, with clear status updates so you always know where your money stands on BetOnline.ag.',
    ],
  },
  {
    id: 'sports',
    title: 'H2 Sports betting odds and live markets',
    body: [
      'Bet pre-match or in-play across major leagues and props. Deep markets, live scoring, and same-wallet casino play make BetOnline a one-stop destination for sports and casino.',
    ],
  },
] as const

const TOC = [
  { id: 'casino-games', label: 'BetOnline Casino Games: Play Slots, Live Casino & Table Games Online' },
  { id: 'different', label: 'What makes BetOnline different?' },
  { id: 'live-casino', label: 'Live casino, slots, and table games explained' },
  { id: 'bonus', label: 'Bonus features, themes & games on BetOnline' },
  { id: 'responsible', label: 'Responsible gambling tools on your account' },
  { id: 'banking', label: 'Deposits and withdrawals on BetOnline' },
  { id: 'sports', label: 'Sports betting odds and live markets' },
] as const

/** Figma SEO — collapsed 196px clip + Show more. Light card on light page. */
export function ShellSeo() {
  const [open, setOpen] = useState(false)

  return (
    <section data-name="SEO" className="bg-background px-6 pb-6">
      <div className="flex w-full max-w-[1440px] flex-col gap-3 rounded-lg border-b border-border bg-card p-6">
        <div className={cn('relative overflow-hidden', open ? 'h-auto' : 'h-[196px]')}>
          <div className="flex items-start justify-center gap-14">
            <div className="flex min-w-0 flex-1 flex-col gap-7">
              {SECTIONS.map((section) => (
                <article key={section.id} id={section.id} className="flex flex-col gap-3">
                  <h2 className="text-xl font-semibold leading-7 text-foreground">{section.title}</h2>
                  <div className="flex flex-col gap-3">
                    {section.body.map((paragraph) => (
                      <p key={paragraph.slice(0, 24)} className="text-sm font-normal leading-5 text-foreground">
                        {paragraph}
                      </p>
                    ))}
                    {'list' in section && section.list ? (
                      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-5 text-foreground">
                        {section.list.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                    {'after' in section && section.after ? (
                      <p className="text-sm leading-5 text-foreground">{section.after}</p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
            <nav className="hidden w-[380px] shrink-0 pt-10 lg:block" aria-label="On this page">
              <p className="mb-3 text-sm font-bold leading-5 text-foreground">On this page</p>
              <ul className="flex flex-col gap-3">
                {TOC.map((item) => (
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
