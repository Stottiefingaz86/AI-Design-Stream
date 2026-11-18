---
name: chris-feedback-learn
description: >-
  Capture and apply Chris likes vs dislikes so agents stop repeating UI/process
  mistakes. Use on every correction, praise, or “hate this / love this”; before
  inventing join/OTP/phone/auth/Design Agent UX; when shaping prompts or Claude
  handoffs. Writes FEEDBACK_LOG.md + chris-taste notes.
---

# Chris feedback learn

## When

- Chris rejects, praises, or corrects UI/copy/process  
- Starting work on a surface that already has entries in the feedback log  
- Exporting skills / Claude packs / agent prompts  

## Sources of truth

| File | Role |
|------|------|
| `.cursor/knowledge/chris-taste/FEEDBACK_LOG.md` | **Primary** — positive / negative Do & Don't (by surface + chronological) |
| `.cursor/knowledge/chris-taste/*.md` | Settled hard rules (AUTH_JOIN, COPY, MOBILE_CAROUSELS, …) |
| `lumen-betonline-build` + `patterns.md` | Live-site build taste (sub-nav, cards, inputs, claims) |

Do **not** rebuild full chat dumps for Design Agent. Feedback only — no prior-company / vendor brand names in the log.

## On every correction (same turn)

1. **Classify** — `positive` | `negative` | `mixed`  
2. **Append** one chronological entry to `FEEDBACK_LOG.md`  
3. If the same miss has happened before (e.g. sub-nav, mobile arrows), **strengthen the surface Do/Don't table** at the top of the log  
4. **Promote** durable rules into the right chris-taste note / `lumen-betonline-build` / `patterns.md`  
5. **Fix the product** — don’t only document  

If Chris says “AI slop,” also update `COPY.md` with the rejected line.

## Before inventing

1. Open `FEEDBACK_LOG.md` — read the **Settled Do / Don't by surface** table for your area  
2. Grep chronological entries for the surface (join, OTP, phone, SMS, sub-nav, carousel, Design Agent, …)  
3. Obey every matching **Don't** — treat as hard rules  
4. Prefer neighbors that already shipped over new patterns he rejected  

## Shaping future agents

When writing Cursor / other-agent prompts or handoff packs:

- Include this skill + `FEEDBACK_LOG.md`  
- Summarize top **Don't**s for the feature area (always include **sub-nav** + **mobile carousels** if chrome is in scope)  
- Never ship a pack without peer-screen / research tooling when competitor flows are in scope  

## Anti-patterns

- Logging feedback but not fixing taste files  
- Re-trying a rejected pattern with a small tweak (OTP stripe → OTP card)  
- Treating anger as tone only — extract the **Don't**  
- Pasting raw chat history or naming prior companies instead of the design rule  
