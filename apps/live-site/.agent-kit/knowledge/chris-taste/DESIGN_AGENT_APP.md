# Design agent app (`/designagent`) — settled preference

**Source:** Chris, Oct 2026.

## Pipeline (HARD RULE)

One SpecKit flow for everyone (outside repos/agents included):

**BRD (SpecKit) → Design mock/refine → Chris sign-off → Dev delivery → Dev agents.**

Our job is **design perfect** (Lumen tokens/components, animations, Chris taste, preview URL) — then hand off. Full detail: [`PIPELINE.md`](PIPELINE.md).

## Chrome (HARD RULE)

- **Isolated backoffice:** `/designagent` must **never** twin the demo site. Middleware sets `x-design-agent`; root layout skips BetOnline boot loader, `SiteShellRoot`, footer, toaster, and brand `data-brand`. No BetOnline logo/loader in this route. Demo styles must not leak onto `/` (and vice versa). **Demo site** link remounts BetOnline `ShellProvider` — login is persisted in `localStorage` so you don’t land on the logged-out “Built for winners.” marketing homepage by accident.
- **Logo:** `/shell/design-agent/logo.png` — transparent PNG (cream mark only; black plate knocked out). Nav header: **logo only, centered** — no “Design agent” / SpecKit wordmark. Empty-state hero: quiet `.da-glitch-logo` nudge (no `mix-blend` flash). Nav/chat stay static.
- **Theme:** **Not BetOnline brand.** One surface BG `#0a0a0a` for nav + center + chat (no mismatched greys). Accent **hot pink** `#ff2d95`. Hard-code — never brand `--primary` / `#ee3536`.
- **Layout:** `fixed inset-0` full-viewport shell. Left nav · center · **full-height right chat dock**.
- **Stage:** Compact pill (current + next + n/N) — not an 8-dot stepper. While designing with no preview: open canvas (grid + scan only — **no framed squares**).
- **Chat:** User controls — close (X), widen/narrow; reopen via **Chat** in the initiative header. Send sits inside the input (not a pink square button).
- **New BRD:** centered **modal** portaled to `document.body`. Never a side drawer / full-page form.
- **Inbox:** under **Site** in left nav (badge for open questions). Primary Q&A + run log live in the **right chat** — answers typed there apply to open questions; SpecKit/design progress streams as `…` lines while status is `designing`.
- **Preview vs live (HARD):** Design-lane prototype is **`http://127.0.0.1:3001/prototype/<slug>`** (`npm run dev:3001`) — never on demo `:3000` while refining. Center defaults to **Preview** first. **Request sign-off ≠ Final sign-off ≠ Merge.** `liveUrl` is planned route only; demo gets it when Chris says **Merge**. See `PROTOTYPE_LANE.md`.
- **Links:** Demo = same-origin `/` (port badge `:3000` local only). **Lumen codebase** = **`/lumen`** (live site modules: main nav, quick links, sub-navs, promo cards, sheets/drawers, pages — copy code). Not unmerged prototypes. **Never** Storybook `:6006`. Never link prod to 127.0.0.1. **Figma Lumen** → project folder + DS file.
- **Package UI:** Neutral borders (no pink strokes on the handoff card). **View** opens a modal, not an inline dump.
- **Refine step:** When preview is up, chat is for **screenshots + issue notes** (paste or paperclip attach). Saves under `public/design-agent/feedback/<slug>/` + `specs/<slug>/feedback.md`, flips status to **Refine** (`needs_review`). **Request Chris sign-off** is optional until taste is right — mute it during refine.
- **Sign-off gate (HARD):** Designers / PMs = **Requester** — **Request Chris sign-off** → status `awaiting_signoff`, Inbox alerts Owner. Only **Owner** (Chris) **Final sign-off** packages for the requester (`approved` → packaging → `ready_for_dev`). Nobody packages / sends to dev without Chris final sign-off. Account nav sets Owner vs Requester (Admin / Members later).
- **Nav chrome:** Site row hover = soft `panel` wash. Sections top→bottom: **Site** (Overview · Inbox · Skills) → **Links** (Demo · Lumen · Figma) → **Initiatives** → **Workspace** (Account · Admin Soon · Members Soon). Overview top-right New BRD = pink **+** only (no “New BRD” label). Inbox count up → soft chime (skip first load).
- **Prod builds (HARD):** On Vercel, jobs persist in **Vercel Blob** (not `/tmp` alone — that is ephemeral per instance). When `CURSOR_API_KEY` + `CURSOR_CLOUD_REPO` are set, New BRD (designing) and refine chat **kick a Cursor cloud agent** that builds/PR’s against the repo. Chat must say the agent started (with agents URL) or the kick error — never “nothing is building; go paste into Cursor” while cloud is configured. Local desk without those env vars may still log feedback only.
- **Designing state:** center shows BetOnline **`betonline-loader`** (“Design working…”) — not an empty canvas / fake pause copy.
- **Packaging after Final sign-off:** status stays `approved` while desk poll streams `…` packaging lines into chat (same cadence as design prep), writes `specs/<slug>/dev-delivery.md`, then flips to `ready_for_dev`. Stage/chat show **Packaging…** / pulse — never a silent “packaging” note with no … activity.
- **Ready for dev / handoff (HARD):** Center defaults to **Preview** first; Package has delivery markdown (components, tokens, **motion/hover/transitions**), file list with View/Copy, and **Prototype URL** (required for dev — `:3001`). **Back to refine** in the initiative header reopens `needs_review` without wiping the prototype; package stays draft until Final sign-off again. **Live (8/8) is not a desk button**. Site nav: icons on Demo / Lumen / Figma Lumen.
- **Package must include:** prototype URL, hover states, animations/transitions notes — not just components/tokens.
- **Demo vs prototype:** Initiatives stay on `:3001` until Chris merges. Demo (`:3000`) must not list unmerged nav (e.g. Races) or serve `/prototype/*` / unmerged product routes.
- **Landing (HARD):** `/designagent` opens **Overview** dashboard — never auto-opens the last initiative. Click a row (or nav Initiatives) to enter. Logo / Overview nav return to dashboard.
- **Don’t re-ask “where?”** if the BRD already says (e.g. “in the VIP Hub … Benefits tab”) — infer route, go straight to designing. Typo-tolerant (`benifits` / `beneifits`).
- **VIP Benefits prototypes:** `/prototype/<slug>` opens the **real shell with VIP Hub → Benefits** (table), not a BRD text dump. Match slugs with extra vowels (`beneifits`). **HARD:** do **not** wire `VipBenefitsPanel` into demo `vip-hub-sheet` until Chris says **Merge** — demo Benefits tab stays empty / EmptyVipTab.
- **Skills:** **this project only** — `.cursor/skills`, patterns, product strategy, chris-taste, rules, constitution. Do **not** list global `~/.cursor/skills-cursor` / `~/.agents/skills` on the desk. Hosted (Vercel) packs them into `apps/live-site/.agent-kit` via `prebuild` / `agent-kit:sync` — without that kit, Skills shows **0**. Also require `experimental.outputFileTracingIncludes` for `/api/agent/skills*` → `./.agent-kit/**/*` or the kit never lands in the serverless bundle.
- **Prod BRDs:** Job JSON + feedback live in **Vercel Blob** (`BLOB_READ_WRITE_TOKEN`); `/tmp` is cache only. New BRD accepts **screenshots** + optional PDF/MD/TXT.
- **Surfaces:** Rewards, Marketing, Casino, Sports, Account, Promotions, Other. Default **Rewards** (VIP hub / rewards is the common home).
- **One agent only** — Design agent. No Nova/Ivo/Mika cast in this UI.
- Upfront questions: only what can’t be inferred (e.g. route). Lumen reuse / breakpoints / error scope → decide while building; ask later if stuck.

## Copy

Short labels. No AI-slop desk poetry. See `COPY.md`.
