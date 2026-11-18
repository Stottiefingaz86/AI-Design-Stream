# Lumen codebase (`/lumen`) — settled preference

**Source:** Chris, Oct 2026.

## What it is

- **Lumen codebase** — extract library for the **Lumen design system** + what’s **live on the demo site** (`localhost:3000`). Not Storybook `:6006`.
- Nav structure mirrors **Lumen Storybook Coverage** (`src/components/lumen/Coverage.stories.tsx`):
  - 🎨 Foundations · ⚡️ Actions · 🛠️ Utilities · ⌨️ Inputs · 🔔 System States · 📊 Data Display · 🧭 Navigation · Others
  - Then product: Shell · Sheets · Promo & banners · Casino · Rewards · Account · Pages · Motion
- Sticky left nav · preview (device frame) · **Copy import** / **Copy code**.
- Top chrome: **light / dark** + **device view** (mobile / tablet / desktop) — device forces real chrome breakpoints via `GalleryDeviceProvider`.
- **No Demo / Design agent links** in the library header.
- **Previews never navigate to the demo** — freeze soft-nav; interactive openers use `data-lumen-allow`.

## Must include

- Full **foundations**: Typography, Colors, Logos, Screens, Icons (Lucide + ShellIcon), Favicons, Shadows, Radius.
- **Atoms / molecules** matching the Coverage inventory (Button → Timeline, Inputs, System States, etc.).
- **Live :3000 modules** — Shell chrome, promo/contest cards, casino/account/product pages as live previews (tabs), not filename ModuleCards.
- **Live modules only** for Rewards product UI = `LoyaltyRewardCard`. Never orphan `RewardCard` marketing card from unused `home-page.tsx`.
- Sticky chrome = phone frame + quick-links tuck/reveal on `#shell-scroll`.

## Design agent

Links → **Lumen codebase** → `/lumen`. Never Storybook `:6006`.

## Deploy

Do **not** deploy `/lumen` (or live-site) unless Chris explicitly asks.

## MCP (later)

A Lumen design-system MCP for agents/devs is desired — not required to ship gallery chrome first.
