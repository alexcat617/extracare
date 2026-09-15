# FLOW-07: Redeem purchased offer

| Field | Value |
|-------|--------|
| ID | FLOW-07 |
| Priority | P1 |
| Persona | Buyer after FLOW-01 or FLOW-03 |
| Trigger | User shops at CVS with marketplace-acquired offer in wallet |
| Goal | Coupon applies at checkout; seller paid (if escrow pending edge cleared); ratings triggered |
| Preconditions | Offer in buyer wallet; in-store or online per terms |

## Happy path — in store

1. User opens Deals wallet; confirms offer and checklist (min basket, product scope).
2. User shops in store; at checkout scans ExtraCare (buyer’s account).
3. POS applies eligible offer; receipt shows discount.
4. System marks offer redeemed; links redemption to **transfer ID**.
5. If escrow was already released at wallet sync, no change; if any hold remained (edge), release completes.
6. User prompted to rate seller/trade partner (optional skip).

## Happy path — online

1. User shops on CVS.com/app with same ExtraCare linked.
2. Offer auto-applies or user sends to card per existing app behavior.
3. Steps 4–6 same as in-store.

## Decision points

- **If** offer fails at POS **then** show in-app troubleshooting (wrong SKU, threshold not met); link [FLOW-06](./FLOW-06-dispute-refund.md) if entitlement wrong.
- **If** user abandons before expiry **then** offer remains until expiry; no auto-refund.

## Failure & edge paths

- Expired before use → standard expiry UX; no marketplace refund.
- Stacking conflicts → pre-checkout validator messaging (copy from listing checklist).

## System truths

- Redemption delists any erroneous duplicate state on seller side (already void).
- Marketplace badge on wallet offer distinguishes purchased vs issued.

## States at end

- Offer: redeemed / consumed
- Transaction: complete
- Ratings: captured or deferred

## Open questions

Tracked in [FEAT-06 Decisions](../features/FEAT-06-redeem.md#decisions).

## Related

- [FLOW-01](./FLOW-01-buy.md), [FLOW-03](./FLOW-03-trade.md)
- [FLOW-06](./FLOW-06-dispute-refund.md)
