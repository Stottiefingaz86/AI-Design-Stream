/**
 * Lumen design knowledge — distilled from the designers' live Figma files
 * (Casino-Lumen, 🐚 Shell, PropShopX) and from the live-site shell implementation
 * through 2026-10-14. Agents read this before designing or building so new work
 * follows the same shell, sections, naming and token usage.
 *
 * Keep this factual: every entry here was observed in the files listed in REFERENCE_FILES
 * or is already shipped in `apps/live-site`.
 */

import { tasteBrief } from './taste';

export interface ReferenceFile {
  id: string;
  name: string;
  fileKey: string;
  nodeId?: string;
  what: string;
}

export const REFERENCE_FILES: ReferenceFile[] = [
  {
    id: 'casino',
    name: 'Casino-Lumen',
    fileKey: 'omWPnweoGhy1Ulv1AXxx2z',
    nodeId: '69-47911',
    what: 'Casino lobby — "Product Page, Logged Out, Hidden Sidebar | Desktop, Light" (69:47911). Sub-menu: Lobby / Slots / Bonus Buy / Megaways / Originals / Blackjack / Live / Jackpots / Early / Staff Picks / Exclusive / New.',
  },
  {
    id: 'shell',
    name: '🐚 Shell',
    fileKey: 'HrYQR2J5ZZz44boczhBMaB',
    nodeId: '11-4',
    what: 'App shell for every product (homepage, casino, sportsbook, poker, racebook, promotions, my account) in Desktop/Tablet/Mobile × Light/Dark × Logged in/out. Header, sidebar, SEO block, footer specs.',
  },
  {
    id: 'propshopx',
    name: 'PropShopX',
    fileKey: 'HprCQCrgznHOxAIMpsL4re',
    nodeId: '321-209846',
    what: 'Sport-specific page (M1). Icon tab bar with primary underline, skeleton loading states, same shell.',
  },
  {
    id: 'poker',
    name: 'Poker_Landing-Page',
    fileKey: '6MRTcwJHXgYmLxBWxRLz4I',
    nodeId: '78-163252',
    what: 'Poker product page desktop (78:163252). 🐚 Shell chrome + landing: hero “The BetOnline Poker Platform”, Our Top Features, Getting Started (5 steps), Game Integrity, Download Our Poker App, SEO, footer. No casino sub-nav.',
  },
  {
    id: 'lumen',
    name: 'Lumen_Desing System',
    fileKey: 'vCPe93hNKDWWcpu49Vo0kU',
    nodeId: '4862-20722',
    what: 'Published Lumen library. Page “Documentation” (4862:20722). Instances only — <Button>, <IconButton>, text-input, search-box, bound to ☀️ Mode / 🚀 Themes / 💨 Tailwind.',
  },
];

export const LUMEN_PROJECTS_FOLDER = 'https://www.figma.com/files/1304356510223900444/folder/625743109';

/** Legacy sandbox only. New mockups get their own file — never add pages here. */
export const STUDIO_MOCK_SPACE = {
  name: 'Studio mocks',
  fileKey: 'wFyCOBCR34AMrgwEbp9tML',
  url: 'https://www.figma.com/design/wFyCOBCR34AMrgwEbp9tML/Studio-mocks',
};

export const FIGMA_NEW_FILE = {
  planKey: 'organization::1304356510223900444',
  projectId: '625743109',
  editorType: 'design' as const,
};

/** Product / library files humans paste as source. Never the Design mock tile. */
const SOURCE_FIGMA_KEYS = new Set<string>([
  ...REFERENCE_FILES.map((f) => f.fileKey),
  STUDIO_MOCK_SPACE.fileKey,
  'pbmNTsL7vz1BSF0ZYWY1n1',
]);

export function figmaFileKeyFromUrl(url: string): string | null {
  const m = url.match(/figma\.com\/(?:design|file|board|proto)\/([A-Za-z0-9]+)/i);
  return m?.[1] ?? null;
}

/** Casino-Lumen, Shell, Poker landing, DS, Studio-mocks — source, not a studio spec. */
export function isSourceFigmaUrl(url: string): boolean {
  const key = figmaFileKeyFromUrl(url);
  return Boolean(key && SOURCE_FIGMA_KEYS.has(key));
}

/** A new Design file agents created — the only URL the Design mock tile may show. */
export function isStudioFigmaUrl(url: string): boolean {
  return /figma\.com\/(?:design|file)\//i.test(url) && !isSourceFigmaUrl(url);
}

