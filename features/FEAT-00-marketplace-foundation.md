# FEAT-00: Marketplace foundation

| Field | Value |
|-------|--------|
| ID | FEAT-00 |
| Wave | A |
| Status | `draft` |
| Flows | [FLOW-00](../flows/FLOW-00-marketplace-entry.md), [FLOWS.md](../FLOWS.md) shared rules |
| Depends on | — |
| Blocks | FEAT-01, FEAT-02, FEAT-07 |
| Primary persona | **P1** Jordan, **P2** Sam — [PERSONAS.md](../PERSONAS.md) |
| Secondary persona | — |
| Flow map | [FEAT-00-map](./maps/FEAT-00-map.md) |

## Outcome

Members can reach Marketplace from the app shell, accept marketplace rules once, and the prototype has a consistent **offer / listing / transfer ID** model used by buy and sell features.

## Persona lens

- **P1:** Plain-language rules; no phone-number workaround messaging.
- **P2:** Trust copy on escrow and official transfer before first buy.
- **Both:** ExtraCare link gate before money or listing actions.

## User stories

- (P1 + P2) As an **ExtraCare member**, I want to open Marketplace from Savings / Deals so that I can browse or sell offers.
- (P1 + P2) As a **first-time marketplace user**, I want a clear explanation of official transfer and escrow so that I trust the feature.
- (P1 + P2) As a **prototype user**, I need realistic **seed listings and wallet offers** so that buy/sell demos work end-to-end.

## Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| REQ-00-01 | Primary navigation includes entry to **Marketplace** (tab or Deals sub-area). | Wave A shell |
| REQ-00-02 | First marketplace visit shows **rules / consent** (transfer, no barcode resale, escrow on purchases). | FLOW-00 steps 2–4 |
| REQ-00-03 | Declining consent allows **read-only browse**; buy/sell/trade require consent. | FLOW-00 decision |
| REQ-00-04 | ExtraCare **must be linked** before transactional CTAs; use existing link pattern. | FLOW-00 step 2 |
| REQ-00-05 | Prototype **data model**: `Offer`, `Listing`, `Transfer` (id, status, parties, timestamps). | FLOWS shared rules |
| REQ-00-06 | Enforce **one active listing per offer entitlement ID** in mock logic. | FLOWS rule 2 |
| REQ-00-07 | Seed **8–12 listings** across categories (oral care, baby, vitamins, threshold deals). | PRD §12 |

## Acceptance criteria

- (P1 + P2) **Given** a signed-in member with linked ExtraCare, **when** they open Marketplace, **then** they see browse UI or consent if first visit.
- (P1 + P2) **Given** first visit, **when** user accepts rules, **then** consent is stored and transactional CTAs unlock.
- (P1) **Given** first visit, **when** user dismisses without accept, **then** browse works but list/sell actions prompt consent (Jordan may still browse).
- **Given** prototype load, **when** developer inspects state, **then** seed listings and sample wallet offers exist.

## Out of scope

- Full FLOW-00 carousel polish (Wave D).
- Real ExtraCare / payment APIs.
- FEAT-01/02 UI beyond shared shell and data.

## Dependencies

- [FLOWS.md](../FLOWS.md) — shared system rules 1–8 (reference only in code comments / types).

## Decisions

| Decision | Status |
|----------|--------|
| Show consent on every install vs only before first transaction | TBD |
| Single screen vs 3-step carousel for rules | TBD |
| Visual tone: playful vs clinical CVS Health | TBD (portfolio) |

## Research / links

- [PRD §0](../PRD-cvs-coupon-marketplace.md) — case study framing

## Build handoff

- [ ] Read [FEAT-00-map](./maps/FEAT-00-map.md) + this file + FLOW-00 + FLOWS shared rules
- [ ] Implement journey nodes from map (consent, hub, seed data)
- [ ] Verify against **Persona lens** above
- [ ] CVS patterns: Savings entry, segmented area — [UI-PATTERNS](../../docs/cvs-app-reference/UI-PATTERNS-AND-IA.md)
- [ ] Update APP.md **only** if IA placement changes
