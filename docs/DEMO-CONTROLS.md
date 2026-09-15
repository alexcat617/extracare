# Prototype demo controls

**Not shopper UI.** A separate **Prototype controls** surface so you can demo flows and reset state without a persona header toggle.

**Guardrails:** [DESIGN-GUARDRAILS.md](./DESIGN-GUARDRAILS.md) · **Build prompts:** [BUILD-PROMPTS.md](./BUILD-PROMPTS.md)

---

## Principles

- **No** “View as Jordan / Sam” in the app header or main nav.
- Personas stay in **docs** (PERSONAS, FEAT lens); you demo paths by **where you tap**, not by switching identity.
- Controls must look **clearly non-production** (e.g. fixed “Prototype” chip opening a panel/sheet)—never mixed with ExtraCare or Savings chrome.

---

## Where it lives

- **Entry:** Small fixed control (e.g. bottom-left **Prototype** pill or gear) → opens **bottom sheet** or narrow side panel.
- **Persistence:** Same store as app (`localStorage`); resets write through that store and refresh UI.

---

## Controls (minimum for FEAT-00)

| Control | Effect |
|---------|--------|
| **ExtraCare linked** | On/off — when off, transactional CTAs show link gate (FLOW-00 / map `linkEC`). |
| **Marketplace consent** | Set: *Not given* / *Given* — or **Clear consent** to replay rules sheet. |
| **Reseed listings & wallet** | Reload mock seed data (8–12 listings + sample wallet offers); clears user-created mock state if any. |
| **Reset all prototype data** | Consent off, ExtraCare on (or your chosen default), reseed — “fresh install” demo. |

---

## Controls (add as features ship)

| Control | FEAT | Effect |
|---------|------|--------|
| Simulate offline | 00+ | Disables transactional CTAs; shows retry/offline copy. |
| Skip to Marketplace hub | 00 | Bypass entry only for dev speed (optional; label as dev-only). |
| Clear purchase / wallet | 01+ | After buy demos. |
| Clear my listings | 02+ | After sell demos. |

---

## Defaults after “Reset all”

Use for repeatable demos:

- Signed in (mock)
- **ExtraCare linked:** `true`
- **Marketplace consent:** `false` (so FLOW-00 can be shown on next Marketplace visit)
- Seed data loaded

Document any change to defaults here when you tweak them.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-15 | Initial spec; no persona toggle |
