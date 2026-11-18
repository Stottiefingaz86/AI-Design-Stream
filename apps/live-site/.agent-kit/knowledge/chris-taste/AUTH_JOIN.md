# Join / Login (AuthModal) fields

**Source:** Chris, Oct–Nov 2026.

## Join order (shipped / journey 1)

1. **Email** + **Password** (+ optional referral + 18+ T&C). CTA **Next**.
2. **Verify** — Nickname + OTP (optional SMS). See Journey 5 notes (same step).
3. Welcome success → Let’s Go → `completeJoin`.

**Nickname is not on the join form** — only on Verify. No DOB at join.

## Nickname (Verify — journeys 1 / 5)

- Label / placeholder: **Nickname**
- Live validation while typing (green check / red X):
  - No spaces
  - No special characters — letters, numbers, and `_` only
  - 3–20 characters
- Errors: **Enter a nickname** / **No spaces** / **No spaces or special characters** / length messages
- Stored on profile as `fullName` (display handle). Welcome greets with the full nickname (`Welcome, Chris99!`).
- Not the same as journey **4** Username (which also checks availability) — Nickname is format-only live validation.
- **Leaderboards** (Daily Race etc.) show the Nickname on the “You” row — never email or legal name.
- On join, assign unique **Account ID** (`B` + 6 digits, e.g. `B954663`). UBC + My Account show **Nickname + Account ID** — **never email**.
- Persist Nickname + Account ID in `localStorage` (`lumen-shell-demo-profile`) so soft remount / refresh does not fall back to “Player”.

## Login

- Identifier label / placeholder: **Email or Customer ID** (not “Email or username”).

## Local-only journey lab (1 / 2 / 3 / 4 / 5)

**Hosted / prod:** always journey **1**. Lab control only on `localhost` / `127.0.0.1`.

**UI:** under **Referral Code** on Join (local only) — expand Referral → **one** code input. Type `1`–`5` in that field to switch journeys (no dropdown, no extra lab fields). Subtle `· lab N` on the Referral label only.

| Journey | Join form | Extra surfaces |
|---------|-----------|----------------|
| **1** (default) | Email → Password | **Verify** (Nickname + OTP) → welcome |
| **2** | Email → Password | Sports Place Bet → Full Name modal (required) |
| **3** | Email → Password | Compact progress card on My Account; VIP claim / sports / card cashier gated |
| **4** | Email → **Username** → Password | Username live availability (taken check). No Full Name. Same post-join as 1. |
| **5** | Email → Password | **Verify** step → then welcome success |

### Journey 5 — verify before welcome

1. Join: **Email + Password** (+ terms / referral). CTA **Next**.
2. **Verify** screen (modal chrome title **Verify** — not Login/Join tabs):
   - **Nickname** (live: no spaces / no special chars; letters, numbers, `_`; 3–20)
   - OTP (**5** square boxes only — no card wrapper; paste-friendly). Copy: *We sent a code to {email}.*
   - **I prefer to receive SMS** — auth-link label + rule + chevron (same expand as Referral). Collapse to dismiss. Phone never required.
   - When open: **one** auth Input (same frost as Email). Left overlay: **flag + dial ▾** (dial lives in the dropdown, not a second tone). Primary **Send SMS** beside. IP default via `/api/geo/country`. Demo **12345** after Send / Resend.
   - **Resend code** still available under the row.
   - CTA **Complete**
3. On success → existing welcome (**You’re in** / Welcome, {name}! / Let’s Go) → `completeJoin` + cashier.

Closing Verify without Verify does **not** create the account.

### Journey 4 — Username

- Label **Username** (not Full Name). Strip spaces while typing.
- Format: 3–20 chars, letters / numbers / `_` only.
- Live check (debounce ~320ms): spinner → green check / red X. Demo taken: `admin`, `betonline`, `chris`, `dealer`, `jackpot`, `player1`, `support`, `vip`, `winner`.
- Error when taken: **Username is taken**. Join blocked until available.
- Stored on profile as `fullName` (display handle). Welcome greets with the handle.
- Sports / VIP gates: same as journey 1 (no name gate).

### Journey 3 levels

1. Email + password + phone → crypto deposit/withdraw, casino play, **no sports**
2. DOB + Full Name → reward perks + sportsbook
3. Address → CC deposits & non-crypto withdrawals
4. Full KYC → premium support, higher limits

**My Account UI:** one compact card — thin bar + 4 step chips + **only the next-step field(s)**. Not four stacked level cards or a full-page checklist.

**Post-join toast (journey 3):** `Account 0% complete` / `Add a phone for Level 1` + action **My Account** → closes cashier, soft-nav `/account`.

Journey 2/3/4/5 UI must **not** appear when journey is 1 (except when lab is set to that journey).

### Profile gate modal (HARD)

- Body portal: `data-profile-gate-root` + carve-out in `globals.css` (`z-index: 260`). Tailwind z alone paints **under** the shell / betslip — Chris has hit this repeatedly.
- Visual = AuthModal glass (frost, white/15 border) — **compact sheet**, max ~360px. **No** ticket icon, **no** “SPORTSBOOK” eyebrow bar, **no** red gradient / lightning “AI modal”.
- Sports name copy: **Name required to bet** / *First Name, Last Name on the account — then this bet can go through.* / CTA **Confirm & bet**.

### Fonts (HARD)

- Lumen tokens use the family name **`Figtree`**. Self-host `@font-face { font-family: 'Figtree' }` in `globals.css` (`/fonts/figtree-var.woff2`). next/font hashed names alone are **not** enough — bare `Figtree` otherwise falls to Times.

## Do not

- Do not put Nickname on the join form (journeys 1 / 5) — it belongs on **Verify**.
- Do not use Username on journey **1** (shipped) — Username is **journey 4 lab only**.
- Do not allow spaces or special characters in Nickname — live-validate.
- Do not enable the 1–5 lab on Vercel / production hosts.
