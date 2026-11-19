# Sportsbook · Full offering — dev handover

Status: **ready for review** · Sign-off: CH · Site version: **V1** (live default; V2/V3 out of scope)

## Links (always together)

| What | Where |
|---|---|
| Prod reference | https://design-request-app-one.vercel.app/sports |
| Figma page | https://www.figma.com/design/MYeELetKW9xye1shSpm8Fn/?node-id=173-653 (Design Agent file → "Sportsbook · Full offering (V1 prod)"; every frame in `figma.md`) |
| Handover folder | `specs/sportsbook/handover/` (this folder) |
| Prototype source | `apps/live-site/` (routes + components below) |

## What's in scope

| # | Surface | Route | Source |
|---|---|---|---|
| S1 | Sports home (the offering) | `/sports` | `components/lumen/sports-home-page.tsx`, `lib/lumen/sports-home.ts` |
| S2 | Soccer board / league board | `/sports/soccer`, `/sports/football/[league]` | `soccer-sport-page.tsx`, `nfl-sport-page.tsx` |
| S3 | Event view · pre-match | `/sports/soccer/event/mun-mci`, `/sports/football/event/kc-buf` | `sports-event-view.tsx`, `lib/lumen/soccer-event.ts`, `nfl-event.ts` |
| S4 | Event view · live | `/sports/soccer/event/cov-bri`, `/sports/football/event/sea-sf` | same, `model.live` branch |
| S5 | Popular live cards | `/sports` → Popular rail | `PopularGameCard` |
| S6 | Same Game Parlay pack cards | `/sports` → Same Game Parlays rail | `SgpPackCard` |
| S7 | Odds Boost cards | `/sports` → Odds Boosts rail | `OddsBoostCard` |
| S8 | Betslip with SGP + parlay | drawer, every sports route | `soccer-betslip.tsx` |
| S9 | My Bets | `/sports/my-bets` | `my-bets-page.tsx`, `lib/lumen/sports-bets-store.ts` |

## Read in this order

1. `journeys.md` — happy path and every unhappy branch
2. `states.md` — every component × state × breakpoint
3. `dev-delivery.md` — tokens, component map, copy, acceptance criteria (AC-01…)
4. `interactions.md` — motion, live odds, suspension, haptics/celebration
5. `data-and-errors.md` — data dependencies, failure UI, analytics
6. `decisions.md` — rules already decided (don't re-ask)
7. `figma.md` — node ids for every frame
8. `manifest.json` — all of the above, machine-readable

## Ground rules

- **Lumen only.** Every colour, radius, spacing and type value is a Lumen token (`tokens.md`). No raw hex.
- **Betslip is always dark** (root carries `class="dark"`), in Light and Dark page modes.
- **Header and footer are always dark.** Sub-nav glass follows page mode: Light `--container` @72%, Dark `--header-inverted` @72%.
- **Touch rails swipe only** — glass arrows appear on fine pointers only.
- Odds are American format everywhere.

## Asking design

POST questions to the studio `dev-questions` endpoint (see `docs/HANDOVER.md` in the Design Studio repo). Don't guess.
