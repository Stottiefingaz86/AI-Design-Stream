# Sports V3 — traditional sports + prediction markets

**Source:** Chris, Nov 2026. V3 = Polymarket / Kalshi style content **added to** the V1/V2 sports product. Never a replacement.

## Hard rule (he corrected a replacement build)
- V3 keeps **everything** in traditional sports: banners, Popular, Same Game Parlays, Odds Boosts carousels, Premier League / NFL boards, outrights, event Live Stream + Match/Game Tracker + stats, every market tab, the **betslip**, Live Wins, and the full sports nav (Live Betting, Odds Boosters, Same Game Parlay, Mega Parlay).
- Don't strip "confusing" odds to simplify. Add the market layer on top.

## What V3 adds
- **Sports Home:** a `Markets` shelf (trends icon) under Popular. It holds a featured live market (chance chart, range tabs, Buy ¢ per outcome) with **Top movers** beside it on desktop, then a swipe rail of Yes/No question cards (% chance, 24h move, sparkline, `Yes 48¢` / `No 55¢`).
- **Event page:** a "Who wins?" card under the event header (chance chart, outcome rows with % and Buy ¢), plus Yes/No questions. The traditional markets carry on below.
- **My Bets → Portfolio:** nav, sub-nav and mobile dock say Portfolio (trends icon). The page is the full My Bets with an **account value hero** on top (value, move, Cash / Open bets / Open P/L, Deposit, value chart 1D/1W/ALL).
- Market buys use the trade sheet (amount, shares, payout, `Buy Yes · $x`). Bets land in the same bets store, so they show in Portfolio / My Bets.

## Style
- **Monochrome, same as the ML % bar.** Favourite line in `--foreground`, every other outcome `--muted-foreground`. No chart-1/chart-4 or rainbow lines. Price buttons use board odds-chip grammar: neutral idle, primary when selected. No green/red Yes/No buttons.
- Green/red only for movement and P/L text (`text-success` / `text-destructive`), with no tinted chip backgrounds.
- Carousels follow the shared rails (swipe on touch, glass arrows on fine pointer only, bleed to the gutter).

## Build notes
- Composition, not a fork: `SportsHomePage markets={<HomeMarketsShelf />}`, `SoccerEventPage/NflEventPage markets={<EventMarketsCard />}`, `MyBetsPage title="Portfolio" hero={<PortfolioHero />}`, switched by `V3Switch` on the server cookie.
- Body portals (trade sheet) need a `globals.css` carve-out (`[data-trade-sheet-root]`); without it the legacy `body > div` rule collapses them to 0px.

## Round 2 (Nov 2026)
- **Buy → betslip.** Market price chips (Buy / Yes / No) add to the normal `SoccerBetslip` — never open a trade side sheet. Toggle removes. Fly + dock reveal.
- **No side-column Buy block.** Featured / Who wins? stack: meta → teams → chance → full-width chart → range → full-width outcome rows (swatch · crest · name · % · Buy).
- **Line ↔ team.** Chart end gutter shows `SEA 59%`; each outcome row has a matching stroke swatch (solid favourite, dashed others). Still monochrome — no rainbow.

## Round 3 (Nov 2026)
- **My Bets stays My Bets** — never rename to Portfolio in chrome. V3 may still show the account-value hero on `/sports/my-bets`.
- **Betslip live legs:** clock (destructive) + score (bold) + event name when `live`.
- **Event ladders:** all alternate lines as a 2-col grid with Show all — no alt-line stepper on Alternate Spread / Total.

## Round 4 (Nov 2026) — featured card breath
- Don't crush the featured Markets card into striped `h-12` rows with Buy jammed on the far right and a short chart.
- Do: one padded card — header → chance → ~180px chart → range tabs under the chart → **moneyline as a 2-col outcome grid** (crest · name · % · Buy) → **More markets** as a 2-col Yes/No card grid.
- Rails: title in `px-4/6`, `HorizontalRail` full column width with its own gutter + snap (no nested `-mx` under shell `overflow-x-hidden`).

