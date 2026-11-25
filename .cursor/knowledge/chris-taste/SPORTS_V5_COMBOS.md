# Sports V5 — Combos (prediction-market layer on the V1 sportsbook)

**Source:** Chris, 25 Nov 2026. V5 is a sportsbook with a prediction-market feel and a combo builder people actually use. Don't touch the other versions.

## Hard rules
- V5 owns `/sports`, `/sports/football`, `/sports/soccer` and both event views **only when V5 is picked**. V1–V3 render exactly as before (`V5Switch` wraps the existing `V3Switch`).
- **Build on V1.** Same container, breadcrumbs (`BreadcrumbMenu`), league tiles (`LeagueQuickLinks`), mode pills (`ModePillTrack`), card (`rounded-[10px] border bg-card` + soft shadow), `Typography` scale, odds-chip grammar (`rounded-lg border bg-secondary`, primary when picked). If it doesn't look like V1, it's wrong.
- **No AI-slop tells:** no hero banners, no uppercase tracked eyebrows, no `font-black` headlines, no rainbow, no glow, no pulsing, no flashing.
- **Hover lights up, never strokes:** cards brighten to `bg-surface-muted-2` (`V5_LIGHT_UP`). Borders never change on hover. Picked state = filled primary chip, never a primary card border.
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
