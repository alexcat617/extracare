# Build prompts (copy/paste)

Short prompts for Agent mode in this repo. Guardrails apply automatically via [`.cursor/rules/extracare-prototype.mdc`](../.cursor/rules/extracare-prototype.mdc).

**Demo ops:** [DEMO-CONTROLS.md](./DEMO-CONTROLS.md) — no persona toggle; use prototype panel for resets.

---

## FEAT-00 — Marketplace foundation (current slice)

```text
Build FEAT-00 per FEATURES build handoff.

Read: features/FEAT-00-marketplace-foundation.md, features/maps/FEAT-00-map.md, flows/FLOW-00-marketplace-entry.md, FLOWS.md (shared rules), APP.md, docs/DESIGN-GUARDRAILS.md, docs/cvs-app-reference/UI-PATTERNS-AND-IA.md.

Deliver: React + Vite + Tailwind mobile-first clickable prototype; implement all FEAT-00-map nodes and key errors; seed data per FEAT; stub FEAT-01/02 exits only.

Demo: implement docs/DEMO-CONTROLS.md (prototype panel — no persona header toggle).

Run dev server. End with a short click-through checklist for consent accept vs decline paths.
```

---

## FEAT-01 — Buy & browse (later)

```text
Build FEAT-01 on the existing prototype. Read FEAT-01, FEAT-01-map, FLOW-01, FLOWS, DESIGN-GUARDRAILS, UI-PATTERNS. Wire from FEAT-00 hub. Extend DEMO-CONTROLS if needed. No persona toggle.
```

---

## FEAT-02 — Sell & list (later)

```text
Build FEAT-02 on the existing prototype. Read FEAT-02, FEAT-02-map, FLOW-02, FLOWS, DESIGN-GUARDRAILS, UI-PATTERNS. Wallet sell entry. Extend DEMO-CONTROLS if needed. No persona toggle.
```

---

## Wave A (full demo path)

```text
Build FEAT-00 + FEAT-01 + FEAT-02 on one prototype. Same doc contract as FEATURES.md. DEMO-CONTROLS for resets. Demo path: list → buy → wallet. No persona toggle.
```
