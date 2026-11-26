import type { ShellIconName } from "./shell-icons";
import {
  DEFAULT_SITE_VERSION,
  versionAtLeast,
  type SiteVersionId,
} from "@/lib/lumen/site-versions";

export type ShellProduct = "casino" | "sports" | "poker" | "promotions";

export type ShellNavGameAction = "launch-last-game" | "launch-random";
export type ShellNavAction = ShellNavGameAction | "open-vip-hub";

export type ShellNavItem = {
  label: string;
  href: string;
  icon: ShellIconName;
  /** Optional thumbnail (e.g. last game art) — shown instead of the vector icon. */
  iconSrc?: string;
  /** Opens game launcher or VIP Hub instead of navigating. */
  action?: ShellNavAction;
  active?: boolean;
  subtitle?: string;
  emphasis?: boolean;
  trailing?: ShellIconName;
  /** Pulsing live indicator on the far right (e.g. Live Betting). */
  live?: boolean;
};

/** Last side-nav row on every product — opens the VIP Hub sheet. */
export const VIP_HUB_NAV_ITEM: ShellNavItem = {
  label: "VIP Hub",
  href: "#vip-hub",
  icon: "vip",
  trailing: "external",
  emphasis: true,
  action: "open-vip-hub",
};

function withVipHub(groups: ShellNavGroup[]): ShellNavGroup[] {
  return [...groups, { items: [VIP_HUB_NAV_ITEM] }];
}

export type ShellNavGroup = {
  heading?: string;
  /** Expand/collapse headed section (Top Leagues / Top Sports / A–Z). */
  collapsible?: boolean;
  items: ShellNavItem[];
};

/** Last Game row — no thumb when logged out / never played. */
export function withLastGamePlayed(
  groups: ShellNavGroup[],
  opts: {
    loggedIn: boolean;
    lastPlayed: { title: string; imageSrc: string } | null;
  },
): ShellNavGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (item.action !== "launch-last-game") return item;
      if (!opts.loggedIn || !opts.lastPlayed) {
        return {
          ...item,
          iconSrc: undefined,
          subtitle: opts.loggedIn ? "Will show here" : undefined,
        };
      }
      return {
        ...item,
        iconSrc: opts.lastPlayed.imageSrc,
        subtitle: opts.lastPlayed.title,
      };
    }),
  }));
}

/** Sports Home — banners, Popular, SGP packs, featured boards. */
export const SPORTS_HOME_HREF = "/sports" as const;

export const HEADER_NAV = [
  { label: "Casino", href: "/casino", product: "casino" as const },
  { label: "Sports", href: SPORTS_HOME_HREF, product: "sports" as const },
  { label: "Poker", href: "/poker", product: "poker" as const },
  { label: "Promotions", href: "/promotions", product: "promotions" as const },
] as const;

export const CHIP_NAV = [
  { label: "Home", href: "/" },
  { label: "Casino", href: "/casino" },
  { label: "Live Casino", href: "/casino/live" },
  { label: "Sports", href: SPORTS_HOME_HREF },
  { label: "Live Betting", href: SPORTS_HOME_HREF },
  { label: "Poker", href: "/poker" },
  { label: "Promos", href: "/promotions" },
  { label: "Esports", href: SPORTS_HOME_HREF },
  { label: "Racebook", href: SPORTS_HOME_HREF },
  { label: "Contests", href: "/promotions/contest" },
] as const;

export const TABLET_NAV = [
  { label: "Casino", href: "/casino" },
  { label: "Sports", href: SPORTS_HOME_HREF },
  { label: "Poker", href: "/poker" },
  { label: "Promotions", href: "/promotions" },
] as const;

export const OTHER_NAV = [
  { label: "Live Betting", href: SPORTS_HOME_HREF },
  { label: "Racebook", href: SPORTS_HOME_HREF },
  { label: "Contests", href: "/promotions/contest" },
  { label: "Esports", href: SPORTS_HOME_HREF },
] as const;

/** Sports with a built board — everything else still lands on the soccer board. */
const SPORT_ROUTES: Record<string, string> = {
  Baseball: "/sports/baseball",
  Basketball: "/sports/basketball",
  Boxing: "/sports/boxing",
  Football: "/sports/football",
  Golf: "/sports/golf",
  Hockey: "/sports/hockey",
  "Horse Racing": "/sports/horse-racing",
  Lacrosse: "/sports/lacrosse",
  MMA: "/sports/mma",
  Pool: "/sports/pool",
  Rugby: "/sports/rugby",
  Soccer: "/sports/soccer",
  "Table Tennis": "/sports/table-tennis",
  Tennis: "/sports/tennis",
  Volleyball: "/sports/volleyball",
};

