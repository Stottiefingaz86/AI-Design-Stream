# BA workshop (`/BA`)

**Source:** Chris, Nov 2026 — activity / Live Wins workshop for variants.

## Rules

- Casino and Sports are **separate** — no Mixed / interleaved table.
- Casino Activity = **table only** — no All Bets / Jackpot / Daily Race pills. See `ACTIVITY_FEED.md`.
- **No sports Live Wins carousel** — casino tiles only (Casino variant).
- Sports **All** (+ sport pills) = open **and** graded wins. **Graded** tab = wins only. Status on graded = **amount won** (`toWin`, success) — never bare `Won`; graded rows **not clickable**. See PRD §14 + `public/ba/HANDOVER.md`.
- Sports column = **Status** (not Payout).
- Matchup: team logos free; live = **score-only box** (aligned to team rows, hairline between scores).
- Sports row height **6rem** (`h-24`) — content stays inside the row; casino stays `h-14`.
- **Parlays:** one row — `N-Pick Parlay` + clock/kickoff + **stacked home/away logo pairs** (no team names); Selection = picks; pending + live; tap adds all legs. Filter: **Parlays**.
- League filters stay full (`padFeedPool`).
- PRD = `createPortal` + `data-ba-prd-root` carve-out; full eng handover in `public/ba/ACTIVITY_FEED_BEHAVIOUR.md` (rationale, click paths, unhappy paths, components).

## Code

- `app/BA/page.tsx`
- `components/lumen/ba-workshop-page.tsx`
- `lib/lumen/ba-workshop.ts`
- `public/ba/ACTIVITY_FEED_BEHAVIOUR.md`

## Feed configuration

VIP-tiered / page-aware / ratio / stake / graded configs — agent brief in `public/ba/ACTIVITY_FEED_BEHAVIOUR.md` §14. Propose variations; default stream stays open-only.
