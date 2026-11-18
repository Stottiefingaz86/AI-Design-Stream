'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ParticleBurst, Shimmer, SlidingIndicator } from '@/components/lumen/animations'
import { ShellIcon, type ShellIconName } from '@/components/site/shell-icons'
import { ShellMobileNav } from '@/components/site/shell-mobile-nav'
import { fireJoinWelcomeConfetti } from '@/lib/lumen/vip-celebrate'
import type { LumenStory } from './types'

/** Includes Casino Lobby (`library`) — left-rail lobby mark. */
const ICON_SAMPLE: ShellIconName[] = [
  'library',
  'home',
  'dice',
  'football',
  'vip',
  'wallet',
  'search',
  'favorite',
  'random',
  'lastGame',
  'betslip',
  'ticket',
  'bonus',
  'promos',
  'contests',
  'refer',
  'gift',
  'bell',
  'account',
  'shield',
  'menu',
  'drawer',
  'play',
  'slots',
  'blackjack',
  'live',
  'soccer',
  'crown',
  'trophy',
  'users',
  'signOut',
]

const ICON_LABEL: Partial<Record<ShellIconName, string>> = {
  library: 'Casino Lobby',
  dice: 'Casino (dock)',
  home: 'Home',
}

export const MOTION_ICON_STORIES: LumenStory[] = [
  {
    id: 'icons-shell-full',
    title: 'Shell icons (full set)',
    group: 'Foundations',
    description: 'Full Figma-exported ShellIcon set — prefer over Tabler when a mark exists.',
    importPath: '@/components/site/shell-icons',
    code: `import { ShellIcon } from '@/components/site/shell-icons'

<ShellIcon name="vip" tone="token" className="size-6" />
<ShellIcon name="library" tone="token" className="size-6" />`,
    render: () => (
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
        {ICON_SAMPLE.map((name) => (
          <div
            key={name}
            className="flex flex-col items-center gap-2 rounded-[10px] border border-border bg-card p-3"
          >
            <ShellIcon name={name} tone="token" className="size-6 text-foreground" />
            <span className="truncate text-center text-[10px] text-muted-foreground">
              {ICON_LABEL[name] ?? name}
            </span>
            {ICON_LABEL[name] ? (
              <span className="truncate font-mono text-[9px] text-muted-foreground/70">{name}</span>
            ) : null}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'motion-confetti',
    title: 'Confetti',
    group: 'Motion',
    description:
      'Real site celebrate — canvas-confetti via fireJoinWelcomeConfetti (join / VIP claim). Not the CSS dot helper.',
    importPath: '@/lib/lumen/vip-celebrate',
    code: `import { fireJoinWelcomeConfetti } from '@/lib/lumen/vip-celebrate'

/* Same burst as Join welcome + VIP claim */
fireJoinWelcomeConfetti()`,
    render: () => {
      const Demo = () => (
        <div data-lumen-allow="" className="space-y-3">
          <Button type="button" onClick={() => fireJoinWelcomeConfetti()}>
            Fire claim confetti
          </Button>
          <p className="max-w-md text-sm text-muted-foreground">
            Side cannons + centre pop over the viewport (same as join “You’re in” / VIP claim).
            The old preview used a CSS particle strip — that wasn’t the live effect.
          </p>
        </div>
      )
      return <Demo />
    },
  },
  {
    id: 'motion-particle-shimmer',
    title: 'Particle burst · shimmer',
    group: 'Motion',
    description: 'Favorite burst + CTA shimmer wraps.',
    importPath: '@/components/lumen/animations',
    code: `import { ParticleBurst, Shimmer } from '@/components/lumen/animations'

<ParticleBurst playing>
  <button>♥</button>
</ParticleBurst>

<Shimmer tint="primary" trigger="hover">
  <Button>Claim</Button>
</Shimmer>`,
    render: () => {
      const Demo = () => {
        const [play, setPlay] = useState(false)
        return (
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm"
              onClick={() => {
                setPlay(true)
                window.setTimeout(() => setPlay(false), 700)
              }}
            >
              <ParticleBurst playing={play} count={12}>
                <span className="text-primary">♥ Favorite</span>
              </ParticleBurst>
            </button>
            <Shimmer tint="primary" trigger="hover">
              <Button type="button">Claim</Button>
            </Shimmer>
            <SlidingIndicator
              items={['Lobby', 'Slots', 'Live']}
              variant="pills"
            />
          </div>
        )
      }
      return <Demo />
    },
  },
  {
    id: 'shell-mobile-dock',
    title: 'Mobile dock',
    group: 'Shell',
    description: 'Floating nav-menu-icon-solid dock — Casino / Sports / Promos variants.',
    importPath: '@/components/site/shell-mobile-nav',
    code: `import { ShellMobileNav } from '@/components/site/shell-mobile-nav'

/* Mounted in ShellFrame — path picks HOME / CASINO / SPORTS / PROMOS dock */`,
    render: () => (
      <div className="relative mx-auto h-[220px] w-full max-w-[390px] overflow-hidden rounded-[14px] border border-border bg-[#121212]">
        <p className="px-4 pt-4 text-xs text-muted-foreground">
          Preview host — dock pins to bottom (live ShellMobileNav).
        </p>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 [&_a]:pointer-events-none">
          <ShellMobileNav />
        </div>
      </div>
    ),
  },
]
