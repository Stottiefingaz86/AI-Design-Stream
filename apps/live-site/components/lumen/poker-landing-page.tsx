'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { ShellSeo } from '@/components/site/shell-seo';
import {
  POKER_DOWNLOADS,
  POKER_FEATURES,
  POKER_INTEGRITY,
  POKER_STEPS,
} from '@/lib/lumen/poker-landing-promos';
import { cn } from '@/lib/utils';

function DownloadChip({ label, icon }: { label: string; icon: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-3"
    >
      <img src={icon} alt="" className="size-8" />
      <span className="flex flex-col items-start leading-none">
        <span className="text-[10px] leading-[14px] text-muted-foreground">Download for</span>
        <span className="text-sm font-semibold text-secondary-foreground">{label}</span>
      </span>
    </button>
  );
}

function PokerHero() {
  return (
    <section data-name="poker_hero" className="px-6 py-8 md:px-8">
      <div className="overflow-hidden rounded-3xl bg-card">
        <div className="grid md:grid-cols-[1fr_minmax(280px,46%)]">
          <div className="flex flex-col justify-center gap-6 px-8 py-10 md:px-14 md:py-14">
            <Typography as="h1" shape="h1" weight="bold" className="text-[48px] leading-none">
              The BetOnline
              <br />
              Poker Platform
            </Typography>
            <Typography as="p" shape="paragraph" variant="muted" className="max-w-lg">
              Play online or download the BetOnline poker app today, available on IOS, PC, and Android.
            </Typography>
            <Button size="lg" className="w-fit">
              Play Online
            </Button>
            <div className="h-px w-full bg-border" />
            <div className="flex flex-wrap gap-4">
              {POKER_DOWNLOADS.map((item) => (
                <DownloadChip key={item.id} label={item.label} icon={item.icon} />
              ))}
            </div>
          </div>
          <div className="relative min-h-[280px] overflow-hidden rounded-[10px] bg-[red] md:min-h-[470px]">
            <img
              src="/poker/hero-ape.svg"
              alt=""
              className="absolute inset-[8%] h-[84%] w-[84%] object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function PokerFeatures() {
  return (
    <section data-name="poker_features" className="bg-background px-6 py-14 md:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-11">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography as="h2" shape="h2" weight="semibold">
            Our Top Features
          </Typography>
          <Typography as="p" shape="paragraph" variant="muted" className="max-w-[900px]">
            Some of the features available. Play Now or Download our poker software to try them out.
          </Typography>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {POKER_FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="overflow-hidden rounded-[10px] border border-border bg-card shadow-[0_0_16px_0_rgba(0,0,0,0.06)]"
            >
              <div className="aspect-[280/140] overflow-hidden bg-surface-muted-3">
                <img src="/poker/feature-chest.png" alt="" className="size-full object-cover object-bottom" />
              </div>
              <div className="flex flex-col gap-2 px-6 pb-6 pt-6">
                <Typography as="h3" shape="lead" weight="semibold">
                  {feature.title}
                </Typography>
                <Typography as="p" shape="small" variant="muted">
                  {feature.body}
                </Typography>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PokerGettingStarted() {
  return (
    <section data-name="poker_steps" className="bg-surface-muted-1 px-6 py-14 md:px-8">
      <div className="mx-auto flex max-w-[740px] flex-col items-center gap-11">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography as="h2" shape="h2" weight="semibold">
            Getting Started
          </Typography>
          <Typography as="p" shape="paragraph" variant="muted">
            Five quick steps from sign-up to your first hand at the tables.
          </Typography>
        </div>
        <div className="flex w-full flex-col gap-3">
          {POKER_STEPS.map((item) => (
            <Card
              key={item.step}
              className="flex items-start gap-6 rounded-[10px] border border-border bg-card p-6 shadow-none"
            >
              <span className="grid size-[38px] shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {item.step}
              </span>
              <div className="min-w-0 flex-1">
                <Typography as="h3" shape="lead" weight="semibold">
                  {item.title}
                </Typography>
                <Typography as="p" shape="small" variant="muted" className="mt-3">
                  {item.body}
                </Typography>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">
                {item.action}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function PokerIntegrity() {
  return (
    <section data-name="poker_integrity" className="bg-background px-6 py-14 md:px-8">
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-11">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography as="h2" shape="h2" weight="semibold">
            Ensuring a Fair and Trustworthy Poker Experience
          </Typography>
          <Typography as="p" shape="paragraph" variant="muted" className="max-w-[900px]">
            Our Game Integrity team protects every table so you can focus on the cards in front of you.
          </Typography>
        </div>
        <div className="relative aspect-[1248/435] w-full overflow-hidden rounded">
          <img src="/poker/integrity.png" alt="" className="size-full object-cover" />
        </div>
        <div className="grid w-full gap-8 md:grid-cols-2">
          {POKER_INTEGRITY.map((item) => (
            <div key={item.title} className="flex flex-col gap-4">
              <Typography as="h3" shape="lead" weight="semibold">
                {item.title}
              </Typography>
              <Typography as="p" shape="small" variant="muted">
                {item.body}
              </Typography>
            </div>
          ))}
        </div>
        <Typography as="p" shape="small" className="w-full">
          BetOnline&apos;s Game Integrity team is your stalwart ally in ensuring a fair, enjoyable poker
          experience. Through our vigilant detection systems, comprehensive investigations, and resolute
          stance against rule violations, BetOnline stands as a beacon of trust and reliability in the
          online poker world.
        </Typography>
        <Button size="lg">Poker Help Center</Button>
      </div>
    </section>
  );
}

function PokerDownload() {
  return (
    <section data-name="poker_download" className="bg-surface-muted-1 px-6 py-14 md:px-8">
      <div className="mx-auto flex max-w-[1300px] flex-col items-center gap-11 rounded-3xl bg-card px-8 py-14">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography as="h2" shape="h2" weight="semibold">
            Download Our Poker App
          </Typography>
          <Typography as="p" shape="paragraph" variant="muted" className="max-w-[900px]">
            Available on all major platforms. Get the best poker experience on any device.
          </Typography>
        </div>
        <div className="flex w-full max-w-[792px] flex-wrap justify-center gap-4">
          {POKER_DOWNLOADS.map((item) => (
            <DownloadChip key={item.id} label={item.label} icon={item.icon} />
          ))}
        </div>
      </div>
    </section>
  );
}

export type PokerLandingPageProps = {
  className?: string;
};

/** Poker_Landing-Page 78:163252 — content only. Chrome is PokerProductShell. */
export function PokerLandingPage({ className }: PokerLandingPageProps) {
  return (
    <div data-name="poker_landing_content" className={cn('w-full bg-background', className)}>
      <PokerHero />
      <PokerFeatures />
      <PokerGettingStarted />
      <PokerIntegrity />
      <PokerDownload />
      <ShellSeo />
    </div>
  );
}
