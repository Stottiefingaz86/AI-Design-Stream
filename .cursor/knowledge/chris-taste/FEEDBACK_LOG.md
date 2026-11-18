# Chris feedback log — likes vs dislikes

**Purpose:** Positive / negative product taste for Design Agent and live-site builds. Not a chat dump.  
**Skill:** `.cursor/skills/chris-feedback-learn/SKILL.md`  
**Hard rules also live in:** `lumen-betonline-build` skill + `patterns.md` + other notes in this folder.

**Rule:** On every correction or “love this / hate this,” append here **and** update the matching chris-taste note the same turn. No vendor / prior-employer brand names in this file — describe the pattern, not the company.

Format for new chronological entries (bottom of file):

```
### YYYY-MM-DD — short topic
- **Sentiment:** positive | negative | mixed
- **Surface:** …
- **Signal:** what Chris said (paraphrase OK)
- **Do:** …
- **Don't:** …
```

---

## How Design Agent must use this

1. Before inventing UI, grep this file for the **surface** (sub-nav, carousel, OTP, toast, …).  
2. Treat every **Don't** as a hard reject — do not retry with a small tweak.  
3. Prefer shipped neighbors + Lumen over invention.  
4. After Chris corrects you, append + promote into the taste note / skill.

---

## Settled Do / Don't by surface

### Sub-nav (repeated heavily — do not re-litigate)

| | |
|--|--|
| **Do** | Match design-tool frame pixel-for-pixel before inventing. Glass frost bar (token `--container`), no invented divider. White / high-contrast **icon chip** + category **pills** with soft card shadow on the glass field. Semibold/medium pills; animated **glide** thumb on select (not hard on/off). Sub-nav sits in the **sticky chrome stack**; content scrolls underneath. Mobile: pills **full-bleed**, track scrolls with the grey field (not text clipped inside). Desktop may keep glass edge arrows when fine pointer. |
| **Don't** | Invent a different sub-nav. Light-hardcoded glass in dark mode. Extra `border-b` when Figma is blur-only. Faint icons on muted capsule instead of the white chip. Flat inactive chips with no shadow. Mobile **crop** so pills don't flow off the right. Mobile arrows on the sub-nav track. Search / Favourites chrome on mobile when those live in the dock. Late-loading sub-nav after the rest of the page. Ship without checking the design-tool source. |

### Shell / sticky chrome

| | |
|--|--|
| **Do** | One sticky chrome block (chips + header + glass sub-nav). Scroll in `#shell-scroll`. Soft-nav: spinner on tile **before** route change. Destination skeletons. Sidebar/dock active = real route. Ultra-wide: brand bar inner `max-w-[1440px]` aligned to content. Sidebar open/close: smooth ease; closed state persists across pages. Mobile dock: Search / Play Random / Favourites; hide on scroll up, show on scroll down (opposite of top tabs). Drawers: drag-to-dismiss with centered handle; don't dismiss on every content swipe. |
| **Don't** | Invent wordmark headers or a second shell. Sticky with `top: 0 !important`. Full-page boot loader on soft top-nav. Broken hover/active on VIP / UBC / logout. Side-nav that doesn't match design-tool. Intercom-style chat bubble on mobile product chrome. |

### Carousels / shelves / arrows

| | |
|--|--|
| **Do** | **Mobile + touch = swipe only.** Desktop glass arrows only when `(hover: hover) and (pointer: fine)`. Separate scrollport from flex row so overflow is swipeable. See More + arrows readable on the shelf background. Align Top 10 / shelves with sibling rows (same gutters). Live Wins: shelf h4, play/pause beside title, primary live dot, tile spring hover — see `LIVE_WINS_CAROUSEL.md`. |
| **Don't** | Overlay chevrons on mobile “for discoverability.” `touch-pan-x` on odds rails (kills vertical scroll). Numbers / rank badges more behind cards after being told to fix depth. Broken See More. Indent one shelf differently from the rest. |


### Activity / BA workshop

| | |
|--|--|
| **Do** | Sports: pending/live. Score-only box aligned to teams. **Parlay Event = logo stacks** (featured leg clock + matchup); pick count in Selection; Pending parlays (not started) + live parlays. **All** (+ sport pills) include graded wins; Graded tab = wins only. Graded Status = amount won (`toWin`, success). |
| **Don't** | `N-Pick` pill/card in the Event cell. Treating every parlay as live. Wrap teams in score card. Expand parlays into N rows. Bare `Won` in Graded Status. Hide graded from All. |

### Cards / surfaces / hover

| | |
|--|--|
| **Do** | Default card: `rounded-[10px] border border-border bg-card` + soft `0 0 16px` shadow. Hover/active/focus on interactive chrome. Tooltips on icon hits. Casino tiles: smooth spring hover. Sheet close: `rounded-lg` + `hover:bg-accent`. |
| **Don't** | Decorative cards for static logos/marketing. Missing hover/active states. White heart / faded icons when neighbors use proper token states. Random shimmer skeletons that aren't Lumen. Hamburger when the product icon already exists. Desktop drawer when the pattern is **sheet**. |

### Inputs / fields

| | |
|--|--|
| **Do** | Match cashier BTC converter: `rounded-lg border border-input bg-popover`. Text `text-foreground`; placeholders muted. One frost field — dial/prefix inside the country dropdown, not a second tone. |
| **Don't** | `bg-card` / plain `bg-background` fields that disappear on dark secondary washes. Nested Select backgrounds / two-tone grey phone fields. |

### Join / verify / OTP / SMS

| | |
|--|--|
| **Do** | Join CTA **Next**; verify CTA **Complete**. **Nickname** only on Verify (live: no spaces / no special chars). OTP = **5** bare square boxes, full width, paste OK. SMS optional like Referral expand (chevron); collapse dismisses. Country from IP; flag + dial in dropdown; **Send SMS** beside field. Hover wash centered on prefix. |
| **Don't** | Full Name / real-name field on Verify for journeys 1/5. Nickname on first join form. Spaces or special characters in Nickname. Trap in required phone. OTP as grey stripe, dashed groups, 6 boxes, or boxes inside a card “block.” Off-center hover pill. AI sports-gate copy — see `AUTH_JOIN.md` / `COPY.md`. |

