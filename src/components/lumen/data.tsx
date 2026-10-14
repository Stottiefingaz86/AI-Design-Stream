import type { ReactNode } from 'react';
import { Badge, Button } from './index';
import { Favorite } from './casino';

export { Typography } from '@/components/ui/typography';

/* ------------------------------------------------------------- Type scale */
export function TypeScale() {
  return (
    <div className="flex max-w-xl flex-col gap-3 text-foreground">
      <h1 className="text-4xl font-bold leading-tight">H1 · Casino games, live dealers, big wins</h1>
      <h2 className="text-3xl font-bold">H2 · Play slots, live casino & table games</h2>
      <h3 className="text-2xl font-semibold">H3 · Section heading</h3>
      <h4 className="text-xl font-semibold">H4 · Row title (lg / semibold)</h4>
      <p className="text-xl text-muted-foreground">Lead · 20px for banner titles and intros.</p>
      <p className="text-base">Base · 16/24 body text for SEO blocks and descriptions.</p>
      <p className="text-sm">Small · 14/20 default UI text, table cells, nav items.</p>
      <p className="text-xs text-muted-foreground">XS · 12/16 captions, meta, badges.</p>
      <p className="text-xs leading-none text-muted-foreground">XXS · 10/14 tile tags and tiny labels.</p>
      <p className="font-mono text-sm">Mono · 0x2F3A · odds, hashes, codes</p>
    </div>
  );
}

/* ------------------------------------------------------------------- Icon */
const ICONS: Record<string, string> = {
  home: '⌂', search: '⌕', heart: '♡', star: '★', user: '◯', wallet: '▭', crown: '♛', chevron: '›', chevronLeft: '‹', menu: '☰', close: '✕', plus: '+', check: '✓', bell: '🔔', play: '▶', shuffle: '⇄', cup: '🏆', clock: '◷', dice: '⚄', football: '⚽', basketball: '🏀', tennis: '🎾', baseball: '⚾',
};
export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 'md', className = '' }: { name: IconName; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const s = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }[size];
  return (
    <span aria-hidden className={`inline-flex items-center justify-center leading-none ${s} ${className}`}>
      {ICONS[name] ?? '•'}
    </span>
  );
}

