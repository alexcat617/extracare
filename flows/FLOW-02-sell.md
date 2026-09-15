# FLOW-02: Sell from wallet

| Field | Value |
|-------|--------|
| ID | FLOW-02 |
| Priority | P0 |
| Persona | Casual member, deal optimizer |
| Trigger | User has coupons they won’t use before expiry |
| Goal | Offer is live on marketplace at a valid price; seller retains no duplicate usable copy |
| Preconditions | Transferable offer in wallet; sell eligibility (7+ days, phone verify, under listing cap) |

## Happy path

1. User opens Deals wallet (or post-trip coupon list).
2. User selects offer; taps **Not for me** or **Sell on Marketplace**.
3. System shows transferable vs blocked offers if user picked ineligible item → explain why (Rx, non-transferable type).
4. User chooses **Sell** (not trade/gift).
5. System pre-fills listing: title, savings estimate, expiry, rules, suggested price band.
6. User sets asking price within floor/ceiling; sees platform fee and estimated payout.
7. User publishes listing.
8. System voids/reserves seller entitlement on card (no double use); listing goes live.
9. User lands on “My listings” or confirmation with link to → [FLOW-05](./FLOW-05-manage-listings.md).

## Decision points

- **If** user chooses **Trade** **then** → [FLOW-03](./FLOW-03-trade.md) from step 4.
- **If** user chooses **Gift** **then** → [FLOW-04](./FLOW-04-gift.md).
- **If** price outside band **then** block publish with guidance to adjust.
- **If** first-time seller **then** optional tooltip on void-on-list behavior.

## Failure & edge paths

- **Not eligible to sell** (new account) → show days remaining; allow gift/trade only if policy allows (case study: trade allowed, sell blocked).
- **Offer expires before publish completes** → error; remove from flow.
- **User redeems at POS while listing live** → POS sync delists; notify “listing removed—offer redeemed.”
- **Marketplace consent missing** → [FLOW-00](./FLOW-00-marketplace-entry.md).

## System truths

- One active listing per offer ID ([FLOWS.md](../FLOWS.md)).
- Seller cannot use same offer in store while listed.

## States at end

- Seller: no active entitlement for that offer (held in listing)
- Listing: active, visible in marketplace
- Buyer: none yet

## Open questions

Tracked in [FEAT-02 Decisions](../features/FEAT-02-sell-list.md#decisions).

## Related

- [FLOW-01](./FLOW-01-buy.md) — buyer side
- [FLOW-05](./FLOW-05-manage-listings.md)
- PRD §7.3 — double sell, farming
