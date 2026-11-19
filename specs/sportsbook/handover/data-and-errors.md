# Data & errors

The prototype runs on local fixtures. Dev wires these to the real feeds.

| Data | Prototype source | Used by | Failure UI | Retry / timing |
|---|---|---|---|---|
| Popular live games | `sportsHomePopular()` (`lib/lumen/sports-home.ts`) | Popular rail | Hide the rail if empty; skeleton while loading (`sports-home-skeleton`) | Poll live score + ML % (feed cadence) |
| SGP packs | `sportsHomeSgpPacks()` | SGP rail | Hide the rail if empty; a pack with a suspended leg must not be addable (disable footer button) — **gap, see decisions D-09** | Re-price with the feed |
| Odds boosts | `sportsHomeOddsBoosts()` | Boost rail | Hide if empty | — |
| League boards | `sportsHomePremierLeague()`, `sportsHomeNflBoard()`, `soccer-sport.ts` | Boards | Hide board if no events | — |
| Event model | `soccerEventModel()`, `nflEventModel()` | Event view | Not found → `EventMissing` | — |
| Live state (score, clock, incidents, stats, tracker) | `model.live` | Header, media, stats | Stream fails → keep tracker, stream button disabled | Score/clock push |
| Prices | feed | Every odds button | Suspended → lock state | Push; slip re-prices at place (U3) |
| Bets | `sports-bets-store.ts` | Betslip receipt, My Bets | Load fail → skeleton then error card with retry (**gap, D-10**) | — |
| Balance / auth / profile | shell (`useShell`) | Place button | Logged out / deposit / profile gate (U1, U2, U5) | — |

## Rules the API must honour

- **One leg per market per event**: a new pick in the same market on the same game replaces the old one.
- **SGP** = 2+ legs on one event. Price: product of decimal odds × **0.82** correlation haircut, back to American (prototype stand-in — use the trading SGP price).
- **Parlay** = 2+ units across events; an SGP counts as one unit.
- **Futures/outrights**: straight only — never in an SGP or parlay.
- Min risk **$1**. Max risk **straight $5,000 · SGP $1,000 · parlay $1,000**. Per-bet rejection; the rest still place.

## Analytics (to add)

| Event | When | Props |
|---|---|---|
| `sb_pick_add` / `sb_pick_remove` | odds button | `surface` (home_card, board, event, boost, sgp_pack), `event_id`, `market`, `live` |
| `sb_sgp_pack_add` | SGP pack footer | `pack_id`, `legs`, `odds` |
| `sb_betslip_open` | drawer opens | `trigger` (first_pick, dock, selection_bar) |
| `sb_place_attempt` / `sb_place_result` | Place | `bets`, `types`, `stake`, `rejected[]`, `odds_changed` |
| `sb_mybets_filter` | chip/tab | `tab`, `type`, `sport` |
