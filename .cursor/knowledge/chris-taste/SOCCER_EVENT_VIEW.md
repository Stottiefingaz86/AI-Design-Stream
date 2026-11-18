# Soccer event view

Route: `/sports/soccer/event/[eventId]` (V1, no site-version gate). Opens from the board scoreboard link (team names + chevron).

- **Layout:** markets column + sticky rail (380 / 420px) pinned under the sticky chrome via `lg:top-[calc(var(--shell-chrome-h,140px)+16px)]` (`--shell-chrome-h` is published by `shell-sticky-chrome.tsx`). Never a fixed `top-[76px]`: it slid under the sports sub-nav. Below lg the rail content goes in-flow (live media above market pills; stats / form after markets).
- **Live rail:** Lumen `Tabs` Live Stream | Match Tracker, then Stats | Timeline. Stream is logged-in only (blurred + Log In / Join when logged out). Mount ONE media panel (rail or in-flow), never both: two video decoders.
- **Tracker:** top-down SVG pitch, team colours `--chart-1` home / `--chart-2` away (same in stat bars + key). Attack zone tint + beat label pill.
- **Pre-match rail:** Who wins? (no-vig from the board 3-way), Form (last 5 W/D/L chips), Head to head tally + list, Match info.
- **Markets:** pill tabs Popular / Goals / Halves / Corners / Cards / Players. Board-shared legs (3-way, Spread, Total, 1H ML) reuse board ids + market names so selections sync. American lines only. Ladders: one main pair + the board's `AlternateLinePicker` (alt points / goals dropdown); picking a line moves the pair and adds the leg. Correct Score = bet365-style stepper (− score + per team, live price) + Any other score + Show all scores grid.
- **Live prices:** non-board legs drift every ~3s with a small up / down triangle; selected legs never move.
- **Slip:** `lib/lumen/soccer-slip-store.ts` (sessionStorage) + `withOneLegPerMarket`. Player legs are keyed per player.
- **Tailwind gotcha:** `/opacity` modifiers on `var()` tokens don't resolve in this app; use `color-mix(in srgb, var(--token) N%, transparent)`.
- **Generic view:** `components/lumen/sports-event-view.tsx` renders any `SportsEventModel` (`lib/lumen/sports-event.ts`); soccer + NFL are thin adapters. New sports = new model, not a new page.

## Full-list markets (Nov 2026)
- **Not everything goes in the alt popup.** Main Spread / Total keep the popup; ladders players scan in full render as a `list` market (every line visible, column heads, lock chip for suspended lines, Show all past `preview`):
  - Asian Handicap (team columns, -1.5…+1.5 incl. PK), Goal Spread 3-way (home / Draw / away), Team Total Goals + 1st Half Team Total (team sub-heading per group, Over / Under), 1st Half Correct Score (home / Draw / away columns).
- Player Goals = per-player O/U pair with its own alt stepper (player-lines).
