# Activity feed — eng PRD

**Match `/BA`.** This sheet + the workshop UI are the handover. Casino Activity already ships; sports Activity is net-new.

---

## 0. Build from these

| What | Path |
|---|---|
| Workshop | `app/BA/page.tsx` |
| UI | `components/lumen/ba-workshop-page.tsx` |
| Data / filters | `lib/lumen/ba-workshop.ts` |
| This PRD | `public/ba/ACTIVITY_FEED_BEHAVIOUR.md` |
| Casino Activity | `CasinoActivity` in `casino-lobby-page.tsx` |
| Live Wins | `casino-live-wins-carousel.tsx` |
| Betslip | `soccer-betslip.tsx` + `useShell()` |
| Tokens | `app/lumen.css` |

**Lumen only:** `Typography`, `Button`, shell toasts, semantic tokens (`bg-card`, `border-border`, `bg-secondary`, `text-muted-foreground`, `text-destructive`, `text-success`, `surface-muted-1`). No new greys.

**Promote from workshop:** `TeamLogo`, `MatchupBoard`, `MatchupCell`, `ParlayLegStack`, `ParlayMatchupCell`, `ParlaySelection`, `SportsStatus`, `PlayToggle` / `WorkshopFilterTrack`.

### Spot-check vs `/BA`

- [ ] Casino = heading + table (no Jackpot / Race pills)
- [ ] Casino rows `h-14`; sports `h-24`
- [ ] Straight: logos + names; score-only box when live / Graded Final
- [ ] Parlay: `N-Pick Parlay` + stacked logo pairs (no names)
- [ ] Graded = **wins only**, Final, Status = **amount won** (e.g. `+$116.00`), **not clickable**
- [ ] ~900ms tick; hover pauses; header play/pause
- [ ] Crown on every user

### Order of work

1. Align prod `CasinoActivity` to `/BA` Casino if needed  
2. Ship sports Activity from workshop → sports lobby / homepage  
3. Open rows → `SoccerBetslip`; Graded stays display-only  
4. Config (§14) behind flags — default All = open bets  

---

## 1. Purpose

Live stream of recent bets so the lobby feels busy — without noise.

| Goal | How |
|---|---|
| Discover | Social proof of what’s being played / bet |
| Activate | Tap → game launch or betslip |
| Trust | Open bets are actionable; Graded wins are finished and not clickable |

Casino and sports stay **separate**. No Mixed table.

---

## 2. Scope

**In**

- Casino Activity (prod + `/BA`)
- Sports Activity (`/BA` → prod sports surfaces)
- Live Wins (casino tiles only)
- Tap → launch / add to slip
- Unhappy paths when market / game is gone

**Out (default chrome)**

- Jackpot / Daily Race pills above Casino Activity
- Sports Live Wins carousel
- HoverCard on Activity rows

**Config / try-outs (§14):** Graded wins filter, VIP rules, ratio/stake/page filters. Not a Bet History replacement.

---

## 3. Settled UI rules

### Casino vs Sports

| | Casino | Sports |
|---|---|---|
| Job | Launch game | Build slip |
| Live Wins | Yes | No |
| Filters | None | All · Parlays · Graded · leagues |
| Row height | `h-14` | `h-24` |

### Status

| Status | Meaning |
|---|---|
| Pending | Not started — kickoff, no score |
| Live | In play — clock + score (straights) |
| Amount won (e.g. `+$116.00`) | Graded filter only — Final + score; success color; **not clickable**. Never the bare word `Won`. |

Default **All** / leagues / Parlays = open only. Do not mix Graded into All without a config flag.

### Straight

- Logos + names stacked  
- Score in a **box** only (aligned to team rows, hairline between)  
- Meta = clock/kickoff + league  

### Parlay

- Label: plain `N-Pick Parlay`  
- Stacked logo pairs (no names); live leg gets light destructive ring  
- Cap **4** stacks + `+N`  
- Tap adds **all** legs  

### Casino

Activity = heading + table. No All Bets / Jackpot / Race pills.

---

## 4. Anatomy

- Title: `Activity` (`Typography` h4 semibold)  
- Card: `rounded-[10px] border border-border bg-card shadow-[0_0_16px_rgba(0,0,0,0.06)]`  
- Visible rows: **8**  
- Row hover: `hover:bg-surface-muted-1`  
- Crowns: gold / purple / silver — never empty  

**Casino columns:** `User | Game | Bet Amount | Multiplier | Payout`  

**Sports columns:** `User | Event | Selection | Odds | Stake | Status`  
Mobile: Event | Status (Event carries parlay stacks).

**Sports filters:** `All · Parlays · Graded · NFL · NBA · Soccer · MLB · NHL`

- All → open straights + parlays  
- Parlays → open parlays  
- **All** (+ sport pills) → open bets **and** graded wins
- **Graded** tab → `won` only; Final; Status = amount won (`toWin`); no tap / no slip
- Open rows only → slip add; graded never tap  
- League → open bets in that sport (incl. parlays with a leg there)  
- Pad empty filters (`padFeedPool`)  

---

## 5. Files

### Workshop

| Piece | Path |
|---|---|
| Route | `app/BA/page.tsx` |
| Page | `components/lumen/ba-workshop-page.tsx` |
| Data | `lib/lumen/ba-workshop.ts` |
| PRD | `public/ba/ACTIVITY_FEED_BEHAVIOUR.md` |

