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
4. User sends proposal with optional message.
5. Seller receives notification; reviews proposal.
6. Seller accepts, declines, or counters with different bundle.
7. Both parties reach agreement; system shows **pending lock** summary (both offers frozen).
8. Each user taps **Confirm trade** within timeout window.
9. System atomically voids both sides’ offers and re-issues cross-wise; transfer IDs linked.
10. Both see success; offers in respective wallets → [FLOW-07](./FLOW-07-redeem.md).

## Happy path — initiate from wallet (open trade)

1. User lists offer as **Trade preferred** (or trade-only) via [FLOW-02](./FLOW-02-sell.md) variant.
2. Other users send proposals; seller manages in My listings → [FLOW-05](./FLOW-05-manage-listings.md).

## Decision points

- **If** one party does not confirm before timeout **then** lock released; proposals expire; no transfer.
- **If** either offer becomes invalid (expiry) during negotiate **then** cancel with explanation.
- **If** seller accepts but buyer withdraws **then** treat as decline; no lock until dual confirm.

## Failure & edge paths

- **Trade bait** mitigated by dual confirm (step 8)—single accept insufficient.
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
