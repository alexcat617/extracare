# ExtraCare Marketplace — features (build packages)

**Delivery layer** between [flows](FLOWS.md) (behavior) and [APP.md](APP.md) + code (implementation). One file per feature under [`features/`](./features/).

**Wiki:** [docs/WIKI.md](./docs/WIKI.md)

| Layer | Doc |
|-------|-----|
| Why | [CONCEPT.md](./CONCEPT.md) |
| Who | [PERSONAS.md](./PERSONAS.md) (P1 / P2) |
| Product | [PRD-cvs-coupon-marketplace.md](./PRD-cvs-coupon-marketplace.md) |
| Paths | [FLOWS.md](./FLOWS.md), [flows/](./flows/) |
| **Build** | **This file + features/FEAT-XX.md** |
| **Visual paths** | [features/maps/](./features/maps/) (journey maps per FEAT) |
| UI shell | [APP.md](./APP.md) IA skeleton + [CVS UI patterns](./docs/cvs-app-reference/UI-PATTERNS-AND-IA.md) |

Work item shape: [Persona lens](./PERSONAS.md) → User stories → Requirements → AC → [flow map](./features/maps/) → build.

---

## Status

| ID | Feature | Wave | Status | Flow map | Flows |
|----|---------|------|--------|----------|-------|
| [FEAT-00](./features/FEAT-00-marketplace-foundation.md) | Marketplace foundation | A | `draft` | [map](./features/maps/FEAT-00-map.md) | FLOW-00 |
| [FEAT-01](./features/FEAT-01-buy-browse.md) | Buy & browse | A | `draft` | [map](./features/maps/FEAT-01-map.md) | FLOW-01 |
| [FEAT-02](./features/FEAT-02-sell-list.md) | Sell & list | A | `draft` | [map](./features/maps/FEAT-02-map.md) | FLOW-02 |
| [FEAT-03](./features/FEAT-03-trade.md) | Trade | B | `draft` | [map](./features/maps/FEAT-03-map.md) | FLOW-03 |
| [FEAT-04](./features/FEAT-04-my-listings.md) | My listings | C | `draft` | [map](./features/maps/FEAT-04-map.md) | FLOW-05 |
| [FEAT-05](./features/FEAT-05-trust-escrow-dispute.md) | Trust: escrow + dispute | C | `draft` | [map](./features/maps/FEAT-05-map.md) | FLOW-06 |
| [FEAT-06](./features/FEAT-06-redeem.md) | Redeem & close loop | D | `draft` | [map](./features/maps/FEAT-06-map.md) | FLOW-07 |
| [FEAT-07](./features/FEAT-07-gift.md) | Gift | D | `draft` | [map](./features/maps/FEAT-07-map.md) | FLOW-04 |

**Status values:** `draft` → `ready` → `building` → `done`

---

## Build waves

| Wave | Features | Demo outcome |
|------|----------|----------------|
| **A — Core marketplace** | FEAT-00 → FEAT-01 + FEAT-02 | List coupon → another user buys → offer in buyer wallet |
| **B — Differentiation** | FEAT-03 | Propose trade → dual confirm → swap |
| **C — Seller ops + trust** | FEAT-04 + FEAT-05 | Edit/cancel listing; dispute / escrow story |
| **D — Polish** | FEAT-06, FEAT-07, fuller FLOW-00 | Redeem closure; gift (optional) |

---

## Wave A decisions (blocking `ready`)

Resolve in the linked FEAT **Decisions** sections, then set FEAT-00/01/02 to `ready`.

| Topic | Owner FEAT | State |
|-------|------------|-------|
| Marketplace entry: every install vs first transaction only | FEAT-00 | TBD |
| Entry UX: single screen vs 3-step carousel | FEAT-00 | TBD |
| Payment mocks: ExtraBucks vs card vs both | FEAT-01 | TBD |
| Seller rating on listing detail before buy | FEAT-01 | TBD |
| Sell entry: printed receipt narrative vs app wallet only | FEAT-02 | TBD |
| Draft listings (no void until publish) | FEAT-02 | TBD |
| Case study tone (playful vs clinical CVS) | FEAT-00 / global | TBD — [PRD §13](./PRD-cvs-coupon-marketplace.md) |
| Hero metric for portfolio close | — | TBD — PRD §13 |

---

## Build handoff contract

When you say **“build FEAT-XX”** (or **FEAT-01 + FEAT-02**):

1. Read [`features/FEAT-XX.md`](./features/) + [`features/maps/FEAT-XX-map.md`](./features/maps/) — prefer status `ready` (override only if you say so).
2. Read **Persona lens** + AC in FEAT; [PERSONAS.md](./PERSONAS.md) as needed.
3. Read linked [`flows/FLOW-XX.md`](./flows/) + [FLOWS.md](./FLOWS.md) shared rules.
4. Implement prototype from **map nodes** + [CVS UI patterns](./docs/cvs-app-reference/UI-PATTERNS-AND-IA.md) + [design guardrails](./docs/DESIGN-GUARDRAILS.md) (sheets, coupon cards, segments).
5. Touch [APP.md](./APP.md) only if **IA placement** changes—not a per-feature screen inventory.
6. Set feature status to `building` → `done`; add a line to **Changelog** below.

---

## Changelog

| Date | Change |
|------|--------|
| 2026-03-24 | Initial FEATURES index + FEAT-00…07 scaffolded |
| 2026-03-24 | Persona-driven FEATs + per-feature flow maps in features/maps/ |
| 2026-03-24 | Added [docs/WIKI.md](./docs/WIKI.md) project hub; restored PRD |
