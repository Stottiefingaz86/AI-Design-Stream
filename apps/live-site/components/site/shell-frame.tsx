"use client";

import { Suspense, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShellContent } from "./shell-content";
import { useShell, useShellOptional, ShellProvider } from "./shell-context";
import { ShellSeo } from "./shell-seo";
import { ShellDrawer } from "./shell-drawer";
import { ShellSidebar } from "./shell-sidebar";
import { SiteFooter } from "./site-footer";
import { CashierSheet } from "./cashier-sheet";
import { UbcSheet } from "./shell-ubc";
import { VipHubSheet } from "./vip-hub-sheet";
import { NotificationsSheet } from "./notifications-sheet";
import { VipClaimToastHost } from "@/components/lumen/vip-claim-toast";
import { DailySpinModal } from "@/components/lumen/daily-spin-modal";
import { ChurnRescueModal } from "@/components/site/churn-rescue-modal";
import { ShellMobileNav } from "./shell-mobile-nav";
import { casinoSkeletonForPath } from "@/components/lumen/casino-lobby-skeleton";
import { HomepageLobbySkeleton } from "@/components/lumen/homepage-lobby-skeleton";
import { PokerLandingSkeleton } from "@/components/lumen/poker-landing-skeleton";
import { ContestsLobbySkeleton } from "@/components/lumen/contests-lobby-skeleton";
import { MyBonusSkeleton } from "@/components/lumen/my-bonus-skeleton";
import { MyAccountSkeleton } from "@/components/lumen/my-account-skeleton";
import { BetHistorySkeleton } from "@/components/lumen/bet-history-skeleton";
import { PaymentsSkeleton } from "@/components/lumen/payments-skeleton";
import { TransactionsSkeleton } from "@/components/lumen/transactions-skeleton";
import { SecurityCentralSkeleton } from "@/components/lumen/security-central-skeleton";
import { ProfileSettingsSkeleton } from "@/components/lumen/profile-settings-skeleton";
import { PromotionsLobbySkeleton } from "@/components/lumen/promotions-lobby-skeleton";
import {
  ChallengesSkeleton,
  RacesRouteSkeleton,
  RafflesSkeleton,
} from "@/components/lumen/v2-promos-skeleton";
import { ReferAFriendSkeleton } from "@/components/lumen/refer-a-friend-skeleton";
import { SoccerEventSkeleton } from "@/components/lumen/soccer-event-skeleton";
import { MyBetsSkeleton } from "@/components/lumen/my-bets-skeleton";
import { SoccerSportSkeleton } from "@/components/lumen/soccer-sport-skeleton";
import { SportsHomeSkeleton } from "@/components/lumen/sports-home-skeleton";
import { CasinoSearchOverlay } from "@/components/lumen/casino-search-overlay";
import { GameLauncher } from "@/components/lumen/game-launcher";
import { CasinoSubNav } from "./casino-subnav";
import { AccountSubNav } from "./account-subnav";
import { SportsSubNav } from "./sports-subnav";
import { ShellStickyChrome } from "./shell-sticky-chrome";
import { AuthModal } from "./auth-modal";
import { ProfileGateModal } from "./profile-gate-modal";
import { FullPageLoader } from "./full-page-loader";
import { IntercomFab } from "./intercom-fab";
import { ProductTourHost } from "./product-tour";
import { applySiteVersionFromUrl } from "@/lib/lumen/site-versions";
import { isAccountPath, productFromPath } from "./shell-nav";
import { cn } from "@/lib/utils";

/**
 * Figma 🐚 Shell — casino / sports / poker / promotions
 * Viewport-locked chrome: header stays put, page scrolls under it,
 * footer stays at the end of the page (and docks to the bottom on short pages).
 */
