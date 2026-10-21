import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type ShellIconName =
  | 'account'
  | 'accountBetHistory'
  | 'accountHome'
  | 'accountPayments'
  | 'accountSecurity'
  | 'accountSettings'
  | 'accountTransactions'
  | 'bets'
  | 'bell'
  | 'betslip'
  | 'blackjack'
  | 'bonus'
  | 'broadcast'
  | 'cards'
  | 'caretDown'
  | 'cherry'
  | 'clock'
  | 'contests'
  | 'crown'
  | 'crownMuted'
  | 'crownGold'
  | 'desktop'
  | 'dice'
  | 'diamond'
  | 'football'
  | 'download'
  | 'drawer'
  | 'external'
  | 'favorite'
  | 'fire'
  | 'gear'
  | 'gift'
  | 'globe'
  | 'heart'
  | 'home'
  | 'house'
  | 'lastGame'
  | 'library'
  | 'list'
  | 'live'
  | 'megaphone'
  | 'menu'
  | 'moon'
  | 'play'
  | 'popular'
  | 'promos'
  | 'puzzle'
  | 'random'
  | 'receipt'
  | 'refer'
  | 'rocket'
  | 'search'
  | 'shield'
  | 'shuffle'
  | 'signOut'
  | 'slots'
  | 'soccer'
  | 'spade'
  | 'specialty'
  | 'star'
  | 'start'
  | 'sun'
  | 'table'
  | 'telegram'
  | 'ticket'
  | 'tournaments'
  | 'transactions'
  | 'trophy'
  | 'user'
  | 'userPlus'
  | 'users'
  | 'videoPoker'
  | 'vip'
  | 'virtuals'
  | 'wallet'

const ICONS: Record<ShellIconName, string> = {
  account: '/shell/figma/header/account.svg',
  /** My Account sidebar — Figma WIP My Account SidebarContent */
  accountHome: '/shell/figma/account/nav-user.svg',
  accountBetHistory: '/shell/figma/account/nav-bet-history.svg',
  accountTransactions: '/shell/figma/account/nav-transactions.svg',
  accountPayments: '/shell/figma/account/nav-payments.svg',
  accountSecurity: '/shell/figma/account/nav-security.svg',
  accountSettings: '/shell/figma/account/nav-settings.svg',
  bets: '/shell/figma/sports/bets.svg',
  bell: '/shell/figma/ubc/bell.svg',
  /** Sports dock — Shell 4308:278679 */
  betslip: '/shell/figma/dock/betslip.svg',
  blackjack: '/shell/figma/casino/blackjack.svg',
  bonus: '/shell/figma/promo/bonus.svg',
  broadcast: '/shell/figma/sports/live.svg',
  cards: '/shell/figma/casino/table.svg',
  caretDown: '/shell/figma/header/caret.svg',
  cherry: '/shell/figma/casino/slots.svg',
  clock: '/shell/figma/ubc/betslip.svg',
  contests: '/shell/figma/promo/contests.svg',
  crown: '/shell/figma/ubc/crown.svg',
  /** Shell header logged-out VIP — white @ 60% (preserve; do not chrome-invert). */
  crownMuted: '/shell/figma/header/crown.svg',
  crownGold: '/shell/figma/header/crown-gold.svg',
  desktop: '/shell/figma/casino/video-poker.svg',
  /** Homepage dock — Shell 4308:278685 */
  dice: '/shell/figma/dock/casino-dice.svg',
  diamond: '/shell/figma/poker/diamond.svg',
  download: '/shell/figma/poker/download.svg',
  drawer: '/shell/figma/ubc/drawer.svg',
  external: '/shell/figma/promo/external.svg',
  /** Casino dock — Shell 4308:278672 */
  favorite: '/shell/figma/dock/favorite.svg',
  fire: '/shell/figma/casino/popular.svg',
  football: '/shell/figma/dock/sports-football.svg',
  gear: '/shell/figma/sports/gear.svg',
  gift: '/shell/figma/poker/gift.svg',
  globe: '/shell/rocket.svg',
  heart: '/shell/figma/dock/favorite.svg',
  home: '/shell/figma/casino/home.svg',
  house: '/shell/figma/casino/home.svg',
  lastGame: '/shell/figma/dock/last-game.svg',
  library: '/shell/figma/casino/home.svg',
  list: '/shell/figma/header/menu.svg',
  live: '/shell/figma/casino/live.svg',
  megaphone: '/shell/figma/promo/all.svg',
  menu: '/shell/figma/header/menu.svg',
  moon: '/shell/figma/ubc/moon.svg',
  play: '/shell/figma/poker/play.svg',
  popular: '/shell/figma/casino/popular.svg',
  promos: '/shell/figma/promo/promos.svg',
  puzzle: '/shell/figma/casino/specialty.svg',
  random: '/shell/figma/dock/random.svg',
  receipt: '/shell/figma/ubc/transactions.svg',
  refer: '/shell/figma/promo/refer.svg',
  rocket: '/shell/figma/poker/rocket.svg',
  search: '/shell/figma/dock/search.svg',
  shield: '/shell/figma/poker/shield.svg',
  shuffle: '/shell/figma/casino/random.svg',
  signOut: '/shell/figma/ubc/logout.svg',
  slots: '/shell/figma/casino/slots.svg',
  soccer: '/shell/star.svg',
  spade: '/shell/figma/casino/blackjack.svg',
  specialty: '/shell/figma/casino/specialty.svg',
  star: '/shell/star.svg',
  start: '/shell/figma/poker/start.svg',
  sun: '/shell/figma/ubc/sun.svg',
  table: '/shell/figma/casino/table.svg',
  telegram: '/shell/figma/promo/telegram-mark.svg',
  ticket: '/shell/figma/ubc/ticket.svg',
  tournaments: '/shell/figma/casino/tournaments.svg',
  transactions: '/shell/figma/ubc/transactions.svg',
  trophy: '/shell/figma/casino/tournaments.svg',
  user: '/shell/figma/ubc/user.svg',
  userPlus: '/shell/figma/ubc/user-plus.svg',
  users: '/shell/figma/sports/parlay.svg',
  videoPoker: '/shell/figma/casino/video-poker.svg',
  vip: '/shell/figma/promo/vip.svg',
  /* Stopwatch/bolt — solid black so chrome invert stays bright (not Live Casino flame). */
  virtuals: '/shell/figma/casino/virtuals.svg',
  wallet: '/shell/figma/header/wallet.svg',
}

