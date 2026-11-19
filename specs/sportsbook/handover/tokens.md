# Tokens (Lumen)

Resolve through the Lumen variables (Mode collection: Light `82:0` / Dark `3686:0`; Themes: BetOnline / SportsBetting / LowVig). Never hard-code the values.

| Role | Lumen token | Where |
|---|---|---|
| Page background | `color/background` | page |
| Card surface | `color/card` + `color/border` (1px) + shadow `0 0 16px shadow/color @6%` | every card, board, market card |
| Card radius | `border-radius/lg` (10px) | cards |
| Inner plate (teams) | `color/secondary` | SGP / boost event plate |
| Text primary / muted | `color/foreground` / `color/muted-foreground` | — |
| Selected odds | `color/primary` + `color/primary-foreground` | odds button, SGP leg discs, betslip count |
| Live | `color/destructive` (clock, LIVE pill, ping, slip live dot) + wash `destructive @7% → transparent 22%` (left edge) | live cards, rows, event header |
| Price up / down | `color/success` / `color/destructive` | tick triangles |
| Place button | `color/success` + `success-foreground`; deposit state `color/primary` | betslip |
| Odds changed | `color/warning` (@14% bg, icon full) | betslip note |
| Suspended | `color/secondary` + `muted-foreground` + lock | odds button |
| Header / footer | `color/header`, `color/footer` (always dark) | shell |
| Sub-nav glass | Light `color/container` @72% · Dark `color/header-inverted` @72% | sub-nav |
| Spacing | `spacing/1…6` (4px scale) — card padding `spacing/3` (12), legs `spacing/4` (16) | — |
| Type | Figtree; Tailwind styles `XS/Regular` (meta), `SM/Medium` (legs), `SM/Semi Bold` (team), `XL/Bold`, score 40/52 Bold | — |