export function ShellFrame({
  children,
  loggedIn = false,
  skeleton = false,
  hideSeo = false,
}: {
  children?: ReactNode;
  loggedIn?: boolean;
  skeleton?: boolean;
  /** Error pages — no SEO block under content. */
  hideSeo?: boolean;
}) {
  const existing = useShellOptional();
  const chrome = (
    <TooltipProvider delayDuration={0}>
      <ShellChrome hideSeo={hideSeo} forceSkeleton={skeleton}>
        {children}
      </ShellChrome>
    </TooltipProvider>
  );

  /*
   * Prefer the root SiteShellRoot provider so login/profile survive route
   * changes. Only mount a local provider for Storybook / isolated chrome.
   */
  if (existing) return chrome;

  return (
    <ShellProvider loggedIn={loggedIn} forceSkeleton={skeleton}>
      {chrome}
    </ShellProvider>
  );
}

/** Skeleton for the destination route — never the page you’re leaving. */
function RouteSkeleton({ path }: { path: string }) {
  if (path === "/") return <HomepageLobbySkeleton />;

  if (isAccountPath(path)) {
    if (path.startsWith("/account/bet-history")) return <BetHistorySkeleton />;
    if (path.startsWith("/account/transactions"))
      return <TransactionsSkeleton />;
    if (path.startsWith("/account/payments")) return <PaymentsSkeleton />;
    if (path.startsWith("/account/security"))
      return <SecurityCentralSkeleton />;
    if (path.startsWith("/account/settings"))
      return <ProfileSettingsSkeleton />;
    return <MyAccountSkeleton />;
  }

  const product = productFromPath(path);
  if (product === "poker") return <PokerLandingSkeleton />;
  if (product === "promotions") {
    if (path.startsWith("/promotions/my-bonus")) return <MyBonusSkeleton />;
    if (path.startsWith("/promotions/races")) return <RacesRouteSkeleton />;
    if (path.startsWith("/promotions/challenges"))
      return <ChallengesSkeleton />;
    if (path.startsWith("/promotions/raffles")) return <RafflesSkeleton />;
    if (path.startsWith("/promotions/contest"))
      return <ContestsLobbySkeleton />;
    if (path.startsWith("/promotions/refer-a-friend"))
      return <ReferAFriendSkeleton />;
    return <PromotionsLobbySkeleton />;
  }
  /* Casino — destination layout (shelves / wallpaper / lobby), never blank. */
  if (product === "casino") return casinoSkeletonForPath(path);
  if (product === "sports") {
    if (
      path.startsWith("/sports/soccer/event/") ||
      path.startsWith("/sports/football/event/")
    )
      return <SoccerEventSkeleton />;
    if (path.startsWith("/sports/my-bets")) return <MyBetsSkeleton />;
    if (path.startsWith("/sports/soccer")) return <SoccerSportSkeleton />;
    if (path.startsWith("/sports/football")) return <SoccerSportSkeleton />;
    if (path === "/sports" || path === "/sports/")
      return <SportsHomeSkeleton />;
    return <SportsHomeSkeleton />;
  }

  return <ShellContent />;
}

