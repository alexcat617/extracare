# Product requirements document

**Feature:** ExtraCare Marketplace  
**Context:** Enhancement to CVS Health app · ExtraCare members  
**Status:** Case study — product and UX concept  
**Wiki:** [docs/WIKI.md](./docs/WIKI.md)

---

## 0. Case study framing

Portfolio case study—not a CVS legal pitch. **Buy, sell, trade** in scope; **fraud and trust** are first-class. Offers **move atomically** (void seller → issue buyer); **escrow** on paid buys.

**Flows:** [FLOWS.md](./FLOWS.md) · **Features:** [FEATURES.md](./FEATURES.md) · **Maps:** [features/maps/](./features/maps/)

---

## 1. Executive summary

ExtraCare members receive many personalized coupons; many go unused. The **ExtraCare Marketplace** lets members **buy, sell, and trade** offers with **protected transfer** and **escrow**.

---

## 2. Problem statement

Offer overload, expiry, complex rules, poor fit, competitive pricing (Amazon/Walmart). Unused offers hurt redemption and loyalty.

---

## 3. Goals

**Business:** Volume, basket diversity/size, loyalty, app use.  
**User:** Maximize savings and utility of rewards.  
**Metrics:** Redemption rate, time-to-redemption, incremental sales, engagement, fraud/disputes guardrail.

---

## 4. Users and scope

ExtraCare members (18+, US, app-first). Actions: buy, sell, trade within platform caps.

**Personas:** [PERSONAS.md](./PERSONAS.md) — P1 Jordan (sell), P2 Sam (buy).

**Out of scope v1:** Non-members, external sellers, Rx/pharmacy offers in marketplace, paper OCR marketplace, deep legal appendix.

---

## 5. Research summary (context)

- Offers tied to ExtraCare card; case study assumes **CVS-mediated transfer**.  
- CPG coupons often non-assignable in production—case study uses retailer-controlled transfer.  
- P2P coupon apps exist; patterns: escrow, verification, ratings.  
- See [docs/cvs-app-reference/](./docs/cvs-app-reference/) for CVS UI research.

---

## 6. Chosen product concept

**ExtraCare Marketplace** — sell (price/ExtraBucks), buy (escrow), trade (dual confirm), gift optional. Price floor/ceiling vs savings. Discovery: category, expiry, filters.

---

## 7. Functional requirements

### 7.1 Wallet and listing

- Transferable vs blocked offers; list with terms; browse/filter marketplace.

### 7.2 Transactions

- Buy/sell with escrow; trade with atomic swap; gift at $0.

### 7.3 Trust and safety

| Threat | Mitigation |
|--------|------------|
| Double sell | One listing per offer; void on list; POS delist |
| Fake/expired offer | Escrow until wallet verify; auto-refund |
| Account farming | Tenure, phone verify, listing caps |
| Price laundering | Min/max vs face value |
| Trade bait | Dual confirm lock |
| Chargeback abuse | Transfer ID + redemption tie |
| Off-platform leakage | No barcode in listings |
| Bot sniping | Rate limits / fair queue (optional) |

### 7.4–7.5 Discovery, checkout

- Expiry nudges; “not for me”; compatibility checklist; post-redemption payout.

---

## 8. Non-functional requirements

Performance, availability with Deals module, secure server-side transfer, privacy, WCAG 2.2 AA target, case study compliance footnote.

---

## 9. User flows (high level)

List → acquire → fulfill (wallet) → expire/cancel. Detail in [flows/](./flows/).

---

## 10–11. Dependencies and risks

ExtraCare entitlement service, payment/ExtraBucks, policy engine, support playbooks. Risks: confusion vs gray market, fraud, cannibalization, stack rules—mitigations in §7.3 and FEAT-05.

---

## 12. Case study scope

P0: browse, detail, list, buy, escrow success. P1: trade, dispute, my listings. Seed 8–12 listings. **Design source:** [features/maps/](./features/maps/) (not screen table).

---

## 13. Open questions

Track in [FEATURES.md § Wave A](./FEATURES.md#wave-a-decisions-blocking-ready) and FEAT **Decisions** (payment mocks, tone, hero metric, receipt vs app-only, etc.).

---

## 14. Appendix

Original one-pager: coupon overload → marketplace → business and user goals.  
References: CVS Coupon Policy, ExtraCare terms (context), CPG redemption policies (context).