/** Org folder + library the Figma plugin can write into. MCP cannot list folder contents — catalog known files, then create_new_file into this project. */
export const FIGMA_WORKSPACE = {
  folderUrl: LUMEN_PROJECTS_FOLDER,
  planKey: FIGMA_NEW_FILE.planKey,
  projectId: FIGMA_NEW_FILE.projectId,
  libraryName: 'Lumen_Desing System',
  libraryKey:
    'lk-40fae532f4d55afe9d90d03a1d23bb174e778ffbae07cd2f0474fa95b2d2d722c963aac1e23b5574fcef93bdd232629e4ba24792340aae1653726545bb15ac8f',
  libraryFileKey: 'vCPe93hNKDWWcpu49Vo0kU',
  components: {
    Button: '0d49e1fe7b73453bc333ff0681468e192218200d',
    IconButton: 'aff1728c9e52c185c7c4c86531be90d5ff73f56a',
    textInput: 'a8e777539d783bf9689823e8e225c7d22082cc10',
    searchBox: '1e18d363b5064671cbbf44890fe94aa0bb24c993',
  },
  shellPages: [
    '11:4 🐚 Shell | Screens',
    '12:80010 ⚙️ Components',
    '2563:297761 Navbar (Header)',
    '3087:21675 Sidebar',
    '2565:312988 UBC',
    '11:5 Footer',
  ],
} as const;

export function figmaNodeUrl(f: ReferenceFile): string {
  return `https://www.figma.com/design/${f.fileKey}/${encodeURIComponent(f.name)}${f.nodeId ? `?node-id=${f.nodeId}` : ''}`;
}

/** Dev Mode URL for a specific frame — what we want pasted in chat. */
export function figmaDevModeUrl(f: ReferenceFile): string {
  const node = f.nodeId ? `?node-id=${f.nodeId}&m=dev` : '?m=dev';
  return `https://www.figma.com/design/${f.fileKey}/${encodeURIComponent(f.name)}${node}`;
}

/** True when a URL is a Figma *selection* (has node-id), not just a file. */
export function isFigmaSelectionUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!/(^|\.)figma\.com$/i.test(u.hostname)) return false;
    return u.searchParams.has('node-id');
  } catch {
    return false;
  }
}

export const FIGMA_SELECTION_EXAMPLE = figmaDevModeUrl(REFERENCE_FILES.find((f) => f.id === 'shell')!);

export const FIGMA_ASK_STEPS = [
  'Open the file and build (or select) the frame the agent needs.',
  'Switch to Dev Mode — Shift+D, or the toggle in the top-right.',
  'Click the frame so it is the only thing selected.',
  'Right-click → Copy link to selection (Share → Copy link also works if the frame is selected).',
  'Paste that link in this chat. That is enough — no slash command needed.',
] as const;

/** Frame naming used across all Lumen project files. Agents MUST name frames this way. */
export const FRAME_NAMING = {
  pattern: '<Page>, <Auth state>[, <Sidebar state>] | <Device>, <Mode>',
  examples: [
    'Homepage, Logged Out | Desktop, Light',
    'Casino, Logged In | Mobile, Dark',
    'Product Page, Logged In, Hidden Sidebar | Desktop, Light',
    'Product Page, Logged Out, Open Sidebar | tablet, Light',
  ],
  devices: { desktop: 1440, tablet: 768, mobile: 375 },
  matrix: 'Every screen ships Desktop + Mobile × Light + Dark, and Logged In + Logged Out where the state changes the UI.',
  sections: 'One Figma section per product (homepage, casino, sportsbook, poker, racebook, promotions, my account). Spec frames use a "Slide" + "InfoExtra" pair for documentation.',
};

