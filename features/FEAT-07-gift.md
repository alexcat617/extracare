# FEAT-07: Gift

| Field | Value |
|-------|--------|
| ID | FEAT-07 |
| Wave | D |
| Status | `draft` |
| Flows | [FLOW-04](../flows/FLOW-04-gift.md) |
| Depends on | FEAT-00 |
| Blocks | — |
| Primary persona | **P1** Jordan — [PERSONAS.md](../PERSONAS.md) |
| Secondary persona | **P2** Sam (recipient) |
| Flow map | [FEAT-07-map](./maps/FEAT-07-map.md) |

## Outcome

Member can gift a transferable offer to another ExtraCare member with transfer and optional accept flow.

## Persona lens

- **P1:** Gift kids’ deals to partner without listing for cash.
- **P2:** Optional accept flow when receiving gift.

## User stories

- (P1) As **Jordan**, I want to **gift** an offer to family so that it doesn’t expire on my account.
- (P2) As **Sam** (recipient), I want to **accept** a gift when required so that I control what enters my wallet.

## Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| REQ-07-01 | From wallet, **Gift** path with recipient lookup (phone/contact mock). | FLOW-04 steps 1–2 |
| REQ-07-02 | Confirm gift at **$0**; transfer void sender / issue recipient. | FLOW-04 steps 3–5 |
| REQ-07-03 | Recipient sees **gift metadata** in wallet. | FLOW-04 step 6 |
| REQ-07-04 | Decline or timeout **returns** offer to sender. | FLOW-04 decision |

## Acceptance criteria

- (P1) **Given** transferable offer, **when** Jordan completes gift (per accept rules), **then** recipient wallet contains offer and sender copy is void.
- (P1) **Given** recipient declines, **when** timeout elapses, **then** Jordan regains offer.

## Out of scope

- Non-ExtraCare invite funnel detail.
- Marketplace listing from gift.

## Dependencies

- FEAT-00 consent and transfer model

## Decisions

| Decision | Status |
|----------|--------|
| Recipient must always accept vs instant for verified household | TBD — default accept for non-household, instant for household mock |

## Build handoff

- [ ] Read [FEAT-07-map](./maps/FEAT-07-map.md) + this file + FLOW-04
- [ ] Wallet entry parallel to [FEAT-02-map](./maps/FEAT-02-map.md)
