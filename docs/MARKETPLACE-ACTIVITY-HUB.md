# Marketplace activity hub (member operational UI)

**Not** an internal CVS program dashboard. This is the **shopper-facing** hub for marketplace sellers and buyers: balances, inventory, saved/earned, and trust—mobile-first inside **Savings → Marketplace**.

## Purpose

For a C2C coupon marketplace, members need a **light operational surface** (not executive analytics): real-time-ish activity, wallet balances, and quick tasks—similar in spirit to Mercari/Poshmark seller hubs and digital-wallet apps (Revolut/Venmo card layouts).

**Design references (inspiration only):** Gameflip, CardCash, Mercari, Poshmark, Raise, Snaplii.

## Entry

- **Primary:** Savings → **Marketplace** segment → **Activity**
- **Also:** Sell flow → **My listings** after publish
- **Future (not in prototype):** Account → Purchases & Savings → Marketplace activity

## Metrics (case study)

| Category | Metric | UI |
|----------|--------|-----|
| Financials | Available balance & pending escrow | Hero card |
| Inventory | Active listings & expiring &lt;48h | Counter chips |
| Value | Total saved / total earned | Toggle (buyer vs seller) |
| Trust | Fulfillment % & rating | Text badge (not color-only) |

**Mocks:** Trust defaults to 99% / 4.9★ unless a disputed transfer exists in prototype state. Escrow pending is $0 unless extended later. **Live:** listing counts, trade pending, saved/earned from [`marketplaceActivity.ts`](../prototype/src/lib/marketplaceActivity.ts).

## Relationship to FEAT-04

This hub is the **v1 surface** for seller ops. Full **My listings** (edit price, cancel, sold/expired tabs) remains [FEAT-04](../features/FEAT-04-my-listings.md).

## Changelog

| Date | Change |
|------|--------|
| 2026-09-18 | Initial hub spec + prototype screen |
