'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import {
  POKER_DOWNLOADS,
  POKER_FEATURES,
  POKER_INTEGRITY,
  POKER_STEPS,
} from '@/lib/lumen/poker-landing-promos'
import { scrollShellToId } from '@/lib/lumen/shell-scroll'
import { cn } from '@/lib/utils'

const TILE_SPRING = { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.85 }

const CHIP_HOVER =
  'transition-[background-color,border-color,transform] duration-150 hover:border-white/25 hover:bg-white/[0.08] active:scale-[0.98]'

/** iOS mark — currentColor tracks --secondary-foreground (white in dark). */
function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8 shrink-0', className)} aria-hidden>
      <path
        fill="currentColor"
        d="M20.149 3.847c.1 1.315-.315 2.617-1.159 3.63a4.33 4.33 0 0 1-1.5 1.183 4.25 4.25 0 0 1-1.866.408c-.041-.632.043-1.266.247-1.866.204-.6.524-1.153.942-1.629.855-.974 2.046-1.59 3.336-1.726Z"
      />
      <path
        fill="currentColor"
        d="M22.501 13.416a4.84 4.84 0 0 0-.67 2.473c.001.977.29 1.931.83 2.745a5.05 5.05 0 0 0 2.206 1.83 10.4 10.4 0 0 1-1.579 3.216c-.93 1.391-1.905 2.75-3.453 2.776-.736.017-1.233-.195-1.751-.416-.54-.23-1.103-.47-1.983-.47-.934 0-1.522.248-2.089.486-.49.207-.965.406-1.633.434-1.474.055-2.6-1.485-3.565-2.863-1.926-2.815-3.426-7.932-1.415-11.414a4.73 4.73 0 0 1 1.952-2.031 4.8 4.8 0 0 1 2.699-.806c.836-.017 1.638.305 2.342.588.537.216 1.017.408 1.41.408.346 0 .812-.185 1.356-.401.857-.34 1.905-.756 2.973-.644.819.026 1.62.242 2.34.631.721.39 1.341.942 1.81 1.613a4.84 4.84 0 0 0-1.78 1.844Z"
      />
    </svg>
  )
}

function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8 shrink-0', className)} aria-hidden>
      <path fill="#F35325" d="M5.333 5.333h10.159v10.159H5.333V5.333Z" />
      <path fill="#81BC06" d="M16.508 5.333h10.159v10.159H16.508V5.333Z" />
      <path fill="#05A6F0" d="M5.333 16.508h10.159v10.159H5.333V16.508Z" />
      <path fill="#FFBA08" d="M16.508 16.508h10.159v10.159H16.508V16.508Z" />
    </svg>
  )
}

/** Brand-green Android head — Figma Domain-Button wrongly exports a black Apple for this slot. */
function AndroidIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8 shrink-0', className)} aria-hidden>
      <path
        fill="#3DDC84"
        d="M23.467 12.64 25.92 8.4a.556.556 0 0 0-.213-.76.556.556 0 0 0-.76.213l-2.507 4.334a13.72 13.72 0 0 0-5.44-1.12c-1.92 0-3.733.4-5.44 1.12L8.053 7.853a.556.556 0 0 0-.76-.213.556.556 0 0 0-.213.76l2.453 4.24C5.813 14.613 3.733 17.787 3.733 21.6h24.534c0-3.813-2.08-6.987-4.8-8.96ZM10.667 18.133a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2Zm10.666 0a1.6 1.6 0 1 1 0-3.2 1.6 1.6 0 0 1 0 3.2Z"
      />
    </svg>
  )
}

function DownloadChipIcon({ id }: { id: string }) {
  if (id === 'ios') return <AppleIcon className="text-secondary-foreground" />
  if (id === 'windows') return <WindowsIcon />
  return <AndroidIcon />
}

function DownloadChip({
  id,
  label,
  className,
}: {
  id: string
  label: string
  className?: string
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary p-3 text-secondary-foreground',
        CHIP_HOVER,
        className,
      )}
    >
      <DownloadChipIcon id={id} />
      <span className="flex flex-col items-start leading-none">
        <span className="text-[10px] leading-[14px] text-muted-foreground">Download for</span>
        <span className="text-sm font-semibold leading-5">{label}</span>
      </span>
    </button>
  )
}

/** Figma 413:145820 — composed NFT + cards on --primary. */
function PokerHeroArt() {
  return (
    <div
      data-name="poker-hero-art"
      className="relative min-h-[280px] w-full flex-1 self-stretch overflow-hidden rounded-[10px] bg-primary md:min-h-[470px] md:min-w-0 md:w-auto"
    >
      <img
        src="/poker/hero-art.png"
        alt=""
        className="absolute inset-0 size-full object-cover object-[center_bottom]"
      />
    </div>
  )
}

