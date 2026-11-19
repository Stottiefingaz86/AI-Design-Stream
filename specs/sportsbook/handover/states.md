# States

Breakpoints: **mobile 375** (`< lg`), **desktop 1440** (`lg+` = 1024). Every state ships in **Light and Dark** except the betslip (always dark).

| Component | States | Mobile vs desktop |
|---|---|---|
| **odds-button** (Lumen `OddsButton`) | default · hover (fine pointer) · pressed · **selected** (primary fill, primary-foreground text) · suspended (secondary fill, label + lock, not focusable as button) · live tick (▲ success / ▼ destructive, top-right, 1.8s; hidden when selected) · disabled | Same; min tap 44px tall on touch rows |
| **popular-live-card** (`PopularGameCard`) | default · hover lift (y −2, scale 1.01) · pressed (fine: y −1 / touch: scale .98) · loading (`LaunchOverlay`) · live wash | Width `min(340px, 85vw)`, height 160 |
| **sgp-pack-card** | default (hollow leg nodes) · **selected** (primary check discs + "Added to Betslip") · hover / pressed lift · loading · live (red wash + live clock) | Width `min(320px, 85vw)` |
| **odds-boost-card** | default · selected (Boosted button selected) · hover / pressed · loading · live | Width `min(320px, 85vw)`; "Was" price struck through, muted |
| **shelf rail** (`HorizontalRail`) | start (no prev arrow) · middle · end (no next arrow) | Touch: swipe only, no arrows. Fine pointer: glass arrows |
| **sport chips** | All / Soccer / Football; active = selected chip | Scroll on mobile |
| **league board** (Premier League, NFL) | expanded · collapsed ("Show more") · selected picks · live rows (red wash) | Desktop columns; mobile stacked market groups |
| **event-header** | pre-match ("Pre-match"/"Pregame", kickoff time + day) · live (LIVE pill, score 40/52px, clock destructive, goal scorers under team) | Score 40px mobile / 52px desktop |
| **event switcher / breadcrumbs** | closed · open (other games in the league) | Back chevron + crumbs |
| **market tabs** (`ModePillTrack`) | Popular / Goals / Halves / Corners / Cards / Players (soccer); tabs with no markets are hidden | Scrolls on mobile |
| **market-card** | open (first 5) · collapsed · suspended (live, volatile) · with selections · "Show more" lines | Same |
| **market bodies** | grid (2/3-way) · ladder (alt lines with picker) · list (with column heads, team groups) · players (team toggle) · US lines (spread/total/ML) · player lines (5 rows + Show more) · correct score (−/+ per team + full grid) | Same |
| **media panel** (live) | stream · tracker (pitch / field) · beat pill · muted / fullscreen | Desktop: sticky right rail. Mobile: under header |
| **live stats** | Stats tab (bars) · Timeline tab (incidents) | Desktop rail; mobile under markets |
| **pre-match side cards** | Win probability · Form (W/D/L chips) · H2H | Desktop rail; mobile in flow |
| **betslip** | closed + dock · open empty · open 1 pick · open multi (Straights) · **with SGP** (collapsed / expanded leg rail) · with Parlay (sticky) · odds changed · rejected leg · logged out · needs deposit · placing · receipt (all placed / partial) | Mobile: full-width bottom drawer, drag to close. Desktop: 375 card bottom-right; minimise → selection bar |
| **my-bets** | logged out · loading skeleton · all · pending (n) · settled · filtered · empty · row collapsed / expanded · live leg (score + clock) | Figures 2×2 on mobile, 4 across desktop |
| **status badge** | Pending · Won (+amount) · Lost · Push · Void | — |
