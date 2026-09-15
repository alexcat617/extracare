# App design

Working name: **ExtraCare Marketplace** (CVS Health app case study)

**Visual & shell reference:** [docs/cvs-app-reference/UI-PATTERNS-AND-IA.md](./docs/cvs-app-reference/UI-PATTERNS-AND-IA.md) — bottom sheets, Savings coupon cards, segmented filters, nav models.

## What kind of app

- **Platform:** Mobile-first web prototype (matches iOS CVS patterns); native optional later
- **Audience:** [PERSONAS.md](./PERSONAS.md) — P1 Jordan, P2 Sam
- **Use context:** Quick tasks (list, buy, clip); not long browsing sessions

## Core loop

*Portfolio demo: Jordan (P1) supplies, Sam (P2) buys.*

1. **Jordan** — Savings → On card → not for me → list on Marketplace ([FEAT-02-map](./features/maps/FEAT-02-map.md)).
2. **Sam** — Savings → Marketplace → browse/filter → buy with escrow ([FEAT-01-map](./features/maps/FEAT-01-map.md)).
3. **Sam** — Wallet shows offer + transfer ID → stock-up / redeem ([FEAT-06-map](./features/maps/FEAT-06-map.md)).



## Information architecture

*Skeleton — detail in [UI-PATTERNS-AND-IA.md §10](./docs/cvs-app-reference/UI-PATTERNS-AND-IA.md#10-suggested-appmd-ia-tree-aligned-to-screenshots).*


| Area                              | Purpose                                                        |
| --------------------------------- | -------------------------------------------------------------- |
| **Savings** (tab)                 | Coupons: All / On card / For you + **Marketplace** (new)       |
| **Savings → Marketplace**         | Browse, listing detail, buy sheet (FEAT-01)                    |
| **Wallet / On card**              | Jordan sell entry, Sam post-purchase offers (FEAT-02, FEAT-06) |
| **Account → Purchases & Savings** | ExtraCare, history, marketplace activity (FEAT-04/05)          |
| **Sheets**                        | Buy confirm, success, consent (FEAT-00/01)                     |




## App shell

- **Primary navigation:** Bottom bar — **Home · Savings · Shop · Photo · Orders** (shop-focused prototype); Savings hosts Marketplace.
- **Global actions:** Search (“Find deals” on Savings), chat, cart, **Scan in store** FAB where appropriate.
- **Signed-in:** ExtraCare linked; marketplace consent (FEAT-00) for transactions.



## Key entities

- **Offer** — wallet coupon (transferable or not)
- **Listing** — marketplace view of an offer for sale/trade
- **Transfer** — void + re-issue event (`transferId`, status, parties)
- **Transaction** — paid buy (escrow, fees) or trade record



## States to design (not just happy path)

- [x] Empty (first use)
- [x] Loading
- [x] Error / offline
- [x] Success / confirmation
- [ ] Settings / account (if needed)



## Flow maps (design source)

Implementation is driven by **journey maps** + persona stories—not a screen inventory.

| Resource | Purpose |
|----------|---------|
| [features/maps/README.md](./features/maps/README.md) | Index of all FEAT flow maps |
| [FEAT-00 … FEAT-07 maps](./features/maps/) | Mermaid paths (happy + key errors) per build package |
| [FEATURES.md](./FEATURES.md) | Status, waves, build handoff |

When designing or building, open the **map** for the FEAT you are working on and follow nodes in order.




## Links

- [Project wiki](./docs/WIKI.md)
- [CVS UI reference](./docs/cvs-app-reference/UI-PATTERNS-AND-IA.md)
- [FEATURES](./FEATURES.md) · [Flow maps](./features/maps/) · [FLOWS](./FLOWS.md)
- [Project overview](./README.md)
- [Product concept](./CONCEPT.md)
- [Personas](./PERSONAS.md)
- [Notes — patterns & open questions](./NOTES.md)

