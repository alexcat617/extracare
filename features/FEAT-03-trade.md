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
- **P1:** Review proposals on their listing; dual confirm before losing offer.

## User stories

- (P2) As **Sam**, I want to **propose a trade** on a listing so that I swap a coupon I don’t need instead of paying cash.
- (P1) As **Jordan**, I want to **review, accept, decline, or counter** trade proposals on my listing.
- (P1 + P2) As **both parties**, I want **dual confirm** so that neither side loses offers without agreement.

## Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| REQ-03-01 | From listing detail, **Propose trade** opens bundle picker (1–n wallet offers). | FLOW-03 steps 1–3 |
| REQ-03-02 | Show **value fairness hint** vs listing (non-blocking). | FLOW-03 step 3 |
| REQ-03-03 | Seller receives proposal; can accept, decline, counter. | FLOW-03 steps 5–6 |
| REQ-03-04 | On agreement, **pending lock** both bundles; each user **Confirm trade**. | FLOW-03 steps 7–8 |
| REQ-03-05 | On dual confirm, **atomic swap** (void both, cross-issue); linked transfer IDs. | FLOW-03 step 9; FLOWS rule 1 |
| REQ-03-06 | **Timeout** on lock releases offers; no transfer. | FLOW-03 decision |
| REQ-03-07 | Offers in active listing elsewhere cannot join bundle until delisted. | FLOW-03 failure |
| REQ-03-08 | Optional **trade-preferred** listing type from sell flow. | FLOW-03 open path |

## Acceptance criteria

- (P2) **Given** a listing and eligible wallet offers, **when** Sam sends proposal, **then** Jordan sees pending proposal.
- (P1 + P2) **Given** agreement, **when** only one party confirms, **then** no transfer occurs.
- (P1 + P2) **Given** both confirm within window, **when** swap completes, **then** each wallet shows received offers and prior offers are gone.

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