function PokerHero() {
  /** Mobile hero (Figma 78:163511) — iOS + Android side-by-side; Windows stays in download block. */
  const heroDownloads = POKER_DOWNLOADS.filter((item) => item.id !== 'windows')

  return (
    <section
      id="poker-start"
      data-name="poker_hero"
      className="scroll-mt-24 bg-background px-4 pt-6 md:px-6 md:pt-8"
    >
      <div className="overflow-hidden rounded-3xl bg-card">
        <div className="flex flex-col md:flex-row md:items-stretch">
          <div className="flex min-w-0 flex-1 flex-col items-stretch gap-6 px-6 py-10 md:min-w-[476px] md:items-start md:py-14 md:pl-14 md:pr-6">
            <Typography
              as="h1"
              shape="h1"
              weight="bold"
              className="text-[40px] leading-none text-foreground md:text-[48px]"
            >
              The BetOnline
              <br />
              Poker Platform
            </Typography>
            <Typography
              as="p"
              shape="paragraph"
              variant="muted"
              className="max-w-lg text-base leading-6 text-muted-foreground"
            >
              Play online or download the BetOnline poker app today, available on IOS, PC, and Android.
            </Typography>
            <Button size="lg" className="w-full md:w-fit">
              Play Online
            </Button>
            <div className="h-px w-full bg-border" />
            {/* Mobile: equal-width iOS | Android. Desktop: all three chips. */}
            <div className="flex w-full gap-4 md:hidden">
              {heroDownloads.map((item) => (
                <DownloadChip
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  className="min-w-0 flex-1"
                />
              ))}
            </div>
            <div className="hidden flex-wrap content-center items-center gap-4 md:flex">
              {POKER_DOWNLOADS.map((item) => (
                <DownloadChip key={item.id} id={item.id} label={item.label} />
              ))}
            </div>
          </div>
          <PokerHeroArt />
        </div>
      </div>
    </section>
  )
}

function PokerFeatures() {
  return (
    <section
      id="poker-features"
      data-name="poker_features"
      className="scroll-mt-24 bg-background px-6 py-14 md:px-8"
    >
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
            <motion.article
              key={feature.title}
              whileHover={{ scale: 1.03, y: -6, zIndex: 10 }}
              whileTap={{ scale: 1.01, y: -2 }}
              transition={TILE_SPRING}
              className={cn(
                'group relative z-0 cursor-pointer overflow-hidden rounded-[10px] border border-border bg-card',
                'shadow-[0_0_16px_0_rgba(0,0,0,0.06)]',
                'transition-[border-color] duration-150 hover:border-white/25',
                'motion-reduce:!transform-none',
              )}
            >
              <div className="aspect-[280/140] overflow-hidden bg-surface-muted-3">
                <img
                  src="/poker/feature-chest.png"
                  alt=""
                  className="size-full object-cover object-bottom transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col gap-2 px-6 pb-6 pt-6">
                <Typography as="h3" shape="lead" weight="semibold">
                  {feature.title}
                </Typography>
                <Typography as="p" shape="small" variant="muted">
                  {feature.body}
                </Typography>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function PokerGettingStarted() {
  return (
    <section
      id="poker-getting-started"
      data-name="poker_steps"
      className="scroll-mt-24 bg-surface-muted-1 px-4 py-12 md:px-8 md:py-14"
    >
      <div className="mx-auto flex max-w-[740px] flex-col items-center gap-11">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography as="h2" shape="h2" weight="semibold">
            Getting Started
          </Typography>
          <Typography as="p" shape="paragraph" variant="muted">
            Five quick steps from sign-up to your first hand at the tables.
          </Typography>
        </div>
        {/* Figma 60:118989 — badge | (title → body → CTA), not badge | text | CTA. */}
        <div className="flex w-full flex-col gap-3">
          {POKER_STEPS.map((item, index) => (
            <div
              key={item.step}
              className="flex w-full items-start gap-6 rounded-[10px] border border-border bg-card p-6"
            >
              <div className="flex w-[37px] shrink-0 flex-col items-center gap-1 self-stretch">
                <span className="grid size-[38px] place-items-center rounded-full bg-primary text-lg font-medium text-primary-foreground">
                  {item.step}
                </span>
                {index < POKER_STEPS.length - 1 ? (
                  <span className="w-0.5 flex-1 bg-white/20" aria-hidden />
                ) : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-start gap-6">
                <div className="flex w-full flex-col gap-3">
                  <Typography as="h3" shape="lead" weight="semibold" className="w-full">
                    {item.title}
                  </Typography>
                  <Typography as="p" shape="small" variant="muted" className="w-full">
                    {item.body}
                  </Typography>
                </div>
                <Button variant="secondary" size="sm" className="shrink-0">
                  {item.action}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PokerIntegrity() {
  return (
    <section
      id="poker-integrity"
      data-name="poker_integrity"
      className="scroll-mt-24 bg-background px-6 py-14 md:px-8"
    >
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
  )
}

function PokerDownload() {
  return (
    <section
      id="poker-download"
      data-name="poker_download"
      className="scroll-mt-24 bg-surface-muted-1 px-4 py-14 md:px-8"
    >
      <div className="mx-auto flex w-full max-w-[1300px] flex-col items-center gap-11 rounded-3xl bg-card p-8 md:px-8 md:py-14">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography as="h2" shape="h2" weight="semibold">
            Download Our Poker App
          </Typography>
          <Typography as="p" shape="paragraph" variant="muted" className="max-w-[900px]">
            Available on all major platforms. Get the best poker experience on any device.
          </Typography>
        </div>
        {/* Mobile: full-width stack (Figma 217:123296). Desktop: centered wrap. */}
        <div className="flex w-full max-w-[792px] flex-col gap-4 md:flex-row md:flex-wrap md:justify-center">
          {POKER_DOWNLOADS.map((item) => (
            <DownloadChip
              key={item.id}
              id={item.id}
              label={item.label}
              className="w-full md:w-auto"
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export type PokerLandingPageProps = {
  className?: string
}

/** Poker_Landing-Page 78:163252 — content only. SEO lives in ShellFrame. */
export function PokerLandingPage({ className }: PokerLandingPageProps) {
  useEffect(() => {
    const id = window.location.hash.replace(/^#/, '')
    if (!id) return
    const t = window.setTimeout(() => scrollShellToId(id), 80)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div data-name="poker_landing_content" className={cn('w-full bg-background', className)}>
      <PokerHero />
      <PokerFeatures />
      <PokerGettingStarted />
      <PokerIntegrity />
      <PokerDownload />
    </div>
  )
}
