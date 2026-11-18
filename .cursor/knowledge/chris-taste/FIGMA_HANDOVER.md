# Figma handover (live-site → eng)

**Source:** Chris, Nov 2026 — rejected PropShopX wireframe.

## Hard rules

1. **Full shell** — header, side-nav, sports sub-nav, page content, betslip. Never a lonely market card.
2. **Identical to production** — **build with `use_figma` + Lumen library instances** (Mode tokens, sports icons, Shell/Button). `generate_figma_design` HTML capture is a **pixel layout ref only** — never the eng deliverable (it turns icons into grey IMAGE squares and strips Mode bindings). Quarantine/delete captures after rebuild.
3. **Real icons** — alt-line trigger = Tabler `IconSelector` (selector / up-down), not emoji or text arrows.
4. **Lumen + Shell** — Mode tokens on every fill/stroke/radius (odds cell = `opacity/secondary/10` + `color/border` + `border-radius/md`; never raw `#FAFAFA` / hard `8`). `<Button>`, Shell header/sidebar components. No Kraken/MUI.
5. **Journey focus** — for Spread alt-lines: board closed → menu open → line applied → slip updates in place. Anatomy/spec after the full screens.
6. **Figma-to-code ready** — named frames (`… | Desktop, Dark`), annotations for happy/empty/dismiss, component instances linked to the library.

## File

`Agent PropShopX` — Lumen folder — https://www.figma.com/design/Sz7zOb4XwFViP2Ca5uyGnY/Agent-PropShopX?node-id=10-38&m=dev

### Path frames (live captures)

| Frame | State |
|-------|--------|
| 01 | Board + shell + MUN spread on slip |
| 02 | Spreads menu open (IconSelector) |
| 03 | Alt line applied · slip updated in place |

Capture helpers (dev only): `/sports/soccer?handover=board|menu|updated`