const SPORTS_AZ = [
  "Baseball",
  "Basketball",
  "Boxing",
  "Football",
  "Golf",
  "Hockey",
  "Horse Racing",
  "Lacrosse",
  "MMA",
  "Pool",
  "Rugby",
  "Soccer",
  "Table Tennis",
  "Tennis",
  "Volleyball",
] as const;

const SPORT_ICON: Record<string, ShellIconName> = {
  Baseball: "baseball",
  Basketball: "basketball",
  Boxing: "boxing",
  Football: "football",
  Golf: "golf",
  Hockey: "hockey",
  "Horse Racing": "horseRacing",
  Lacrosse: "lacrosse",
  MMA: "mma",
  Pool: "pool",
  Rugby: "rugby",
  Soccer: "soccer",
  "Table Tennis": "tableTennis",
  Tennis: "tennis",
  Volleyball: "volleyball",
};

export function productFromPath(pathname: string): ShellProduct {
  if (pathname.startsWith("/sports")) return "sports";
  if (pathname.startsWith("/poker")) return "poker";
  if (pathname.startsWith("/promotions")) return "promotions";
  return "casino";
}

/** My Account area — Figma WIP sidebar-by-brand with account sections. */
export function isAccountPath(pathname: string) {
  return pathname.startsWith("/account");
}

/** Account left-nav / mobile tabs — Figma SidebarContent + nav-menu-solid. */
export const ACCOUNT_NAV: ShellNavGroup[] = [
  {
    items: [
      {
        label: "My Account",
        href: "/account",
        icon: "accountHome",
        emphasis: true,
      },
      {
        label: "Bet History",
        href: "/account/bet-history",
        icon: "accountBetHistory",
      },
      {
        label: "Transactions",
        href: "/account/transactions",
        icon: "accountTransactions",
      },
      { label: "Payments", href: "/account/payments", icon: "accountPayments" },
      {
        label: "Security Central",
        href: "/account/security",
        icon: "accountSecurity",
      },
      {
        label: "Profile Settings",
        href: "/account/settings",
        icon: "accountSettings",
      },
    ],
  },
];

/** Sidebar/drawer groups for the current URL (account overrides product). */
export function navForPathname(
  pathname: string,
  product: ShellProduct,
  version: SiteVersionId = DEFAULT_SITE_VERSION,
): ShellNavGroup[] {
  if (isAccountPath(pathname)) return ACCOUNT_NAV;
  return navForProduct(product, version);
}

export function headerItemActive(label: string, pathname: string) {
  if (label === "Casino") return pathname.startsWith("/casino");
  if (label === "Sports") return pathname.startsWith("/sports");
  if (label === "Live Betting") return false;
  if (label === "Poker") return pathname.startsWith("/poker");
  if (label === "Promotions" || label === "Promos")
    return pathname.startsWith("/promotions");
  return false;
}

export function chipItemActive(label: string, pathname: string) {
  if (label === "Home") return pathname === "/";
  /* Mobile chips: Casino and Live Casino are mutually exclusive. */
  if (label === "Casino") {
    return (
      pathname.startsWith("/casino") && !pathname.startsWith("/casino/live")
    );
  }
  if (label === "Live Casino") return pathname.startsWith("/casino/live");
  if (label === "Sports") return pathname.startsWith("/sports");
  if (label === "Live Betting") return false;
  if (label === "Poker") return pathname.startsWith("/poker");
  if (label === "Promos") {
    return (
      pathname.startsWith("/promotions") &&
      !pathname.startsWith("/promotions/contest")
    );
  }
  if (label === "Contests" || label === "Contest") {
    return pathname.startsWith("/promotions/contest");
  }
  return false;
}