## Round 5 (Nov 2026) — sport pages + movers
- Football / Soccer mode pills include **SGP** (all packs for that sport).
- Under Games boards: **Odds Boosts** + **Mega Parlays** rails (sport-filtered), same cards as home.
- V3: sport-filtered Markets shelf under those promos.
- Top movers stays **packed** (`h-fit`); More markets spans full width under featured+movers — never stretch movers to featured height.

## Round 6 (Nov 2026) — Kalshi CTA + density
- Market CTAs are **chance pills** (`59%`), optionally with Yes/No short label — never “Buy 62¢”.
- Rows show **multiplier** (`1.61x`) left of the pill (from share price).
- Featured = one card: chart → moneyline rows → more-market rows. No nested card grids.
- Top movers: packed list (~9), `h-fit` — never stretch empty.

## Round 7 (Nov 2026) — sport sub-nav + featured polish
- Football/Soccer mode pills: **Games · SGP · Odds Boosts · Mega Parlays · Outrights · All Leagues**.
- Games view = league boards + **Markets at the bottom only** — never Odds Boosts/Mega rails there.
- Featured card keeps the roomy tile composition (2-col outcomes + more-market cards) with Kalshi % CTAs.

## Round 8 (Nov 2026) — side panel tabs + mega size
- Side panel: tab toggle **Movers / Volume / Live**; stretches to featured height (no void).
- Mega Parlays: minimum **4 legs**, cross-game, ticket-size odds.

## Round 9 (Nov 2026) — compact featured + topic filters
- Featured was too tall — **shrink it**: `h-fit`, ~104px chart, tight team/title header, dense outcome rows (multiplier + % pill). No roomy 2-col outcome tiles.
- Side panel: **`h-fit self-start`** again — never stretch into empty Live/Movers void.
- Home Markets category pills: **All · Football · Soccer · Entertainment · Politics** (demo topic markets for Entertainment/Politics). Football/Soccer pages stay locked to that sport (no topic pills).

## Round 10 (Nov 2026) — no More markets on featured
- Don't nest a “More markets” Yes/No block under the featured card.
- Featured stops at outcome rows; spread/total/props stay in the **Market questions** rail.

## Round 11 (Nov 2026) — movers context + Popular chip filters
- Movers/Volume/Live rows: never bare **Yes/No** — primary is `Yes · {question}`; topic rows use Entertainment/Politics marks (not minus circles).
- Markets category filters reuse **Popular chip grammar** (`h-8 rounded-lg`, secondary wash when on, ShellIcons) — not a red mode-pill track.

## Round 12 (Nov 2026) — Trending chip + side filter
- First category chip label = **Trending** (was All).
- Side panel: pill segmented **Movers | Volume | Live** + top-right **filter** popover for category; dense question-aware rows.

## Round 13 (Nov 2026) — featured Who wins? tiles + hover
- **Keep the main featured chart card** — never delete it for a tile row / invent extras under it.
- Featured bets = **event Who wins? tiles** (swatch · crest · % · mult · change · % pill) — not Winner|line|line columns.
- Card hover `border-foreground/15`; selected outcome tile `border-primary` + accent wash.
- Featured `min-h-[440px]`. No category filter on the side panel.

## Round 14 (Nov 2026) — movers = featured outer height
- Featured + movers grid: **`items-stretch`**; both cards **`h-full`**.
- Side list row count from `ResizeObserver` on featured (`ceil` fill, max ~20); list `flex-1 overflow-y-auto` so the **outer borders** always match — never leave the movers card shorter than featured.

## Round 15 (Nov 2026) — multi-outcome carousel
- Who wins? / featured option tiles: **≤2 = equal grid**; **3+ = one-row carousel** (swipe; desktop glass arrows) — same idea as Odds Boosts / Market questions. Never wrap a second row of options.

## Round 16 (Nov 2026) — category pills full width
- Markets category chips: **full-width** scroll track (`w-full min-w-0`), pad on the track — never nest so shell `overflow-x-hidden` crops mid-pill (e.g. “Entertainme…”). Same as Popular / sports sub-nav.
