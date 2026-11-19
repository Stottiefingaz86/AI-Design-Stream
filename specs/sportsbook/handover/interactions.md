# Interactions & motion

All motion is off under `prefers-reduced-motion: reduce` (cards don't lift, odds don't drift, no fly-dot; state changes are instant).

## Motion table

| Trigger | Element | Property | Duration / spring | Easing / token |
|---|---|---|---|---|
| Hover (fine pointer) | Home cards (live, SGP, boost) | `y −2`, `scale 1.01` | spring stiffness 300 · damping 30 · mass 0.8 | `CARD_SPRING` |
| Press | Home cards | fine: `y −1, scale 1.005` · touch: `scale .98` | same spring | — |
| Card tap → open event | Card | `LaunchOverlay` spinner paints on the card, then route swaps | until route ready | — |
| Odds tap (add) | Bet dot | flies from the button to the betslip target / dock | **720ms** (+80ms hit) | arc |
| Betslip open | Drawer | mount → `shown` after 24ms; unmount after **280ms** | 280ms | ease-out |
| Betslip leg enter | Leg row | `opacity 0→1`, `y −20→0` | 250ms (layout 250ms) | `[0.22, 1, 0.36, 1]` |
| Betslip leg exit | Leg row | `opacity →0`, `y →12` | 180ms | same |
| Betslip drag down | Drawer | follows finger; backdrop fades `1 − offset/320` | — | closes if drag > 80px **or** > 22% of height **or** velocity > 0.55 |
| SGP expand | SGP unit chevron | `rotate 180°` | 200ms | ease |
| Place success | Check disc | `scale .4→1` spring 320/18; check `scale 0→1, rotate −30→0` spring 400/16 (delay 120ms); title `y 10→0` (delay 200ms, 300ms) | — | — |
| Place success | Confetti | `fireJoinWelcomeConfetti()` 80ms after the receipt | — | Taste rule: confetti on wins/claims |
| Live price drift | Odds button | ▲ success / ▼ destructive, top-right 8px | shows **1.8s**; ticks every **3.2s**, 3 random prices | — |
| Live suspension | Volatile markets | lock state | open 10s → locked **4s**, repeat | — |
| Live pill | Ping dot | `animate-ping` | Tailwind default | — |
| Rail arrows | Glass chevrons | fade in/out at start/end | 200ms | fine pointer only |

## Keyboard & screen reader

- Every odds button is a real `<button>` (`data-pick-id`). **Gap:** prod doesn't expose the selected state to screen readers — add `aria-pressed={selected}`. Suspended prices render as a `<span aria-label="{label} suspended">`.
- Cards: `aria-busy` while launching. Rails carry `aria-label` ("Popular live games", "Same Game Parlay packs", "Odds Boosts"); arrows are "Scroll {label} back / forward".
- Betslip: `aria-label="Betslip"`, **Esc** closes, body scroll locks while open; drag handle `aria-label="Drag down to close"`; stake inputs labelled "Stake for {pick}".
- Live score: `aria-label="Score X to Y"`. Live dot in slip legs: `aria-label="Live"`.
- My Bets filter chips use `aria-pressed`.

## Sound / haptics

None on the sportsbook today. Confetti only on place success.
