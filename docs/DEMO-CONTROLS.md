# Prototype demo controls

**Not shopper UI.** A separate **Prototype controls** surface so you can demo flows and reset state without a persona header toggle.

**Guardrails:** [DESIGN-GUARDRAILS.md](./DESIGN-GUARDRAILS.md) · **Build prompts:** [BUILD-PROMPTS.md](./BUILD-PROMPTS.md)

---

## Principles

- **No** “View as Jordan / Sam” in the app header or main nav.
- Personas stay in **docs** (PERSONAS, FEAT lens); you demo paths with **presets** and taps, not by switching identity in chrome.
- Controls must look **clearly non-production** (fixed **Prototype** pill → bottom sheet)—never mixed with ExtraCare or Savings chrome.

---

## Where it lives

- **Entry:** Fixed **Prototype** pill (bottom-left) → **bottom sheet**.
- **Persistence:** Same store as app (`localStorage`); presets and Advanced actions write through that store.

---

## Run a demo (primary)

One tap each: resets the right mock state and navigates. Presets do **not** auto-open flow sheets—walk trade/buy/sell in the app.

| Preset | State | Navigation |
|--------|--------|------------|
| **Fresh start** | Factory reset (consent off, seed data) | Savings → All |
| **Sam: Browse & buy** | Consent given, reseed marketplace + wallet | Savings → Marketplace **Browse** |
| **Sam: Orders & escrow** | Consent given + sample completed purchase | **Orders** tab (FEAT-05) |
| **Jordan: Listings** | Consent given, Jordan seller pack (listings + pending trade inbox) | Marketplace → **Listings** |

**Trade demo:** **Jordan: Listings** → **Review trade offer** → **Accept trade** → success sheet. Sam = buyer (`MOCK_MEMBER_ID`); Jordan = seller (`MOCK_SELLER_ID`).

---

## Advanced (collapsed)

Edge cases and maintenance—not needed for a clean case-study walkthrough.

| Control | Effect |
|---------|--------|
| **Marketplace consent** | Not given / Given / Browse only |
| **ExtraCare linked** | On/off — link gate when off |
| **Network** | Online / Offline |
| **Next Pay tap** | One-shot: payment fail, sold out, wallet timeout |
| **Next buy — trust scenario** | One-shot: offer missing from wallet, or wallet terms ≠ listing snapshot |
| **Mark last purchase redeemed** | Blocks in-app refund (FLOW-06 abuse path) |
| **Seller eligibility** | Jordan blocked scenarios (new account, cap, no phone) |
| **Undo purchases** | Restore sold listings from wallet demos |
| **Reseed listings + wallet** | Reload seed without full factory reset |

Removed from the main panel (use presets instead): trade action dropdown, escrow lock dropdown, data-action dropdown, separate “seed my listings” action (included in Jordan presets).

---

## Defaults after “Fresh start”

- Signed in (mock)
- **ExtraCare linked:** `true`
- **Marketplace consent:** `false` (FLOW-00 on next Marketplace visit)
- Seed data loaded

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-15 | Initial spec; no persona toggle |
| 2026-09-18 | Demo presets + Advanced section; trade dual-confirm presenter shortcuts |
