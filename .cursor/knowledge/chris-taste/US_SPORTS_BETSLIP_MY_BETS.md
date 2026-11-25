# US sports, betslip, My Bets

Product owner prototype (PropShopX) = content + rules only, never its visuals.

## NFL
- League page `/sports/football`: breadcrumbs, quick links (NFL + casino tiles), pills Game Lines / Player Props / Futures.
- US grid: one row per team, columns Spread / Total / Moneyline, point above price. Away on top (`@`). Mobile shows nicknames, 60px odds columns.
- Event `/sports/football/event/[id]`: same generic event view. Live = Live Stream / Game Tracker (field SVG, drive bar, down & distance) + Stats / Scoring. Market tabs only when non-empty; first 5 open; player props 5 then Show more.

## Betslip (`soccer-betslip.tsx`)
- No mode tabs. Every pick is a straight. 2+ legs on one game auto-form an SGP card (collapsible, own stake). 2+ units form a Parlay; an SGP counts as one unit. Futures are straight only.
- Same market on same game replaces the leg + toast "Replaced X with Y".
- Live odds move: old price struck through, warning note, button "Accept odds & place".
- Rejections (min $1, max straight $5,000, SGP / parlay $1,000) show inline and stay in the slip; partial place shows "1 of 2 bets placed".
- Logged out button: "Login to bet". Receipt follows CONFIRMATION_STATES.md and writes to `lib/lumen/sports-bets-store.ts`; My Bets goes to `/sports/my-bets`.

## My Bets (`/sports/my-bets`)
- Pending (n) / Settled / All, filters (type, sport, Bet ID), summary (Bets, Staked, Pending to win, Returned, Net P&L), list + sticky detail; mobile detail replaces the list.
- Row "$stake pick". Detail: legs on a rail with status nodes, View event / Watch live / No longer available, Risk / To win / Payout or Refunded, Bet ID, Placed, Settled.
- Pending pill is neutral (red reads as an error). Won pill shows the amount: "Won $190.91".

## Round 2 corrections (Nov 2026)
- **US board layout**: NFL / NCAA quick-link tiles → Games / Outrights / All Leagues → one card per league (See All, first 5 rows, "Show N More"). Row = time on top, teams stacked + chevron, then a horizontal rail of columns (Moneyline, Point Spread, Total Points, 1H…, 1Q…), each column header over two stacked chips. Never the old grid.
- **Media switcher** (Live Stream / Match Tracker): square icon buttons top-right, bet365-style, tooltip for label. No text tabs.
- **My Bets = Bet History style**: figures card with underline tabs + figure boxes, chip filters, Lumen Table, expand panel, pager. Must work on mobile (Description + Status + chevron, tap to expand).
- **Betslip must not auto-open on navigation**; only on the first real pick add.
- **Alt-line popup** shows team names (or Over/Under) above the columns.
- **Accordion header hover** is inset (rounded, margin) so it never touches the content.
- **Sub-nav**: tapping Soccer / Football shows the loading spinner until the route changes.

## Round 3 corrections (Nov 2026)
- **Board breathing room**: football columns get a gap between every market (gap-3), and a divider + larger gap between periods (Game / 1H / 1Q / 4Q). Event-view Game Lines grid uses gap-x-3. Never cluster chips edge to edge.
- **All Football tile** first in quick links, same as All Soccer.
- **Removing the last pick closes the betslip.** Never show the empty "No bets" state after a remove (empty state is only for opening it from the dock).
- **Alt-line popup**: team/Over-Under label row has 8px below before the chips.
- **Trackers** (Match / Game): pitch inset with p-4 and rounded corners, never touching the panel edges.
- **My Bets links**: muted → foreground on hover. No blue info links.
- **Live games in My Bets**: show clock + score (red play icon + clock, `SEA 20-17 SF`) on the row and each pending leg; "Watch live" only when the game is live.
- **My Bets top**: sports pill track (Pending / Settled / All) + one flat stats strip (Bets, Staked, Potential return, Net P&L) with dividers, 2x2 on mobile. Not the tabbed figures card with boxed stats.

## Round 4 (supersedes board notes above)
- **Football board = soccer board grammar exactly**: one header per market centred over side-by-side chips (away | home), gap-1 inside a market, gap-2 between markets, no vertical dividers, no stacked two-row columns. Moneyline chips carry team abbr labels (SEA / SF) like soccer's COV / BRI. Score column width matches soccer (`min(42%,300px)`).

## Round 5 (final board, supersedes Round 4)
- **Football board = US layout (away chip on top, home chip below per market)** with soccer chip style: label line on each chip (team abbr for moneyline, line for spread, O/U for totals), header centred over the column, gap-1 between the two chips, gap-3 between markets, no dividers. Row h-[148px], score column `min(42%,300px)`.

## Round 6 (Nov 2026)
- **Live rows / live event card**: very subtle — faint red wash on the left edge only (`linear-gradient(90deg, destructive 7%, transparent 22%)`). No red border, outer glow or inset shadow ("way too brash").
- **Betslip visibility**: desktop collapsed dock shows whenever the slip holds picks and the drawer is closed (incl. after navigating). Drawer only auto-opens on the first pick.
- **Outrights scale to 100s of selections**: one collapsible card per market (first open) with "N selections", search when >12, 1/2/3-col grid of name + odds rows sorted by price, top 12 then "Show all N". Book-style rounded prices.
- **Live stream**: fullscreen button in the media header (left of the icon tabs) on live games; iOS falls back to video fullscreen.
- **Game Lines chips** stretch to equal height (moneyline has no label line).

- League previews: top league shows all games; leagues below show 3, then "Show N More" (soccer + football).

## My Bets tabs (Nov 2026)
- Order: **All → Pending (n) → Settled**. Default open on All.

## Event Back (Nov 2026)
- Event page Back returns to the **last sports list page** (Sports Home `/sports`, soccer, football, My Bets) via `sports-return` session — not always the sport lobby. Deep links fall back to soccer/football.

## Betslip balance (Nov 2026)
- Logged in with stake **above wallet balance** → CTA is **Deposit to place bet** (primary) and opens cashier. Never place when underfunded. Logged out stays **Login to bet**.
- Successful place **debits wallet** via `spendBalance` (chrome NumberFlow updates). Underfunded → Deposit CTA, no place.
