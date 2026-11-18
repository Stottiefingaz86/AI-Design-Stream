"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShellIcon, type ShellIconName } from "@/components/site/shell-icons";
import { useShell } from "@/components/site/shell-context";
import {
  SOCCER_SPORT_RAIL,
  type SoccerRailIcon,
} from "@/lib/lumen/soccer-sport";
import { useSportsBets } from "@/lib/lumen/sports-bets-store";
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

function activeRailId(pathname: string | null): string {
  if (!pathname) return "soccer";
  if (pathname.startsWith("/sports/my-bets")) return "my-bets";
  if (pathname.startsWith("/sports/football")) return "football";
  if (pathname.startsWith("/sports/soccer")) return "soccer";
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
  const active = activeRailId(pathname);
  const bets = useSportsBets();
  const pending = loggedIn
    ? bets.filter((b) => b.status === "pending").length
    : 0;

  /* Spinner holds on the tapped sport until the route lands. */
  useEffect(() => {
    setRailLoading(null);
  }, [pathname]);

  const onRailClick = (item: (typeof SOCCER_SPORT_RAIL)[number]) => {
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
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center md:h-[76px] md:px-6 md:py-3">
        <nav
          data-name="sub-menu-scroll"
          aria-label="Sports"
          className="scrollbar-hide flex w-full min-w-0 gap-0.5 overflow-x-auto px-4 md:gap-1 md:px-0"
        >
          {SOCCER_SPORT_RAIL.map((item) => {
            const on = item.id === active;
            const loading = railLoading === item.id;
            const icon = RAIL_ICONS[item.icon];
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
      </div>
    </div>
  );
}
