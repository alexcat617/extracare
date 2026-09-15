# FLOW-06: Dispute & refund

| Field | Value |
|-------|--------|
| ID | FLOW-06 |
| Priority | P0 (portfolio trust) |
| Persona | Buyer (primary), seller (respond) |
| Trigger | Transfer did not meet expectations |
| Goal | Fair resolution within 24h window; abuse signals captured |
| Preconditions | Completed buy with transfer ID within last 24h (paid flow) |

## Happy path — buyer “not in wallet”

1. Buyer opens purchase history or post-transfer status.
2. Buyer taps **Get help** / **Report issue**; selects “Offer not in my wallet.”
3. System runs automatic wallet check.
4. **If** offer present **then** show location in Deals wallet; dispute closed with education.
5. **If** offer absent **then** system retries transfer once; on failure, **full refund** from escrow (or charge reversal); listing flagged; seller payout held/reversed.
6. Buyer receives confirmation and refund timeline; case ID for support storyboard.

## Happy path — terms mismatch

1. Buyer selects “Different terms than listing.”
2. Buyer provides short description (structured: threshold, category, expiry).
3. System compares listing snapshot to issued entitlement.
4. **If** match **then** explain how to use at checkout; link [FLOW-07](./FLOW-07-redeem.md).
5. **If** mismatch **then** refund buyer; investigate seller; apply strike to seller tier.

## Happy path — seller response (optional)

1. Seller notified of dispute.
2. Seller can add comment; cannot override auto wallet verification outcome.

## Decision points

- **If** outside 24h **then** route to general support; no auto-refund path in app.
- **If** buyer already redeemed per POS **then** deny refund; flag redeem-then-dispute pattern.

## Failure & edge paths

- **Chargeback abuse:** redemption tied to transfer ID before refund allowed.
- Partial outages: manual support view (transfer ID, timestamps)—PRD FR-10 storyboard.

## System truths

- Listing snapshot immutable for dispute comparison.
- Trades: dispute path focuses on failed swap (rare)—case study can scope to paid buy only.

## States at end

- Refunded + offer void on buyer if never valid; or dispute closed no refund
- Seller: strike / suspension on confirmed abuse

## Open questions

Tracked in [FEAT-05 Decisions](../features/FEAT-05-trust-escrow-dispute.md#decisions).

## Related

- [FLOW-01](./FLOW-01-buy.md)
- [FLOWS.md](../FLOWS.md) — disputes, escrow
- PRD §7.3 — fake offer, chargeback
