# Prototype demo controls

**Not shopper UI.** A **Reset** pill (bottom-left) opens three plain-language actions so reviewers can recover the demo without a persona toggle in the app chrome.

**Guardrails:** [DESIGN-GUARDRAILS.md](./DESIGN-GUARDRAILS.md) · **Build prompts:** [BUILD-PROMPTS.md](./BUILD-PROMPTS.md)

---

## Principles

- **No** “View as Jordan / Sam” in the header or main nav.
- Personas stay in **docs**; reviewers use **Reset** and normal taps in the app.
- Controls look **clearly non-production** (purple dashed **Reset** pill → bottom sheet).

---

## Where it lives

- **Entry:** Fixed **Reset** pill (bottom-left) → **Reset demo** sheet (`size="compact"`).
- **Persistence:** Same store as the app (`localStorage`).

---

## Actions (three buttons)

| Button | Effect |
|--------|--------|
| **Fresh start** | Full factory reset; **Home** welcome; marketplace rules not accepted yet. Use **Start** or **See process** on Home. |
| **Reload coupons and listings** | Reseed marketplace listings and wallet sample data; keeps current tab and most settings. |
| **Browse the marketplace** | Consent on, sample listings loaded; navigates to Savings → Marketplace **Browse**. |

Presets do **not** auto-open buy/sell sheets—tap through flows in the app.

**Home tab:** **See process** opens the portfolio case-study story (for hiring managers).

---

## Defaults after “Fresh start”

- Signed in (mock)
- **ExtraCare linked:** `true`
- **Marketplace consent:** `false` (rules sheet on next Marketplace visit)
- Seed data loaded

---

## Maintainer note

Edge-case toggles (consent modes, offline, trust scenarios, seller blocks) remain available via `PrototypeContext` APIs but are **not** exposed in the shared UI. Use dev tools or re-add a hidden panel locally if needed.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-15 | Initial spec; no persona toggle |
| 2026-09-18 | Demo presets + Advanced section |
| 2026-09-22 | Simplified to Reset pill + three actions; Advanced removed from UI |
