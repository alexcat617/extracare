# FLOW-03: Trade offers

| Field | Value |
|-------|--------|
| ID | FLOW-03 |
| Priority | P0 |
| Persona | Deal optimizer, household coordinator |
| Trigger | User prefers swap over cash (from wallet or listing detail) |
| Goal | Two parties exchange offers atomically with no payment or balanced trade value |
| Preconditions | User has at least one transferable offer for counter; marketplace enabled |

## Happy path — initiate from listing

1. Buyer views someone else’s listing ([FLOW-01](./FLOW-01-buy.md) step 2).
2. User taps **Propose trade**.
3. User selects 1–3 of their wallet offers as counter (system shows fairness hint vs listing value).
4. User sends proposal.
5. Seller receives notification; reviews proposal.
6. Seller accepts or declines (buyer may send a new proposal after decline).
7. Seller **accepts** → system atomically voids both sides’ offers and re-issues cross-wise; transfer IDs linked.
8. Both see success confirmation; offers in respective wallets → [FLOW-07](./FLOW-07-redeem.md).

## Happy path — initiate from wallet (open trade)

1. User lists offer as **Trade preferred** (or trade-only) via [FLOW-02](./FLOW-02-sell.md) variant.
2. Other users send proposals; seller manages in My listings → [FLOW-05](./FLOW-05-manage-listings.md).

## Decision points

- **If** either offer becomes invalid (expiry) during negotiate **then** cancel with explanation.

## Failure & edge paths

- **Trade bait** mitigated by seller review before accept; buyer committed when sending proposal.
- **Unequal value** → system allows but shows “you’re giving more savings” warning; no blocking in case study unless extreme.
- **One offer already listed** → cannot add to trade bundle until delisted.

## System truths

- No escrow for pure trade (no money movement).
- Same void + re-issue as paid buy, two entitlements.

## States at end

- Each party: received offer(s) in wallet; gave up prior offer(s)
- Listing: closed
- Trade record: linked transfer IDs

## Open questions

Tracked in [FEAT-03 Decisions](../features/FEAT-03-trade.md#decisions).

## Related

- [FLOW-02](./FLOW-02-sell.md), [FLOW-01](./FLOW-01-buy.md)
- PRD §7.3 — trade bait
