'use client';

/**
 * Lumen-tokened page mock. Only token-backed utilities are used
 * (bg-primary, text-muted-foreground, rounded-md, …) — `npm run tokens:lint src`
 * fails if anything else sneaks in.
 */
import type { MockSpec } from '@/lib/studio/mock';
import { Badge, Button } from '@/components/lumen';
import { BannerCard, Carousel, DataTable, GameTile, ProviderChip } from '@/components/lumen/data';
import { Footer as ShellFooter, Header, SeoBlock, SubMenu } from '@/components/lumen/shell';

function Nav({ spec }: { spec: MockSpec }) {
  return <Header brand={spec.brand === 'default' ? 'LUMEN' : spec.brand.toUpperCase()} loggedIn={false} active="Casino" />;
}

function Hero({ spec }: { spec: MockSpec }) {
  return (
    <section className="bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-2 md:px-8 md:py-16">
        <div className="flex flex-col justify-center gap-4">
          <span className="self-start">
            <Badge tone="featured">{spec.kicker}</Badge>
          </span>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">{spec.title}</h1>
          <p className="max-w-prose text-base text-muted-foreground md:text-lg">{spec.summary}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="lg">{spec.primaryAction}</Button>
            <Button size="lg" variant="outline">
              {spec.secondaryAction}
            </Button>
          </div>
        </div>
        <div className="grid aspect-video place-items-center rounded-lg border border-border bg-card">
          <div className="h-2/3 w-2/3 rounded-md bg-surface-muted-2" />
        </div>
      </div>
    </section>
  );
}

