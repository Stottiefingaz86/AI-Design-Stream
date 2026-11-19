# Dev delivery

## Component map

| Figma component | Code | Notes |
|---|---|---|
| odds-button | `OddsButton` exported from `components/lumen/soccer-sport-page.tsx` | default / selected / suspended / tick |
| popular-live-card | `PopularGameCard` in `sports-home-page.tsx` | 160 tall; score centre; ML % bar |
| sgp-pack-card | `SgpPackCard` | legs on a rail, footer `OddsButton` h-12 |
| odds-boost-card | `OddsBoostCard` | Was (struck) + Boosted |
| shelf-title / horizontal-rail / sport-chips | `ShelfTitle`, `HorizontalRail`, `SportChips` | — |
| league board | `SoccerLeagueBoard`, `NflLeagueBoard` | shared with `/sports/soccer` |
| event-header | `EventHeader` in `sports-event-view.tsx` | live / pre-match |
| market-card + bodies | `MarketCard`, `GridBody`, `LadderBody`, `ListBody`, `PlayersBody`, `LinesBody`, `PlayerLinesBody`, `ScoreBody` | first 5 open |
| media-panel / live-stats / timeline | `MediaPanel`, `LiveStream`, `PitchTracker`, `FieldTracker`, `LiveStatsCard`, `Timeline` | live only |
| win-probability / form / H2H | `WinProbabilityCard`, `PreMatchCards` | pre-match only |
| betslip (+leg, +sgp, +parlay, +receipt) | `soccer-betslip.tsx` | `dark` root |
| my-bets (figures, filters, table, row, expand) | `my-bets-page.tsx` | — |
| Shell (header, sub-nav, sidebar, dock, footer, Live Wins, SEO) | `components/site/*`, `CasinoLiveWinsCarousel` | unchanged |

## Copy (exact strings)

**Home** — shelf titles: "Popular", "Same Game Parlays", "Odds Boosts"; chips "All", "Soccer", "Football"; SGP footer "`{n}` Leg SGP" / "Added to Betslip"; boost "Was", "Boosted".
**Event** — "Pre-match" (soccer) / "Pregame" (NFL), "Live", kickoff "TBC" fallback; tabs "Popular, Goals, Halves, Corners, Cards, Players"; "Show more"; rail labels "Live stream and tracker" / "Game stats"; missing: "This game is no longer available", "It may have finished or been taken off the board.", "Back to {Sport}".
**Betslip** — "Selection" / "Selections", "Betslip", "Straight" / "Straights", "Same Game Parlay" / "Same Game Parlays", "`{n}` Leg SGP", "`{n}`-Pick Parlay", "Includes `{n}` SGP(s)" / "`{n}` legs", "To Win $X", "Place $X", "Login to bet", "Deposit to place bet", "$X · Balance $Y", "Accept odds & place", "Odds changed on `{n}` selection(s).", "Minimum risk is $1.00.", "Max risk on this bet is $X.", "Bet placed" / "Bets placed" / "`{n}` of `{m}` bets placed", "`{n}` bet(s) · $X to win $Y", "Reuse selection", "Back to slip", "My Bets", "No bets at this time", "Tap odds on the board to build your slip.", toast "Replaced X with Y".
**My Bets** — "My Bets", tooltip "Open and settled sports bets", "All", "Pending (`{n}`)", "Settled", "Bets", "Staked", "Potential return", "Net P&L", "All bets", "Straights", "Parlays", "SGPs", "Football", "Soccer", "No open bets right now.", "No bets match the selected filters.", "Login to see your bets", "Open bets, settled results and every Bet ID live here.", "Login"; statuses "Pending, Won, Lost, Push, Void".

## Acceptance criteria

| ID | Given | When | Then |
|---|---|---|---|
| AC-01 | `/sports`, desktop, no picks | page loads | Banner row, Popular (chips + live rail), PL board, SGP rail, Boost rail, NFL board, Live Wins, SEO, footer in that order |
| AC-02 | Popular rail | tap "Soccer" chip | only soccer live cards show |
| AC-03 | Touch device | any rail | swipe scrolls; no arrows render |
| AC-04 | Fine pointer | rail at start | next arrow only; at end, prev only |
| AC-05 | SGP pack | tap footer | all legs on slip for that game, card Selected, label "Added to Betslip"; tap again removes them |
| AC-06 | Desktop, empty slip | first odds tap | dot flies 720ms, drawer opens; navigating to another sports page does **not** reopen it |
| AC-07 | Mobile | odds tap | drawer stays closed; dock badge = pick count |
| AC-08 | Slip has "Over 2.5" on COV-BRI | tap "Over 3.5" | replaces in place; toast "Replaced Over 2.5 with Over 3.5" |
| AC-09 | 2 picks on one game | slip open | Straights list both; Same Game Parlay unit "2 Leg SGP" with combined odds and its own stake |
| AC-10 | SGP + a pick on another game | slip open | sticky "2-Pick Parlay", "Includes 1 SGP", parlay odds |
| AC-11 | Live event | 3.2s passes | up to 3 unselected prices change with ▲/▼ for 1.8s; selected prices never change on the board |
| AC-12 | Live, volatile market | suspension window | buttons show label + lock, can't be tapped; ~4s then reopen |
| AC-13 | Live leg on slip, staked | Place | first tap re-prices: amber note, old price struck, button "Accept odds & place"; second tap places |
| AC-14 | Stake $0.50 on a straight and $10 on another | Place | $10 places; $0.50 stays with "Minimum risk is $1.00."; receipt "1 of 2 bets placed" |
| AC-15 | Logged out | Place | "Login to bet" → login modal |
| AC-16 | Stake > balance | view button | "Deposit to place bet", "$X · Balance $Y", primary fill → cashier |
| AC-17 | Place success | receipt | check disc springs in, confetti, Reuse selection + My Bets |
| AC-18 | My Bets, logged in | load | pills All/Pending(n)/Settled, 4 figures, chips, table; Net P&L green if > 0, red if < 0 |
| AC-19 | My Bets row with a live leg | view | live score + clock on the leg |
| AC-20 | Event id unknown | open | "This game is no longer available" card + "Back to {Sport}" |
| AC-21 | Light mode | any sportsbook screen | page/cards light; header, footer and **betslip stay dark**; sub-nav glass `container @72%` |
| AC-22 | Reduced motion | any | no lift, no drift, no fly-dot |
| AC-23 | Screen reader | focus a selected odds button | announced as pressed (`aria-pressed`) — new, not in prod yet |
