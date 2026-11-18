# Last Game + Favourites + Continue Playing (logged out)

**Source:** Chris, Oct 2026.

## Copy

- Auth CTA label is **Login** (one word) — match shell header. Not “Log in”.
- Join CTA: **Join** (header) on lobby gates.

## Last Game Played (sidebar / dock)

- **Logged out:** no game thumb, no subtitle — blank last-game row. Tap → **Login**. Never show Chicken (or any seed game).
- **Logged in, never played:** no thumb; subtitle **Will show here**. Tap does not launch a fake game.
- **Logged in, after a real launch:** thumb + game title from that session (persisted while logged in).

## Continue Playing (casino + home)

- **Logged out:** remove the whole section (no gate, no carousel).
- **Logged in:** demo **last 10** rail (`CONTINUE_PLAYING`) + Play Random. Do not shrink to a single tile.

## Launch with $0 balance

- Logged in + balance ≤ 0 + tap a game → **open wallet (cashier)**. Do not launch.
- Exception: free-spins Play (welcome / Daily Spin spins) still launches.

## Lobby banners

- **Logged out:** hide **VIP Progress** and **$25k Daily Race** cards. Promo banners OK.

## Favourites (`/casino/category/favourites`)

- **Logged out:** empty grid + no-content icon + **Login** / **Join**.
- **Logged in, none saved:** empty + “Heart a game to save it here.”
- Never fill Favourites with seeded lobby tiles when empty / logged out.

## Churn rescue (“Tough run?”)

- Game picks = **wallpaper grid** (3-up Originals), not a side-scroll shelf.
- Don’t clip tile hover (favorite glass / play) — tiles `overflow-visible`; image keeps the radius.