### Reuse in prod

| Piece | Path |
|---|---|
| Casino Activity | `CasinoActivity` — `casino-lobby-page.tsx` |
| Live Wins | `casino-live-wins-carousel.tsx` |
| Betslip | `soccer-betslip.tsx` |
| Slip APIs | `useShell()` → `openSportsBetslip`, `setSportsBetCount` |
| Fly-dot | `flyBetDotToSlip` |
| Launch | `useShell().launchGame` |
| Score density | `EventScoreboard` on soccer page (straights) |
| Tokens | `app/lumen.css` |

### Data shapes (`ba-workshop.ts`)

```ts
BaCasinoRow
BaSportsRow      // straight — pending | live | won
BaParlayRow      // open multi
BaParlayLeg
BaOpenSportsBet = BaSportsRow | BaParlayRow
```

Map API → these. Graded wins only appear under the Graded filter.

---

## 6. Live cadence

| Surface | Tick |
|---|---|
| Activity | ~900ms |
| Live Wins | ~650ms |

Streaming = `playing && !hovered` (desktop hover on the **card**). Header toggle does not flip on hover. Mobile: `playing` only. Filter change reseeds; keep playing. Motion: `cubic-bezier(0.22, 1, 0.36, 1)`; honor reduced motion.

---

## 7. Clicks — happy path

**Casino:** game control → spinner → `launchGame`. No HoverCard.

**Sports straight:** row / selection → one slip pick → open betslip (+ fly-dot).

**Sports parlay:** add **all** legs → open betslip. Prefer fail-closed if any leg invalid.

**Graded:** no click. Game finished.

---

## 8. Unhappy paths

| Case | Behaviour |
|---|---|
| Market gone (all legs) | Toast `This bet is no longer available`; no zombie slip |
| Parlay partial invalid | Fail whole parlay; toast `One or more legs are no longer available` |
| Event finished mid-tap | Toast `This game has finished`; no dead board |
| Odds changed | Latest odds via existing slip rules |
| Suspend mid-slip | Existing betslip suspend UI |
| Casino unavailable | Clear spinner; toast `This game is unavailable` |
| Auth / geo / limits | Existing shell gates |
| Network fail | Toast `Couldn’t add bet — try again`; no empty slip |

---

## 9. Copy

- Short toasts — shell patterns  
- Status: `Pending`, `Live`, amount won e.g. `+$116.00` (Graded only)  
- Parlay: `{n}-Pick Parlay`  
- No CASINO / SPORTS row tags  

---

## 10. A11y

- Card = hover pause target  
- Play toggle: `aria-pressed` + clear labels  
- Parlay stacks: accessible matchup names  
- Touch targets work without hover  
- `prefers-reduced-motion`  

---

## 11. Acceptance

- [ ] Casino: table only — no Jackpot / Race / All Bets pills  
- [ ] No casino+sports mix; no sports Live Wins  
- [ ] Tick / hover pause / toggle / mobile  
- [ ] Crowns; no product pills on rows  
- [ ] Straight score box; parlay stacks; `h-24`  
- [ ] Graded = wins only, non-clickable  
- [ ] Straight / parlay → slip; Graded → nothing  
- [ ] Unhappy paths via toast + existing slip  
- [ ] Lumen tokens; filters never empty  

---

## 12. Open decisions

1. Parlay partial fail = fail whole (§8) unless trading says otherwise  
2. Sports Activity placement: lobby, homepage, or both  
3. Max parlay stacks before `+N` (workshop = 4)  
4. Which VIP tiers get Graded / high-ratio / stake floors (§14)  
5. Graded stays non-clickable (no event-recap deep link unless product asks)  

---

## 13. Related

`/BA` · this PRD · `CasinoActivity` · `CasinoLiveWinsCarousel` · `SoccerBetslip` · `app/lumen.css`

---

## 14. Feed config

Players should see different feeds by **VIP**, page, and bet quality. Don’t hard-code one query — ship a **config list**.

| Key | Examples |
|---|---|
| VIP level | Different pools / thresholds / filters |
| Product | Sports vs casino |
| Lifecycle | Open (`pending`/`live`) vs Graded wins |
| Page | Sport/league or casino category bias |
| Ratio to bet | Casino multi / payout÷stake floor |
| Stake | Min/max bands |
| Row kinds | Straights / parlays / graded |
| Cadence | Tick, row count (optional per tier) |

**Default:** open sports; casino table-only; Graded not in All.  
**Graded filter:** wins only; Final; Status = amount won; not clickable.  
**VIP packs:** ratio, stake, page bias, Graded — behind config.

### Variation sketches (propose, don’t invent silently)

1. Open-only (default)  
2. High-roller — higher stake + ratio floors; optional Graded  
3. Page-aware sports — bias to current sport  
4. Category-aware casino — bias to Slots / Live  
5. Results spotlight — Graded default or low-% mix (flagged)  
6. Ratio board — casino wins above ratio X  

### Config acceptance

- [ ] Config shape covers VIP × product × lifecycle × page × ratio × stake  
- [ ] Unset config = today’s default  
- [ ] Graded = wins only, non-clickable  
- [ ] 2–3 named packs signed off before coding  
