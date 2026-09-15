# Personas — ExtraCare Marketplace (case study)

Two primary personas for design and feature decisions. When speccing or building, tag requirements with **P1** (Jordan) or **P2** (Sam).

**Related:** [Wiki](./docs/WIKI.md) · [CONCEPT.md](./CONCEPT.md) · [PRD §4](./PRD-cvs-coupon-marketplace.md) · [FLOWS](./FLOWS.md) · [FEATURES](./FEATURES.md) · [Flow maps](./features/maps/)

---

## P1 — Jordan Reyes, “The Overwhelmed Regular”

| | |
|--|--|
| **Age** | 38 |
| **Household** | Partner + two kids (8 and 12); shops CVS for snacks, first aid, occasional personal care |
| **ExtraCare** | Member 4+ years; app installed for pharmacy refills, rarely opens Deals |
| **Tech comfort** | Uses phone for essentials; avoids “coupon math” |

### Snapshot

Jordan leaves CVS with a long receipt and a pile of app coupons—most for categories they don’t buy this month (baby, premium skincare, vitamins they already have). Offers expire in the junk drawer of the app. They’ve heard family swap deals by using someone else’s phone at checkout and find it awkward.

### Goals

- Stop feeling guilty about wasted coupons.
- Get rid of irrelevant offers **without** learning coupon forums or spreadsheets.
- Trust that listing a deal won’t break checkout or scam someone.

### Frustrations

- Too many personalized offers; unclear which matter.
- Rules like “$5 off $20” or “25% off 2+” are tiring.
- Doesn’t want to manage prices like eBay—wants **suggested price** and one-tap list.

### Marketplace behaviors

| Job | How they use the product |
|-----|---------------------------|
| Primary | **Sell** or **“Not for me” → list** (FEAT-02, FLOW-02) |
| Secondary | **Gift** to partner (FEAT-07) when kids’ deals still appear |
| Rare | Browse to buy only when push says “deal in a category you buy” |

### What we must design for Jordan

- Plain language terms; **no barcode screenshots**; clear “this leaves your card until sold/cancelled.”
- **Suggested price band** and fee/payout preview before publish.
- Short **marketplace rules** on first use (FEAT-00, FLOW-00)—official transfer, not phone-number hacks.
- Gentle eligibility messaging (e.g. account age) without jargon.

### Primary flows and features

FLOW-02 · FLOW-00 · FEAT-02 · FEAT-00 · (later) FEAT-04 cancel/expiry

### Quote

> “I don’t need another hobby—I just don’t want these coupons to die if someone else can use them.”

---

## P2 — Sam Okonkwo, “The Category Hunter”

| | |
|--|--|
| **Age** | 29 |
| **Household** | Single; urban; shops oral care, skin care, and OTC on a schedule |
| **ExtraCare** | App linked; checks Deals before a stock-up trip |
| **Tech comfort** | Compares unit prices on Amazon/Walmart; willing to tap through filters |

### Snapshot

Sam plans a “personal care stock-up” every few weeks. ExtraCare sends great oral care CRTs—but not every trip. They’d pay a few dollars for someone else’s matching coupon if it beats waiting for the next personalized drop. They care that the deal is **real** and will work at self-checkout.

### Goals

- **Maximize savings** on known categories, not random categories.
- Find offers **before expiry** with clear thresholds.
- Buy with confidence: **escrow**, transfer ID, offer shows in wallet before the trip.

### Frustrations

- Personalized feed is noisy; hard to find “toothpaste / $3 off” quickly.
- Distrusts random coupon trades outside the app.
- Basket thresholds make it unclear if a downloaded deal is worth an extra item.

### Marketplace behaviors

| Job | How they use the product |
|-----|---------------------------|
| Primary | **Browse + filter + buy** (FEAT-01, FLOW-01) |
| Secondary | **Propose trade** if they have a tradeable offer Sam doesn’t need (FEAT-03) |
| Later | **Redeem checklist** + rate seller (FEAT-06, FEAT-05 if something fails) |

### What we must design for Sam

- **Filters** (category, expires soon, discount type) and scannable listing cards.
- Listing detail **terms checklist** before pay; **protected purchase / escrow** state after buy.
- Optional **seller rating** on detail (decision in FEAT-01).
- Fast path from purchase → **wallet** with marketplace badge on the offer.

### Primary flows and features

FLOW-01 · FLOW-07 · FEAT-01 · FEAT-05 (trust) · FEAT-06

### Quote

> “If I’m stocking up on oral care, I’ll pay for the right coupon—as long as it’s actually on my card before I go.”

---

## Persona ↔ feature map

| Feature | Jordan (P1) | Sam (P2) |
|---------|-------------|----------|
| FEAT-00 Foundation | Needs simple consent | Needs trust copy |
| FEAT-01 Buy & browse | Low | **Primary** |
| FEAT-02 Sell & list | **Primary** | Low |
| FEAT-03 Trade | Occasional | Secondary |
| FEAT-05 Trust / dispute | Must feel safe listing | **Critical** on buy |
| FEAT-06 Redeem | — | Closes loop |

## Case study demo pairing

**Portfolio story:** Jordan lists a “not for me” deal → Sam filters, buys, sees wallet + transfer ID → (optional) Sam redeems on stock-up trip.

---

## Out of scope for these two (still valid users, not primary)

- Power **household coordinator** who only gifts—fold into Jordan + FEAT-07 when needed.
- Full-time **deal optimizer** who trades daily—partially covered by Sam + FEAT-03.
