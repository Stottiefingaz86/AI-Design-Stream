# Mobile carousels — settled preference

**Source:** Chris, Sports prototype soccer odds (repeated). Quote: “remove arrows on mobile… store in the knowledge.”

## Rule

On **mobile and any touch / coarse-pointer viewport**, horizontal carousels (odds markets, shelves, rails, breadcrumbs) are **swipe / finger-scroll only**.

- Do **not** overlay left/right circular chevron buttons on the edges.
- Do **not** re-add them “for discoverability” or to mirror desktop.
- Desktop may keep glass edge arrows **only** when `(hover: hover) and (pointer: fine)`.
- Overflow that clips off-screen must be **swipeable** — separate the scrollport from the flex row (`overflow-x-auto` wrapper + inner `w-max` flex). Same element as both often fails on iOS.
- Do **not** use `touch-pan-x` on odds rails — it freezes vertical page scroll when the gesture starts on the carousel.
- Odds rails on event cards: **full-bleed to card edges** (no horizontal card padding on the swipe row). Pad the scoreboard only — don’t leave gutter margins while swiping.

## Where this applies

Odds rails, league quick-link strips, casino shelves, any horizontal market/picker carousel in `apps/live-site`.

## Code anchors

- Skill hard rule: `.cursor/skills/lumen-betonline-build/SKILL.md` → “Mobile carousels — HARD RULE”
- Patterns: `.cursor/skills/lumen-betonline-build/patterns.md` → “Horizontal carousels / odds rails”
- Soccer: `MobileOddsCarousel` (no arrows); `EventOddsRail` arrows gated by fine pointer
