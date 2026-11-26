# Sports V5 — Combos (prediction-market layer on the V1 sportsbook)

**Source:** Chris, 25 Nov 2026. V5 is a sportsbook with a prediction-market feel and a combo builder people actually use. Don't touch the other versions.

## Hard rules
- V5 owns `/sports`, `/sports/football`, `/sports/soccer` and both event views **only when V5 is picked**. V1–V3 render exactly as before (`V5Switch` wraps the existing `V3Switch`).
- **Build on V1.** Same container, breadcrumbs (`BreadcrumbMenu`), league tiles (`LeagueQuickLinks`), mode pills (`ModePillTrack`), card (`rounded-[10px] border bg-card` + soft shadow), `Typography` scale, odds-chip grammar (`rounded-lg border bg-secondary`, primary when picked). If it doesn't look like V1, it's wrong.
- **No AI-slop tells:** no hero banners, no rainbow, no glow, no pulsing, no flashing. Bold type is wanted (`font-bold`, page titles `text-3xl`, shelf titles `text-xl`) but it must sit with the casino lobby type scale — no `font-black` display sizes.
- **Never red icons.** Icons are foreground/muted. Red is for CTAs, the live clock and picked chips only.
- **Hover lights up subtly, never strokes:** cards go to `bg-accent` (`V5_LIGHT_UP`). Borders never change on hover. Picked state = filled primary chip, never a primary card border.
- **Sub-navs use the V1 pill track** (`ModePillTrack`) — markets on sport pages, Moneyline/Spread/Total in the builder, market groups on the event view, prop groups.
- **Shelves use the casino shelf header:** title left, boxed `See All` + boxed ‹ › arrows right (`V5Shelf`).
- Lumen tokens only. Picks use the shared betslip store.

## Lobby (`ComboSportsPage`)
Breadcrumb → league tiles → pills **Games · Live · Popular Combos** → **Popular Combos** shelf (`HorizontalRail`, See All) → league boards (18px logo + name + See All) with 2-up game cards → Live Wins.
- Game card: V1 meta strip (league · time / red live clock), team rows = crest · name · record · chance bar · score (live) · chip with multiplier on top and % below. Footer: volume · N betting · All markets. Live cards get the V1 live wash.
- Popular combo card: meta strip (league · title · bettors), legs with multipliers, "$10 pays $X", `Add N legs` → `✓ Added` (filled chip).

## Combo builder entry
- Lives in the **Selections bar**: desktop dock shows `[n] Selections +odds | Combo builder`; empty slip shows a `Combo builder · Stack 2+ picks` dock. The slip header also has a Combo builder button. Mobile: Popular Combos → Build your own card.
- Builder overlay: V1 top bar (back, Sports / Combo builder, search, close), league tiles, Popular Combos rail, Moneyline / Spread / Total pills, game cards with Yes ¢ / No ¢, the combo growing in a betslip-surface card on the right.

## Event view (`ComboEventPage`)
V1 frame: breadcrumbs + scoreboard header (`EventHeader`), **right rail = stream, match tracker and stats** (`MediaPanel`, `LiveStatsCard`; pregame `WinProbabilityCard` + `PreMatchCards`). That rail is the advantage a pure prediction market doesn't have, so it stays.
Main column:
1. Chance chart — % per side + move, line chart, **bets stream up the chart as "+ $X"** in the colour of the side they back, volume ticks up.
2. Pills **Game Lines · Game Props · Player Props**.
3. Game Lines: Who wins? (Yes ¢ / No ¢ per side), Spread and Total with **line steppers**.
4. Game Props: V1 yes/no markets in one "Yes or no" card (one question per row); multi-outcome props one row per outcome.
5. Player Props: V1 player markets — column chips (e.g. Anytime / First), rows sorted by chance, Show more; yardage-style props get a line stepper.

## Betslip (`SoccerBetslip variant="v5"`)
Same logic as V1. Look: legs are cards (label on its own line, market · multiplier, event, stake right). **SGP and Combo cards pinned at the bottom** (SGP shows its legs as chips; Combo shows multiplier and quick stakes $5 / $10 / $25 / $50). No tinted band behind the combo.

## After a bet (`BetStackPopup`)
- Opens **only after the player closes the slip on a receipt** (not over the open slip, not when heading to My Bets).
- Compact deck docked bottom-centre above the Selections bar, betslip surface, no dimmed overlay. Header: ✓ N-leg combo placed · stake to win. Thin 10s progress line; each card holds 10s then shuffles (hover pauses). Cards: same game more legs, build on your bet, popular combo, one casino card (Play while you wait). Team-level legs only.
- Design review: `?stack=preview`.

## Don't
- Live-bets feed lists. The live feel is the number stream on the chart.
- A separate combo slip — the existing betslip is the slip.


