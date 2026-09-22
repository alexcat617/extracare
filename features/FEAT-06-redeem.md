# FEAT-06: Redeem & close loop

| Field | Value |
|-------|--------|
| ID | FEAT-06 |
| Wave | D |
| Status | `draft` (prototype **not built** — out of case-study scope; FLOW-07 documented only) |
| Flows | [FLOW-07](../flows/FLOW-07-redeem.md) |
| Depends on | FEAT-01 or FEAT-03 |
| Blocks | — |
| Primary persona | **P2** Sam — [PERSONAS.md](../PERSONAS.md) |
| Secondary persona | — |
| Flow map | [FEAT-06-map](./maps/FEAT-06-map.md) |

## Outcome

Buyer can follow pre-checkout checklist and (in prototype) simulate redemption; marketplace-acquired offers are visually distinct; rating prompt appears.

## Persona lens

- **P2:** Checklist before stock-up; marketplace badge on wallet offer; rate seller after successful use.

## User stories

- (P2) As **Sam**, I want a **pre-checkout checklist** so that I use the offer correctly at self-checkout.
- (P2) As **Sam**, I want a **marketplace badge** on wallet offers so that I don’t confuse them with regular deals.
- (P2) As **Sam**, I want to **rate the seller** after use so that trust builds for the next purchase.

## Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| REQ-06-01 | Wallet shows **marketplace badge** on purchased/transferred offers. | FLOW-07; FLOWS rule 8 |
| REQ-06-02 | **Checklist** before shop: min basket, SKU scope, channel. | FLOW-07 step 1 |
| REQ-06-03 | Prototype **simulate redeem** action marks offer consumed; links transfer ID. | FLOW-07 steps 3–4 |
| REQ-06-04 | **Rate seller** prompt after redeem or defer 7 days (mock). | FLOW-07 step 6 |
| REQ-06-05 | Failed apply → troubleshooting + link to dispute (FEAT-05). | FLOW-07 decision |

## Acceptance criteria

- (P2) **Given** marketplace offer in wallet, **when** Sam views it, **then** badge and checklist display.
- (P2) **Given** simulate redeem, **when** Sam confirms, **then** offer marked redeemed and rating prompt shows.

## Out of scope

- Real POS integration.
- Full receipt mock (unless decision requires).

## Dependencies

- FEAT-01 or FEAT-03 acquired offers

## Decisions

| Decision | Status |
|----------|--------|
| Show POS receipt mock vs stop at “ready at checkout” | TBD — default ready at checkout + simulate button |

## Build handoff

- [ ] Read [FEAT-06-map](./maps/FEAT-06-map.md) + this file + FLOW-07
- [ ] Continue from [FEAT-01-map](./maps/FEAT-01-map.md) wallet success node
