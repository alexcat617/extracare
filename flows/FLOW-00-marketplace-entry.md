# FLOW-00: Marketplace entry & rules

| Field | Value |
|-------|--------|
| ID | FLOW-00 |
| Priority | P1 |
| Persona | Any ExtraCare member |
| Trigger | First navigation to Marketplace (or first sell/trade attempt) |
| Goal | User understands official transfer and agrees to marketplace rules |
| Preconditions | Signed in; ExtraCare linked |

## Happy path

1. User opens Marketplace from Deals & Rewards (or deep link).
2. System detects first-time marketplace visitor (or rules version bump).
3. User sees short explanation: offers **move to buyer’s card**; no barcode screenshots; CVS escrow on purchases.
4. User accepts marketplace terms (checkbox + continue).
5. System records consent; user lands on marketplace browse (→ [FLOW-01](./FLOW-01-buy.md) step 1).

## Decision points

- **If** user dismisses without accepting **then** browse allowed in read-only mode; sell/buy/trade CTAs prompt FLOW-00 again.
- **If** ExtraCare not linked **then** prompt link flow (existing app pattern); return to FLOW-00 step 3.

## Failure & edge paths

- Offline at entry → cached browse if available; transactional CTAs disabled with retry message.

## System truths

- Consent version stored on account for case study support narrative.

## States at end

- User: marketplace_enabled = true
- No offer or listing state change

## Open questions

Tracked in [FEAT-00 Decisions](../features/FEAT-00-marketplace-foundation.md#decisions).

## Related

- [FLOWS.md](../FLOWS.md) — shared rules
- [FLOW-02](./FLOW-02-sell.md), [FLOW-01](./FLOW-01-buy.md)
