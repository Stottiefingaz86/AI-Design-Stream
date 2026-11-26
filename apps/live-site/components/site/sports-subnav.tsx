"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { ShellIcon, type ShellIconName } from "@/components/site/shell-icons";
import { useShell } from "@/components/site/shell-context";
import {
  SOCCER_SPORT_RAIL,
  type SoccerRailIcon,
} from "@/lib/lumen/soccer-sport";
import { useSportsBets } from "@/lib/lumen/sports-bets-store";
import { useSiteVersion } from "@/lib/lumen/site-versions";
import { cn } from "@/lib/utils";

/** Lumen sports marks — same ShellIcon set as the sports side nav. */
const RAIL_ICONS: Record<SoccerRailIcon, ShellIconName> = {
  bets: "ticket",
  soccer: "soccer",
  football: "football",
  basketball: "basketball",
  tennis: "tennis",
  baseball: "baseball",
  hockey: "hockey",
  mma: "mma",
};

const TILE_NAV_MS = 280;

type RailItem = { id: string; label: string; href: string; shell: ShellIconName };

/** V5 · Combos — every sport on the book gets a tile (earlier versions keep the short rail). */
const V5_EXTRA_RAIL: RailItem[] = [
  { id: "boxing", label: "Boxing", shell: "boxing", href: "/sports/boxing" },
  { id: "golf", label: "Golf", shell: "golf", href: "/sports/golf" },
  { id: "horse-racing", label: "Racing", shell: "horseRacing", href: "/sports/horse-racing" },
  { id: "rugby", label: "Rugby", shell: "rugby", href: "/sports/rugby" },
  { id: "volleyball", label: "Volleyball", shell: "volleyball", href: "/sports/volleyball" },
  { id: "table-tennis", label: "Table Tennis", shell: "tableTennis", href: "/sports/table-tennis" },
  { id: "lacrosse", label: "Lacrosse", shell: "lacrosse", href: "/sports/lacrosse" },
  { id: "pool", label: "Pool", shell: "pool", href: "/sports/pool" },
];

function activeRailId(pathname: string | null, rail: RailItem[]): string {
  if (!pathname) return "soccer";
  if (pathname.startsWith("/sports/my-bets")) return "my-bets";
  if (pathname.startsWith("/sports/football")) return "football";
  if (pathname.startsWith("/sports/soccer")) return "soccer";
  const sport = rail.find((i) => i.href !== "/sports" && pathname.startsWith(i.href));
  if (sport) return sport.id;
  /* Sports Home — no sport rail selected. */
  if (pathname === "/sports" || pathname === "/sports/") return "";
  return "soccer";
}

/**
 * PropShopX sport icon rail — lives in shell sticky chrome with casino glass.
 * Scrolls horizontally on mobile (carousel); frosts content underneath.
 */
export function SportsSubNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { startNavigating, loggedIn } = useShell();
  const [railLoading, setRailLoading] = useState<string | null>(null);
  const version = useSiteVersion();
  const rail: RailItem[] = [
    ...SOCCER_SPORT_RAIL.map((i) => ({ id: i.id, label: i.label, href: i.href, shell: RAIL_ICONS[i.icon] })),
    ...(version === "v5" ? V5_EXTRA_RAIL : []),
  ];
  const active = activeRailId(pathname, rail);
  /* Desktop only — glass chevrons + edge fade when the rail overflows (mice have no sideways scroll). */
  const scrollRef = useRef<HTMLElement>(null);
  const [edge, setEdge] = useState({ back: false, more: false });
  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setEdge({
      back: el.scrollLeft > 2,
      more: el.scrollLeft + el.clientWidth < el.scrollWidth - 2,
    });
  }, []);
  useLayoutEffect(() => {
    measure();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, rail.length]);
  const scrollBy = (d: 1 | -1) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: d * Math.min(320, el.clientWidth * 0.7), behavior: "smooth" });
  };
  const fade = `linear-gradient(to right, ${edge.back ? "transparent 0, black 56px" : "black 0"}, ${
    edge.more ? "black calc(100% - 72px), transparent 100%" : "black 100%"
  })`;
  const arrow =
    "absolute top-1/2 z-20 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border v5-glass text-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring md:inline-flex";
  const bets = useSportsBets();
  const pending = loggedIn
    ? bets.filter((b) => b.status === "pending").length
    : 0;

  /* Spinner holds on the tapped sport until the route lands. */
  useEffect(() => {
    setRailLoading(null);
  }, [pathname]);

  const onRailClick = (item: RailItem) => {
    if (pathname === item.href || railLoading) return;
    setRailLoading(item.id);
    window.setTimeout(() => {
      startNavigating(item.href);
      router.push(item.href);
    }, TILE_NAV_MS);
  };

  return (
    <div
      data-name="sub-menu"
      data-glass="true"
      data-sticky="false"
      className="w-full shrink-0 border-b border-border"
    >
      <div className="relative mx-auto flex h-16 w-full max-w-[1440px] items-center md:h-[76px] md:px-6 md:py-3">
        <nav
          ref={scrollRef}
          onScroll={measure}
          data-name="sub-menu-scroll"
          aria-label="Sports"
          className="scrollbar-hide flex w-full min-w-0 gap-0.5 overflow-x-auto px-4 md:gap-1 md:px-0"
          style={edge.back || edge.more ? { maskImage: fade, WebkitMaskImage: fade } : undefined}
        >
          {rail.map((item) => {
            const on = item.id === active;
            const loading = railLoading === item.id;
            const icon = item.shell;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onRailClick(item)}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "relative flex h-14 w-[68px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg px-1 transition-colors",
                  on
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {loading ? (
                  <span className="size-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                ) : (
                  <ShellIcon
                    name={icon}
                    tone="token"
                    className={cn(
                      "size-5",
                      on ? "!bg-foreground" : "!bg-current",
                    )}
                  />
                )}
                <span className="text-[11px] font-medium leading-none tracking-tight">
                  {item.label}
                </span>
                {item.id === "my-bets" && pending > 0 ? (
                  <span
                    aria-label={`${pending} pending`}
                    className="absolute right-2.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground"
                  >
                    {pending}
                  </span>
                ) : null}
                {on ? (
                  <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary" />
                ) : null}
              </button>
            );
          })}
        </nav>
        {edge.back ? (
          <button type="button" aria-label="Scroll sports back" onClick={() => scrollBy(-1)} className={cn(arrow, "left-6")}>
            <IconChevronLeft className="size-4" stroke={2} />
          </button>
        ) : null}
        {edge.more ? (
          <button type="button" aria-label="Scroll sports forward" onClick={() => scrollBy(1)} className={cn(arrow, "right-6")}>
            <IconChevronRight className="size-4" stroke={2} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
