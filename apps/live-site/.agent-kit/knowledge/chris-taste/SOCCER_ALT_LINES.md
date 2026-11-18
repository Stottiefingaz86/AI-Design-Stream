# Soccer alternate lines (Spread / Total)

**Source:** Chris, Nov 2026.

## Rule

Spread and Total market pairs have an **up/down selector** that opens a popover of alternate points (home/away or over/under pairs).

## Betslip sync

If the main board pick is already on the slip and the player picks a new line from the dropdown, **update that slip leg in place** (new label + odds + id). Do not add a second leg for the same side.

## UI

- Trigger: `IconSelector` beside the two odds chips (Lumen tokens, not a custom grey).
- Popover: list of pairs; active line bordered with `primary`.
- Mobile + desktop both use the grouped market columns (swipe rail on mobile — no overlay chevrons for scrolling).

## Menu position

Open **left of** the selector (body portal), vertically centered on the arrows; if clipped, park just right of the trigger. Selector stretches to odds chip height. Board uses real team crests from `/public/team`.

## Figma handover

`Agent PropShopX` in the Lumen folder — https://www.figma.com/design/Sz7zOb4XwFViP2Ca5uyGnY/Agent-PropShopX?node-id=4-70&m=dev