/** The shell every page lives inside. */
export const SHELL = {
  header: {
    height: 68,
    surface: 'header (dark in both modes)',
    left: 'brand logo',
    nav: ['Casino', 'Sports', 'Live Betting', 'Poker', 'Promotions', 'Other ▾'],
    right: ['balance pill "$100,000.00" + wallet icon-button', 'VIP crown icon-button (vip-rewards)', 'account icon-button'],
    mobile: 'top tab strip (Home / Casino / Live Casino / Sports …) above the header row — underline tabs (nav-item-outline-inverted), not pills. Strip hides on scroll down and returns on scroll up.',
  },
  sidebar: {
    width: 96,
    expanded: 256,
    surface: 'sidebar / sidebar-inverted',
    desktop: 'lg+: fixed left rail, 96 collapsed / 256 expanded, persisted in localStorage. Logo morphs wordmark ↔ lettermark.',
    content: 'icon-only when collapsed; labels + optional headings when expanded. Product-specific groups from navForProduct.',
  },
  mobileDrawer: {
    width: 311,
    node: 'Figma 🐚 Shell · casino 629:278650, sports 629:275619, poker 100:108640, promotions 100:143751',
    chrome: 'rounded-r-2xl, BETONLINE wordmark + close, then a horizontally scrollable product tab strip (same CHIP_NAV as the header, active = primary underline)',
    lists: 'Casino Home / Favorite / Play Random / Last Game Played + categories; Sports Home + leagues/A–Z; Poker Play Online / Download + Start; Promotions All Promotions + VIP Hub trailing icon + Telegram',
  },
  mobileDock: {
    name: 'nav-menu-icon-solid',
    casino: ['Search', 'Play Random', 'Favourites'],
    sports: ['Search', 'Bets'],
    states: 'default muted, hover accent fill, pressed scale-95, selected secondary fill. No browser focus ring.',
    scroll: 'opposite of the top tabs — hides when scrolling up, returns when scrolling down, always visible at the top of the page',
  },
  ubc: {
    desktop: 'right sheet 384px attached below the 68px header, slides in (translate-x), VIP hover, LogOut hover/active',
    mobile: 'bottom sheet with centered 54px drag handle; drag down to dismiss (threshold ~80px or flick). Backdrop fades with drag.',
  },
  viewport: {
    root: "[data-name='Product Page'] is position:fixed; inset:0; overflow:hidden. Inner #shell-scroll is the only vertical scroller. Do not portal overlays onto body without beating the legacy body>div { position:relative; height:auto } rules.",
  },
  content: {
    surface: 'background',
    maxWidth: 1344,
    gutter: 24,
    cards: 'card surface, rounded-box (10px), card-shadow 0 0 16 shadow-default',
  },
  seoBlock: {
    layout: 'card: H2 + paragraphs left, "On this page" ToC right; "Show more" outline button centred below',
    mobile: 'ToC becomes a select; paragraphs clamp with "Show more"',
  },
  footer: {
    surface: 'footer (dark in both modes)',
    columns: ['Quick Links', 'Casino', 'Sports', 'Poker', 'Racebook', 'Other', 'Support'],
    extras: ['primary "Need Help?" button', '"A Trusted & Safe Experience" blurb', 'Official Partners logos', 'payment icons + 18+', 'social icons', 'copyright + timestamp'],
  },
  storybook: [
    'Lumen/Shell/Mobile Dock → ShellMobileNav',
    'Lumen/Shell/Side Nav → ShellDrawer',
    'Lumen/Shell/Account Sheet → UbcSheet',
    'Lumen/Shell/Cashier Sheet → CashierSheet (balance pill)',
    'Lumen/Shell/Mobile Top Tabs → ShellHeader',
  ],
  code: {
    liveSite: 'apps/live-site/components/site/shell-*.tsx — source of truth. Storybook imports these files.',
    lumen: 'src/components/lumen/shell.tsx — prototype mock only. Do not add a second dock/drawer/UBC here.',
  },
};

/**
 * Pages observed in Casino-Lumen (one page: "Casino").
 * Every product surface ships a 1440 desktop frame and a 390 mobile frame.
 */
export const CASINO_PAGES = ['Lobby', 'Live Casino', 'Slots', 'Providers', 'by Section', 'Favorites'] as const;

/**
 * 🐚 Shell file pages. Specs live as Slide + InfoExtra pairs.
 * Header / sidebar / footer stay dark in both modes (inverted tokens).
 */
export const SHELL_PAGES = {
  screens: '11:4 · 🐚  Shell | Screens',
  components: '12:80010 · ⚙️ Components',
  navbar: '2563:297761 · Navbar (Header)',
  sidebar: '3087:21675 · Sidebar',
  ubc: '2565:312988 · UBC (Universal Balance)',
  footer: '11:5 · Footer',
};

export const SHELL_SPEC_SLIDES = [
  'Tooltip',
  'Collapse / Expand Behavior',
  'nav',
  'header-deskrtop',
  'nav-button-menu',
  'Effects',
] as const;

/**
 * PropShopX index (designer Sam Wilson, PO Kike Moreno, in charge CH).
 * Same shell. Sport tabs with primary underline. Skeletons while loading.
 */
export const PROPSHOPX_SURFACES = [
  'Sport Specific Page',
  'League Specific Page',
  'Fixture Specific Page',
  'Betslip System',
  'Bet History',
] as const;

