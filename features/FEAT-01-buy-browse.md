# FEAT-01: Buy & browse

| Field | Value |
|-------|--------|
| ID | FEAT-01 |
| Wave | A |
| Status | `draft` |
| Flows | [FLOW-01](../flows/FLOW-01-buy.md) |
| Depends on | FEAT-00 |
| Blocks | FEAT-03, FEAT-05, FEAT-06 |
| Primary persona | **P2** Sam — [PERSONAS.md](../PERSONAS.md) |
| Secondary persona | — |
| Flow map | [FEAT-01-map](./maps/FEAT-01-map.md) |

## Outcome

A member can browse marketplace listings, review terms, purchase with escrow semantics, and see the offer in their wallet with a transfer ID.

## Persona lens

- **P2:** Filters (category, expires soon); terms checklist before pay; escrow + transfer ID before stock-up trip.
- **P2:** No scannable barcode on listing—wallet is source of truth after purchase.

## User stories

- (P2) As **Sam**, I want to **filter and browse** listings so that I find oral care / skin care deals before they expire.
- (P2) As **Sam**, I want to see **full terms** before paying so that I know thresholds and in-store vs online rules.
- (P2) As **Sam**, I want a **protected purchase** (escrow + wallet confirmation) so that I don’t pay for a missing offer.

## Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| REQ-01-01 | Marketplace **browse** with filters: category, expires soon, discount type (minimum set). | FLOW-01 step 1 |
| REQ-01-02 | **Listing detail** shows terms checklist: min purchase, channel, expiry, stack summary; **no scannable barcode**. | FLOW-01 step 2; FLOWS rule 4 |
| REQ-01-03 | **Buy** CTA shows price, platform fee, total before confirm. | FLOW-01 step 3 |
| REQ-01-04 | Payment via configured method(s); on confirm, **escrow** + start transfer (void listing, issue buyer offer). | FLOW-01 steps 4–5; PRD FR-5, FR-6 |
| REQ-01-05 | **Success state**: offer in buyer wallet, **transfer ID**, protected purchase copy. | FLOW-01 step 6 |
| REQ-01-06 | On wallet sync success, **release escrow** to seller minus fee (mock ledger). | FLOW-01 step 7 |
| REQ-01-07 | **Payment failure**: no transfer; retry payment. | FLOW-01 failure |
| REQ-01-08 | **Sold out**: if listing taken, show not available. | FLOW-01 failure |
| REQ-01-09 | **Wallet sync timeout**: auto-refund narrative (&gt;15 min). | FLOW-01 failure; PRD §7.3 |
| REQ-01-10 | Block purchase if marketplace **consent** missing (FEAT-00). | FLOW-01 failure |
| REQ-01-11 | Listing detail includes **Propose trade** entry point (disabled or stub until FEAT-03). | FLOW-01 decision |

## Acceptance criteria

- (P2) **Given** active listings, **when** Sam applies a filter, **then** only matching listings show.
- (P2) **Given** a listing detail, **when** Sam views it, **then** terms are visible and barcode is not exposed.
- (P2) **Given** valid payment, **when** Sam confirms buy, **then** wallet contains offer and transfer ID displays.
- **Given** payment fails, **when** user retries, **then** no duplicate transfer occurs.
- **Given** listing already sold, **when** user attempts buy, **then** user sees unavailable message.

## Out of scope

- Full trade flow (FEAT-03).
- Dispute UI depth (FEAT-05) — basic error/refund copy only.
- In-store redemption (FEAT-06).
- Seller ratings persistence (optional stub).

## Dependencies

- FEAT-00 — consent, seed listings, data model
- [FLOWS.md](../FLOWS.md) — rules 1, 3, 4, 8

## Decisions

| Decision | Status |
|----------|--------|
| Default payment in mocks: ExtraBucks vs card vs both | TBD |
| Show seller rating on listing detail before buy | TBD |
| High-demand fair queue: copy only vs implemented | TBD — default copy only |

## Research / links

- PRD §7.3 — escrow, fake offer, chargeback (inform error copy)

## Build handoff

- [ ] Read [FEAT-01-map](./maps/FEAT-01-map.md) + this file + FLOW-01 + FLOWS shared rules
- [ ] Implement map nodes (browse → terms → buy sheet → escrow → wallet); key errors on map
- [ ] UI: coupon-card listings, segment filters, **bottom sheet** checkout — [UI-PATTERNS](../../docs/cvs-app-reference/UI-PATTERNS-AND-IA.md)
- [ ] Wire to FEAT-00 mock store
