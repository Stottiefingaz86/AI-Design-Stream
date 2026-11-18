# Soccer alternate lines (Spread / Total)

**Source:** Chris, Nov 2026.

## Rule

Spread and Total market pairs have an **up/down selector** that opens a popover of alternate points (home/away or over/under pairs).

## Order — main line centred (Chris, 12 Nov 2026)

**American lines only — no Asian handicaps.** Half / whole points (`±0.5` steps), never x.25 / x.75 quarter lines. Prices are valid American odds (≤ −100 or ≥ +100, never e.g. −56); alt rows are priced off the main row via implied probability.

Rows run **high → low**: e.g. main 3.5 → `5, 4.5, 4, **3.5**, 3, 2.5, 2`. The **main (default) line is always the centre row and always sits exactly on the board chips** — on first open *and* every reopen, even after an alt line was picked (the red selection does **not** move the anchor). Higher lines above, lower lines below. Show the full ladder (7 rows), no scroll for the seed data.

## Betslip rule — one selection per market (Chris, 12 Nov 2026)

Only **one market selection per market per event** can be on the betslip. A newer pick in the same market **replaces** the existing leg in place with the newer values — never both. Example: Spread −1 (−110) on the slip, then −2 (−115) picked → slip shows only −2 (−115). Applies to every market (3-Way, Spread, Total, 1H Moneyline), from both board chips and the alt-line popover. Different markets on the same event still stack (→ parlay). Code: `withOneLegPerMarket` in `soccer-sport-page.tsx`, keyed on event + market.

## Tap = pair moves, tapped pick goes on the betslip

Each popover chip is its own button (left = home / over, right = away / under). Tapping one:
1. Moves the **pair** onto the event row (both sides update to that line).
2. Adds **only the tapped pick** to the betslip (fly-dot from the board chip).
3. One leg per event market — an existing Spread / Total leg from that event is replaced in place. Tapping a chip already on the slip removes it.

Superseded (wrong): per-side line state where tapping a chip moved only one team on the board.

## UI — no shift

- Trigger: `IconSelector` beside the two odds chips.
- **Chip size = event-row size.** Measure the board pair (`previousElementSibling`) for width + height; popover rows use those exact pixels and the same `OddsButton` classes (`rounded-lg border … px-2 py-1.5`, `gap-1`).
- On open, the **current board line** sits exactly over the event-row chips (same left/top/size) — no jump.
- **Compact list** — no fake top/bottom scroll spacers. Short lists shift the menu; long lists scroll the active row to the board slot.
- **No red stroke around the row.** Popover chips use the board's `OddsButton` hover (`hover:bg-accent`) and selected fill (`border-primary bg-primary text-primary-foreground`); selected = that pick is on the betslip.
- Tap another line → **smooth roll** into the board slot (when scrolling) → apply + close.
- **One scrollport** inside the list; hide scrollbar. Menu shell `overflow: hidden` — never double bars.
- Body portal left-aligned to the chips; selector stays visible on the right.

## Figma handover

`Agent PropShopX` in the Lumen folder — https://www.figma.com/design/Sz7zOb4XwFViP2Ca5uyGnY/Agent-PropShopX?node-id=4-70&m=dev
