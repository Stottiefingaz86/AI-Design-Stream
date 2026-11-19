# Journeys

## J1 · Browse the offering → add a pick (happy)
1. Player lands on `/sports`. Promo banner row, then **Popular** (sport chips All / Soccer / Football + live cards rail).
2. Below: Premier League board (expanded), **Same Game Parlays** rail, **Odds Boosts** rail, NFL board (3 rows, "Show more"), Live Wins, SEO, footer.
3. Player taps any odds button → button turns **Selected** (primary fill), a dot flies from the button to the betslip target, the dock reveals.
4. **Desktop:** the first pick of the session opens the betslip drawer (375 card). **Mobile:** the dock Betslip badge counts up; the drawer stays closed.
5. Tapping a selected button again removes the pick.

## J2 · Add a Same Game Parlay pack (happy)
1. Player taps the pack's footer button "`N Leg SGP` +odds".
2. All legs replace any legs already on the slip for that game (one game = one SGP). Legs from other games stay.
3. Card enters **Selected**: every leg node turns into a primary check disc, footer label reads **"Added to Betslip"**.
4. Tapping again removes all of that pack's legs.

## J3 · Build an SGP by hand on the event view (happy)
1. From a card / board row / breadcrumb switcher, open the event (`/sports/soccer/event/<id>`).
2. Pick 2+ selections from **different markets** on the same game. Picking a second price in the **same market** replaces the first (toast: "Replaced X with Y").
3. Betslip groups them: each pick still listed under **Straights**, plus one **Same Game Parlay** unit (`N Leg SGP`, event label, combined odds, own stake).
4. Add a pick from another game → a sticky **Parlay** unit appears ("2-Pick Parlay · Includes 1 SGP"). An SGP counts as one unit.

## J4 · Live event (happy)
1. Live event header: LIVE pill (ping dot), big score, clock in destructive red, faint red wash on the left edge of the card.
2. Desktop right rail (sticky): Live Stream panel (stream ↔ tracker), Live Stats (Stats / Timeline tabs). Mobile: media sits under the header, stats under the markets.
3. Prices drift every ~3.2s (3 random non-selected prices); a green ▲ / red ▼ shows for 1.8s.
4. Volatile markets suspend for ~4s every ~14s → buttons show the label + lock icon and can't be tapped.

## J5 · Place bets (happy)
1. Stake fields default `$0.00`. Place button: **"Place $X.XX · To Win $Y.YY"** (success fill).
2. Tap Place → receipt: primary check disc (spring), "Bet placed" / "Bets placed", summary "N bets · $X to win $Y", cross-sell originals rail, **Reuse selection** (or **Back to slip** when some were rejected) and **My Bets**. Confetti fires 80ms after.
3. My Bets shows the new bets under **Pending**.

## J6 · My Bets (happy)
1. Title "My Bets" + info tooltip ("Open and settled sports bets").
2. Status pills **All / Pending (n) / Settled**, figures card (Bets, Staked, Potential return, Net P&L), filter chips (All bets / Straights / Parlays / SGPs | Football / Soccer), Bet ID search.
3. Table rows: title (pick, or "N-Leg SGP" / "N-Leg Parlay"), subtitle, odds, stake, to win/payout, status badge, date. Live legs show the live score + clock.
4. Row expands: legs on a rail (node per leg: pending/won/lost/push/void), then ticket facts (Bet ID, placed, settled).

## Unhappy branches

| # | Where | Trigger | What the player sees |
|---|---|---|---|
| U1 | Betslip | Logged out taps Place | Button reads **"Login to bet"** → opens login. No stake summary line. |
| U2 | Betslip | Stake > balance | Button turns primary: **"Deposit to place bet"**, sub "$X · Balance $Y" → opens cashier. |
| U3 | Betslip | Live leg re-priced between stake and place | Amber note "Odds changed on N selection(s)."; leg shows old price struck through → new price; button **"Accept odds & place"**. |
| U4 | Betslip | Stake < $1 or over max (straight $5,000 · SGP $1,000 · parlay $1,000) | Bet stays on the slip with a destructive note under it: "Minimum risk is $1.00." / "Max risk on this bet is $X." Others place. Receipt title "N of M bets placed". |
| U5 | Betslip | Profile not complete | Profile gate opens (name / level step) before placing. |
| U6 | Betslip | Last leg removed | Drawer closes, no empty flash. Opening from the dock shows empty state "No bets at this time · Tap odds on the board to build your slip." |
| U7 | Event view | Event id not found | `EventMissing` card: "This game is no longer available" · "It may have finished or been taken off the board." · button "Back to {Sport}". |
| U8 | Event view | Market suspended (live) | Label + lock, not tappable; selected legs keep their price. |
| U9 | Cards / boards | Route loading | Card shows `LaunchOverlay` spinner until the route swaps; route `loading.tsx` skeletons (`sports-home-skeleton`, `soccer-event-skeleton`, `my-bets-skeleton`). |
| U10 | My Bets | Logged out | Card: "Login to see your bets · Open bets, settled results and every Bet ID live here." + Login button. |
| U11 | My Bets | Filters return nothing | Table empty row: "No bets match the selected filters." (Pending tab, no filters: "No open bets right now.") |
| U12 | Any | `prefers-reduced-motion` | No card lift, no odds drift, no fly-dot; state changes are instant. |
| U13 | Odds button | Image (crest/league icon) fails | Team initials badge (`BoardTeamBadge`) stays; layout doesn't shift. |
