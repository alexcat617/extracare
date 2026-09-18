# FEAT-05: Trust — escrow + dispute

| Field | Value |
|-------|--------|
| ID | FEAT-05 |
| Wave | C |
| Status | `draft` |
| Flows | [FLOW-06](../flows/FLOW-06-dispute-refund.md), FLOW-01 escrow |
| Depends on | FEAT-01 |
| Blocks | — |
| Primary persona | **P2** Sam — [PERSONAS.md](../PERSONAS.md) |
| Secondary persona | **P1** Jordan (seller payout visibility) |
| Flow map | [FEAT-05-map](./maps/FEAT-05-map.md) |

## Outcome

Buyers see clear escrow/protected-purchase states; can report issues within 24h; portfolio demonstrates fraud-aware resolution (auto wallet check, refund path).

## Persona lens

- **P2:** Escrow timeline and 24h help if offer missing—core trust for Sam.
- **P1:** Understands payout may pause if dispute filed (secondary).

## User stories

- (P2) As **Sam**, I want to see **escrow status** after purchase so that I know the deal is real before my trip.
- (P2) As **Sam**, I want **help if the offer isn’t in my wallet** so that I get a refund fairly.
- (P2) As **Sam**, I want **marketplace-only protection** explained so I don’t trust off-app barcodes.

## Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| REQ-05-01 | Post-purchase **timeline**: paid → escrow → wallet verified → released. | FLOW-01; PRD FR-5 |
| REQ-05-02 | **Purchase history** with transfer ID and get-help entry. | FLOW-06 step 1 |
| REQ-05-03 | Dispute type **“Not in wallet”**: auto wallet check; retry transfer or refund. | FLOW-06 happy path 1 |
| REQ-05-04 | Dispute type **“Terms mismatch”**: compare listing snapshot vs issued offer. | FLOW-06 happy path 2 |
| REQ-05-05 | **24h window** for in-app auto dispute; after → generic support copy. | FLOW-06 decision |
| REQ-05-06 | Block refund if **redemption already tied** to transfer ID. | FLOW-06 failure; PRD §7.3 |
| REQ-05-07 | **Education**: marketplace-only protection modals (PRD FR-11). | PRD §7.3 |

## Acceptance criteria

- (P2) **Given** completed buy, **when** Sam opens status, **then** escrow phase is visible until wallet verified.
- (P2) **Given** offer absent after buy, **when** Sam files “not in wallet” within 24h, **then** refund or successful retry is shown.
- **Given** redemption recorded, **when** buyer requests refund, **then** refund denied with explanation.

## Out of scope

- Full support CRM integration.
- Trade-specific disputes (scope to paid buy unless extended).

## Dependencies

- FEAT-01 purchase and transfer records

## Decisions

| Decision | Status |
|----------|--------|
| Portfolio: interactive dispute vs static storyboard panel | TBD — default interactive minimal |

## Build handoff

- [x] Read [FEAT-05-map](./maps/FEAT-05-map.md) + this file + FLOW-06
- [x] Entry from [FEAT-01-map](./maps/FEAT-01-map.md) post-purchase nodes (buy success + Orders tab)
