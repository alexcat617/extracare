# Design guardrails — ExtraCare Marketplace prototype

**Purpose:** Keep UI/UX consistent with the CVS case study and stop prototype drift. Tweak this doc as we learn; Cursor rule [`.cursor/rules/extracare-prototype.mdc`](../.cursor/rules/extracare-prototype.mdc) should stay in sync for agents.

**Related:** [UI-PATTERNS-AND-IA](./cvs-app-reference/UI-PATTERNS-AND-IA.md) · [APP.md](../APP.md) · [PERSONAS.md](../PERSONAS.md) · [FLOWS.md](../FLOWS.md) · [FEATURES.md](../FEATURES.md)

---

## 1. Source of truth (read before UI work)

| Need | Document |
|------|----------|
| Visual system, components, Savings shell | [UI-PATTERNS-AND-IA.md](./cvs-app-reference/UI-PATTERNS-AND-IA.md) |
| Where Marketplace lives in the app | [APP.md](../APP.md) |
| Journey nodes to implement | `features/maps/FEAT-XX-map.md` + [FEAT-XX](../features/) |
| Steps, copy, branches | `flows/FLOW-XX.md` + [FLOWS.md](../FLOWS.md) shared rules 1–8 |
| Voice and jobs-to-be-done | [PERSONAS.md](../PERSONAS.md) (P1 Jordan, P2 Sam) |

**Rule:** If a pattern is not in UI-PATTERNS, **adapt** an existing CVS pattern (coupon card, bottom sheet, segment bar)—do not invent new chrome.

**Build rule:** Implement **map nodes** first; do not drive layout from a screen inventory.

---

## 2. Product defaults (FEAT-00 TBD — use until changed)

| Decision | Default |
|----------|---------|
| Consent timing | First visit to Marketplace |
| Consent UX | Single bottom sheet, checkbox + Continue |
| Tone | Credible CVS Health — warm, clear, not playful gamification |
| App shell | Model B: **Home · Savings · Shop · Photo · Orders**; Marketplace under **Savings** |

---

## 3. Visual UI (MUST)

- **Viewport:** Mobile-first; ~430px max content width; respect bottom nav + FAB safe area.
- **Colors:** Primary CTAs = **deep blue** filled pills; savings / urgency amounts = **red** bold; active Savings = **red** nav accent; page = light gray; cards = white, 1px light border.
- **Shape:** Pill/stadium buttons and search; card radius **12–16px**; no generic purple gradients or default Material-only styling.
- **Type:** Clean sans (system-ui acceptable); bold section titles; meta/expiry in smaller **gray**.
- **Reuse components:**
  - Filters → Savings **segment bar** (All / On card / For you / Marketplace).
  - Short transactions → **bottom sheet** (grabber, centered title, full-width blue primary in footer).
  - Listings → **Savings coupon card** shell; marketplace = different CTAs + badge, same layout.
- **Branding:** Case-study framing—avoid official CVS trademark assets; text labels only if needed.
- **Hierarchy:** One clear primary CTA per sheet; don’t stack competing full-width buttons.

---

## 4. UX interaction (MUST)

- Prefer **sheets + segments** over deep navigation stacks for consent, buy confirm, success.
- **FLOW-00:** Decline consent → **read-only browse**; buy/sell/trade re-prompt rules—no silent bypass.
- **ExtraCare linked** before transactional CTAs (mock link flow, consistent across features).
- **Trust:** Paid flows surface **escrow** and **official transfer** in plain language (see P2 in PERSONAS).
- **FLOWS rule 4:** No scannable barcodes on browse; full offer + **transfer ID** in buyer wallet after purchase.
- **Errors:** What happened + what to do next; no raw codes in UI.
- **Demo controls (prototype only):** [DEMO-CONTROLS.md](./DEMO-CONTROLS.md) — separate **Prototype** panel/sheet for operational state and resets. **No** persona header toggle (Jordan/Sam stay in documentation only).

---

## 5. Content & voice

| Persona | Guardrails |
|---------|------------|
| **P1 Jordan** | Plain language; “leaves your card until sold/cancelled”; suggested price; minimize jargon (“escrow” needs one line). |
| **P2 Sam** | Trust copy up front; expiry and category visible on cards; filters matter. |

**Never promote:** phone-number checkout hacks, barcode screenshots, sharing logins.

---

## 6. States (required per major surface)

Plan and implement—not polish-later only:

- First visit / empty  
- Loading (skeleton or brief spinner on lists)  
- Success (sheet or confirmation)  
- Blocked (consent, ExtraCare, offline) with explicit next step  

See [APP.md § States](../APP.md).

---

## 7. Accessibility (prototype minimum)

Target intent: [PRD § NFR](../PRD-cvs-coupon-marketplace.md) WCAG 2.2 AA.

- Body text contrast ≥ **4.5:1** on white/gray surfaces.  
- **Visible focus** on interactive elements.  
- Icon-only controls: **`aria-label`**.  
- Sheets: labeled dismiss; sensible focus order.  
- Status: not **color-only** (text/badge/icon).

---

## 8. Code & scope (prototype)

- **Stack:** React + Vite + Tailwind; centralize CVS-like colors/radius in Tailwind theme.  
- **Data:** Mock `Offer`, `Listing`, `Transfer`; persist consent/demo flags in **localStorage** where useful.
- **Demo panel:** Implement [DEMO-CONTROLS.md](./DEMO-CONTROLS.md) for every prototype slice; resets must not require editing code.  
- **Scope:** Build only FEAT(s) named in the task; stub other exits unless asked.  
- **APP.md:** Update only when **IA placement** changes.

---

## 9. Explicit DON’Ts

- New root tab for Marketplace.  
- Desktop-first default layout.  
- eBay/Amazon-style listing chrome (bids, galleries) unless spec’d.  
- Dark mode unless we add it here.  
- Lorem on trust/consent screens—use FLOW/FEAT copy.  
- Skipping marketplace rules because “legal comes later.”

---

## 10. Conflict resolution

1. **FEAT AC / map** wins for behavior.  
2. **This file + UI-PATTERNS** win for look and interaction patterns.  
3. **FLOWS shared rules** win for system truths (transfer, escrow, listing).  
4. If still ambiguous, match **Savings** screenshots patterns and document the choice in FEAT **Decisions**.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-15 | Initial guardrails for Wave A prototype |
