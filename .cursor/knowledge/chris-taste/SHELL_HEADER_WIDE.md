# Shell header on ultra-wide

**Source:** Chris, Oct 2026 — “lets try” aligning balance / VIP / UB with content.

## Rule

Header brand bar inner row uses the same column as page content + casino sub-nav:

`mx-auto w-full max-w-[1440px]` (+ `px-4` / `lg:px-6`)

On very large screens, balance / VIP / UB sit on the **content right edge**, not the viewport edge. Left brand + product nav move with the same column so they stay locked to the lobby grid.

Full-bleed stays on the header shell (`bg` + `border-b`); only the controls row is capped.

## Do not

- Do not pin balance/VIP/UB with absolute `right: 0` on the viewport.
- Do not invent a second max-width — keep **1440** with sub-nav / `ShellFrame` content.
