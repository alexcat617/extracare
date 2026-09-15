# FLOW-01: Buy a listing

| Field | Value |
|-------|--------|
| ID | FLOW-01 |
| Priority | P0 |
| Persona | Category loyalist, deal optimizer |
| Trigger | User wants a specific deal from marketplace |
| Goal | User owns the offer in their ExtraCare wallet after a protected purchase |
| Preconditions | Marketplace enabled ([FLOW-00](./FLOW-00-marketplace-entry.md)); payment method or ExtraBucks balance |

## Happy path

1. User opens Marketplace; optionally applies filters (category, expires soon, discount type).
2. User selects a listing; reviews terms checklist (min purchase, in-store/online, expiry, stack rules summary).
3. User taps buy; reviews price, platform fee, and total.
4. User confirms payment (card on file, ExtraBucks, or mock wallet).
5. System places payment in **escrow**; starts transfer (void seller listing + entitlement, issue buyer entitlement).
6. System confirms offer appears in buyer’s Deals wallet; displays **transfer ID** and “protected purchase” state.
7. System releases escrow to seller (minus fee); prompts buyer to rate seller after redemption or in 7 days.
8. User continues to shop or → [FLOW-07](./FLOW-07-redeem.md).

## Decision points

- **If** user taps **Propose trade** instead of buy **then** → [FLOW-03](./FLOW-03-trade.md) from this listing.
- **If** listing flagged high-demand **then** optional fair queue before step 4 (case study: mention in copy only).
- **If** buyer lacks sell eligibility irrelevant; buying may still be allowed with phone verify only.

## Failure & edge paths

- **Payment fails** → no transfer; user stays on listing; retry or change method.
- **Wallet sync timeout (&gt; 15 min)** → auto-refund from escrow; notify buyer and seller; listing may return to active or cancelled per policy (case study: relist by seller).
- **Listing sold to another buyer** → optimistic UI rollback; show “no longer available.”
- **User not accepted FLOW-00** → block step 4 until consent.

## System truths

- Barcode not shown on listing detail—only post-transfer in wallet.
- Escrow release tied to wallet verification, not in-store redemption (redemption → [FLOW-07](./FLOW-07-redeem.md)).

## States at end

- Buyer: offer in wallet; transaction record with transfer ID
- Seller: entitlement void; payout initiated
- Listing: sold / closed

## Open questions

Tracked in [FEAT-01 Decisions](../features/FEAT-01-buy-browse.md#decisions).

## Related

- [FLOWS.md](../FLOWS.md) — escrow, transfer
- [FLOW-06](./FLOW-06-dispute-refund.md)
- PRD §7.3 — fake offer, chargeback rows