function ShellChrome({
  children,
  hideSeo = false,
  forceSkeleton = false,
}: {
  children?: ReactNode;
  hideSeo?: boolean;
  /** Next `loading.tsx` ShellFrame — keep destination skeleton until page mounts. */
  forceSkeleton?: boolean;
}) {
  const pathname = usePathname();
  const {
    expanded,
    drawerOpen,
    setDrawerOpen,
    cashierOpen,
    setCashierOpen,
    vipHubOpen,
    setVipHubOpen,
    notificationsOpen,
    setNotificationsOpen,
    product,
    navigating,
    pendingHref,
    fullPageLoader,
    casinoSearchOpen,
    setCasinoSearchOpen,
    launchedGame,
    closeGameLauncher,
    dailySpinOpen,
    closeDailySpin,
    resolveDailySpin,
  } = useShell();
  const showSkeleton = navigating || forceSkeleton;

  useEffect(() => {
    applySiteVersionFromUrl();
  }, []);

  /**
   * Homepage chrome (wordmark, no rail) only while truly idle on `/`.
   * Soft-nav away from home must flip to product chrome immediately — otherwise
   * sidebar logo + header wordmark both show while pendingHref is set.
   */
  const isHomeChrome = pathname === "/" && !pendingHref;
  const skeletonPath = pendingHref ?? pathname;
  const showAccountNav = isAccountPath(pathname) || isAccountPath(skeletonPath);
  const showCasinoNav =
    pathname.startsWith("/casino") || skeletonPath.startsWith("/casino");
  const showSportsNav =
    pathname.startsWith("/sports") || skeletonPath.startsWith("/sports");

  return (
    <div
      data-name="Product Page"
      className="fixed inset-0 flex flex-col overflow-hidden bg-background font-sans text-foreground"
    >
      {isHomeChrome ? null : <ShellSidebar />}
      <ShellDrawer />
      <div
        data-shell-column=""
        className={cn(
          "flex h-full min-h-0 min-w-0 flex-1 flex-col transition-[padding] duration-300 ease-in-out",
          !isHomeChrome && "lg:pl-24",
          !isHomeChrome && expanded && "lg:pl-64",
        )}
      >
        {/*
          One chrome block (chips + header + glass sub-nav). Sticky top:-chipH
          so the page scrolls until main nav hits the top; scroll-up sets top:0
          to slide the block down until quick-nav is fully revealed.
        */}
        <div
          id="shell-scroll"
          className="shell-scroll h-0 min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
        >
          {/* Above in-page z-50+ (e.g. VIP carousel CTA) so scroll content can’t paint over the header. */}
          <ShellStickyChrome
            subNav={
              <>
                {showCasinoNav ? (
                  <CasinoSubNav glass sticky={false} motion />
                ) : null}
                {showAccountNav ? <AccountSubNav /> : null}
                {showSportsNav && !showCasinoNav && !showAccountNav ? (
                  <SportsSubNav />
                ) : null}
              </>
            }
          />
          {/*
            Content flex-1 fills the viewport so SEO + footer stay pinned below the fold.
            Hide SEO while any soft-nav is in flight (pendingHref) — including casino
            routes that skip the skeleton — so it never flashes under the sub-nav.
          */}
          <div className="flex min-h-full w-full flex-col">
            <div className="mx-auto w-full max-w-[1440px] min-h-0 flex-1 pb-24 lg:pb-0">
              {showSkeleton ? (
                <RouteSkeleton path={skeletonPath} />
              ) : (
                (children ?? <ShellContent />)
              )}
            </div>
            {!hideSeo &&
            !pendingHref &&
            !showSkeleton &&
            !fullPageLoader &&
            !pathname.startsWith("/casino/trends") ? (
              <ShellSeo />
            ) : null}
            <SiteFooter />
          </div>
        </div>
      </div>
      <ShellMobileNav />
      <Suspense fallback={null}>
        <IntercomFab />
      </Suspense>
      <ProductTourHost />
      <FullPageLoader open={fullPageLoader} />
      <AuthModal />
      <ProfileGateModal />
      <CashierSheet open={cashierOpen} onClose={() => setCashierOpen(false)} />
      <UbcSheet open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <VipHubSheet open={vipHubOpen} onClose={() => setVipHubOpen(false)} />
      <NotificationsSheet
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <VipClaimToastHost />
      <ChurnRescueModal />
      <DailySpinModal
        open={dailySpinOpen}
        onClose={closeDailySpin}
        onResult={resolveDailySpin}
      />
      {product === "casino" ? (
        <CasinoSearchOverlay
          open={casinoSearchOpen}
          onClose={() => setCasinoSearchOpen(false)}
        />
      ) : null}
      {/* Always mount — free spins can open from homepage before /casino lands. */}
      <GameLauncher
        open={!!launchedGame}
        game={launchedGame}
        onClose={closeGameLauncher}
      />
    </div>
  );
}