### Copy

| | |
|--|--|
| **Do** | One concrete fact. Match shipped neighbors. Login CTA = **Login**. |
| **Don't** | AI-slop filler, em-dash pitches, “You’re in” as body copy, explaining the product in three clauses. See `COPY.md`. |

### Claims / toasts / tooltips

| | |
|--|--|
| **Do** | Claim → toast under balance (readable, correct tokens, centered on mobile). Tooltips on info icons. Confetti/celebrate via shared VIP path. |
| **Don't** | Transparent unreadable toasts. Toast stuck left / wrong colour. Shipping claim UI with no toast. Ignoring tooltip requests across turns. |

### Lumen / design-tool / component gallery

| | |
|--|--|
| **Do** | Lumen only. Pull from design-tool MCP before coding. Reuse gallery components (confetti, shimmer, tiles). Exact tokens — no parallel system. Skeletons that match real layout. |
| **Don't** | Invent outside the system. “Looks live” with no link. Fake peer UI from memory when peer-screen library / research exists. Skip MCP then invent pages. |

### Figma handover (live-site → eng)

| | |
|--|--|
| **Do** | Full Shell chrome. **Build journey frames with `use_figma` + Lumen library instances** (Mode vars, sports/*, Button, Shell). HTML `generate_figma_design` capture = **layout reference only** — then delete or quarantine. Real IconSelector. Anatomy after full screens. |
| **Don't** | Ship HTML-capture as the handover (grey IMAGE squares, unbound `#FAFAFA`). Patch captures forever and call it Lumen. Wireframe-only strips. Fake ⇅ arrows. IntercomFab over Dev Mode. |

### Design Agent / process

| | |
|--|--|
| **Do** | One clear master Design Agent flow. BRD → skills + research → build → human gates → learn from this log → package. Always load lumen-betonline-build (+ patterns) every request. Separate back-office styling from the demo site. Show what needs attention, screens, and what’s going to engineering. |
| **Don't** | Confusing multi-agent soup. Clunky back office shared with live demo. Approve with no artifact. Pause with no explanation. Handoffs missing peer-screen / research tooling when competitor flows matter. |

### Responsive / large screens

| | |
|--|--|
| **Do** | Center content on large desktops (`max-w` alignment). Mobile product tabs: don’t double-highlight Casino + Live Casino. Smooth lobby scroll (no snap hitch). |
| **Don't** | Left-jammed ultra-wide layouts. Mobile casino sub-nav with desktop chrome leftovers. |

---

## Chronological entries (append below)

## Session: Join verify + Design Agent + handoff (Nov 2026)

### 2026-11-04 — Join CTAs
- **Sentiment:** positive (after fix)
- **Surface:** join/auth
- **Signal:** First page CTA **Next**, verify CTA **Complete**.
- **Do:** Journey 1/5 join = **Next**; verify = **Complete**.
- **Don't:** Full Name on the first join form for journeys 1/5.

### 2026-11-04 — SMS optional / closable
- **Sentiment:** negative then fixed
- **Surface:** phone/SMS
- **Signal:** Opening mobile must be dismissible; mobile is optional.
- **Do:** SMS expand like Referral; collapse dismisses; phone never required.
- **Don't:** Trap users in a required phone step.

### 2026-11-04 — Prefer SMS UX
- **Sentiment:** mixed → settled
- **Surface:** phone/SMS
- **Signal:** Prefer SMS like the referral arrow; hover chip so it looks clickable; hover must be centered.
- **Do:** Flag + dial in dropdown; one frost Input; hover wash vertically centered on prefix.
- **Don't:** Nested Select backgrounds, two-tone field, floating dial mid-field, off-center hover.

### 2026-11-04 — OTP boxes
- **Sentiment:** strongly negative on several attempts
- **Surface:** OTP
- **Signal:** Rejected stripe, dash groups, and card wrapper; wants plain OTP squares.
- **Do:** **5** separate square OTP boxes, full width, paste-friendly.
- **Don't:** Full-width grey stripe; 6 boxes; mid dash; OTP inside a card block.

### 2026-11-04 — Phone + Send SMS
- **Sentiment:** negative → cleaner after flatten
- **Surface:** phone/SMS
- **Signal:** Patchwork field; put prefix in dropdown; country from IP; Send SMS beside field.
- **Do:** One auth Input; country popover = flag + dial ▾; IP default; primary **Send SMS** same height.
- **Don't:** Nested tones; dial duplicated outside dropdown.

### 2026-11-05 — Design Agent north star
- **Sentiment:** positive direction
- **Surface:** Design Agent / process
- **Signal:** Wants detailed flow (skills, MCPs, human gates) and a handoff pack with full skills + peer-screen tooling.
- **Do:** BRD → skills + research → build → Human#1 → refine → learn → Final sign-off → eng package.
- **Don't:** Invent peer UX without research; skip learning from negative feedback.

### 2026-11-06 — Handoff missing peer-screen tooling
- **Sentiment:** negative on omission
- **Surface:** Design Agent / process
- **Signal:** Handoff pack was missing the peer-screen library skill/MCP.
- **Do:** Always include peer-screen skill + MCP in Cursor/other-agent exports when competitor flows are in scope.
- **Don't:** Ship handoff packs with design-tool only.

### 2026-11-09 — Feedback archive purpose
- **Sentiment:** negative on wrong artifact
- **Surface:** Design Agent / process
- **Signal:** Full chat dumps (and prior-company names) are not useful; need positive/negative design feedback (e.g. sub-nav repeated many times).
- **Do:** Keep this log as the Design Agent context; consolidate repeated corrections into surface Do/Don't tables.
- **Don't:** Store raw multi-session chat or vendor/prior-employer names as “feedback.”

### 2026-11-10 — Nickname on Verify
- **Sentiment:** positive direction (requested)
- **Surface:** join/auth
- **Signal:** Change Full Name to **Nickname** with live validation — no spaces or special characters.
- **Do:** Verify field = Nickname; live green/red status; letters, numbers, `_` only; 3–20 chars; welcome greets with full nickname.
- **Don't:** First Name, Last Name on Verify for journeys 1/5; allow spaces or special chars in Nickname.

### 2026-11-10 — UBC Account ID + nickname on leaderboards
- **Sentiment:** negative on email in UBC
- **Surface:** UBC / leaderboards
- **Signal:** Nickname on all leaderboards; UBC must not show email — show unique Account ID like B954663.
- **Do:** Profile `accountId` (B######) under Nickname in UBC + My Account; leaderboard “You” = Nickname.
- **Don't:** Show email under the name in UBC; use email or legal name on race boards.

### 2026-11-10 — My Account P&L vs Top 10
- **Sentiment:** positive request
- **Surface:** My Account / Performance
- **Signal:** Next to P&L, show how I perform compared to the top 10 best performing players.
- **Do:** Compact **vs Top 10** board beside Net P&L (nickname + net); your rank + gap to #1; sticky You row if outside top 10.
- **Don't:** Use email on the board; bury the comparison far from Performance.

### 2026-11-10 — Nickname wiped + Top 10 dumped in graph
- **Sentiment:** strongly negative
- **Surface:** My Account / UBC / Performance
- **Signal:** Nickname became “Player”; vs Top 10 table dumped into the P&L graph.
- **Do:** Persist nickname + accountId in localStorage; restore on remount. **Separate card** for vs Top 10 (own list + own chart) beside Net P&L — never nest inside the P&L chart.
- **Don't:** Clear nickname on refresh; show generic “Player” when accountId exists; jam Top 10 into the Performance graph column.

### 2026-11-10 — Account ID shown twice
- **Sentiment:** negative
- **Surface:** UBC / My Account
- **Signal:** Nickname missing; Account ID shown as both title and subtitle (e.g. B474432 / B474432). Signup nickname was stottiefingaz.
- **Do:** Title = Nickname only; subtitle = Account ID once. Persist nickname separately (`lumen-shell-demo-nickname`) and restore if profile wipe.
- **Don't:** Fall back display name to Account ID (duplicates the ID line).

### 2026-11-10 — Performance cards must feel like finance
- **Sentiment:** strongly negative
- **Surface:** My Account / Performance
- **Signal:** Cards look terrible; should look like a finance app. Nickname still showed as Account ID in vs Top 10.
- **Do:** Dense finance desk UI — uppercase micro-labels, tabular P&amp;L, profit/loss pill, metric strip, area chart with axes; vs Top 10 as ranked table with relative fill bars + nickname header. Reject Account ID masquerading as nickname.
- **Don't:** Nested chip soup; empty bar chart boxes; Account ID as the player name on the board.

### 2026-11-10 — VIP crowns on vs Top 10
- **Sentiment:** positive request
- **Surface:** My Account / vs Top 10
- **Signal:** On players show their VIP level crown.
- **Do:** Crown next to each nickname (and header), tinted with `VIP_LEVEL_COLOR`; your crown from shell `vipTier`.
- **Don't:** Plain nickname-only rows on the top performers board.

### 2026-11-10 — Player dossier modal from vs Top 10
- **Sentiment:** positive request
- **Surface:** My Account / vs Top 10
- **Signal:** Click a name → modal of that player — bets, sports they bet, casino games they play.
- **Do:** Clickable nickname opens glass dossier (sports mix bars, recent sports bets, casino games with net); VIP crown in header.
- **Don't:** Dead names on the board with nowhere to inspect activity.

### 2026-11-12 — BA workshop Activity variants
- **Do:** `/BA` lab with Casino / Sports / Mixed; filter pills (casino: none; sports: leagues + Parlays). No Mixed variant.; Live Wins only where casino tiles apply; PRD sheet for hover-pause + 900ms cadence.
- **Don't:** Invent a sports tile carousel; don’t put workshop Jackpot/Daily Race filters back on production lobby Activity.

### 2026-11-12 — BA sports activity (reject AI slop)
- **Don't:** CASINO / SPORTS product tags on rows; all sports bets shown as graded; flat "Event" text instead of sportsbook matchup; empty/missing VIP crowns.
- **Do:** Sports rows = pending | live (clock + score) | graded; teams stacked like soccer EventScoreboard (logo dots + home/away + score when live/final); every user has a crown; no product pills.

### 2026-11-12 — BA PRD portal + league fill
- **Don't:** Sheet/Radix PRD without body carve-out (opens under the shell). League filters with 2 seed rows leaving an empty table.
- **Do:** `data-ba-prd-root` portal + globals carve-out (same as dossier). Pad/expand sports pools so every league filter fills 8 live rows.

### 2026-11-12 — BA sports Status / logos / betslip
- **Don't:** Payout column for open sports bets; graded Final rows (dead click); empty logo dots; squashed team+score in one cramped line.
- **Do:** Status (Pending / Live); live+pending only; sportsbook matchup with real logos + score column; roomy Event cell; tap sports row → add selection to SoccerBetslip.

### 2026-11-12 — BA sports row density / score divide
- **Don't:** Oversized sports rows (empty belly under teams); scores stretched to the far edge of a wide Event column away from team names.
- **Do:** Sports row **6rem** (clock + teams + score need air — not casino 3.5rem, not empty belly). Event capped `min(42%,300px)`; score-only box aligned to team rows.

### 2026-11-12 — BA parlays in activity
- **Do:** Show multi-game bets as one row — `N-Pick` badge, primary matchup (+N more), Selection = “N-Pick Parlay” with leg preview; combined odds; tap adds **all legs** to betslip. Filter pill **Parlays**.
- **Don't:** Expand every leg as separate activity rows; invent a second table for parlays.

### 2026-11-12 — BA score box + parlay featured leg
- **Don't:** Hairline-only scores floating across the Event cell; vague “Live” on parlays with no clock for the shown game.
- **Do:** Box the score (`border` + `bg-secondary`) and keep it glued to the team stack (`inline-flex` / `w-fit`). Parlay meta = `N-Pick` + `+N more` + **featured leg’s clock + league** (prefer live leg) so it’s obvious why that matchup is shown.

### 2026-11-12 — BA score align + divides
- **Don't:** Floating score pill beside the stack (hard to map which number is which team); score not on the team row.
- **Do:** One matchup card — each score cell on the same row as its team; vertical divide teams|score; horizontal divide between the two team rows.

### 2026-11-12 — Casino Activity no Jackpot/Race pills
- **Don't:** Jackpot Winners / $25k Daily Race (or All Bets) filter pills above casino Activity — not on `/BA` Casino either.
- **Do:** Casino Activity = heading + table only (production rule). Race/jackpot live in VIP Hub / promotions.

### 2026-11-12 — BA score box = scores only
- **Don't:** Put team names inside the bordered matchup card.
- **Do:** Teams free outside; **score-only** box glued beside them; each score on its team row with a divide between the two numbers.

### 2026-11-12 — BA sports row height breathe
- **Don't:** Cram clock + two teams + score box into ~4.25rem so the row feels squashed.
- **Do:** Sports activity rows **6rem** (`h-24`) so clock + teams sit inside the row with air; no Event py that overflows the fixed height.

### 2026-11-12 — BA parlay hierarchy calm
- **Don't:** `N-Pick` badge/card in Event; stack pick + “+N more” + clock as one noisy meta; imply all parlays are live.
- **Do:** Event hierarchy = straight (when/league + matchup); Selection carries “N-Pick Parlay”; soft `+N more` under teams. Mix **pending** (kickoff, no score) and **live** parlays; Status column tells the truth.

### 2026-11-12 — BA sports row no clip
- **Don't:** Cram Event content taller than the fixed row (text crossing dividers); `+N more` under the matchup blowing the height.
- **Do:** Sports rows `h-24` / 6rem, Event vertically centered with no extra cell py; parlay Event = straight stack only — pick count in Selection.

### 2026-11-12 — BA parlays readable + no Mixed
- **Don't:** Strip all parlay cues so Event looks like a straight; keep a Mixed casino+sports table.
- **Do:** Event label plain text `N-Pick Parlay · +N` (no pill card) above the featured-leg clock; Selection still shows picks. Workshop = **Casino | Sports only** — separate tables, never interleaved.

### 2026-11-12 — BA parlay = stacked game logos
- **Don't:** Reuse the straight matchup (full team names + score) for parlays — too heavy and looks like a single.
- **Do:** Parlay Event = `N-Pick Parlay` + clock/kickoff + **stacked logo pairs per leg** (home/away overlap, no names). Live leg can ring lightly. Selection still lists picks.

### 2026-11-12 — BA Activity PRD eng handover
- **Do:** Keep `ACTIVITY_FEED_BEHAVIOUR.md` as the detailed eng PRD — why UI looks this way, casino vs sports split, parlay logo stacks, click → slip/launch, unhappy paths (unavailable / finished / odds / auth), component + file map.
- **Don't:** Leave the PRD as pause/play-only notes once sports Activity is in scope for build.

### 2026-11-12 — Soccer alternate spread/total lines
- **Do:** Spread + Total columns get an up/down (`IconSelector`) control → popover of alternate point pairs. Changing the line updates the board chips. If that side is already on the betslip, **replace** the slip line (same side, new points + odds) — don’t add a duplicate.
- **Don't:** Leave alt lines as a dead board-only toggle; don’t stack a second slip pick when swapping points on an existing selection.

### 2026-11-12 — Soccer board badges + alt-line menu position
- **Don't:** Grey placeholder dots for teams when crests exist; short alt-line chevron shorter than odds chips; Radix popover flipping **above** the trigger so picks aren’t selectable.
- **Do:** Real `/team` crests on the board; selector `self-stretch` to match odds height; alt-line menu via body portal with trigger staying put (list opens **left of** the arrow — see later entry).

### 2026-11-12 — Soccer alt-line portal carve-out
- **Don't:** Body-portal the alt-line menu with only Tailwind `z-*` — shell forces `position: relative` and the menu lands under/below the site.
- **Do:** `data-soccer-alt-line-menu` + globals carve-out (`:not` list + `position: fixed !important; z-index: 260`) like pick-a-game / PRD.

### 2026-11-12 — Soccer board score box + chevron hover
- **Do:** Live scores in a **score-only box** (same as BA activity — glued to teams, hairline between). Event chevron gets `hover:bg-accent hover:text-foreground` hit target.
- **Don't:** Bare floating score numbers + muted chevron with no hover.

### 2026-11-12 — Soccer alt-line menu left of arrow
- **Don't:** Drop the alternate-line popover centered **under** the selector so it covers the next rows and hides the arrow.
- **Do:** Open the menu **to the left of the arrow**, top-aligned with the trigger — odds get covered; **arrow stays visible on the right**. Keep body portal + carve-out so it stays above the shell.

### 2026-11-12 — Soccer score box spacing + alt-line vertical center
- **Don't:** Glue the score box to the team name (`gap-1.5`); use soft `rounded-md` on a short score column (reads too pill-like); top-align the alt-line menu so it hangs **below** the selector.
- **Do:** More air between names and score (`gap-3`); sharper score box (`rounded-sm`); alt-line menu **vertically centered** on the up/down arrows (and still left of them so the arrow stays visible).

### 2026-11-12 — Sports nav Lumen icons + My Bets ticket
- **Don't:** Leave A–Z / Top Sports on generic `star`; leave My Bets on the betslip `bets` mark when sub-nav uses ticket.
- **Do:** Extract Lumen `sports/*` SVGs into `public/shell/figma/sports/lumen/` and wire through `ShellIcon`; My Bets side nav uses `ticket` (same as sports sub-nav). Horse Racing had no Lumen mark — local monochrome fallback.

### 2026-11-12 — Sports icons optical size
- **Don't:** Drop edge-to-edge Phosphor sports SVGs into the sidebar at the same `size-5` as padded shell marks — they read huge.
- **Do:** Normalize Lumen sports icons to a 24×24 viewBox with ~0.75px inset — match Live Betting / Odds Boosters fill (3.75 was too small).

### 2026-11-12 — Sports sub-nav Lumen icons + alt-line scroll
- **Don't:** Keep Tabler balls on the sports sub-nav once Lumen sports marks are in ShellIcon; use native OS scrollbar on the alt-line menu; leave fill sports icons optically heavier than Live.
- **Do:** Sub-nav uses the same `ShellIcon` sports set as the side rail; alt-line popover uses `.shell-scroll`; sports SVGs match Live/Odds Boosters fill (~0.75 inset); Chris rejected the smaller pad.

### 2026-11-12 — Sports side-nav accordion + icon fill + Home active
- **Don't:** Leave Sports Home red-active on `/sports/soccer`; over-inset Lumen sport glyphs smaller than Live/Odds Boosters; leave Top Leagues / Top Sports / A–Z as static headings.
- **Do:** Sports Home active only on exact `/sports`; sport SVGs near edge-to-edge like Live/rocket (`~0.75` inset); collapsible headed sections (default open) in sidebar + drawer.

### 2026-11-12 — Side-nav section collapse ≠ FAQ accordion
- **Don't:** Chunky accordion triggers (hover wash on whole heading, abrupt mount/unmount). Don't hide the section chevron until hover — he wants it visible + hover state.
- **Do:** Keep the quiet section label; chevron **always visible** with hover wash on the hit target (not hide-until-hover); smooth height open/close (`grid-rows` / overflow clip).

### 2026-11-12 — Activity PRD feed configuration + Graded
- **Do:** PRD §14 — VIP/page/ratio/stake/lifecycle configs; propose variations; sports **Graded** filter for results (no slip-add). Soft “out of scope” for try-outs that stay configurable.
- **Don't:** Treat graded as forever banned, or mix settled into All without a config flag.

### 2026-11-12 — Graded = wins only + handover pack
- **Do:** Sports **Graded** filter shows settled **wins** only; rows non-clickable (finished). Ship `public/ba/HANDOVER.md` + PRD §0 so eng matches `/BA` with Lumen components.
- **Don't:** Graded lost/push in the win filter; clickable finished games; handover without a living `/BA` reference.

### 2026-11-12 — Graded Status = amount won
- **Sentiment:** negative
- **Surface:** /BA sports Activity · Graded Status column
- **Signal:** Status showed only “Won” — should show the amount won.
- **Do:** Graded Status = `toWin` in `text-success` tabular nums (e.g. `+$116.00`), same idea as casino payout.
- **Don't:** Bare label `Won` in the Status cell for graded rows.

### 2026-11-12 — BA All includes graded + preview files on CDN
- **Sentiment:** negative
- **Surface:** /BA sports filters + PRD path popovers
- **Signal:** Prod still “Could not read file”; graded only on Graded tab — wants graded in All filters too.
- **Do:** All + sport filters include graded wins; ship previews under `public/ba/preview/` (static) + API bundle fallback.
- **Don't:** Hide graded from All; rely on serverless `readFile` of source for PRD chips.

### 2026-11-12 — PRD sheet: no private paths, no red links
- **Don't:** Link chris-taste / FEEDBACK_LOG / agent-only paths in the BA PRD sheet; style doc links with `text-primary` (reads as error red); leave handover in a separate .md the sheet barely shows.
- **Do:** Self-contain handover in the PRD body (§0); sheet subtitle plain muted; render markdown with bold/code/tables nicely.

### 2026-11-12 — PRD copy + Future Feature + path preview
- **Don't:** AI-slop PRD voice; `Future Feature` badge on Live Wins; dead private paths in the sheet; non-clickable path chips with nowhere to go.
- **Do:** Tight eng PRD; no Future Feature tag; `` `path` `` chips open a preview box via `/api/ba-artifact`.

### 2026-11-12 — PRD download + solid preview + copy
- **Don't:** Preview file boxes with `bg-card` (dark = transparent wash); leave handover without a downloadable pack; preview without Copy.
- **Do:** `bg-popover` solid preview; **Download package** zip at PRD top; **Copy** on artifact preview.

### 2026-11-12 — Figma PropShopX handover rejected (wireframe)
- **Sentiment:** negative
- **Surface:** Figma handover / sportsbook Spread→betslip
- **Signal:** Figma looked nothing like production — no shell, wrong arrows, thin section wireframe, not Figma-to-code ready. Wants full sportsbook identical to live, journey focused on spread/alt points, anatomy OK but advanced.
- **Do:** Full Shell (header + side-nav + sub-nav + board + betslip); match live `/sports/soccer` pixel-close; real IconSelector (Tabler selector / up-down), Lumen tokens + Shell library; capture live into Figma then compose journey states; document path + anatomy for eng.
- **Don't:** Wireframe-only “handover” frames; invent ⇅ text instead of the product selector icon; omit shell chrome; ship a lonely market card as the “design.”

### 2026-11-12 — Figma capture missing Lumen tokens + Intercom blocker
- **Sentiment:** negative
- **Surface:** Figma handover / PropShopX
- **Signal:** Live HTML capture has no Mode token bindings (raw #FAFAFA 5% fills); icons black/broken squares; IntercomFab frame covers whole screen and blocks Dev Mode; journey incomplete (need menu w/ slip closed, mobile/breakpoints, animations, components).
- **Do:** Strip Intercom overlays from captures; bind Mode variables (not hex); full path frames including points-open + slip closed; mobile + breakpoints; components/animations inventory; Shell icons from library.
- **Don't:** Ship unbound capture hex as “Lumen”; leave IntercomFab covering frames; stop at one thin desktop page.

### 2026-11-12 — PropShopX still not on Lumen tokens
- **Sentiment:** negative
- **Surface:** Figma handover / PropShopX / SPREADS odds cells
- **Signal:** “its also not using lumen tokens” — selected alt-line button still showed hard radius `8` + fill `#FAFAFA` @ 5%, not Mode.
- **Do:** Rebind all journey paints to Mode (`opacity/secondary/10`, `color/border`, `border-radius/md`, `color/foreground` / `muted-foreground`); document on Components + Tokens page; treat unbound capture hex as broken until rebound.
- **Don't:** Leave capture defaults visible in Dev Mode; call it Lumen when the right panel shows raw hex.

### 2026-11-12 — /BA prod popovers empty (tokens / path chips)
- **Sentiment:** negative
- **Surface:** /BA PRD sheet path previews (+ Design Agent Skills on hosted)
- **Signal:** Local OK; prod popovers open with no content for tokens / paths / skills.
- **Do:** Bundle BA artifacts into imported module at prebuild (`bundle-ba-artifacts.mjs`); NFT-include `.agent-kit/**` for Skills APIs. Never rely on bare `fs.readFile` of untraced source on Vercel.
- **Don't:** Assume `process.cwd()` source trees exist in serverless the way they do in `next dev`.

### 2026-11-12 — PropShopX worse than ever (capture ≠ Lumen)
- **Sentiment:** negative
- **Surface:** Figma handover / PropShopX
- **Signal:** File is a mess of grey icon squares / thin unbound layers — “we used Figma MCP to build sports so tokens should be 1:1 — what the hell is this.”
- **Do:** Explain: HTML capture flattens SVGs→IMAGE + drops Mode bindings. Rebuild handover with Lumen DS instances from the same library the live site uses; quarantine captures as refs; delete when rebuilt.
- **Don't:** Keep polishing capture frames as if they were the design system.

### 2026-11-12 — Soccer alt-line slot reel
- **Sentiment:** mixed
- **Surface:** Soccer Spread/Total alternate lines
- **Signal:** Selected line should stay on the event-row axis (red ring); scroll must never leave the ring between two rows; click smooth-scrolls into centre like a slot reel.
- **Do:** Fixed destructive ring locked to selector/odds Y; mandatory snap on a fixed stride (no flex gap); open with active line in ring; click → smooth scroll to ring then apply; settle-correct if scroll stops mid-tick. See `SOCCER_ALT_LINES.md`.
- **Don't:** Free-scroll list where the highlight drifts off the board row or sits in the gutter between lines.

### 2026-11-12 — Alt-line size match + one scrollbar + tap-to-roll
- **Sentiment:** negative
- **Surface:** Soccer Spread/Total alternate lines
- **Signal:** Popover odds smaller than event-row (visible shift on open); two scrollbars clashing; don’t like fixed reel frame — red = current selection; tap rolls into place then closes.
- **Do:** Measure board chip pair for exact W/H; same OddsButton chrome; open overlays board chips with zero shift; red outline on selected only; tap → smooth scroll into board slot → apply/close; single inner list scroll, scrollbar hidden; menu shell overflow hidden.
- **Don't:** Smaller popover chips; outer+inner scrollbars; free-scroll fixed ring that drifts off the event row.

### 2026-11-12 — Alt-line empty spacers + clipped red
- **Sentiment:** negative
- **Surface:** Soccer Spread/Total alternate lines
- **Signal:** “terrible” — big empty gaps top/bottom in the scroll; red selection clipped at the popover edge.
- **Do:** Compact list only (no padY spacers); short list repositions menu so active row = board chips; inset red (`shadow inset`) so ring isn’t clipped.
- **Don't:** Fake top/bottom spacers for a middle “slot”; outer `outline`/`ring` that gets chopped by `overflow: hidden`.

### 2026-11-12 — Alt-line: one team at a time, no red stroke
- **Sentiment:** negative
- **Surface:** Soccer Spread/Total alternate lines
- **Signal:** Popover was swapping both teams' lines on one tap. Left side = team A, right side = team B — change only the one tapped. Remove the red row stroke; use the same hover/selection as the event row.
- **Do:** Each popover chip is its own button; tap updates only that side on the board + slip. Chips reuse `OddsButton` hover + primary selected fill. See `SOCCER_ALT_LINES.md`.
- **Don't:** Whole-row pick that moves both sides; destructive inset ring around the row.

### 2026-11-12 — Alt-line: main line centred, pair moves, tapped pick to slip
- **Sentiment:** negative (correcting the per-side change)
- **Surface:** Soccer Spread/Total alternate lines
- **Signal:** “what we did was wrong” — main/default line must be the centre row; higher lines above, lower below (4.25, 4, 3.75, **3.5**, 3.25…). Tapping an option updates the **pair** on the event row and adds the **tapped** pick to the betslip.
- **Do:** Sort rows high → low; active board line overlays the board chips; tap → pair on board + tapped pick on slip (replace existing leg for that event market). See `SOCCER_ALT_LINES.md`.
- **Don't:** Per-side line state that moves only one team on the board; ascending lists; tap that changes the board without adding the pick.

### 2026-11-12 — Alt-line reopen: anchor on main line, not selection
- **Sentiment:** mixed (first open “perfect”)
- **Surface:** Soccer Spread/Total alternate lines
- **Signal:** On reopen the menu re-centred on the red (picked) line; main line must always be centre.
- **Do:** Anchor the menu on the main/default row every open; selection only changes chip fill.
- **Don't:** Re-anchor the ladder on the picked / board line.

### 2026-11-12 — Betslip: one selection per market
- **Sentiment:** neutral (new rule)
- **Surface:** Soccer betslip (board chips + alt-line popover)
- **Signal:** Only one market selection per market can be on the betslip; a newer pick updates the existing leg (Spread −1 (−110) → −2 (−115) shows only −2 (−115)).
- **Do:** Replace the leg in place for same event + market; different markets still stack into a parlay.
- **Don't:** Stack two picks from the same market (e.g. home + draw, or two spread lines).

### 2026-11-12 — No Asian handicaps; American lines + odds
- **Sentiment:** negative
- **Surface:** Soccer Spread/Total alternate lines
- **Signal:** Remove all x.25 / x.75 lines — should be American.
- **Do:** Half/whole-point ladders (±0.5 steps); valid American prices only (≤ −100 / ≥ +100), priced via implied probability.
- **Don't:** Quarter (Asian) lines; prices between −99 and +99.

### 2026-11-13 — Site version switch lives in Laura's arrival message
- **Sentiment:** negative (moved)
- **Surface:** Site versions (V1, V2, …)
- **Signal:** Version toggle in the UBC was wrong — UBC only shows when logged in and skips onboarding.
- **Do:** On arrival (once per browser session), Laura's Intercom card says "You're viewing V1 · Current site." and lists other versions; tapping one saves it and reloads the site in that version. Registry: `lib/lumen/site-versions.ts`.
- **Don't:** Put the version picker in the UBC / account drawer, or behind login.

### 2026-11-13 — Version pop every landing + always in Intercom Home
- **Sentiment:** negative (once-per-session was wrong)
- **Surface:** Laura site-version arrival card
- **Signal:** "Pop only showed once and now I can't access it."
- **Do:** Pop on every landing with the messenger pop sound (like other Laura messages); keep the version list permanently in Intercom Home.
- **Don't:** Gate arrival messages behind sessionStorage "seen" flags, or leave a setting reachable only from a one-shot pop.

### 2026-11-18 — No auto-open Intercom for site version
- **Sentiment:** negative
- **Surface:** Laura site-version arrival pop
- **Signal:** "Intercom keeps popping up repeatedly — don't make it trigger open; I can go to Home manually."
- **Do:** Keep the version list in Intercom Home only; player opens it.
- **Don't:** Auto-open Intercom on every landing for informational messages (version, settings). Reserve auto-open for earned moments (welcome after join, level-up, VIP match).

### 2026-11-18 — V2: Challenges, Raffles, Races in Promotions side menu
- **Sentiment:** neutral (new direction, refs supplied)
- **Surface:** V2 site version · Promotions sidebar
- **Signal:** Wanted V2 with Challenges (Winna grid), Raffles (Rainbet weekly raffle), Races (Winna daily race podium + leaderboard) in the side menu.
- **Do:** Gate new features behind `useSiteVersion() === 'v2'`; translate peer layouts into Lumen cards/Tabs/tokens and BOL red banner art; reuse CasinoGameTile, RankCrest, toast, openAuth.
- **Don't:** Change V1 navigation when building V2 features; clone Winna/Rainbet blue/gold chrome or crypto coin icons.

### 2026-11-18 — Hates image-banner heroes on V2 promo pages; Challenges underwhelming
- **Sentiment:** negative
- **Surface:** V2 Raffles / Races / Challenges heroes + challenge cards
- **Signal:** "I hate the banners you made, layout can be cleaner, challenges looks underwhelming." Ref: Rainbet Casino Challenges (centered icon hero, horizontal cards with Play Game).
- **Do:** Use `PromoPageHero` — bordered card, soft primary radial glow, 64px primary icon tile, centered title with `text-primary` accent word, short subtitle, centered countdown/tabs/CTA beneath. Challenges = horizontal cards (art left; title, objective with bold numbers, Prize/Provider rows, full-width "Play Game" primary button that launches the game).
- **Don't:** Put promo art JPGs behind a black gradient with glass countdown overlays as page heroes; ship portrait-tile-only grids for challenges with no clear CTA; add a separate page h1 above a hero that already says it.

### 2026-11-18 — Races simpler (V1 card structure), raffle hero too tall, perforated tickets
- **Sentiment:** negative (refine)
- **Surface:** V2 Races / Raffles
- **Signal:** "Daily race can simplify like Rainbet and structure more like our daily race cards; raffle banner is so tall; tickets should be perforated."
- **Do:** Races = page h1 + Daily/Weekly tabs on the right → V1-style status card (title + mono clock, Position / Wagered / Current Prize cells) → leaderboard. Raffle hero = `PromoPageHero compact` (one row: icon + title left, countdown + CTA right). Tickets = stub + dashed perforation + half-moon notches, "Draw #N" over the number.
- **Don't:** Tall centered heroes or top-3 podium cards on races; flat pill tickets.

### 2026-11-18 — Red stroke + glow on promo hero = "AI slop, harsh"
- **Sentiment:** strong negative
- **Surface:** V2 Raffle / Race top cards
- **Signal:** "Looks shit, AI slop, not clean, why the stroke, where is the subtleness, so harsh."
- **Do:** Keep the standard card (`border-border`, normal shadow). If adding atmosphere: a faint primary wash (~9%) in one corner and a near-invisible slow sheen (foreground ~3%, 9s). Claimed/confirm state = quiet muted text + small success check.
- **Don't:** Primary-tinted borders, inset red hairlines, outer red glows, big glowing icon shadows, bordered success chips. Subtle > loud, always.

### 2026-11-18 — No red accent words in headings; promo heroes = homepage hero style
- **Sentiment:** negative
- **Surface:** V2 Raffles / Races / Challenges headers
- **Signal:** "I hate the red text on headers only, we don't do this anywhere else. Look how clean our homepage 'Built for winners' banner is — same style."
- **Do:** `PromoPageHero` = solid `bg-primary` banner, `rounded-[14px]`, Figtree 900 white title, white/95 subtitle, white Register-style CTA (`PROMO_HERO_CTA`), `bg-black/20` tiles for icon / countdown cells / stats. Same recipe as `home-hero.tsx`.
- **Don't:** Two-tone headings ("$20K **Weekly Raffle**" in red), dark card heroes with red glows, coloured accent words anywhere in titles.

### 2026-11-18 — No icon tiles next to promo hero titles
- **Sentiment:** negative
- **Surface:** V2 Raffles / Races / Challenges banners
- **Signal:** "Remove the icons next to the headers on raffles races and challenges."
- **Do:** Promo hero is type + CTA + countdown only (homepage "Built for winners" density).
- **Don't:** Ticket / trophy / target icon chips beside the title.

### 2026-11-18 — V2 Promotions arrival product tour
- **Sentiment:** positive (requested)
- **Surface:** V2 /promotions
- **Signal:** On V2, arriving at Promotions should run a product tour for Challenges, Raffles, and Races (new Daily Race location).
- **Do:** Once per browser (`lumen-tour-seen-v2-promotions`); spotlight sidebar/drawer `data-tour` hooks; open mobile drawer for targets; short COPY.md facts.
- **Don't:** Auto-open Intercom for this; re-fire every visit; point Races at VIP Hub in this intro.

### 2026-11-18 — Promo tour needs welcome + no AI slop / no dashes
- **Sentiment:** negative
- **Surface:** V2 Promotions product tour
- **Signal:** "Not very welcoming, introduce with party emoji then where to find them; remove AI slop text and dashed, I keep telling you."
- **Do:** Open with centred 🎉 welcome ("What's new" / short fact / Let's go); then spotlight Challenges → Raffles → Races with one-line facts. Progress = equal dots (not elongated dashes). No em-dashes in player copy.
- **Don't:** Jump straight into a cold nav spotlight; pitchy multi-clause bodies; em-dash lines; stretched pill "dash" progress.

### 2026-11-18 — Soccer event view (live + pre-match), V1
- **Sentiment:** negative on the reference, positive on the direction
- **Surface:** `/sports/soccer/event/[id]` (opens from board team names / row chevron)
- **Signal:** "The reference design is shit; live shows live stream + match tracker on the right; highest quality, look at bet365; build on V1."
- **Do:** Markets left, sticky rail right (lg+): live = Live Stream / Match Tracker tabs + Stats / Timeline; pre-match = Who wins? + Form + Head to head + Match info. Mobile: media in-flow above the market pills. Ladders show main line ±1 with "Show all N lines". One shared slip store across board + event view.
- **Don't:** Asian handicaps or quarter lines; wall-of-rows all-open ladders; a homemade stream clip from another sport; gate this behind V2.

### 2026-11-18 — Event rail under sub-nav, alt points, NFL + slip + My Bets
- **Sentiment:** negative (rail), positive (scope requested)
- **Surface:** event view, `/sports/football`, betslip, `/sports/my-bets`
- **Signal:** "The side panel is going under the sub nav, should stick before"; wants alt points dropdown for goals; NFL league + event; straights / parlays / SGPs in slip and My Bets; confirmation; "product owner prototype: don't use design, just the content."
- **Do:** Stick to `--shell-chrome-h`; reuse `AlternateLinePicker` on the event view; one generic event view per sport model; auto SGP / parlay in one slip; neutral Pending pill. See `US_SPORTS_BETSLIP_MY_BETS.md`.
- **Don't:** Hardcoded sticky tops; copy the prototype's look; slip mode tabs; red Pending pills.

## 2026-11-18 — Sports round 2 (negative)
- Don't: US grid board ("looks awful") → Do: league cards with column rail (header over two chips), See All + Show N More.
- Don't: text tabs for Live Stream / Tracker → Do: square icon buttons like bet365.
- Don't: bespoke My Bets ("looks shocking", broken on mobile) → Do: reuse Bet History table/figures/expand patterns.
- Don't: auto-pop the betslip on route changes → Do: open only on first pick.
- Don't: accordion hover touching content → Do: inset hover with spacing.
- Do: team names above alt-line popup; spinner on sub-nav taps.

## 2026-11-18 — Sports round 3 (negative)
- Don't: clustered football odds → Do: gaps per market + period dividers like soccer.
- Don't: empty betslip after removing last pick → Do: close it.
- Don't: alt-popup labels touching chips; pitch touching panel edges → Do: spacing.
- Don't: blue links in My Bets; boxed figures card top → Do: muted links; pill tabs + flat stats strip.
- Do: All Football tile; live score + clock on My Bets live legs.

## 2026-11-18 — Football board style (negative)
- Don't: period dividers / stacked chip columns on the football board → Do: copy the soccer board layout (header over side-by-side chips, gap between markets).
- Correction: keep the American top/bottom stacking, but with the soccer chip style and spacing. Not side-by-side chips.

## 2026-11-18 — Event markets (negative)
- Don't: put every ladder behind the alt popup → Do: full-list layouts for Asian Handicap, Goal Spread 3-way, team totals per team, 1H correct score.

## 2026-11-18 — Live glow + outrights (negative)
- Don't: red border / glow on live cards → Do: faint left-edge red wash only.
- Don't: short outright list cards → Do: searchable grid, top 12 + Show all.
- Don't: hide the betslip after navigation → Do: always show the collapsed dock when picks exist.

## 2026-11-18 — Sports Home (positive / locked)
- Do: `/sports` real home — casino banners, Popular live mix (soccer+NFL) with ML % bar, sleek SGP pack shelf (whole pack → slip as one SGP), Games/Outrights/All Leagues, Premier League then NFL boards, Live Wins + betslip.
- Don't: redirect Sports Home to soccer; invent PropShopX chrome; put SGP packs as single-leg adds; Sports Home sidebar active off exact `/sports`.
- See `SPORTS_HOME.md`.

## 2026-11-18 — Sports Home round 2 (negative)
- Don't: wrap banner row in extra padding (clips banners); rainbow green/amber/red % bars; static Popular cards; home-only board copy missing market titles/odds; SGP leg list with abbreviations; SGP shelf above the boards.
- Do: banner row owns its gutters; monochrome ML bar; casino-tile spring hover on Popular; reuse soccer `SoccerLeagueBoard` + NFL `LeagueCard`; SGP timeline cards with full selection copy + board odds chip; SGP below Premier League. See `SPORTS_HOME.md`.

## 2026-11-18 — Sports Home round 3 (negative)
- Don't: invent shelf icons / put them in a square card; Games/Outrights/All Leagues + filter icon on Sports Home; invisible grey bar segments; aggressive hover lifts; flat SGP headers with no hierarchy.
- Do: Figma shooting-star Popular icon bare; Starting Soon / Live / Not Started; sport chips on Popular; live red glow on live cards; Odds Boosts carousel under SGP; solid grey secondary bar; subtle hover on all cards; event plate behind teams + chevron. See `SPORTS_HOME.md`.

## 2026-11-18 — Sports Home round 4 (negative)
- Don't: blank red circles for selected SGP legs; cards that navigate with no feedback; status pills on Sports Home (for now).
- Do: ticked nodes; banner-style preloader on Popular / SGP / Boost cards when opening an event.

## 2026-11-18 — My Bets tabs
- Do: All first in the status pill track (All → Pending → Settled); default All.

## 2026-11-18 — Mega Parlay icon
- Do: sports sidebar Mega Parlay uses Lumen DS hexagon **MP** mark (`ShellIcon megaParlay`, `public/shell/figma/sports/mega-parlay.svg` from 52196:37903) — not the users/people glyph.

## 2026-11-18 — Event Back
- Do: from Sports Home → event → Back lands on `/sports`. Same for soccer/football/My Bets.

## 2026-11-18 — Betslip underfunded
- Do: **Deposit to place bet** when balance < stake; open cashier. Don't place on $0.
