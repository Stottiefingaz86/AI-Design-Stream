# Sports Home (`/sports`)

Layout reference: PropShopX `321:152831` — **content only**. Shell already owns chrome / sports sub-nav. Translate into Lumen + live sports components; do not clone PropShopX chrome.

## Route & nav
- `/sports` is Sports Home (not a soccer redirect).
- `SPORTS_HOME_HREF = '/sports'`. Sidebar **Sports Home** is active only on exact `/sports` (never on `/sports/soccer` or `/sports/football`).
- Soft-nav destination skeleton: banners + Popular + SGP shimmers (`SportsHomeSkeleton`).

## Page stack (top → bottom)
1. **Casino banners** — same `CasinoLobbyBannerRow` as homepage/casino (VIP + daily race + lobby promos). Desktop glass arrows; mobile swipe-only.
2. **Popular** — live-only mix across soccer + NFL. Cards ~340×160: league mark + name, red live clock, crests/names/score, bottom **moneyline % bar** (soccer 3-way; NFL 2-way away/home). Tap → event. Desktop arrows; mobile swipe.
3. **Same Game Parlays** — sleek pack cards (not in Figma). Event label, 2–3 stacked legs, combined American price, primary **Add SGP**. One action adds **every leg** with shared `eventId` so the betslip auto-forms one SGP; `flyBetDotToSlip` + dock reveal. Toggle removes the pack legs. No empty-state flash.
4. **Mode pills** — Games / Outrights / All Leagues (`ModePillTrack`). Filter icon soft-switches to All Leagues.
5. **Games boards** — Premier League first (all rows, top-league rule), then NFL (preview 3 + Show more). Soccer horizontal chips; NFL US stacked columns. See All → `/sports/soccer` or `/sports/football/nfl`.
6. **Outrights** — soccer + NFL futures via `OutrightsBoard`. **All Leagues** — compact list into built sports.
7. **Live Wins** + shared `SoccerBetslip`.

## Locked interactions
- SGP pack = whole pack onto the slip as one same-game group (combined price on card matches slip SGP unit).
- Popular is **live only** (demo may promote a couple of spotlight games to live for richness).
- Never invent a parallel sports shell; reuse soccer/NFL board primitives and casino banner/wins shelves.

## Round 2 corrections (Nov 2026)
- **Banners never clip.** `CasinoLobbyBannerRow` owns its gutters — never wrap it in extra `px-*` (same as casino lobby).
- **No rainbow bars.** ML % bar is monochrome: favourite segment `bg-foreground`, others muted (color-mix on `--muted-foreground`), small gaps; labels `COV 31% · Draw 25% · BRI 44%`, favourite bold.
- **Popular cards hover like casino tiles** — framer spring lift (`scale 1.03, y -6`) on fine pointer, press shrink on touch; rail padded so the lift isn't clipped.
- **Boards = the real blocks.** Sports Home renders `SoccerLeagueBoard` (soccer page `LeagueGamesCard` + alt lines, market headers, every chip) and NFL `LeagueCard`. Never a home-only copy that drops titles/odds.
- **Order:** Banners → Popular → mode pills → Premier League → **Same Game Parlays** → NFL.
- **SGP cards:** league + clock/time, teams stacked with crests, legs on a **timeline** (My Bets node + connector grammar; nodes fill primary when added), full selection copy ("Coventry City to win", "Over 2.5 goals"), market muted below (hidden if same as copy), leg price right. Footer = full-width board odds chip `3 Leg SGP / +689` → "Added to Betslip" when on slip.

## Round 3 corrections (Nov 2026)
- **Shelf icons = Figma marks, no backing card.** Popular uses the PropShopX shooting star (`ShellIcon popularSports`, `public/shell/figma/sports/popular.svg` from 321:153695). SGP = `sgp`, Odds Boosts = `rocket`. Icon sits bare next to the title — never in a `bg-secondary` square.
- **Board filter = game status:** Starting Soon / Live / Not Started (`ModePillTrack`). Not Games / Outrights / All Leagues, no filter-icon button on Sports Home. Starting Soon = next 3 kickoffs per league; Not Started = every pre-match game.
- **Popular has a sport filter** — chip tabs All / Soccer / Football (sport ShellIcons) above the rail.
- **Live cards get the board live glow** (`LIVE_ROW_STYLE` left red wash) — Popular, SGP and Odds Boost cards when live.
- **Odds Boosts carousel** sits below SGP: meta row, event plate, rocket + proposition, `Was` (struck, muted) | `Boosted` odds chip. Boosts go on the slip straight-only.
- **ML % bar:** favourite `bg-foreground`, others solid `bg-muted-foreground` grey (opacity modifiers on this token don't render).
- **Hover is subtle on every home card** (`y -2, scale 1.01`, soft spring) — Popular, SGP, Boosts. Not the casino poster lift.
- **Event plate for hierarchy:** SGP + Boost cards put teams + chevron on an inner `rounded-lg border bg-secondary hover:bg-accent` plate under the league/time row.
- **Order:** Banners → Popular → status pills → Premier League → SGP → Odds Boosts → NFL.

## Round 4 (Nov 2026)
- **Selected SGP legs show ticks** — filled primary node with a white check (My Bets won-node grammar), never a blank red dot.
- **Every card that opens an event shows the banner preloader** (dim + spinner overlay on the whole card) before the route swaps — Popular, SGP plate, Odds Boost plate. Shared `useLaunch` + `LaunchOverlay` in `sports-home-page.tsx`.
- **Status pills removed for now** (Starting Soon / Live / Not Started) — boards show all games.

## Round 5 (Nov 2026)
- **Rails never clip inside the gutter.** `HorizontalRail` bleeds to the page edge (`-mx-4 md:-mx-6` + matching padding / scroll-padding), same as `CasinoLobbyBannerRow`; arrows at `left-3` / `right-3`.
- **Collapsed betslip dock** ("3 Selections +689") ends with an up chevron, far right.
- V3 adds a Markets shelf under Popular. See `SPORTS_V3_MARKETS.md`.
