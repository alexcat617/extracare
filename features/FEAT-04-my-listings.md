# FEAT-04: My listings

| Field | Value |
|-------|--------|
| ID | FEAT-04 |
| Wave | C |
| Status | `building` |
| Flows | [FLOW-05](../flows/FLOW-05-manage-listings.md) |
| Depends on | FEAT-02 |
| Blocks | — |
| Primary persona | **P1** Jordan — [PERSONAS.md](../PERSONAS.md) |
| Secondary persona | — |
| Flow map | [FEAT-04-map](./maps/FEAT-04-map.md) |

## Outcome

Sellers can view, edit price, cancel, and handle expiry for their marketplace listings; respond to trade proposals (with FEAT-03).

## Persona lens

- **P1:** Simple hub for active vs sold; cancel returns offer to wallet without surprise.

## User stories

- (P1) As **Jordan**, I want a **My listings** hub so that I see active, sold, and expired listings.
- (P1) As **Jordan**, I want to **edit price** or **cancel** so that I control my offers without calling support.
- (P1) As **Jordan**, I want **expired** listings handled clearly so that I know if the offer returned to my wallet.

## Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| REQ-04-01 | **Tabs or sections**: active, pending trades, sold, expired. | FLOW-05 monitor |
| REQ-04-02 | **Edit price** with floor/ceiling validation. | FLOW-05 edit |
| REQ-04-03 | **Cancel** with confirm; re-issue offer to seller wallet. | FLOW-05 cancel |
| REQ-04-04 | Block cancel/edit when **purchase in escrow** or **trade lock** active. | FLOW-05 decisions |
| REQ-04-05 | **Auto-expire** listing; return offer to wallet (case study default). | FLOW-05 expiry |
| REQ-04-06 | Entry from sell confirmation and Marketplace hub. | FLOW-02 step 9 |

## Acceptance criteria

- (P1) **Given** active listing, **when** Jordan cancels, **then** listing removed and offer returns to wallet.
- (P1) **Given** buyer in escrow, **when** Jordan tries cancel, **then** action blocked with plain message.
- **Given** listing past offer expiry, **when** system runs expiry job, **then** listing closed and seller notified (mock).

## Out of scope

- Community ExtraBucks donate pool (decision TBD).
- Analytics depth (views/saves optional).

## Dependencies

- FEAT-02 listings
- FEAT-03 for pending trade UI (can stub until Wave B)
- **Related:** [Marketplace activity hub](../docs/MARKETPLACE-ACTIVITY-HUB.md) — v1 metrics + listings preview; this FEAT adds full manage flows (edit/cancel/history).
- **Related:** [Marketplace activity hub](../docs/MARKETPLACE-ACTIVITY-HUB.md) — v1 metrics + listings preview; this FEAT adds full manage flows (edit/cancel/history).

## Decisions

| Decision | Status |
|----------|--------|
| Include “donate expired to community ExtraBucks pool” | TBD — default no for v1 |

## Build handoff

- [x] Read [FEAT-04-map](./maps/FEAT-04-map.md) + this file + FLOW-05
- [x] Implement map nodes (hub → edit / cancel / expiry) — prototype `feat/feat-04-my-listings`
