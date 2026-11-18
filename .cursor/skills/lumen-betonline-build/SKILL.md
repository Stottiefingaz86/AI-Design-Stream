---
name: lumen-betonline-build
description: >-
  REQUIRED on every request in this repo. Build and refine BetOnline live-site
  UI with the Lumen design system and Chris's product taste (shell, sub-navs,
  cards, hovers, toasts, claims, tables, Figma→code). Use Mobbin + competitor
  research for peer flows (Rainbet/Winna join, rewards, lobby). Always read
  this skill first for any live-site, shell, Promo26, Casino, VIP, RAF, or
  refinement work.
---

# Lumen BetOnline Build

**Always apply** — load this skill at the start of every request (`.cursor/rules/lumen-betonline-build.mdc`). Part of the full stack in `.cursor/rules/chris-build-stack.mdc`: **taste (this skill) + Lumen constitution + strategy brief + competitor research**. Aim for close-to-perfect first passes; Chris will refine.

You are extending **`apps/live-site`** — a Next.js shell that already owns chrome, navigation, tokens, and claim/toast/balance behavior. Prefer **reuse over invention**. New screens should look like they shipped with My Bonus / Transactions / Casino / VIP Hub / Refer a Friend.

## Before you code

1. Read existing neighbors first: `components/site/shell-*.tsx`, `components/lumen/*-page.tsx`, `lib/lumen/*`, `app/lumen.css`.
2. If Figma is linked: load **figma-design-to-code**, `create_session`, then `get_design_context` + screenshot. Download assets locally — never leave MCP temp URLs in code.
3. **Competitor UX (Mobbin + research)** — when inventing or refining a flow Chris has compared to peers (join / verify, rewards chrome, live wins, cashier, lobby discovery), pull patterns **before** coding. See **Competitor patterns via Mobbin** below and `.cursor/knowledge/product-strategy/COMPETITOR_RESEARCH.md`.
4. Map UI to **tokens** (`bg-card`, `bg-popover`, `border-input`, `text-muted-foreground`, `primary`, `success`, `warning`) — not hard-coded greys.
5. Wire demos into **shared shell state** (`useShell`) when the same fact exists elsewhere (claims, balance, login, launch).

Detail catalog: [patterns.md](patterns.md).

### Competitor patterns via Mobbin

**Why:** Chris often references peers (e.g. **Rainbet** join, Live Wins, rewards-in-chrome; **Winna** Bonus Center). Guessing peer UX from memory is worse than looking. Mobbin = production screens; local research = Chris-liked notes + screenshots.

**When to open Mobbin (MCP `plugin-mobbin-mobbin`):**
- New or reworked **flows** — join/login/verify, deposit/cashier, claim/rewards popovers, lobby shelves, onboarding, empty states.
- Chris names a peer site or “like Rainbet / Winna / Stake…” — search that pattern (and related screens) before proposing UI.
- Activation / friction debates — pair Mobbin with journey audits + `COMPETITOR_RESEARCH.md`.

**How:**
1. Use Mobbin `search_screens` / `search_flows` (prefer **web** for casino peers; ios when mobile chrome matters). Query like a screen: `"crypto casino signup"`, `"gambling app rewards claim dropdown"`, `"casino live wins activity carousel"` — name the peer when known (`"Rainbet signup"`).
2. Read the returned screen images (not metadata alone). Cite Mobbin links when discussing options with Chris.
3. Cross-check **Chris-liked** notes in `COMPETITOR_RESEARCH.md` + files under `competitors/` — those are settled taste, not every Mobbin hit.
4. **Translate into Lumen + BetOnline shell** — tokens, AuthModal, VIP/claims, cashier. Inspiration only; **never clone** peer brand, gems, purple chrome, or copy.

**If Mobbin MCP fails** (auth / paid plan / empty): say so once, then use `COMPETITOR_RESEARCH.md` + `competitors/` screenshots + journey audits. Do not invent fake peer UI.

**Example (join):** Rainbet-style short join was a peer signal → BOL AuthModal Email → Password → Verify (OTP / optional SMS) in Lumen frost — not a Rainbet skin. Next time, Mobbin signup/verify screens first, then ship in shell.

## Hard rules (Chris's refinements)