/** Page sections seen in the casino / sports files. Mocks compose from these. */
export const SECTION_PATTERNS = {
  subMenu: '76px glass bar; search + heart in a 48px surface-muted-5 capsule (44px / 20px icons); pills Lobby → Slots → Bonus Buy → Megaways → Originals → Blackjack → Live → Jackpots → Early → Staff Picks → Exclusive → New; active = primary fill, text-sm regular',
  carouselRow: 'row title (optional icon) + "See More" link + prev/next icon-buttons (32px outline, rounded-md) on the right; items scroll horizontally. Banner row uses inside arrows — rounded-full, overlaid on the track, not a header.',
  bannerCard: '288–340 × 164 card: title, 1–2 lines body, official Button size="sm" (h-7, no custom height/radius/hover), image on the right',
  vipProgress: 'banner card with level name, progress bar (vip-level colours), "Open VIP Hub" link',
  dailyRaces: 'banner card with 3 stat cells (position / wagered / prize)',
  gameTile: 'portrait 152 × 207 tile: image, top-left tag badge (Originals / Live / Exclusive), top-right favourite icon-button; Top 10 variant has a large rank numeral',
  providerChips: 'row of outline chips with provider logo + name',
  activityTable: 'tabs (All Bets / Jackpot Winners / Big Wins) above a table: game, player, bet, multiplier, payout (success for wins)',
  sportTabs: 'icon + label tabs; active tab has muted bg and a 2px primary underline',
  skeleton: 'official Lumen <Skeleton>: flat --skeleton fill (#0000000d light / #ffffff17 dark), 10px radius, no pulse. Casino = CasinoLobbySkeleton: banner row only (4×164). No game-tile shelves. Chrome (header / sidebar) stays real.',
  casinoLobby:
    'Logged-in desktop: header + collapsed sidebar + casino sub-nav + VIP/Daily Races/promo banner row with official inside carousel arrows (rounded-full, overlaid on the banners). Play Now = Button size="sm". Nothing below the banners — no New Games, Originals, shelves, activity table, or invented lobby content.',
  pokerLanding:
    'Poker_Landing-Page 78:163252 inside 🐚 Shell (no casino sub-nav): hero “The BetOnline Poker Platform” + Play Online + iOS/Windows/Android chips + ape art; Our Top Features 6 cards; Getting Started 5 steps; Game Integrity + video still; Download Our Poker App; SEO + footer. Never the PrototypeMock Register/View schedule filler.',
};

/**
 * Core UI is shadcn/studio (`src/components/ui`, registries `@shadcn` + `@shadcn-studio`).
 * Agents do not invent a second button / input / dialog. Lumen only adds tokens
 * and product compositions (shell, game tile, banner, activity table).
 */
export const CORE_LIBRARY = {
  name: 'shadcn/studio',
  path: 'src/components/ui',
  registries: ['@shadcn', '@shadcn-studio', '@ss-components'],
  storybook: 'http://localhost:6006 — sidebar Lumen/Shell/* and lumen-ui/*',
};

/** Token usage observed in the files — agents reach for these first. */
export const TOKEN_USAGE = {
  typography: {
    family: 'Figtree (font-family-font-sans)',
    scale: { xxs: '10/14', xs: '12/16', sm: '14/20', base: '16/24', lg: '18/28', lead: '20' },
    weights: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    rowTitle: 'lg / semibold',
    body: 'sm / regular, muted-foreground for secondary text',
  },
  spacing: '4px scale (spacing-1 = 4 … spacing-6 = 24, spacing-8 = 32, spacing-12 = 48)',
  radius: { field: '8px (inputs, buttons, chips)', box: '10px (cards, banners)', rounded: '9999 (pills, avatars)', tile: '4px' },
  colours: {
    primary: 'CTAs, active pill, sport-tab underline, "Need Help?"',
    secondary: 'secondary buttons (6b7280 @ 5%)',
    muted: 'skeletons, inactive tab bg',
    'surface-muted-1…5': 'nested surfaces inside cards',
    live: 'Live badges (dc2626)',
    'vip-rewards': 'VIP crown button, VIP progress',
    success: 'payout / win amounts',
    border: '00000014 light / ffffff14 dark',
  },
  effects: { cardShadow: '0 0 16 shadow-default', glass: 'container #f3f4f6 @ 86% + bg-blur 64 on floating header elements' },
};

/**
 * Compact brief injected into agent chat / stage notes so the cast knows
 * what is already shipped — not just what Figma originally specified.
 */
