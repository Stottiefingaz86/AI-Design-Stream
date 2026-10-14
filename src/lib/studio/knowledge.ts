/**
 * Lumen design knowledge — distilled from the designers' live Figma files
 * (Casino-Lumen, 🐚 Shell, PropShopX) and from the live-site shell implementation
 * through 2026-10-14. Agents read this before designing or building so new work
 * follows the same shell, sections, naming and token usage.
 *
 * Keep this factual: every entry here was observed in the files listed in REFERENCE_FILES
 * or is already shipped in `apps/live-site`.
 */

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
    what: 'Casino lobby — "Product Page, Logged Out, Hidden Sidebar | Desktop, Light". Sub-menu pills, banner carousel, game-tile rows, providers, Top 10, activity table, SEO block.',
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
];

export const LUMEN_PROJECTS_FOLDER = 'https://www.figma.com/files/1304356510223900444/folder/625743109';

/** Blank file in that folder — Design Lead + Product Designer mock here. */
export const STUDIO_MOCK_SPACE = {
  name: 'Studio mocks',
  fileKey: 'wFyCOBCR34AMrgwEbp9tML',
  url: 'https://www.figma.com/design/wFyCOBCR34AMrgwEbp9tML/Studio-mocks',
};

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
  subMenu: 'horizontal pill menu under the header; active pill = primary bg + primary-foreground; search + favourites icon-buttons on the left',
  carouselRow: 'row title (optional icon) + "See More" link + prev/next icon-buttons (32–36px) on the right; items scroll horizontally',
  bannerCard: '288–340 × 164 card: title, 1–2 lines body, small primary button, image on the right',
  vipProgress: 'banner card with level name, progress bar (vip-level colours), "Open VIP Hub" link',
  dailyRaces: 'banner card with 3 stat cells (position / wagered / prize)',
  gameTile: 'portrait 152 × 207 tile: image, top-left tag badge (Originals / Live / Exclusive), top-right favourite icon-button; Top 10 variant has a large rank numeral',
  providerChips: 'row of outline chips with provider logo + name',
  activityTable: 'tabs (All Bets / Jackpot Winners / Big Wins) above a table: game, player, bet, multiplier, payout (success for wins)',
  sportTabs: 'icon + label tabs; active tab has muted bg and a 2px primary underline',
  skeleton: 'rounded muted blocks mirror the final layout while loading (PropShopX M1)',
  casinoLobby:
    'Logged-out desktop: dark header (logo + Casino/Sports/… + search + Join) → banner carousel → pill sub-menu → game-tile rows (Originals, New Games, Live Casino, Providers, Popular, Exclusive, Halloween, Top 10 with rank numerals) → activity table → SEO card (H2 + On this page ToC) → dark footer (Quick Links / products / Need Help? / partners / 18+ / copyright).',
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
    `- Storybook: Lumen/Shell/Mobile Dock, Side Nav, Account Sheet, Mobile Top Tabs.`,
    `- Live site root is http://localhost:3000 (casino shell). /design-system is the token checkoff page — not the product.`,
    `- Pipeline: prototype = testing ground. Post the /prototype?id= link in chat. Live site only after the human approves that prototype, then a preview branch, then Tess signs off.`,
    `- Figma: Casino-Lumen ${REFERENCE_FILES.find((f) => f.id === 'casino')?.fileKey}, 🐚 Shell ${REFERENCE_FILES.find((f) => f.id === 'shell')?.fileKey}.`,
  ].join('\n');
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
