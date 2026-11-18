# Competitor research — Chris-liked patterns

**Purpose:** When writing a BRD or debating UX, cross-check **strategy** (`BRIEF.md`) + **journey audits** (`research/Journey_Audits_2026.pdf`) + **these patterns**. Research only — do not copy brand/visuals; translate into Lumen + BetOnline shell.

**Peers covered here:** Rainbet, Winna (also audited: Whale.io, Stake, MyBookie).

Screenshots: `competitors/`.

---

## Ideas Chris likes (priority signals)

### 1. Rainbet — Live Wins activity carousel
**What:** Same data as an activity table, but a horizontal scrolling card strip: game thumb → truncated user + VIP gem → green win amount. Pulsing “Live Wins” badge. Cards update / stream left↔right.

**Why it matters for BOL:** We already have an activity table/feed on casino. Carousel form puts social proof **in the lobby scroll path** (Discover + Reward heartbeat). Maps to strategy: rewards/excitement where players already are; features **19–20** (side rail / always-something-happening) and Discover.

**Lumen translation:** Reuse activity data model; card = game tile + muted user + `success` amount; live pill = existing casino activity patterns. Not Rainbet art or gem system.

**Screenshot:** `competitors/rainbet-live-wins-carousel-closeup.png`, `rainbet-homepage-live-wins-sidebar.jpg`

---

### 2. Rainbet — Left nav with reward widgets (future)
**What:** Sidebar isn’t just links — sticky promo widgets: Weekly Raffle countdown, Daily/Weekly/Monthly race pots, VIP Exclusive races, Challenges. Rewards are **chrome**, not a buried Promotions tab.

**Why:** Strategy finding — BOL has the biggest promo portfolio and the smallest spotlight. Left-nav widgets = “make it rain” in the shell. Maps to initiatives **03–04** (Rewards Hub / Always-On Mechanics) and feature **19**.

**Lumen translation:** Future shell sidebar modules (raffle / race / mission chips) using Lumen cards + countdown — not reinventing nav IA until BRD.

**Screenshot:** `competitors/rainbet-homepage-live-wins-sidebar.jpg`

---

### 3. Rainbet — Header gift → rewards claim list
**What:** Gift icon opens a compact popover: featured raffle banner + row list (Freespins, Reload, Rakeback…) each with **Claim**, footer **All Rewards**.

**Why:** Claim moments in minutes/hours, from global chrome. Maps to features **12–13**, **50** (alert state + One Rewards Hub + notification centre). Aligns with live-site VIP hub / My Bonus claim patterns we already ship.

**Screenshot:** `competitors/rainbet-rewards-gift-dropdown.jpg`

---

### 4. Winna — Bonus Center modal
**What:** Gift-triggered “Bonus Center”: Overview / Level Up / All Levels. Grid of reward types (Instant Rakeback, Weekly Boost, Monthly Bonus…) with lock states by VIP tier. Bottom CTA: **Match your VIP Status** / Transfer Status.

**Why:** One rewards home + VIP status match acquisition in the same surface. Core bet 02 + Convert enabler (features **13**, **32–34**). Pattern to reference when expanding VIP hub / rewards hub — not a parallel product.

**Screenshot:** `competitors/winna-bonus-center-modal.jpg`

---

### 5. Winna — Promotions header dropdown (races + challenges)
**What:** “Promotions” control opens short list: Daily Race ($10k), Weekly Race ($50k), Challenges (N available) — icon + title + pot/count.

**Why:** Fast path into always-on mechanics without full page load. Features **18–20**.

**Screenshot:** `competitors/winna-promotions-header-dropdown.png`

---

### 6. Winna — Challenges grid (+ social chat sidebar)
**What:** Dedicated Challenges page: Active/Finished toggle, “13 Active” + pot total, game-art cards with objective (“first to hit Nx”) + cash reward. Optional right rail: live chat + “Live Rain” pool widget; chat pauses on scroll.

**Why:** Mission/race surface with clear objective → reward → claim. Features **18**, **20**. Chat/rain = community enabler (Convert “NEXT”); lower priority than rewards-in-lobby for BOL now.

**Screenshots:** `competitors/winna-challenges-grid.jpg`, `winna-challenges-with-chat-sidebar.jpg`, `winna-challenges-chat-sidebar-alt.jpg`

---

## Journey audit takeaways (pair with strategy)

Source: `research/Journey_Audits_2026.pdf` — BOL vs MyBookie, Winna, Whale.io, Rainbet, Stake.

| Stage | BOL signal | Competitor bar | Opportunity |
|-------|------------|----------------|-------------|
| Registration | ~1–2 min, **6 fields**, higher field count | Peers often **2–3 fields**, ~1 min | Defer gender/DOB/phone post-signup |
| BTC deposit | ~3 clicks, ~6 min arrival; email clear; **no cashier widget yet** | Widget everywhere; some ~1–3 min | Cashier widget (in flight → 2027); preselect currency |
| First casino bet | Sports start → **~50s** to find casino; **~8 min / 8 clicks** after cleared deposit | Peers often **~30s–1:30 / 3–5 clicks** | Casino-first surfaces; search not buried in filter drawer |

Use these numbers in BRDs when arguing friction cuts (Activate needle: &lt;2 min to first casino bet).

---

## Mobbin (live peer screens)

**Connected in Cursor** as MCP `plugin-mobbin-mobbin`. Use it when building or advising on flows peers already solved (join like Rainbet, rewards chrome, lobby activity, cashier).

1. Search Mobbin (web first for casino peers) for the screen/flow.
2. Compare hits to **Ideas Chris likes** above + `competitors/` screenshots.
3. Translate into Lumen + BetOnline shell — never clone.
4. If MCP returns paid-plan / auth errors: fall back to this file + local screenshots and say Mobbin is blocked.

Wired into `.cursor/skills/lumen-betonline-build/SKILL.md` so every live-site build can pull peer UX before inventing.

## BRD checklist (agents)

When Chris asks for a BRD or feature write-up:

1. Open `BRIEF.md` — which core bet / initiative / feature #?
2. Open this file — any Chris-liked competitor pattern?
3. **Mobbin** (when available) — peer screens for the same flow; cite links.
4. Open journey audit — any timed friction this removes?
5. Propose Lumen/shell shape — never “clone Rainbet/Winna.”
6. Do **not** implement unless he explicitly asks to build.
