# Sports V5 — Combos (prediction-exchange style)

**Source:** Chris, 25 Nov 2026. "Do me a V5 sportsbook, heavily influenced by the prediction exchange. The combo builder needs to be present — we want users clicking it. When they do, the betslip changes, feels different, with direction. They build their combos up. Exciting, aimed at a new generation. Don't touch the other versions."

## Hard rules
- V5 owns `/sports`, `/sports/football`, `/sports/soccer` and both event views **only when V5 is picked**. V1–V3 render exactly as before (`V5Switch` wraps the existing `V3Switch`).
- Lumen tokens only. The combo glow is a conic sweep of Lumen brand tokens (`--brand-superpurple/highblue/wildneongreen/superyellow/superorange-400`).
- Dark `--card` is translucent — anything glowing sits on `bg-background` first, then `bg-card`.
- Picks use the shared betslip store, so a placed combo lands in My Bets as a parlay (SGP haircut for same-game legs).

## What V5 is
- **Lobby (`ComboSportsPage`):** big title + live count, glowing **Combo builder hero** (sample legs ticker, "$10 could pay $X"), filter chips (Trending · Live · Football · Soccer · leagues with Lumen league logos), **Popular combos** rail, then games grouped **Trending → Live now → by day**. Game card = league tile · title · time/league · score when live; team rows = crest · name (record) · **chance bar** · multiplier · **% pill**; footer = volume · "N betting now" · All markets.
- **Right rail:** COMBO button, the **combo slip**, then **Live bets**.
- **Combo builder (`ComboBuilderOverlay`):** full screen. Sport icons (All / Football / Soccer), search, **Popular combos** ("$10 pays $X", first leg + N more, volume, bettors, Add to my combo), Moneyline / Spread / Total tabs, games by league with **Yes % / No %** per team, slip sticky on the right (bottom pill + sheet on mobile).
- **Combo slip (`ComboSlip`):** empty → "Pick 2+ markets" + Open combo builder. One pick → Single. **Two or more → it becomes a combo:** glow border turns on, header "N-leg combo", multiplier chip pops, "$10 pays $X" counts up (NumberFlow), legs slide in from the right grouped by game, "One more leg → Nx" nudge, stake chips +$5/+$10/+$25/+$50, Place combo → confetti + receipt (My Bets / Build another).
- **Event view (`ComboEventPage`):** league tile + big title + Begins/Live + watching count + COMBO; chart card (side colours `--chart-1` / `--chart-2`, draw muted dashed) with big % legend, volume and ranges; **Who wins?** rows with % + move + **Yes ¢ / No ¢**; **Spread and total** with line **steppers** (‹ 1.5 2.5 3.5 ›) — chance and prices follow the line; "Make it a combo" nudge; More games.
- **Live bets (`LiveBetsFeed`):** people placing bets in real time (demo handles only — CH, Lilly, Sam, NEK, Victor, Mai + made-up handles). New row every ~1.5–3s, "bought Yes · team", single or N-leg combo, multiplier, amount, age; big bets tinted warning; "betting now" and last-hour total tick up; on the event view it bumps the volume counter.

## Colours (V5 only)
- Yes = `success`, No = `destructive`, filled when picked (exchange colours). V1–V3 keep the neutral price chips.