## Update — 25 Nov evening (V5d)
- **Sport pages:** title (+ " · View") with a **sort menu** (Start time · Trending · Volatile · New · Closing soon · Volume · 50-50 · Reverse sort), league tabs, then the market pill track: **Games** (default) · Live · Spreads · Totals · Game props · Player props · Win totals · Futures · Combos · Odds Boosts. Data: `lib/lumen/v5-markets.ts` (uniform `KCard` rows; V1 event models for props; NFL win totals from records; futures from `marketFutures`).
- **Games view:** Popular carousel (league groups, live scores) → Odds Boosts → Popular Combos → **Same Game Combos** → **Mega Combos** (V1 SGP packs / mega parlays renamed), then games by day. Home also gets the casino banner row.
- **Game cards:** % pill + multiplier per side, **buy points** = V1 board chips + the ⇅ alternate-line dropdown (`AlternateLinePicker`), not a ‹ › stepper.
- **League logos:** always `leagueLogo()` (the transparent SVGs in `/leagues`).
- **Builder:** uses the real betslip inline on the right (`SoccerBetslip inline variant="v5"`), which prompts "Pick 1 more market to make a combo". One close button; search is a field.
- **Betslip V5:** selections timeline; single → stake box; 2+ → "Bet as singles" disclosure; SGP blocks; combo pinned at the bottom with stake field (label left, amount right), quick stakes, Chance row and big **To win**; the slip never pops open on its own in V5 (picks build in the Selections bar).
- **After a bet:** deck opens when the slip closes on the receipt; 20s per card, **never pauses**; "Add to Selections" adds legs without opening the slip; casino card = blurred art + tile + Play now.
- **Event view footer:** Market rules (Timeline and payout, rules text, ids, insider betting) + People are also betting.

## Update — 25 Nov night (V5 round 4)
- **Full sportsbook:** `lib/lumen/v5-sportsbook.ts` generates every side-nav sport (Basketball, Hockey, Baseball, Tennis, MMA, Boxing, Golf, Horse Racing, Rugby, Lacrosse, Volleyball, Table Tennis, Pool) plus extra Soccer leagues (Serie A, Bundesliga, Ligue 1, Europa League, Liga MX, MLS): leagues, games, live scores, deep event markets per sport (V1 market kinds), ladders, futures. Teams are real; every individual is invented. Routes: `app/sports/[sport]` + `/event/[eventId]` (V5 only; earlier versions show Sports Home). Side nav, Top Leagues, Top Sports and the sport rail link to them; V5 adds the extra sports to the rail with desktop-only chevrons.
- **Layout:** main column (title, league tabs, market pill track, content) + sticky right rail from the top: promos, Top movers, Casino (Top 10 · Slots · Blackjack · Live casino · Originals, 16 each, scroll with fade), Season forecasts, Politics & Entertainment (sport pages). Home: Trending (3 chart cards) → Popular leagues → Popular → Live now → Popular Combos → sport sections (Football, Basketball, Soccer, Hockey, Tennis, MMA) interleaved with Odds Boosts, Upcoming, Same Game Combos, Politics & Entertainment, Mega Combos → Browse markets (sort · when · category · more).
- **Shelves:** `V5Shelf fill/minCard` size cards to the column; arrows only when there is more; fade at the clipped edge. `AUTO_GRID`: max two columns, lone card spans, single card fills. `FadeScroll` for vertical/horizontal scroll areas. `V5PillTrack` = V1 pill look + casino overflow (phone: edge-to-edge capsule; desktop: clip, fade, glass chevrons).
- **Event view:** every V1 market in V1's own groups (Popular · Goals · Halves · Corners · Cards · Players / Quarters · Touchdowns · Props) rendered as Yes / No rows (rows, ladders, lists, grids, correct score, US lines, player tables). Races get a field header + Runners rail.
- **Casino:** rail games open in a draggable mini player (theatre view, full screen → game launcher; launches with a $0 wallet via `launchGame(..., { skipFunds: true })`).
- **Deck:** Tinder-style — swipe the top card away (phones), it flies off, the next rises; receipt bar above, roomy cards, full-width CTA.
- **Combo builder:** glass header, full-height inline slip, sport pills (all sports) + league tabs, Combo meter (legs, $10 pays, next-leg payout), tabs Moneyline · Spread · Total · Game props · Player props · Futures. Combo identity = `/v5/combo-mark.svg` (holographic double-diamond +); the dock button gets a slow light sweep, no glow.

