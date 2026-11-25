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
