# FEAT-02: Sell & list

| Field | Value |
|-------|--------|
| ID | FEAT-02 |
| Wave | A |
| Status | `draft` |
| Flows | [FLOW-02](../flows/FLOW-02-sell.md) |
| Depends on | FEAT-00 |
| Blocks | FEAT-04 |
| Primary persona | **P1** Jordan — [PERSONAS.md](../PERSONAS.md) |
| Secondary persona | — |
| Flow map | [FEAT-02-map](./maps/FEAT-02-map.md) |

## Outcome

A member can list a transferable wallet offer for sale at a valid price; the offer is reserved/void on their card and appears on the marketplace for buyers (FEAT-01).

## Persona lens

- **P1:** “Not for me” from On card wallet; suggested price band; fee/payout in plain language.
- **P1:** Clear that listing **removes use** on their card until sold or cancelled—no coupon math.

## User stories

- (P1) As **Jordan**, I want to mark an offer **“not for me”** and list it so that it doesn’t expire unused.
- (P1) As **Jordan**, I want **suggested pricing** within platform limits so that I can publish without haggling like eBay.
- (P1) As **Jordan**, I want to understand that **listing removes use** of that offer on my card until sold or cancelled.

## Requirements

| ID | Requirement | Trace |
|----|-------------|-------|
| REQ-02-01 | From **Deals wallet**, user can open sell flow via “Not for me” / “Sell on Marketplace”. | FLOW-02 steps 1–2 |
| REQ-02-02 | **Non-transferable** offers show block reason (Rx, type). | FLOW-02 step 3 |
| REQ-02-03 | User selects **Sell** (trade/gift stubs or links for later FEATs). | FLOW-02 step 4 |
| REQ-02-04 | Listing form **pre-fills** title, savings estimate, expiry, rules, suggested price band. | FLOW-02 step 5 |
| REQ-02-05 | Price must be within **floor/ceiling** vs savings; show fee and estimated payout. | FLOW-02 step 6; FLOWS rule 6 |
| REQ-02-06 | On **publish**, void/reserve seller entitlement; create active listing (one per offer ID). | FLOW-02 steps 7–8; PRD FR-6 |
| REQ-02-07 | **Confirmation** with link to My listings (stub OK until FEAT-04). | FLOW-02 step 9 |
| REQ-02-08 | **Sell eligibility**: 7+ day account, phone verified, listing cap for new sellers (mock flags). | FLOW-02 preconditions; PRD §7.3 |
| REQ-02-09 | Ineligible seller sees **days remaining** message. | FLOW-02 failure |
| REQ-02-10 | Missing marketplace **consent** redirects to FEAT-00 gate. | FLOW-02 failure |
| REQ-02-11 | Optional first-seller **tooltip**: void-on-list behavior. | FLOW-02 decision |

## Acceptance criteria

- (P1) **Given** a transferable wallet offer, **when** Jordan publishes valid price, **then** listing appears in marketplace browse and wallet offer is reserved.
- (P1) **Given** price outside band, **when** Jordan tries publish, **then** publish is blocked with simple guidance.
- (P1) **Given** ineligible seller account, **when** Jordan tries sell, **then** eligibility message shows without jargon.
- **Given** published listing, **when** buyer completes FEAT-01 purchase, **then** listing closes and seller payout logic runs.

## Out of scope

- Trade and gift (FEAT-03, FEAT-07).
- Full My listings management (FEAT-04).
- POS sync / redeem-while-listed (copy or mock event only).
- Draft listings unless decision says yes.

## Dependencies

- FEAT-00 — consent, data model, marketplace entry
- FEAT-01 — buyer consumes listings (Wave A demo)

## Decisions

| Decision | Status |
|----------|--------|
| Entry narrative: long printed receipt → find in app vs app wallet only | TBD |
| Draft listings without void until publish | TBD — default void on publish |
| Trade allowed when sell blocked (new account) | TBD — case study: optional |

## Research / links

- PRD §7.3 — double sell, farming

## Build handoff

- [ ] Read [FEAT-02-map](./maps/FEAT-02-map.md) + this file + FLOW-02 + FLOWS shared rules
- [ ] Implement map nodes from wallet → publish → live listing
- [ ] UI: Savings **On card** + coupon card actions — [UI-PATTERNS](../../docs/cvs-app-reference/UI-PATTERNS-AND-IA.md)
- [ ] Wave A E2E with [FEAT-01-map](./maps/FEAT-01-map.md): Jordan publish → Sam buy
