# FLOW-04: Gift to member

| Field | Value |
|-------|--------|
| ID | FLOW-04 |
| Priority | P2 |
| Persona | Household coordinator |
| Trigger | User wants to give an offer to known member, no payment |
| Goal | Recipient has offer on their ExtraCare card; sender voided |
| Preconditions | Transferable offer; recipient identifiable (phone, contact, ExtraCare lookup) |

## Happy path

1. User selects offer in wallet → **Gift**.
2. User picks recipient (contact list, phone number lookup, recent marketplace party).
3. System shows terms; sender confirms gift (price $0).
4. Recipient receives push/in-app request (optional accept for non-household—case study: instant for household, accept for others).
5. On completion, system transfers entitlement; sender copy void.
6. Recipient sees offer in wallet with “Gift from [name]” metadata.

## Decision points

- **If** recipient declines or 48h no response **then** offer returns to sender wallet; listing not created.
- **If** recipient not found **then** invite to join ExtraCare (out of scope detail).

## Failure & edge paths

- Same eligibility as sell for **sender** transferable offers.
- Gift does not bypass non-transferable offer types.

## System truths

- No escrow; no platform fee.
- Audit trail with transfer ID for support.

## States at end

- Sender: void
- Recipient: active offer
- No marketplace listing

## Open questions

Tracked in [FEAT-07 Decisions](../features/FEAT-07-gift.md#decisions).

## Related

- [FLOW-02](./FLOW-02-sell.md)
- [FLOWS.md](../FLOWS.md) — transfer rules