export function agentKnowledgeBrief(): string {
  return [
    'Shipped shell (apps/live-site, 2026-10-14):',
    `- Desktop: 68px header, 96/256 sidebar (persisted), UBC = 384px right sheet under the header.`,
    `- Mobile: underline product tabs (hide on scroll down); 311px left drawer with the same tabs; casino dock Search / Play Random / Favourites (hide on scroll up); UBC = bottom sheet, 54px centered handle, drag to dismiss.`,
    `- Viewport: [data-name='Product Page'] is fixed; only #shell-scroll scrolls. Do not portal overlays onto body.`,
    `- Storybook: Lumen/Shell/Mobile Dock, Side Nav, Account Sheet, Mobile Top Tabs, Lumen/Casino/Lobby Skeleton. Every shipped UI includes a matching skeleton (CasinoLobbySkeleton) — official flat blocks, never muted+pulse pills.`,
    `- Live site root is http://localhost:3000 (casino shell). /design-system is the token checkoff page — not the product.`,
    `- Pipeline: prototype = testing ground at /prototype?id=&ground=1. QA uses the same page at Mobile 375 / Tablet 768 / Desktop 1440 (toolbar or &view=frames). Never post /component for a page or chat job — that sheet is leftover button/badge variants. “Go live” / approve writes apps/live-site immediately (casino → /casino, poker → /poker). A new Figma Design file is a follow-up — live does not wait on it.`,
    `- Figma workspace: Lumen folder ${LUMEN_PROJECTS_FOLDER} (projectId ${FIGMA_WORKSPACE.projectId}). Known files: ${REFERENCE_FILES.map((f) => `${f.name} ${f.fileKey}`).join('; ')}. MCP cannot list the folder — call get_metadata (no nodeId) on a fileKey to list pages. New work = create_new_file into that projectId, never Studio-mocks.`,
    `- Figma implement: create_session + get_design_context + get_screenshot on the SOURCE frame FIRST, then create_new_file in the Lumen folder (projectId ${FIGMA_WORKSPACE.projectId}) named “Lumen studio — <job>”. That new file is the Design mock: annotated frames for happy path, error / empty / loading, and how the flow works. Never post Casino-Lumen / Shell / Poker_Landing / the pasted source as the Design mock. The runner fails the job if the read tools or create_new_file never run. Poker source = Poker_Landing-Page 6MRTcwJHXgYmLxBWxRLz4I / 78:163252 inside PokerProductShell.`,
    `- Figma design (mockup): NEW Design file in the Lumen folder. create_session, get_libraries, search_design_system scoped to libraryKey ${FIGMA_WORKSPACE.libraryKey} (Lumen_Desing System only — ignore Kraken/MUI/Sportsbook). Assemble with use_figma instances + bound ☀️ Mode variables. Annotate happy path, errors, empty/loading, and the flow. Shell pages: ${FIGMA_WORKSPACE.shellPages.join(', ')}. Frame names follow FRAME_NAMING. Post the NEW file URL. No testing-ground until the human says build it.`,
    `- Figma journey: FigJam flowchart via generate_diagram (NOT mermaid journey — unsupported). planKey ${FIGMA_WORKSPACE.planKey}. Steps named after real Lumen surfaces (Shell, Casino lobby, Poker landing). Post the board URL.`,
    `- Figma implement defaults: Casino-Lumen ${REFERENCE_FILES.find((f) => f.id === 'casino')?.fileKey} node ${REFERENCE_FILES.find((f) => f.id === 'casino')?.nodeId}, Poker ${REFERENCE_FILES.find((f) => f.id === 'poker')?.fileKey} node ${REFERENCE_FILES.find((f) => f.id === 'poker')?.nodeId}, 🐚 Shell ${REFERENCE_FILES.find((f) => f.id === 'shell')?.fileKey}.`,
    `- Chrome: import live-site ShellHeader + ShellSidebar. Never invent a BETONLINE wordmark header. Never use PrototypeMock filler (Register / View schedule / Players online). Hidden Sidebar = 96px collapsed rail.`,
    tasteBrief(),
  ]
    .filter(Boolean)
    .join('\n');
}

/** Review checklist derived from the above — the design lead runs this on every mock. */
export const DESIGN_REVIEW_CHECKLIST = [
  'Frame named "<Page>, <Auth> | <Device>, <Mode>" and placed in the product section',
  'Shell present: dark header with nav + balance/VIP/account, sidebar (if product page), background surface, footer',
  'Desktop 1440 + Mobile 375; Light + Dark',
  'Row headers use title + See More + prev/next icon-buttons',
  'Cards: card surface, 10px radius, card-shadow; inputs/buttons 8px radius; pills 9999',
  'Only Lumen variables bound (no detached fills, no hex), Figtree only',
  'Loading state designed with skeletons where content is async',
  'SEO block + footer included on landing / product pages',
  'Mobile: top underline tabs + left drawer with the same product tabs + floating dock (casino: Search / Play Random / Favourites)',
  'UBC: desktop right sheet, mobile bottom sheet with centered drag handle',
];
