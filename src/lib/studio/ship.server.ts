import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export interface ShipFile {
  path: string;
  content: string;
}

export interface ShipSnapshot {
  projectId: string;
  liveUrl: string;
  files: ShipFile[];
  createdAt: string;
}

const ROOT = () => process.cwd();
const SNAP_DIR = () => resolve(ROOT(), '.studio-rollback');

const CASINO_PAGE = `'use client'

import { CasinoLobby } from '@/components/site/casino-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** Live casino — shell sub-nav + the approved lobby banner row. */
export default function Page() {
  return (
    <ShellFrame loggedIn>
      <CasinoLobby />
    </ShellFrame>
  )
}
`;

const CASINO_LOBBY = `'use client'

import { CasinoLobbyBannerRow } from '@/components/lumen/casino-lobby-banners'
import { CASINO_LOBBY_PROMO_BANNERS } from '@/lib/lumen/casino-lobby-promos'

/** Live casino lobby — same banner row as the testing ground. ShellFrame owns sub-nav. */
export function CasinoLobby() {
  return (
    <div className="w-full py-4">
      <CasinoLobbyBannerRow promos={CASINO_LOBBY_PROMO_BANNERS} />
    </div>
  )
}

/** @deprecated Use ShellFrame + CasinoLobby on the live route. */
export function CasinoPage() {
  return <CasinoLobby />
}
`;

const POKER_PAGE = `'use client'

import { PokerLandingPage } from '@/components/lumen/poker-landing-page'
import { ShellFrame } from '@/components/site/shell-frame'

/** Live poker — Figma Poker_Landing-Page 78:163252 inside the shipped shell. */
export default function Page() {
  return (
    <ShellFrame loggedIn>
      <PokerLandingPage />
    </ShellFrame>
  )
}
`;

const POKER_LOADING = `import { ProductRouteLoading } from '@/components/site/product-route-loading'

export default function Loading() {
  return <ProductRouteLoading product="poker" />
}
`;

function snapPath(projectId: string) {
  return resolve(SNAP_DIR(), `${projectId}.json`);
}

function readIf(path: string) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

function writeFile(rel: string, content: string) {
  const abs = resolve(ROOT(), rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content, 'utf8');
}

function rewriteLiveImport(src: string) {
  return src
    .replace("from '../../../apps/live-site/components/site/shell-icons'", "from '@/components/site/shell-icons'")
    .replace("from '../../../apps/live-site/components/site/shell-seo'", "from '@/components/site/shell-seo'")
    .replace("from '@/components/lumen/casino-lobby-skeleton'", "from '@/components/lumen/casino-lobby-skeleton'");
}

function shipTargets(title: string, surface: string, brief = '') {
  const blob = `${title} ${surface} ${brief}`.toLowerCase();
  const pokerAsk =
    /\bpoker\b/.test(blob.replace(/video[\s-]*poker/g, ' ')) &&
    !/originals|casino|lobby|banner|game carousel/.test(blob);
  const casinoAsk = /casino|sub[- ]?nav|lobby|banner|originals|slots/.test(blob);
  if (pokerAsk && !casinoAsk) return { casino: false, poker: true };
  if (casinoAsk && !pokerAsk) return { casino: true, poker: false };
  if (pokerAsk && casinoAsk) return { casino: true, poker: true };
  return { casino: !pokerAsk, poker: pokerAsk };
}