function Stats({ spec }: { spec: MockSpec }) {
  const stats = [
    ['Players online', '12,480'],
    ['Guaranteed today', '$245K'],
    ['Running now', String(spec.items.length)],
    ['Avg. buy-in', '$55'],
  ];
  return (
    <section className="border-y border-border bg-surface-muted-1">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4 md:px-8">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-md bg-card p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{k}</div>
            <div className="mt-1 text-2xl font-bold">{v}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Cards({ spec }: { spec: MockSpec }) {
  const casino = /casino|slot|poker|lobby/i.test(`${spec.title} ${spec.kicker}`);
  if (casino) {
    const rows = [
      { title: 'Originals', items: spec.items.slice(0, 6), tag: 'Originals' as const },
      { title: 'New Games', items: spec.items.slice(0, 6), tag: 'New' as const },
      { title: 'Live Casino', items: spec.items.slice(0, 6), tag: 'Live' as const },
    ];
    return (
      <section className="bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 md:px-8">
          <div className="flex gap-3 overflow-x-auto">
            <BannerCard title="Welcome bonus" description="100% up to $1,000 on your first deposit." buttonLabel="Claim" tag="New" textColor="dark" />
            <BannerCard title="Weekend race" description="Wager to climb the leaderboard." buttonLabel="Join" textColor="dark" />
            <BannerCard title="VIP hub" description="Open your rewards and progress." buttonLabel="Open" textColor="dark" />
          </div>
          <SubMenu items={['Lobby', 'Slots', 'Bonus Buy', 'Megaways', 'Originals', 'Blackjack', 'Live', 'Jackpots']} />
          {rows.map((row) => (
            <Carousel key={row.title} title={row.title} icon="dice">
              {row.items.map((it, i) => (
                <GameTile key={`${row.title}-${it}`} title={it} tag={row.tag} rank={row.title === 'Originals' && i < 3 ? i + 1 : undefined} />
              ))}
            </Carousel>
          ))}
          <Carousel title="Providers">
            {['Pragmatic Play', 'Evolution', 'NetEnt', 'Playtech', 'Microgaming', 'Red Tiger'].map((n) => (
              <ProviderChip key={n} name={n} />
            ))}
          </Carousel>
        </div>
      </section>
    );
  }
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-xl font-bold md:text-2xl">Featured</h2>
          <span className="text-sm text-link">See all</span>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {spec.items.slice(0, 6).map((it, i) => (
            <article key={it} className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground">
              <div className="aspect-[4/3] bg-surface-muted-2" />
              <div className="flex flex-col gap-2 p-3 md:p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold md:text-base">{it}</h3>
                  {i === 0 ? <Badge tone="live">Live</Badge> : i === 1 ? <Badge tone="vip">VIP</Badge> : null}
                </div>
                <Button size="sm" variant={i === 0 ? 'primary' : 'secondary'}>
                  {spec.primaryAction}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Activity({ spec }: { spec: MockSpec }) {
  void spec;
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <DataTable />
      </div>
    </section>
  );
}

function Seo({ spec }: { spec: MockSpec }) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <SeoBlock
          heading={`${spec.title}: play online`}
          paragraphs={[spec.summary, 'Same Lumen shell as Casino-Lumen — dark header and footer, card surfaces, Figtree only.']}
          toc={['Games', 'Live casino', 'Providers', 'Responsible gaming']}
        />
      </div>
    </section>
  );
}

function Table({ spec }: { spec: MockSpec }) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <h2 className="mb-4 text-xl font-bold md:text-2xl">Schedule</h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted-1 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="hidden px-4 py-3 md:table-cell">Starts</th>
                <th className="hidden px-4 py-3 md:table-cell">Buy-in</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {spec.items.map((it, i) => (
                <tr key={it}>
                  <td className="px-4 py-3 font-medium">{it}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{`${18 + i}:00`}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{`$${[55, 109, 22, 11, 5, 0][i % 6]}`}</td>
                  <td className="px-4 py-3">{i === 0 ? <Badge tone="live">Running</Badge> : i === 1 ? <Badge tone="success">Late reg</Badge> : <Badge>Upcoming</Badge>}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant={i < 2 ? 'primary' : 'outline'}>
                      {spec.primaryAction}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Form({ spec }: { spec: MockSpec }) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-xl px-4 py-10 md:px-8">
        <h1 className="text-2xl font-bold md:text-3xl">{spec.title}</h1>
        <p className="mt-2 text-muted-foreground">{spec.summary}</p>
        <div className="mt-6 flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          {spec.items.map((label) => (
            <label key={label} className="flex flex-col gap-1.5 text-sm font-medium">
              {label}
              <span className="h-10 rounded-md border border-input bg-background px-3 text-sm leading-10 text-muted-foreground">{label}…</span>
            </label>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost">{spec.secondaryAction}</Button>
            <Button>{spec.primaryAction}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Slip({ spec }: { spec: MockSpec }) {
  const chips = ['10', '25', '50', '100'];
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="font-bold">Bet slip</h2>
            <Badge>{spec.items.length} selections</Badge>
          </div>
          <ul className="divide-y divide-border">
            {spec.items.map((sel) => (
              <li key={sel} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="font-medium">{sel}</span>
                <span className="text-muted-foreground">Single</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 border-t border-border bg-surface-muted-1 p-4">
            <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Stake
              <span className="flex h-11 items-center rounded-md border border-input bg-background px-3 text-base text-foreground">$ 25.00</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {chips.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  className={`h-9 rounded-md border text-sm font-semibold ${i === 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-input bg-background text-foreground hover:bg-accent'}`}
                >
                  ${c}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Potential return</span>
              <span className="font-bold">$71.25</span>
            </div>
            <Button size="lg">{spec.primaryAction}</Button>
            <Button variant="ghost" size="sm">
              {spec.secondaryAction}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Leaderboard({ spec }: { spec: MockSpec }) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <h2 className="mb-4 text-xl font-bold md:text-2xl">Tiers</h2>
        <ol className="grid gap-3 md:grid-cols-5">
          {spec.items.slice(0, 5).map((it, i) => (
            <li key={it} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Level {i + 1}</span>
              <span className="text-lg font-bold">{it}</span>
              <span className={`h-1.5 rounded-full ${i < 2 ? 'bg-vip-rewards' : 'bg-surface-muted-2'}`} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Cta({ spec }: { spec: MockSpec }) {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 pb-12 md:px-8">
        <div className="flex flex-col items-start justify-between gap-4 rounded-lg bg-primary p-6 text-primary-foreground md:flex-row md:items-center md:p-8">
          <div>
            <h2 className="text-xl font-bold md:text-2xl">{spec.primaryAction} today</h2>
            <p className="opacity-90">{spec.summary}</p>
          </div>
          <Button variant="secondary" size="lg">
            {spec.primaryAction}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return <ShellFooter />;
}

const SECTION: Record<MockSpec['sections'][number], (p: { spec: MockSpec }) => React.ReactNode> = {
  nav: Nav,
  hero: Hero,
  stats: Stats,
  cards: Cards,
  table: Table,
  form: Form,
  slip: Slip,
  leaderboard: Leaderboard,
  cta: Cta,
  activity: Activity,
  seo: Seo,
  footer: () => <Footer />,
};

export function PrototypeMock({ spec }: { spec: MockSpec }) {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      {spec.sections.map((s, i) => {
        const S = SECTION[s];
        return <S key={`${s}-${i}`} spec={spec} />;
      })}
    </main>
  );
}