### Shell & navigation
- All product pages sit in **`ShellFrame`**. Scroll lives in **`#shell-scroll`** — not `window`.
- **One sticky chrome block** (chips + header + glass sub-nav). Use `--shell-sticky-top: -chipH` so the page scrolls until main nav hits the top; scroll-up sets it to `0` to slide the same block down until quick-nav is fully revealed. Never override with `top: 0 !important`. Do not strip casino sub-nav `glass`.
- **Ultra-wide header:** brand bar inner row is `max-w-[1440px] mx-auto` (same as content / sub-nav) so balance / VIP / UB align to the content right edge — see `SHELL_HEADER_WIDE.md`.
- Soft-nav: call **`startNavigating(href)`** before `router.push`. Show **`TileSpinner`** on the clicked tile **before** navigation unmounts the page.
- Full-page loader: boot + deep links only — dark `#1a1a1a`, fixed stacking under shell, not above the menu. Soft top-nav should not flash the boot loader.
- Destination **route skeletons** (title real or shimmer matching the page) — no blank leave-page flash.
- Sidebar / dock active states must track real routes (e.g. Refer → `/promotions/refer-a-friend`).

### Sub-navs & filters
- Pill tracks (casino activity, promo filters): motion thumb + clear active; reuse existing track components when possible.
- Account / My Bonus style: **Filters** button + sheet/drawer; tables use shared pager (`Rows per page` + Page N of M).
- Inline search + Filter by + Sort by (RAF) is OK when Figma shows it — still use the same `Table` / `Select` primitives.

### Mobile carousels — HARD RULE (do not re-litigate)
- **Never put left/right edge chevron overlays on mobile or touch.** Swipe / finger-scroll only.
- Desktop may use glass edge arrows (casino sub-nav pattern) **only** when `(hover: hover) and (pointer: fine)`.
- Odds rails, league tiles, shelves, market carousels — same rule. Chris has repeated this; do not “helpfully” add arrows back on narrow viewports.

### Cards & surfaces
- Default content card: `rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]`.
- **Do not invent decorative cards** for partner logos, hero chrome, or static marketing strips — flat/full-bleed or simple rows unless the card is the interaction container.
- Sheet/drawer **close** controls: `rounded-lg` + **`hover:bg-accent`** (not `rounded-full`, not muted-only). Unify close hover across VIP hub, UBC, cashier.
- Sticky side columns: put **`sticky` on the flex item** (`lg:sticky lg:top-[76px] lg:self-start`). Sticky inside a short `items-start` wrapper fails.

### Inputs (dark mode)
- On cards / secondary washes, fields must match **cashier BTC converter**:  
  `rounded-lg border border-input bg-popover`  
  Never `bg-card` or plain `bg-background` for those fields — in dark, `--card` ≈ `--secondary` (`#fafafa0d`) so inputs disappear.
- Prefer the shared `Input` + override with that field class. Text stays `text-foreground`; placeholders `text-muted-foreground`.

### Icons & assets
- Prefer **Figma-exported SVGs** under `public/shell/figma/...` over generic Tabler when the design has a mark (claim token, VIP glyphs, crypto, RAF stats).
- Colored marks keep baked fills (`#EE3536` primary). Mono marks may `dark:invert`.
- Crypto: use circular cashier coin assets (green `$`, orange BTC, etc.).

### Hover, motion, live feeds
- Row hover: whisper `hover:!bg-surface-muted-3` (not heavy stripes).
- Live activity: busy cadence (~900ms), **pause while pointer is over the table**, resume on leave; play icon = live, pause icon = paused (status, not “click to…” convention).
- Game shelves: intentional tile enter / spinner; don't over-animate.

### Auth / join
- Join + login live in **`AuthModal`** (Lumen tokens; welcome art from BOL shad under `public/shell/auth/`). Join: **Email → Password** (+ referral / T&C), then **Verify** (Nickname + OTP, optional SMS), then welcome. CTA **Next** then **Complete**. Nickname only on Verify — live no spaces / no special chars. Login identifier: **Email or Customer ID**. White focus rings — never blue. No DOB at join.
- **Local-only join lab** (`localhost` / `127.0.0.1` only): under Join → **Referral Code** — one code input; type `1`–`5` there (no dropdown / extra lab fields). Journey 1 = Email/Password → Verify → welcome; 2 = sports name gate; 3 = account levels; 4 = Username; 5 = same verify flow as 1. Hosted Vercel always journey 1 — see `AUTH_JOIN.md`.
- After auth: **Join** → welcome modal (“You’re in”) → Let’s Go → `completeJoin` + cashier Activate; **Login** → `completeLogin` + Daily Spin (never the join welcome).
- **Login = returning player:** Daily Spin only — **no** Laura Intercom first-deposit pitch, no welcome offer, no auto cashier. Login social (“sign in with”) uses `completeLogin`, never `completeJoin`.
- **Join = new player:** Join & Play **and** “sign up with” social → welcome modal → `completeJoin` → **cashier Activate**, **no** Daily Spin. Intercom welcome only after empty wallet close. Birthday DOB in VIP Hub as **MM / DD / YY**.
- **Daily Spin:** login-only post-auth popup (`.cursor/knowledge/chris-taste/DAILY_SPIN.md`). Auth-sized — left “Your daily spin is ready” art, right wheel. `variant="daily-spin"` (no wipe) + sounds; outcomes = **cash / free spins / nothing** only.

