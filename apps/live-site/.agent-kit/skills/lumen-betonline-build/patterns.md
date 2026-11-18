# Lumen BetOnline — pattern catalog

Companion to [SKILL.md](SKILL.md). Open when implementing a specific surface.

## Architecture map

| Concern | Where |
|---------|--------|
| Shell chrome / scroll | `components/site/shell-frame.tsx` (`#shell-scroll`) |
| Nav product + active | `components/site/shell-nav.ts` |
| Soft-nav, balance, VIP claims, launcher | `components/site/shell-context.tsx` |
| Claim toast + confetti | `components/lumen/vip-claim-toast.tsx`, `lib/lumen/vip-celebrate.ts` |
| VIP reward seeds | `lib/lumen/vip-hub.ts` |
| Casino shelves / activity | `components/lumen/casino-lobby-page.tsx` |
| Homepage mix | `components/lumen/homepage-lobby-page.tsx` |
| Tables (bonus / tx / RAF) | `components/lumen/my-bonus-page.tsx`, `transactions-page.tsx`, `refer-a-friend-page.tsx` |
| Cashier / crypto fields | `components/site/cashier-sheet.tsx` |
| Join / login modal | `components/site/auth-modal.tsx` (`openAuth` / `completeJoin` → cashier) |
| Player profile (DOB / KYC later) | `shell-context` `profile` — DOB via VIP Birthday reward |
| Tokens | `app/lumen.css` (`[data-brand='betonline']` / `.dark`) |
| Figma static assets | `public/shell/figma/**` |

## Sub-nav recipes

### Casino / account sticky chrome
- Sub-nav renders **inside** sticky header stack with `sticky={false}` on the sub-nav itself (parent provides stickiness).
- Glass frost: content scrolls under chrome; keep z-index so tiles/CTAs don't paint over header (`z-[70]` chrome).

### Filter pill tracks
- Horizontal capsule, drag-free on mobile (`-mx-6` edge bleed).
- Animated thumb measuring active pill `offsetLeft` / `offsetWidth`.
- Label turns high-contrast only after thumb covers (timed to motion).

### Horizontal carousels / odds rails
- **Mobile + touch:** `overflow-x-auto` + `scrollbar-hide` only. **No** absolute edge arrow buttons. Ever.
- **Never `touch-pan-x`** on those rails — it blocks vertical page scroll when the finger starts on the carousel. Use `overscroll-x-contain` if you need to contain horizontal bounce.
- **Desktop (mouse):** optional casino-style glass chevrons, gated by `(hover: hover) and (pointer: fine)`.
- Sports prototype soccer: `MobileOddsCarousel` = swipe strip; `EventOddsRail` arrows only when fine pointer.

### Live Wins carousel (casino lobby)
- Full taste note: `.cursor/knowledge/chris-taste/LIVE_WINS_CAROUSEL.md`.
- Shelf-style **h4 title**; play/pause **beside** the title; live dot = **`primary` red**.
- Hover/pause icon follows Activity status convention (play=live, pause=paused).
- Card hover = **`CasinoGameTile` spring lift** (`scale 1.04`, `y: -6`) — do **not** only zoom the image.

### Soft navigation
```ts
// Tile click: spinner first, then navigate
setLoading(true)
window.setTimeout(() => {
  startNavigating(href)
  router.push(href)
}, TILE_NAV_MS) // ~900ms typical
```

## Confirmation / success screens

Full note: `.cursor/knowledge/chris-taste/CONFIRMATION_STATES.md`.

- Glyph = join welcome: **primary filled disc** + bold white `IconCheck` (`stroke={3}`), spring in. Never a thin green tick.
- Copy names the outcome (**Bets placed** / **Your selections are live**) — not vague **You’re in** in the body.
- CTAs reuse shell marks (`ShellIcon name="ticket"` for My Bets — same as mobile dock; never the serrated `bets` slip).
- Panel carousels: desktop glass arrows; mobile swipe-only.

## Card recipes

```
rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]
```

Sheet close / chrome icon button:
```
rounded-lg ... hover:bg-accent
```

Stat / claim mini-cards (RAF): icon + muted label on one row; large `tabular-nums` value; primary CTA only on claimable card.

## Input / select field recipe

Match cashier crypto converter:

```
rounded-lg border border-input bg-popover
```

Dark token reality:
- `--background: #1a1a1a`
- `--card` / `--secondary`: `#fafafa0d` (same wash — bad for nested fields)
- `--popover: #2c2c2c` (solid elevated — use for fields on cards)

## Table recipe

- Container: same card recipe.
- Header row: muted labels, `h-11 text-xs`.
- Body: `hover:!bg-surface-muted-3`; optional expand with grid-rows animation.
- Status pills: tokenized (`--opacity-success-*`, `--opacity-warning-*`) — see `BONUS_STATUS_STYLE` / commission badges.
- Footer: Rows per page Select + Page N of M ghost icon buttons.

