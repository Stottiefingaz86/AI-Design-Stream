import { cn } from '@/lib/utils'

export type ShellIconName =
  | 'account'
  | 'bets'
  | 'bell'
  | 'betslip'
  | 'blackjack'
  | 'broadcast'
  | 'cards'
  | 'caretDown'
  | 'cherry'
  | 'clock'
  | 'contests'
  | 'crown'
  | 'crownGold'
  | 'desktop'
  | 'diamond'
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
  | 'list'
  | 'live'
  | 'megaphone'
  | 'menu'
  | 'moon'
  | 'play'
  | 'popular'
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
  | 'wallet'

const ICONS: Record<ShellIconName, string> = {
  account: '/shell/figma/header/account.svg',
  bets: '/shell/figma/sports/bets.svg',
  bell: '/shell/figma/ubc/bell.svg',
  betslip: '/shell/figma/ubc/betslip.svg',
  blackjack: '/shell/figma/casino/blackjack.svg',
  broadcast: '/shell/figma/sports/live.svg',
  cards: '/shell/figma/casino/table.svg',
  caretDown: '/shell/figma/header/caret.svg',
  cherry: '/shell/figma/casino/slots.svg',
  clock: '/shell/figma/ubc/betslip.svg',
  contests: '/shell/figma/promo/contests.svg',
  crown: '/shell/figma/ubc/crown.svg',
  crownGold: '/shell/figma/header/crown-gold.svg',
  desktop: '/shell/figma/casino/video-poker.svg',
  diamond: '/shell/figma/poker/diamond.svg',
  download: '/shell/figma/poker/download.svg',
  drawer: '/shell/figma/ubc/drawer.svg',
  external: '/shell/figma/promo/external.svg',
  favorite: '/shell/figma/casino/favorite.svg',
  fire: '/shell/figma/casino/popular.svg',
  gear: '/shell/figma/sports/gear.svg',
  gift: '/shell/figma/ubc/gift.svg',
  globe: '/shell/rocket.svg',
  heart: '/shell/figma/casino/favorite.svg',
  home: '/shell/figma/casino/home.svg',
  house: '/shell/figma/casino/home.svg',
  lastGame: '/shell/figma/casino/last-game.svg',
  list: '/shell/figma/header/menu.svg',
  live: '/shell/figma/casino/live.svg',
  megaphone: '/shell/figma/promo/all.svg',
  menu: '/shell/figma/header/menu.svg',
  moon: '/shell/figma/ubc/moon.svg',
  play: '/shell/figma/poker/play.svg',
  popular: '/shell/figma/casino/popular.svg',
  puzzle: '/shell/figma/casino/specialty.svg',
  random: '/shell/figma/casino/random.svg',
  receipt: '/shell/figma/ubc/transactions.svg',
  refer: '/shell/figma/promo/refer.svg',
  rocket: '/shell/figma/sports/rocket.svg',
  search: '/shell/figma/header/search.svg',
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
  telegram: '/shell/figma/promo/telegram.svg',
  ticket: '/shell/figma/ubc/ticket.svg',
  tournaments: '/shell/figma/casino/tournaments.svg',
  transactions: '/shell/figma/ubc/transactions.svg',
  trophy: '/shell/figma/casino/tournaments.svg',
  user: '/shell/figma/ubc/user.svg',
  userPlus: '/shell/figma/ubc/user-plus.svg',
  users: '/shell/figma/sports/parlay.svg',
  videoPoker: '/shell/figma/casino/video-poker.svg',
  vip: '/shell/figma/promo/vip.svg',
  wallet: '/shell/figma/header/wallet.svg',
}

const PRESERVE_COLOR: Partial<Record<ShellIconName, true>> = {
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
  tone?: 'chrome' | 'surface'
}) {
  const preserve = PRESERVE_COLOR[name]

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
}: {
  expanded: boolean
  className?: string
}) {
  return (
    <span className={cn('relative flex h-8 w-full items-center justify-center', className)}>
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
        key={expanded ? 'mark' : 'pop'}
        src="/shell/figma/logos/lettermark.svg"
        alt=""
        width={36}
        height={26}
        className={cn(
          'h-[26px] w-9 max-w-none object-contain',
          expanded
            ? 'pointer-events-none absolute opacity-0'
            : 'relative opacity-100 [animation:shell-b-pop_280ms_cubic-bezier(0.2,1.4,0.3,1)]'
        )}
      />
    </span>
  )
}

export function ShellLettermark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/shell/figma/header/lettermark.svg"
      alt="BetOnline"
      width={36}
      height={26}
      className={cn('h-[26px] w-9 max-w-none shrink-0 object-contain', className)}
    />
  )
}
