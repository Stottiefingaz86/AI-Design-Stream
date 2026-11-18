# Live Wins carousel — settled preference

**Source:** Chris, casino lobby Live Wins (Rainbet pattern → Lumen), Oct 2026.

## Placement & chrome

- **Homepage:** under hero, **above Continue Playing** (then Originals).
- **Casino lobby:** after Continue Playing when logged in, **above Originals**.
- **Title = shelf sub-header:** `Typography` `h4` / `semibold` — same as Originals / Slots / Continue Playing.
- **Shelf title only** — no pill / border box around “Live Wins” (same as Originals).
- Title tap: **pause icon → always play** (overrides center pause); **live → pause**. No border/box/focus ring on the title.
- **Live dot only while streaming.** **Pause icon whenever paused**. Fixed-width slot so title doesn’t shift.
- **Scroll:** measure the **title** (not the tall card block). Title dead-center → pause; title above/below center → animate. Tap-to-play while centered keeps streaming until pause or leave center.

## Cards & motion

- Reuse activity win data + `activityGameFromTitle` art — Lumen card tokens (`bg-card`, `border-border`, `text-success` amount).
- **Hover = casino tile motion**, not image zoom inside a static card.
  - Mirror `CasinoGameTile`: framer `whileHover={{ scale: 1.04, y: -6, zIndex: 10 }}`, `whileTap={{ scale: 1.015, y: -2 }}`, spring `{ stiffness: 260, damping: 28, mass: 0.85 }`.
  - Leave art unscaled; the **whole card** lifts.
- Give the rail vertical padding so the lift isn’t clipped (`py` on the flex row).
- Mobile: swipe only — **no** edge arrows (`MOBILE_CAROUSELS.md`). Never `touch-pan-x`.

## Cadence

- Faster than Activity table (~650ms tick).
- **Desktop (fine pointer):** stream whenever armed — **pause only on hover** (or title tap). Do **not** use scroll-center pause on desktop.
- **Touch / mobile:** stream when armed **and** the title is outside the center pause band (~12% of `#shell-scroll` height); title tap force-plays while centered.
- Manual pause: title tap. Desktop hover also disarms.

## Code

- `apps/live-site/components/lumen/casino-live-wins-carousel.tsx`
- `HomepageLobby`: Live Wins → Continue Playing → Originals.
- `CasinoLobby`: Continue Playing → Live Wins → Originals.