## Live activity feed

- **Table only** — title + live bet table. No All Bets / Jackpot Winners / 25k Daily Races sub-nav.
- Visible rows ~6–8; tick ~900ms when `playing && !hovered`.
- Hover table → pause; leave → resume if still playing.
- Toggle icon shows **status**: Play when live, Pause when paused.
- Launch via `useShell().launchGame(activityGameFromTitle(...))` — never spinner-only stubs.
- Thumbnails from real originals art, not a single placeholder.

## VIP / RAF claim

```ts
const reward = vipRewards.find(r => r.id === 'refer-friend')
claimVipReward('refer-friend', buttonEl)
// → landing → toast + confetti → balance += amount; hub row becomes claimed
```

Keep claim amount equal to `VIP_REWARDS_SEED` for that id (RAF page and hub stay linked).

## Body portals — NEVER under the shell (HARD RULE)

Legacy `body > div` rules force `position: relative` and kill stacking. **Every** `createPortal(…, document.body)` overlay must:

1. Set a root attribute, e.g. `data-daily-spin-root`, `data-auth-modal-root`, `data-churn-rescue-root`, `data-profile-gate-root`.
2. Be listed in the `:not([data-…])` carve-out selectors in `app/globals.css`.
3. Have a dedicated fixed block: `position: fixed !important; inset: 0; z-index: ≥250` (VIP Hub is **200** — modals that open from the hub / betslip must be higher).

Tailwind `z-[240]` alone is **not enough** — without the carve-out the portal paints under VIP Hub / cashier / drawer / soccer betslip. Chris has hit this repeatedly (profile gate Oct 2026); do not relearn it.

**Daily Spin** = ship the BOL `JackpotWheelBonus` component (`components/lumen/jackpot/jackpot-wheel-bonus.tsx`) + sounds (`lib/sounds.ts`, `/public/sound/`) + wordmarks (`/WHEEL_LOGO/`). Do not redraw the wheel. See `.cursor/knowledge/chris-taste/DAILY_SPIN.md` + `COPY.md`.

## Sports side-nav section collapse

Quiet section labels (Top Leagues / Top Sports / A–Z). Chevron **always visible** with hover wash on the hit target — not a FAQ-style accordion bar, not hide-until-hover. Smooth open/close via `grid-rows-[0fr]/[1fr]`.

## Sticky sidebar

```tsx
<div className="flex flex-col gap-6 lg:flex-row lg:items-start">
  <div className="min-w-0 flex-1">{/* long content */}</div>
  <aside className="w-full shrink-0 lg:sticky lg:top-[76px] lg:w-[320px] lg:self-start lg:z-10">
    {/* share / filters / help */}
  </aside>
</div>
```

`76px` ≈ 68px header + breathing room under sticky chrome.

## Continue Playing

- Homepage: only if `loggedIn`, first shelf after hero.
- Games list short (≈5) + `showPlayRandom`; **no** `seeMoreHref`.
- Distinct games/art — no duplicate Blackjack tiles from wrong `SLOT_TITLES[0]` indexing.

## Figma → code

1. Skill: figma-design-to-code  
2. `create_session` → `get_design_context` (+ screenshot)  
3. Download MCP assets into `public/shell/figma/<feature>/`  
4. Rebuild with shell components + tokens; delete temp URLs  
5. Verify icons, field fills, sticky, and shared claim/nav wiring  

## Taste summary (how Chris decides)

- **Busy where it earns attention** (activity feed, claim moments) — calm everywhere else.
- **Shared state over parallel demos** (one claim, one balance, one launcher).
- **Restraint on chrome** — fewer pills, no divider forests, no logo cards.
- **Correct token > approximate grey** — especially dark inputs and accents.
- **Figma mark when it exists** — don't substitute a generic icon for a branded token.
- **Mobile = swipe, never overlay arrows** on carousels / odds — settled preference; store and obey.

## Competitor UX (Mobbin)

Companion to SKILL **Competitor patterns via Mobbin**.

| Need | Do |
|------|----|
| Peer join / verify / OTP | Mobbin web: signup / phone verify; then AuthModal + `AUTH_JOIN.md` |
| Rewards in chrome | Mobbin + Rainbet gift / Winna Bonus Center notes in `COMPETITOR_RESEARCH.md` |
| Live social proof | Mobbin + Rainbet Live Wins → `LIVE_WINS_CAROUSEL.md` |
| Mobbin unavailable | Local `competitors/` + research MD only; tell Chris MCP is blocked |

Always: **inspire → Lumen/shell**. Never paste peer visuals.