### Claims, toasts, balance
- One source of truth: **`claimVipReward(id, button)`** in shell context. Page claim and VIP Hub claim must sync.
- Fresh join: VIP seed has **no claimables** (rakeback $0 until open/close games; RAF $0 until copy/email/share on RAF page). Crown badge = cash claims only.
- BTC copy address → **2/2 confirmation poll** in cashier; close wallet → same poll under balance toast; on confirm → success toast, VIP shake, balance up, **Free Spins** row above Birthday (game tile icon, `Chicken · 100/100`, CTA **Play**).
- VIP Birthday at list bottom: Add birthday → muted **“N days”** card (disabled, no lock) → claim only on the day.
- Sequence: claiming state → confetti + toast → balance NumberFlow roll-up (respect existing timers). Don't invent a second toast system.

### Tables & empty states
- Reuse My Bonus / Transactions patterns: expand rows optional, status pills via token colors (`success` / `warning` / muted).
- Empty copy is short and calm — no fake dashboards.

### Shelves / Continue Playing
- Logged-in homepage: **Live Wins** under hero, then Continue Playing, then Originals.
- No **See More** on Continue Playing. Cap demo at ~**5 games + Play Random**. No duplicate titles/art.
- Casino lobby Continue Playing follows the same rules.

### Feedback learning

- Skill: `chris-feedback-learn` + log: `.cursor/knowledge/chris-taste/FEEDBACK_LOG.md`
- On praise/rejection: append Do/Don't **same turn**, then patch the relevant chris-taste note
- Before inventing join/OTP/phone/SMS: read FEEDBACK_LOG for that surface

## Process
- **Do not commit** unless asked. **Deploy** (`apps/live-site` → `vercel --prod`) when asked — prod alias `design-request-app-one.vercel.app`.
- Match Figma node intent, then adapt to shell tokens/components. Screenshot is the visual target; code from MCP is a reference, not paste-final.
- When unsure between "more content" and "restraint", choose **restraint** (Chris routinely trims over-filled carousels and decorative chrome).

## Build checklist (new page)

```
- [ ] ShellFrame + product nav href + active state + loading skeleton
- [ ] Tokens only; card recipe above; inputs = popover field class if on dark cards
- [ ] Competitor flow checked (Mobbin and/or COMPETITOR_RESEARCH) when inventing UX — translated to Lumen, not cloned
- [ ] Figma icons downloaded under public/shell/figma/...
- [ ] Shared claims/launch/nav via useShell where applicable
- [ ] Sticky sidebars on the flex item; offset under 68px header (~76px)
- [ ] Soft-nav + tile spinner if leaving via in-page tiles
- [ ] Hover/close accents unified; no rounded-full icon buttons for sheet close
```

## Anti-patterns

| Don't | Do |
|-------|-----|
| New one-off toast/claim | `claimVipReward` + existing toast host |
| `bg-card` inputs on dark cards | `bg-popover` + `border-input` |
| Sticky inside short wrapper | Sticky on tall flex sibling / item |
| Fill Continue Playing to 10 | 5 + Play Random |
| Tabler when Figma has the mark | Export SVG from Figma |
| Boot loader on soft top-nav | Boot/deep-link only |
| Cards around partner logos | Flat row / no divider clutter |
| `rounded-full` sheet close | `rounded-lg hover:bg-accent` |
| Body portal with only Tailwind `z-*` | Carve-out + fixed `z≥250` in `globals.css` (VIP Hub is 200) |
| Flat muted Daily Spin wedges | Jackpot wheel: radial fills, neon rim, `/jackpot/*` assets |