## Update — 26 Nov (V5 round 5)
- **Side nav:** `withSingleActive()` + `navPickKey()` in `shell-nav.ts` (new exports). In V5 the sidebar lights one item: the clicked one (sessionStorage `shell-sidebar-pick:<product>`), else the first match. Scroll position persists per product.
- **League menu:** `v5-league-menu.tsx`. "All" plus the top 4 leagues by volume as logo chips, and an "All leagues N" menu grouped by `leagueCountry()` with search, live and game counts. `?league=` deep links.
- **Header:** back · title · SortMenu · round search, then `V5PillTrack` markets, then league chips (sport pages with 2+ leagues).
- **Combo mark:** `components/lumen/v5/combo-mark.tsx` (`<ComboMark/>`) is an inline SVG with light/dark gradients. `public/v5/combo-mark.svg` is the clean dark version. It's used on the dock CTA, Build-your-own CTA, ComboPackCard header, builder header and meter, slip hint and empty state, slip combo footer, rail promo and bet stack.
- **Sheen:** `.v5-combo-sheen` is isolated and the sheen sits at z -1, so it runs under the label.
- **Builder sport pills:** monochrome `/shell/figma/sports/lumen/*` glyphs.

## Update — 26 Nov morning (V5 round 6)
- **League pages:** `app/sports/[sport]/[league]`, `app/sports/soccer/[league]` (new) and `app/sports/football/[league]` (V5Switch added). `ComboSportsPage({ sport, leagueSlug })` shows logo + title, Trending, day groups, Futures and Activity for that league, plus a rail filtered to it. Helpers: `leagueSlug` / `leagueHref` (v5-sportsbook) and `leaguePageHref` / `leagueBySlug` (v5-combos). `LeagueLink` (combo-ui) is used on the logo and name of KMarketCard, GameCard, HeroCard, Upcoming and boost cards. LeagueMenu chips navigate. `?league=` redirects; `?view=futures` opens a view. NBA nav → `/sports/basketball/nba`.
- **Side nav:** `withSingleActive(groups, pick, pathname)` lights the exact-href match first.
- **Activity:** `components/lumen/v5/v5-activity.tsx` `SportsActivity({ sport, league })`, from the /BA PRD. Open bets are built from V5 games; graded wins come from `ba-workshop` (wins only, no tap). It's on home, sport, league and event pages. `CasinoLiveWinsCarousel` has been removed from the V5 sports and event pages.
- **Combo boost:** `v5-combo-boost.tsx` `ComboBoostMeter` (12 segments, tiers 4/6/8/12 legs → x1.05/1.15/1.25/1.5, min 1.50x). Full size in the builder; `compact` in the V5 slip.
- **Marks:** `BoostMark` (brand rocket, warm gradient) sits next to `ComboMark` in `combo-mark.tsx`. Live hub uses the `broadcast` shell icon.
- **Slip (V5):** "Your combo" header with a help popover; clean empty state; compact pinned combo footer and `V5StakeBox`; the receipt has no casino cross-sell and reads "N-leg combo".
- **Bet deck:** 8 cards (same game, build on it, casino, league favourites, live now, upsets, 2 popular), desktop glass ← → arrows and a Close button.
- **Builder:** LeagueMenu replaces the V5Tabs league row.
- **Home order:** Browse markets is now 3rd, after Popular leagues. Activity is last.
- **Slip bet-type filter (V5):** header pill (Combo · Singles · SGP, only the types the slip can make). Combo shows the boost meter and pinned footer. Singles shows a stake per pick. SGP shows the same-game blocks. `chooseBetType` clears the other types' stakes.
- **Ticket receipt:** `TicketReceipt` in `soccer-betslip.tsx` (V5 only, via `ReceiptRow combo`).
- **Deck payout:** `RollUp` + `.v5-pay-shimmer` (globals.css); bottom Close removed.
- **Event page (V5):**
  - `V5EventCrumbs` (`v5-event-crumbs.tsx`) replaces V1 `EventBreadcrumbs`: sport link with its own glyph, a league ▾ menu that links to league pages, and a game ▾ menu (siblings).
  - The rail is a `FadeScroll` with `[&>*]:shrink-0`; without it the media cards collapse.
  - `GenTracker` (`v5-tracker.tsx`) is used for generated live games: sport surfaces, possession, a play loop and stats, plus a stream tab where a sample stream exists (soccer only).
- **Slip filter:** it now only jumps to or opens a section (Combo legs, Singles, SGP). Combo, singles and SGP stakes can all be placed together. Singles are hidden in the inline builder slip.
- **Activity:** the odds button toggles the bet in the slip and turns red when it's in. It plays by default, and only a mouse hover pauses it.
- **Builder mobile:** floating glass capsule dock (`MobileComboBar`). The header has no back button or logo on phones.
- **Receipt (V5):**
  - Compact header row: check · Bet placed · summary · minimise.
  - Ticket made of two masked stubs (`notch()`) so the notches cut through the border.
  - Action circles: Share (`navigator.share`, or copy) · My Bets · More picks (opens the deck) · Reuse or Back to slip.
  - The inline builder no longer auto-opens the deck.
- **Bet deck:** centred, fixed overlay with a blurred backdrop (tap it to close), a stronger fly-out, and a countdown that shakes and turns red for the last 5s.
- **Builder + cashier:** CSS in `globals.css` lifts `[data-cashier-root]` and `[data-auth-modal-root]` above the builder sheet (z 255) while it's open.
