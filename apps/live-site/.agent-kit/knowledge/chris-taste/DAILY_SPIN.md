# Daily Spin — settled preference

**Source:** Chris, Oct 2026.

## Popup chrome (HARD RULE)

- **Not fullscreen.** Same centered dialog as Login/Join (~820×640): dimmed backdrop + frost card.
- **Left:** `/shell/auth/daily-spin-ready.jpg` (red 3D wheel — copy is in the art; no duplicate headline overlay).
- **Right:** solid brand `--background` (not blue/purple) + jackpot wheel + Spin now.
- Join: open Daily Spin first; open cashier **after** the dialog closes.

## Wheel

- **Do not invent a wheel.** Port the BOL shad `JackpotWheelBonus` (`jackpot-wheel-bonus.tsx`) — same SVG, pointer + center hub (`/jackpot/`), neon rim, zoom/spin/land, and **sounds** from `/sound/` via `@/lib/sounds`.
- Live-site path: `components/lumen/jackpot/jackpot-wheel-bonus.tsx` wrapped by `daily-spin-modal.tsx`.
- **Audio:** FX only (Spin now, segment ticks, land/win stings). **No** looping bg / wheel-spin bed music on Daily Spin.
- Daily Spin wedges: **brand red/cream** + **text labels** (`$5` / `Miss` / `10 Free Spins` / `$100`). No multicolored SVG icons on the face — unreadable and off-brand.
- Hub list glyph: red/cream mini wheel + gold rim (not jackpot neon green/purple/blue).
- Free Spins reward row sits **above Birthday**, never second under Daily Spin.
- Wheel **grows** on spin (`introScale` → `zoomScale` → `closeScale`).
- Idle “pulse” must be **clearly visible** so the wheel doesn’t look lost in the dark panel — red/gold opacity glow + thin gold rim, breathing ~2s. Never nested `scale` on the wheel (jitters against SVG rotation).

## Hub row icon

- Mini multi-color jackpot wheel (green / purple / gold / blue wedges + cyan rim + red pointer).
- **Never** a purple/pink gradient orb glyph.

## Portal stacking

- `data-daily-spin-root` + globals carve-out + `z-index: 250` (VIP Hub is 200). Tailwind `z-*` alone paints under the hub.

## Copy

- Tip / modal: short — see `COPY.md`. Rejected: *“Spin once a day — and every time you log in. Win cash…”*

## Post-login / join (HARD RULE)

- **Login** (form or “sign in with” social) → `completeLogin` → **Daily Spin** only. **Never** the join welcome modal.
- **Join** (Join & Play or “sign up with” social) → **welcome modal** (“You’re in” / Welcome, {name}! / Let’s Go) → then `completeJoin` → **cashier Activate**. **No** Daily Spin.


## Finish transition

- Daily Spin uses `variant="daily-spin"` on `JackpotWheelBonus`: **no wipe**, no extreme zoom, no riser peel.
- Land → one win sting → prize card (cash / free spins / nothing) → stay.

## Prizes

Only three kinds: **cash**, **free spins**, **nothing** (Miss). Never leave the player with “Mini/Major Jackpot” as the outcome copy.

## Login vs join

- **Login** (returning) → Daily Spin only. **No** Intercom first-deposit pitch, no welcome offer, no cashier auto-open.
- **Join** (new) → welcome modal → cashier Activate (no Daily Spin); Intercom welcome only after empty wallet close.