function plan(title: string, surface: string, brief = ''): Array<{ dest: string; next: string }> {
  const { casino, poker } = shipTargets(title, surface, brief);
  const files: Array<{ dest: string; next: string }> = [];
  if (casino) {
    const subnav = rewriteLiveImport(readIf(resolve(ROOT(), 'src/components/lumen/casino-sub-nav.tsx')));
    const skeleton = readIf(resolve(ROOT(), 'src/components/lumen/casino-lobby-skeleton.tsx'));
    files.push({
      dest: 'apps/live-site/components/site/casino-subnav.tsx',
      next: subnav || readIf(resolve(ROOT(), 'apps/live-site/components/site/casino-subnav.tsx')),
    });
    if (skeleton) {
      files.push({ dest: 'apps/live-site/components/lumen/casino-lobby-skeleton.tsx', next: skeleton });
    }
    const lobbyBanners = rewriteLiveImport(readIf(resolve(ROOT(), 'src/components/lumen/casino-lobby-banners.tsx')));
    const promos = readIf(resolve(ROOT(), 'src/lib/lumen/casino-lobby-promos.ts'));
    if (promos) files.push({ dest: 'apps/live-site/lib/lumen/casino-lobby-promos.ts', next: promos });
    if (lobbyBanners) {
      files.push({ dest: 'apps/live-site/components/lumen/casino-lobby-banners.tsx', next: lobbyBanners });
      files.push({
        dest: 'apps/live-site/components/lumen/casino-banner-carousel.tsx',
        next: `export {
  CasinoLobbyBannerRow,
  CasinoLobbyBannerRow as CasinoBannerCarousel,
  DailyRacesBanner,
  PromoLobbyBanner,
  VipProgressBanner,
  type CasinoLobbyBannerRowProps,
  type CasinoLobbyBannerRowProps as CasinoBannerCarouselProps,
  type DailyRacesBannerProps,
  type PromoLobbyBannerItem,
  type PromoLobbyBannerItem as PromoLobbyBannerSlide,
  type PromoLobbyBannerProps,
  type VipProgressBannerProps,
} from './casino-lobby-banners';\n`,
      });
    }
    files.push({ dest: 'apps/live-site/components/site/casino-page.tsx', next: CASINO_LOBBY });
    files.push({ dest: 'apps/live-site/app/casino/page.tsx', next: CASINO_PAGE });
  }
  if (poker) {
    const landing = rewriteLiveImport(readIf(resolve(ROOT(), 'src/components/lumen/poker-landing-page.tsx')));
    const promos = readIf(resolve(ROOT(), 'src/lib/lumen/poker-landing-promos.ts'));
    const skeleton = readIf(resolve(ROOT(), 'src/components/lumen/poker-landing-skeleton.tsx'));
    if (promos) files.push({ dest: 'apps/live-site/lib/lumen/poker-landing-promos.ts', next: promos });
    if (landing) files.push({ dest: 'apps/live-site/components/lumen/poker-landing-page.tsx', next: landing });
    if (skeleton) files.push({ dest: 'apps/live-site/components/lumen/poker-landing-skeleton.tsx', next: skeleton });
    files.push({ dest: 'apps/live-site/app/poker/page.tsx', next: POKER_PAGE });
    files.push({ dest: 'apps/live-site/app/poker/loading.tsx', next: POKER_LOADING });
  }
  return files;
}

export function shipToLiveSite(input: {
  projectId: string;
  title: string;
  surface: string;
  brief?: string;
  liveUrl: string;
}): ShipSnapshot {
  let files = plan(input.title, input.surface, input.brief);
  if (!files.length) files = plan('casino lobby', 'Casino', input.brief);
  const snapshot: ShipSnapshot = {
    projectId: input.projectId,
    liveUrl: input.liveUrl,
    files: files.map((f) => ({ path: f.dest, content: readIf(resolve(ROOT(), f.dest)) })),
    createdAt: new Date().toISOString(),
  };
  mkdirSync(SNAP_DIR(), { recursive: true });
  writeFileSync(snapPath(input.projectId), JSON.stringify(snapshot, null, 2), 'utf8');
  for (const f of files) writeFile(f.dest, f.next);
  return snapshot;
}

export function rollbackLiveSite(projectId: string): ShipSnapshot | null {
  try {
    const snap = JSON.parse(readFileSync(snapPath(projectId), 'utf8')) as ShipSnapshot;
    for (const f of snap.files) writeFile(f.path, f.content);
    return snap;
  } catch {
    return null;
  }
}