/** Which left-nav row is active for the current URL (Lobby vs Slots vs Live, etc.). */
export function navItemActive(
  item: Pick<ShellNavItem, "label" | "href">,
  pathname: string,
  hash = "",
): boolean {
  if (item.href === "/casino/slots")
    return pathname.startsWith("/casino/slots");
  if (item.href === "/casino/live") return pathname.startsWith("/casino/live");
  if (item.href === "/casino/table-games")
    return pathname.startsWith("/casino/table-games");
  if (item.href === "/casino/video-poker")
    return pathname.startsWith("/casino/video-poker");
  if (item.href === "/casino/specialty")
    return pathname.startsWith("/casino/specialty");
  if (item.href === "/casino/virtual-sports")
    return pathname.startsWith("/casino/virtual-sports");
  if (item.href === "/casino/category/popular")
    return pathname.startsWith("/casino/category/popular");
  if (item.href === "/casino/trends")
    return pathname.startsWith("/casino/trends");
  if (item.href === "/casino/category/favourites") {
    return pathname.startsWith("/casino/category/favourites");
  }
  if (item.label === "Casino Lobby")
    return pathname === "/casino" || pathname === "/casino/";
  /* Sports Home ≠ soccer/football board — only exact `/sports`. */
  if (item.label === "Sports Home") {
    return pathname === "/sports" || pathname === "/sports/";
  }
  if (item.label === "Soccer") return pathname.startsWith("/sports/soccer");
  if (item.label === "NFL") return pathname.startsWith("/sports/football/nfl");
  if (item.label === "Football") {
    return (
      pathname.startsWith("/sports/football") &&
      !pathname.startsWith("/sports/football/nfl")
    );
  }
  if (
    (item.label === "My Bets" || item.label === "Portfolio") &&
    item.href === "/sports/my-bets"
  ) {
    return pathname.startsWith("/sports/my-bets");
  }
  /* Every other sport lobby (basketball, boxing, golf…) — active on its page and its events. */
  if (item.href.startsWith("/sports/") && !item.href.includes("?")) {
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }
  if (item.label === "All Promotions") {
    return pathname === "/promotions" || pathname === "/promotions/";
  }
  if (item.label === "My Bonus")
    return pathname.startsWith("/promotions/my-bonus");
  if (item.label === "Challenges")
    return pathname.startsWith("/promotions/challenges");
  if (item.label === "Raffles")
    return pathname.startsWith("/promotions/raffles");
  if (item.label === "Races") return pathname.startsWith("/promotions/races");
  if (item.label === "Contests")
    return pathname.startsWith("/promotions/contest");
  if (item.label === "Refer A Friend")
    return pathname.startsWith("/promotions/refer-a-friend");

  if (item.href === "/account") {
    return pathname === "/account" || pathname === "/account/";
  }
  if (item.href.startsWith("/account/")) {
    return pathname.startsWith(item.href);
  }

  /* Poker landing section anchors — Promotions stays a real route.
     Emphasis CTAs (Play Online / Download) are never "active" from hash. */
  if (pathname.startsWith("/poker") && item.href.startsWith("/poker#")) {
    if (item.label === "Play Online" || item.label === "Download") return false;
    const section = item.href.split("#")[1] ?? "";
    const current = hash || "poker-start";
    return section === current;
  }
  return false;
}

/** Stable id for one side-nav entry (the same sport can sit in Leagues, Top Sports and A–Z). */
export function navPickKey(
  group: Pick<ShellNavGroup, "heading">,
  groupIndex: number,
  item: Pick<ShellNavItem, "label">,
): string {
  return `${group.heading ?? groupIndex}|${item.label}`;
}

/** Several links can point at one page — light only the one the player clicked, else the first. */
export function withSingleActive(
  groups: ShellNavGroup[],
  prefer?: string | null,
  pathname?: string,
): ShellNavGroup[] {
  const all = groups.flatMap((group, gi) =>
    group.items.filter((item) => item.active).map((item) => ({ key: navPickKey(group, gi, item), href: item.href })),
  );
  /* The most specific link wins — on /sports/basketball/nba that's NBA, not Basketball. */
  const exact = pathname ? all.filter((x) => x.href === pathname) : [];
  const lit = (exact.length ? exact : all).map((x) => x.key);
  if (all.length < 2) return groups;
  const keep = prefer && lit.includes(prefer) ? prefer : lit[0];
  return groups.map((group, gi) => ({
    ...group,
    items: group.items.map((item) =>
      item.active && navPickKey(group, gi, item) !== keep ? { ...item, active: false } : item,
    ),
  }));
}

/** Product-tour spotlight hooks for V2 promo nav items. */
export function promoNavTourId(label: string): string | undefined {
  if (label === "Challenges") return "promo-nav-challenges";
  if (label === "Raffles") return "promo-nav-raffles";
  if (label === "Races") return "promo-nav-races";
  return undefined;
}

export function withNavActive(
  groups: ShellNavGroup[],
  pathname: string,
  hash = "",
): ShellNavGroup[] {
  return groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      active: navItemActive(item, pathname, hash),
    })),
  }));
}

