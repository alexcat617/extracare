# FEAT-03: Trade

| Field | Value |
|-------|--------|
| ID | FEAT-03 |
| Wave | B |
| Status | `draft` |
| Flows | [FLOW-03](../flows/FLOW-03-trade.md) |
| Depends on | FEAT-01, FEAT-02 |
| Blocks | — |
| Primary persona | **P2** Sam — [PERSONAS.md](../PERSONAS.md) |
| Secondary persona | **P1** Jordan (seller) |
| Flow map | [FEAT-03-map](./maps/FEAT-03-map.md) |

## Outcome

Two members can propose, negotiate, and confirm a **trade** of offers with dual-lock and atomic swap (no cash).

## Persona lens

- **P2:** Propose trade when cash buy isn’t ideal; fairness hint optional.
- **P1:** Review proposals on their listing; accept completes the swap.

## User stories

- (P2) As **Sam**, I want to **propose a trade** on a listing so that I swap a coupon I don’t need instead of paying cash.
- (P1) As **Jordan**, I want to **review, accept, or decline** trade proposals on my listing.
- (P1 + P2) As **both parties**, I want a clear **success** state when the seller accepts so we know the swap completed.

## Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| REQ-03-01 | From listing detail, **Propose trade** opens bundle picker (1–n wallet offers). | FLOW-03 steps 1–3 |
| REQ-03-02 | Show **value fairness hint** vs listing (non-blocking). | FLOW-03 step 3 |
| REQ-03-03 | Seller receives proposal; can accept or decline. | FLOW-03 steps 5–6 |
| REQ-03-04 | On seller **accept**, **atomic swap** (void both, cross-issue); linked transfer IDs; **success** confirmation. | FLOW-03 steps 7–8; FLOWS rule 1 |
| REQ-03-05 | Offers in active listing elsewhere cannot join bundle until delisted. | FLOW-03 failure |
| REQ-03-06 | Optional **trade-preferred** listing type from sell flow. | FLOW-03 open path |

## Acceptance criteria

- (P2) **Given** a listing and eligible wallet offers, **when** Sam sends proposal, **then** Jordan sees pending proposal.
- (P1) **Given** a pending proposal, **when** Jordan accepts, **then** swap completes and **Trade complete** success is shown.
- (P1 + P2) **When** swap completes, **then** each wallet shows received offers and prior offers are gone.

## Out of scope

- Escrow / payment (trades are offer-only).
- Chat (unless decision enables structured messages only).

## Dependencies

- FEAT-01 listing detail CTA
- FEAT-02 wallet offers and listing creation

## Decisions

| Decision | Status |
|----------|--------|
| Max offers per side: 1 vs 3 for v1 | TBD — default 3 |
| Chat vs structured messages only | TBD — default structured |

## Research / links

- PRD §7.3 — trade bait

## Build handoff

- [ ] Read [FEAT-03-map](./maps/FEAT-03-map.md) + this file + FLOW-03
- [ ] Implement map nodes (propose → lock → dual confirm → swap)
- [ ] Entry from [FEAT-01-map](./maps/FEAT-01-map.md) listing detail