export function IconButton({ icon, label, variant = 'ghost', size = 'md', active }: { icon: IconName; label: string; variant?: 'ghost' | 'outline' | 'primary' | 'vip' | 'secondary'; size?: 'sm' | 'md' | 'lg'; active?: boolean }) {
  const v = {
    ghost: 'bg-transparent text-foreground hover:bg-accent',
    outline: 'border border-input bg-background text-foreground hover:bg-accent',
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    vip: 'bg-vip-rewards text-vip-rewards-foreground hover:opacity-90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
  }[variant];
  const s = { sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-11 w-11' }[size];
  return (
    <button type="button" aria-label={label} aria-pressed={active} className={`inline-flex shrink-0 items-center justify-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${v} ${s} ${active ? 'ring-2 ring-primary' : ''}`}>
      <Icon name={icon} />
    </button>
  );
}

/* ----------------------------------------------------------------- Avatar */
export function Avatar({ name, src, size = 'md', status }: { name: string; src?: string; size?: 'sm' | 'md' | 'lg'; status?: 'online' | 'away' }) {
  const s = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base' }[size];
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="relative inline-flex">
      {src ? <img src={src} alt={name} className={`rounded-full object-cover ${s}`} /> : <span className={`inline-flex items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground ${s}`}>{initials}</span>}
      {status ? <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background ${status === 'online' ? 'bg-success' : 'bg-warning'}`} /> : null}
    </span>
  );
}

export function Separator({ orientation = 'horizontal', label }: { orientation?: 'horizontal' | 'vertical'; label?: string }) {
  if (orientation === 'vertical') return <span role="separator" aria-orientation="vertical" className="inline-block h-6 w-px bg-border" />;
  if (label)
    return (
      <div role="separator" className="flex w-full items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        {label}
        <span className="h-px flex-1 bg-border" />
      </div>
    );
  return <hr className="w-full border-0 border-t border-border" />;
}

/* ------------------------------------------------------------------ Table */
export interface Column<T> {
  key: keyof T & string;
  header: string;
  align?: 'left' | 'right';
  render?: (row: T) => ReactNode;
}

export function Table<T extends Record<string, ReactNode>>({ columns, rows, caption }: { columns: Column<T>[]; rows: T[]; caption?: string }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
      <table className="w-full text-sm">
        {caption ? <caption className="px-4 py-2 text-left text-xs text-muted-foreground">{caption}</caption> : null}
        <thead className="bg-surface-muted-1 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-4 py-2 font-medium ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-accent">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-2.5 ${c.align === 'right' ? 'text-right' : ''}`}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Activity table from the casino lobby: tabs above, win payouts in success. */
export function DataTable() {
  type Row = { game: string; player: string; bet: string; mult: string; payout: string; win: boolean };
  const rows: Row[] = [
    { game: 'Blackjack', player: 'Play_Gusto', bet: '$1,275.03', mult: '1.75x', payout: '$2,231.30', win: true },
    { game: 'Roulette', player: 'Wild Smiley Boy', bet: '$150.00', mult: '0.00x', payout: '-$150.00', win: false },
    { game: 'Duck Hunt', player: 'Chicken Fajita', bet: '$83.90', mult: '2.90x', payout: '$243.31', win: true },
    { game: 'Live Baccarat', player: 'Bear Patch', bet: '$2,000.00', mult: '0.00x', payout: '-$2,000.00', win: false },
  ];
  const cols: Column<Row & Record<string, ReactNode>>[] = [
    { key: 'game', header: 'Game' },
    { key: 'player', header: 'Player' },
    { key: 'bet', header: 'Bet amount', align: 'right' },
    { key: 'mult', header: 'Multiplier', align: 'right' },
    { key: 'payout', header: 'Payout', align: 'right', render: (r) => <span className={r.win ? 'font-semibold text-success' : 'text-muted-foreground'}>{r.payout}</span> },
  ];
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="inline-flex gap-2">
        {['All Bets', 'Jackpot Winners', 'Big Wins'].map((t, i) => (
          <button key={t} type="button" className={`h-8 rounded-full px-3 text-xs font-medium ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-accent'}`}>
            {t}
          </button>
        ))}
      </div>
      <Table columns={cols} rows={rows as (Row & Record<string, ReactNode>)[]} />
    </div>
  );
}

/* ------------------------------------------------------------- Portable text */
export function PortableText({ children }: { children?: ReactNode }) {
  return (
    <article className="prose-lumen max-w-prose text-sm text-foreground">
      {children ?? (
        <>
          <h2 className="text-xl font-semibold">Casino Games: Play Slots, Live Casino & Table Games Online</h2>
          <p className="mt-2 text-muted-foreground">Looking for a trusted place to play online casino games? BrandName brings together thousands of slots, live dealer tables, and classic casino favourites in one lobby.</p>
          <ul className="mt-2 list-disc pl-5 text-muted-foreground">
            <li>Progressive jackpots to high-volatility video slots</li>
            <li>Blackjack, roulette, baccarat and craps</li>
          </ul>
          <p className="mt-2 text-muted-foreground">
            Read the <a className="text-link underline-offset-4 hover:underline">responsible gaming</a> guide before you play.
          </p>
        </>
      )}
    </article>
  );
}

/* ----------------------------------------------------- Casino lobby blocks */
export function BannerCard({
  title,
  description,
  body,
  buttonLabel,
  action,
  tag,
  imageSrc,
  backgroundColor,
  textColor = 'light',
}: {
  title: string;
  description?: string;
  body?: string;
  buttonLabel?: string;
  action?: string;
  tag?: string;
  imageSrc?: string;
  backgroundColor?: string;
  textColor?: 'light' | 'dark';
}) {
  const copy = description ?? body ?? '';
  const cta = buttonLabel ?? action ?? 'Claim now';
  const light = textColor === 'light';
  return (
    <article
      className="relative h-[164px] w-[340px] shrink-0 overflow-hidden rounded-[10px] shadow-sm"
      style={{ backgroundColor: backgroundColor ?? 'var(--card)' }}
    >
      {imageSrc ? <img src={imageSrc} alt="" className="absolute inset-0 size-full object-cover" /> : null}
      <div className={`relative z-10 flex h-full flex-col justify-between p-4 ${light ? 'text-fixed-strong-foreground' : 'text-foreground'}`}>
        <div>
          {tag ? <Badge tone="featured">{tag}</Badge> : null}
          <h3 className="mt-1 text-lg font-bold leading-tight">{title}</h3>
          <p className={`mt-1 line-clamp-2 text-xs ${light ? 'opacity-80' : 'text-muted-foreground'}`}>{copy}</p>
        </div>
        <div>
          <Button size="sm">{cta}</Button>
        </div>
      </div>
    </article>
  );
}

export function GameTile({ title, tag, rank, live }: { title: string; tag?: 'Originals' | 'Exclusive' | 'New' | 'Live'; rank?: number; live?: boolean }) {
  return (
    <article className="relative aspect-[152/207] w-36 shrink-0 overflow-hidden rounded-md bg-surface-muted-3 text-foreground">
      <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-b from-transparent to-surface-muted-5 pb-3 text-center text-xs font-bold uppercase tracking-wide">{title}</div>
      {tag ? (
        <span className="absolute left-1.5 top-1.5">
          <Badge tone={tag === 'Live' || live ? 'live' : tag === 'Exclusive' ? 'vip' : tag === 'New' ? 'featured' : 'muted'}>{tag}</Badge>
        </span>
      ) : null}
      <span className="absolute right-1.5 top-1.5">
        <Favorite />
      </span>
      {rank ? <span className="absolute -bottom-2 -left-1 text-6xl font-black leading-none text-foreground opacity-80">{rank}</span> : null}
    </article>
  );
}

/** Row header + horizontal scroller from the casino lobby. */
export function Carousel({ title, icon, children }: { title: string; icon?: IconName; children: ReactNode }) {
  return (
    <section className="flex w-full flex-col gap-3">
      <header className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          {icon ? <Icon name={icon} /> : null}
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <button type="button" className="text-sm text-muted-foreground hover:text-foreground">
            See More
          </button>
          <IconButton icon="chevronLeft" label="Previous" variant="outline" size="sm" />
          <IconButton icon="chevron" label="Next" variant="outline" size="sm" />
        </div>
      </header>
      <div className="flex gap-3 overflow-x-auto pb-1">{children}</div>
    </section>
  );
}

export function ProviderChip({ name }: { name: string }) {
  return (
    <span className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm text-card-foreground">
      <span className="h-4 w-4 rounded-sm bg-primary" aria-hidden />
      {name}
    </span>
  );
}