const PRESERVE_COLOR: Partial<Record<ShellIconName, true>> = {
  crownMuted: true,
  crownGold: true,
}

export function ShellIcon({
  name,
  className = 'size-5',
  active = false,
  tone = 'chrome',
}: {
  name: ShellIconName
  className?: string
  active?: boolean
  tone?: 'chrome' | 'surface' | 'token'
}) {
  const preserve = PRESERVE_COLOR[name]

  /* library / home / house use the Figma house mask — never Lucide (bg-* was painting a white square). */
  if (tone === 'token') {
    return (
      <span
        aria-hidden
        className={cn('inline-block shrink-0 bg-current', className)}
        style={{
          maskImage: `url(${ICONS[name]})`,
          WebkitMaskImage: `url(${ICONS[name]})`,
          maskMode: 'alpha',
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskPosition: 'center',
        }}
      />
    )
  }

  return (
    // Figma vectors — keep the exported width/height via CSS size, never stretch.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ICONS[name]}
      alt=""
      width={20}
      height={20}
      className={cn(
        'max-w-none shrink-0 object-contain',
        !preserve && tone === 'chrome' && 'brightness-0 invert',
        !preserve && tone === 'surface' && 'brightness-0 dark:invert',
        active && 'opacity-100',
        className
      )}
    />
  )
}

export function ShellLogo({
  expanded,
  className,
  onNavigate,
}: {
  expanded: boolean
  className?: string
  /** Fired when the home link is activated (e.g. close mobile drawer). */
  onNavigate?: () => void
}) {
  // Pop only when the rail collapses — not on mount / route changes.
  const prevExpanded = React.useRef(expanded)
  const [pop, setPop] = React.useState(false)

  React.useEffect(() => {
    const wasExpanded = prevExpanded.current
    prevExpanded.current = expanded
    if (wasExpanded && !expanded) {
      setPop(true)
      const id = window.setTimeout(() => setPop(false), 300)
      return () => window.clearTimeout(id)
    }
    setPop(false)
  }, [expanded])

  return (
    <Link
      href="/"
      aria-label="BetOnline home"
      className={cn('relative flex h-8 w-full items-center justify-center', className)}
      onClick={(e) => {
        e.stopPropagation()
        onNavigate?.()
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/shell/figma/logos/wordmark.svg"
        alt="BetOnline"
        width={125}
        height={17}
        className={cn(
          'h-[17px] w-[125px] max-w-none object-contain transition-opacity duration-200 ease-out',
          expanded ? 'relative opacity-100' : 'pointer-events-none absolute opacity-0'
        )}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/shell/figma/logos/lettermark.svg"
        alt=""
        width={36}
        height={26}
        className={cn(
          'h-[26px] w-9 max-w-none object-contain',
          expanded
            ? 'pointer-events-none absolute opacity-0'
            : 'relative opacity-100',
          pop && '[animation:shell-b-pop_280ms_cubic-bezier(0.2,1.4,0.3,1)]'
        )}
      />
    </Link>
  )
}

export function ShellLettermark({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  return (
    <Link
      href="/"
      aria-label="BetOnline home"
      className={cn('inline-flex shrink-0', className)}
      onClick={() => onNavigate?.()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/shell/figma/header/lettermark.svg"
        alt="BetOnline"
        width={36}
        height={26}
        className="h-[26px] w-9 max-w-none object-contain"
      />
    </Link>
  )
}

/** Full BetOnline wordmark — used on homepage (no left rail). */
export function ShellWordmark({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  return (
    <Link
      href="/"
      aria-label="BetOnline home"
      className={cn('inline-flex shrink-0 items-center', className)}
      onClick={() => onNavigate?.()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/shell/figma/logos/wordmark.svg"
        alt="BetOnline"
        width={148}
        height={20}
        className="h-5 w-[148px] max-w-none object-contain"
      />
    </Link>
  )
}