export function navForProduct(
  product: ShellProduct,
  version: SiteVersionId = DEFAULT_SITE_VERSION,
): ShellNavGroup[] {
  if (product === "sports") {
    return withVipHub([
      {
        items: [
          {
            label: "Sports Home",
            href: SPORTS_HOME_HREF,
            icon: "house",
            emphasis: true,
          },
          {
                label: "My Bets",
                href: "/sports/my-bets",
                icon: "ticket",
                emphasis: true,
              },
          {
            label: "Live Betting",
            href: SPORTS_HOME_HREF,
            icon: "broadcast",
            emphasis: true,
            live: true,
          },
          { label: "Casino", href: "/casino", icon: "dice", emphasis: true },
          {
            label: "Odds Boosters",
            href: SPORTS_HOME_HREF,
            icon: "rocket",
            emphasis: true,
          },
          {
            label: "Same Game Parlay",
            href: SPORTS_HOME_HREF,
            icon: "sgp",
            emphasis: true,
          },
          {
            label: "Mega Parlay",
            href: SPORTS_HOME_HREF,
            icon: "megaParlay",
            emphasis: true,
          },
        ],
      },
      {
        heading: "Top Leagues",
        collapsible: true,
        items: [
          { label: "NBA", href: "/sports/basketball/nba", icon: "basketball" },
          { label: "NFL", href: "/sports/football/nfl", icon: "football" },
          { label: "MLB", href: "/sports/baseball", icon: "baseball" },
        ],
      },
      {
        heading: "Top Sports",
        collapsible: true,
        items: [
          {
            label: "Baseball",
            href: "/sports/baseball",
            icon: SPORT_ICON.Baseball,
          },
          {
            label: "Basketball",
            href: "/sports/basketball",
            icon: SPORT_ICON.Basketball,
          },
          {
            label: "Football",
            href: "/sports/football",
            icon: SPORT_ICON.Football,
          },
          { label: "Soccer", href: "/sports/soccer", icon: SPORT_ICON.Soccer },
        ],
      },
      {
        heading: "A - Z",
        collapsible: true,
        items: SPORTS_AZ.map((label) => ({
          label,
          href: SPORT_ROUTES[label] ?? SPORTS_HOME_HREF,
          icon: (SPORT_ICON[label] ?? "star") as ShellIconName,
        })),
      },
      {
        items: [{ label: "Settings", href: SPORTS_HOME_HREF, icon: "gear" }],
      },
    ]);
  }

  if (product === "poker") {
    return withVipHub([
      {
        items: [
          {
            label: "Play Online",
            href: "/poker#poker-start",
            icon: "play",
            emphasis: true,
          },
          {
            label: "Download",
            href: "/poker#poker-download",
            icon: "download",
            emphasis: true,
          },
        ],
      },
      {
        items: [
          { label: "Start", href: "/poker#poker-start", icon: "start" },
          { label: "Features", href: "/poker#poker-features", icon: "diamond" },
          {
            label: "Getting Started",
            href: "/poker#poker-getting-started",
            icon: "rocket",
          },
          {
            label: "Integrity",
            href: "/poker#poker-integrity",
            icon: "shield",
          },
          { label: "Promotions", href: "/promotions", icon: "gift" },
        ],
      },
    ]);
  }

  if (product === "promotions") {
    return withVipHub([
      {
        items: [
          { label: "All Promotions", href: "/promotions", icon: "megaphone" },
          { label: "My Bonus", href: "/promotions/my-bonus", icon: "gift" },
          ...(versionAtLeast(version, "v2")
            ? ([
                {
                  label: "Challenges",
                  href: "/promotions/challenges",
                  icon: "target",
                },
                {
                  label: "Raffles",
                  href: "/promotions/raffles",
                  icon: "ticket",
                },
                { label: "Races", href: "/promotions/races", icon: "trophy" },
              ] satisfies ShellNavItem[])
            : []),
          { label: "Contests", href: "/promotions/contest", icon: "contests" },
          {
            label: "Refer A Friend",
            href: "/promotions/refer-a-friend",
            icon: "refer",
          },
        ],
      },
      {
        items: [
          { label: "Get Telegram", href: "/promotions", icon: "telegram" },
        ],
      },
    ]);
  }

  return withVipHub([
    {
      items: [
        {
          label: "Casino Lobby",
          href: "/casino",
          icon: "library",
          emphasis: true,
        },
        {
          label: "Favorite",
          href: "/casino/category/favourites",
          icon: "favorite",
          emphasis: true,
        },
        {
          label: "Play Random",
          href: "/casino",
          icon: "random",
          action: "launch-random",
          emphasis: true,
        },
        {
          label: "Last Game Played",
          href: "/casino",
          icon: "lastGame",
          action: "launch-last-game",
          emphasis: true,
        },
      ],
    },
    {
      items: [
        {
          label: "Popular Games",
          href: "/casino/category/popular",
          icon: "popular",
        },
        { label: "Slots", href: "/casino/slots", icon: "slots" },
        { label: "Live Casino", href: "/casino/live", icon: "live" },
        { label: "Table Games", href: "/casino/table-games", icon: "table" },
        {
          label: "Video Poker",
          href: "/casino/video-poker",
          icon: "videoPoker",
        },
        {
          label: "Specialty Games",
          href: "/casino/specialty",
          icon: "specialty",
        },
        { label: "Virtuals", href: "/casino/virtual-sports", icon: "virtuals" },
        { label: "Tournaments", href: "/casino", icon: "tournaments" },
        { label: "Trends", href: "/casino/trends", icon: "trends" },
      ],
    },
  ]);
}
