# FLOW-05: Manage my listings

| Field | Value |
|-------|--------|
| ID | FLOW-05 |
| Priority | P1 |
| Persona | Seller (deal optimizer) |
| Trigger | User wants to change, cancel, or monitor active listings |
| Goal | Listing state matches seller intent until sold, traded, expired, or cancelled |
| Preconditions | At least one past or active listing |

## Happy path — monitor

1. User opens Marketplace → **My listings** (or profile marketplace hub).
2. User sees active, pending trade proposals, sold, expired tabs.
3. User opens active listing; views views/saves (optional metrics).

## Happy path — edit price

1. User selects active listing → **Edit price**.
2. System validates floor/ceiling.
3. User saves; listing updates immediately.

## Happy path — cancel

1. User selects active listing → **Cancel listing**.
2. System confirms void will release offer back to wallet.
3. User confirms; entitlement re-issued to seller; listing removed from marketplace.

## Happy path — respond to trade proposal

1. User opens pending proposal on a listing.
2. User accept / decline / counter → continues in [FLOW-03](./FLOW-03-trade.md).

## Happy path — expiry

1. Offer expiry time passes while still listed.
2. System auto-closes listing; returns offer to wallet if unused OR marks expired (case study: return if not voided at register).
3. User notified; optional CTA to relist with new expiry if still valid (edge: usually not).

## Decision points

- **If** sale in progress (buyer in escrow) **then** block cancel; show “purchase processing.”
- **If** trade lock active **then** block edit/cancel until timeout or complete.

## Failure & edge paths

- Redemption at POS while listed → auto-delisted per shared rules.

## System truths

- Cancel = reverse of list reserve; offer usable again in wallet.

## States at end

- Varies: active listing, wallet restored, or sold/traded terminal state

## Open questions

Tracked in [FEAT-04 Decisions](../features/FEAT-04-my-listings.md#decisions).

## Related

- [FLOW-02](./FLOW-02-sell.md), [FLOW-03](./FLOW-03-trade.md)
- [FLOW-01](./FLOW-01-buy.md) — buyer in flight
