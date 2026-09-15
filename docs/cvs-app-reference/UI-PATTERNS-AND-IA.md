# CVS app — UI patterns & information architecture

Structured reference from in-app screenshots for the **ExtraCare Marketplace** case study. Goal: prototype and IA that feel like an extension of CVS, not a bolt-on product.

---

## 1. Design language (visual system)

### Color and emphasis

| Role | Typical treatment |
|------|-------------------|
| **Primary actions** | Deep blue filled pills (buttons, Send to Card circle, Scan in store FAB) |
| **Secondary actions** | Blue outline pills (“Shop now”, “Edit profile”, “Sort & refine”) |
| **Savings / urgency** | **Red** bold for dollar amounts (“$4.00 off”, BOGO, promo lines) |
| **Active nav** | Red icon or red accent; Savings tab uses red money-bag when selected |
| **Surfaces** | White cards on light gray page background; thin gray borders on cards |
| **Muted text** | Gray for expiry, unit price, counts (“48 deals and rewards”) |

### Shape and density

- **Heavy corner radius** on search bars, chips, cards, and primary buttons (pill / stadium shape).
- **Cards** use ~12–16px radius, 1px light border, internal padding; list rows separated by hairline dividers **inset** from card edges.
- **Generous vertical rhythm** between sections; section titles are large bold black sans-serif.

### Iconography

- Line icons in header (chat, cart, back chevron).
- Coupon metaphor: **yellow scroll + blue coin** on Savings list cards.
- Circular **blue “+”** for “Send to Card” (clip to account).

### Floating elements

- **“Scan in store”** — blue elongated pill FAB over content (barcode/wallet icon).
- **“AI Shopping Assistant”** — blue pill FAB on shop PDP.
- **ExtraCare / wallet** — small blue circular FAB with card icon above bottom nav (home variants).

---

## 2. App shell & navigation (two observed models)

The captures show **two related shell variants**. Treat them as one product with context-specific bottom bars—not two different apps.

### Model A — Health-forward home

| Element | Behavior |
|---------|----------|
| **Top** | Profile, chat, inbox (badge), cart |
| **Search** | Full-width pill: “Search or ask a question” + scanner + **blue mic** button |
| **Quick chips** | Horizontal scroll: Vaccines, Find a store, Photo, Weekly Ad |
| **Mode toggle** | Large **segmented control**: **Health & Pharmacy** \| **Shop** (outline vs filled) |
| **Bottom** | Frosted / warm-tint **floating bar** with handle: **Home · Pharmacy · Health · Shop** |
| **Sheet handle** | Gray grabber above nav → implies **bottom sheet** can expand |

### Model B — Shop & savings forward

| Element | Behavior |
|---------|----------|
| **Bottom tabs (5)** | **Home · Savings · Shop · Photo · Orders** (Orders may show red **New** badge) |
| **Savings** | Dedicated tab — coupon hub (see §5) |
| **Shop flows** | PDP, cart, category (e.g. Vitamins) use same top search + back pattern |

### Global header actions (recurring)

- Back chevron + screen title (left-aligned title on Savings, Account, Cart).
- Top-right: **chat** (CVS bubble), **cart** (shop contexts).
- Search placeholder varies: “Search or ask a question” (shop) vs **“Find deals”** (Savings).

### IA implication for Marketplace

| Placement option | Rationale from screenshots |
|------------------|----------------------------|
| **Inside Savings tab** (recommended) | Coupons already live here with filters and Send to Card; Sam (P2) already visits for deals. Add **Marketplace** as subsection or 4th segment. |
| **Account → Purchases and Savings** | “ExtraCare”, “ExtraCare savings” rows — good for **history**, payout, disputes (FEAT-04/05). |
| **Home ExtraCare block** | “Send to card” / “View all Rewards” — link **wallet**; Jordan (P1) “Not for me” could start from wallet list. |
| **Avoid** | New root tab unless case study scope expands; extend Savings + wallet instead. |

---

## 3. Bottom sheets (primary transactional pattern)

Used for **short tasks** without full navigation away from context.

### Anatomy

| Part | Pattern |
|------|---------|
| **Container** | White panel, **rounded top corners**, overlays dimmed content |
| **Handle** | Centered **horizontal gray grabber** at top |
| **Title** | Centered bold (“Buy now”, “Added to cart”) |
| **Body** | Scrollable: product row (thumb, title, price), fulfillment, payment rows |
| **Footer CTA** | Full-width **blue pill** primary; optional **outline** secondary (“Continue shopping”) |

### Observed uses

- **Buy now** — pickup, store, pickup person, payment; expandable **order total** chevron.
- **Added to cart** — confirmation + “Frequently bought together” horizontal cards + View cart CTA.

### Marketplace mapping (FEAT-01, FEAT-05)

| Flow | Sheet pattern |
|------|----------------|
| Confirm purchase | Mirror **Buy now**: price, fee, payment, escrow line |
| Purchase success | Mirror **Added to cart**: “Offer in your wallet” + transfer ID |
| Quick filters (optional) | Sheet with Sort & refine–style options |

---

## 4. Segmented controls & tab switchers

### Pill segment bar (Savings — **primary filter pattern**)

- Track: light gray rounded rectangle.
- Segments: **All \| On card \| For you** (and room for a 4th: **Marketplace**).
- **Selected**: white pill with subtle shadow on gray track.
- Below: **Sort & refine** (outline pill + filter icon) + count label.

**Sam (P2):** marketplace browse should reuse this idiom—not invent a new filter chrome.

### Large dual toggle (Health vs Shop)

- Two equal tiles in one rounded container.
- Selected: blue border + tint; unselected: neutral border.

### Fulfillment card switcher (PDP)

- Horizontal **three cards**: Pickup | Same-Day Delivery | Shipping.
- **Selected**: blue border, blue check badge on icon, blue tint background.
- **Unselected**: gray border, monochrome icon.

**Marketplace:** use card switcher for **Buy \| Trade** on listing detail, or for **In-store \| Online** eligibility if needed.

### Sort & refine

- Outlined pill button; opens sheet or full-screen refine (not captured open—assume sheet).

---

## 5. Coupons & deals presentation (Savings screen)

**Reference screen:** Savings → Coupons → “For you” (or All / On card).

### Page structure (top → bottom)

1. Title **Savings** + chat + cart  
2. Search: **Find deals** + scanner  
3. Section **Coupons** + link **Weekly Ad** (calendar icon)  
4. **Segmented tabs** (All / On card / For you)  
5. **Sort & refine** + deal count  
6. **Vertical list** of coupon cards  
7. FAB **Scan in store**  
8. Bottom nav (Savings selected)

### Single coupon card (component spec)

```
┌─────────────────────────────────────────────┐
│ [clock] Last day          [pill] In store…  │
│  [scroll+$ icon]   $4.00 off                │
│                    $4 off your next…        │
│                    Exp MM/DD/YYYY           │
│                    [Shop now outline]       │
│                          ( Send to Card )   │
│                          (  blue + circle ) │
└─────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Container | White, bordered, rounded |
| Status | Small pills: “Last day”, channel “In store or online” |
| Amount | Large **red** bold (`$X.00 off`) |
| Body | Black regular — short headline |
| Expiry | Small gray |
| Primary commerce CTA | Outline **Shop now** |
| Clip CTA | **Send to Card**: blue circle **+** + label below (not full-width button) |

### PDP coupon row (variant)

- Horizontal carousel on light blue gradient.
- First tile: large **+** “Send to Card”.
- Next tiles: product thumb, red “SAVE $X”, expiry, **More details** link.

### Marketplace listing card (recommended adaptation)

Reuse Savings card **layout**; swap actions:

| CVS today | Marketplace |
|-----------|-------------|
| Send to Card | **Buy** or **View listing** (blue primary) |
| Shop now | **See terms** / category link |
| — | Badge: **From marketplace** / seller rating |
| — | Price to buy (not clip) |

Jordan’s **listed** offers might show in **My listings** with same card shell, different footer actions (Edit price, Cancel).

---

## 6. ExtraCare & wallet (home)

- Section **Saving & Rewards** / ExtraCare imagery.
- Balances: “Total on card”, “Available to send”.
- CTAs: filled **Send to card**; outline **View all Rewards**.

**Marketplace tie-in:**

- Wallet list ≈ Savings **On card** tab content.
- Purchased marketplace offers: same card UI + **marketplace badge** (FEAT-06).
- **Not for me** → secondary action on card (FEAT-02) — place near Send to Card or in overflow.

---

## 7. Shop & cart patterns

### Product detail (PDP)

- Search bar persists under back/cart.
- Image carousel dots; share + heart.
- Price + vertical rule + red promo (BOGO).
- Coupon carousel; fulfillment cards; AI assistant FAB.

### Cart

- Pickup summary card (icon, address, “Change how to get it” outline).
- Line item card: thumb, title, price, **Qty** pill stepper, trash.
- Promo row: “Buy 1, Get 1 Free” + Add items; **View all available deals** chevron row.
- Empty: icon in circle, **Start shopping** blue pill, **Buy it again** carousel.

**Marketplace:** cart patterns are **less central**; borrow **line item + summary** language for purchase receipt / transfer status.

---

## 8. Account IA (grouped lists)

- Profile header: avatar initials, Hi name, email, **Edit profile** outline pill.
- Sections with **icon + bold title**; white grouped card:
  - Account details (profile, security, payment, addresses…)
  - Prescriptions and health
  - **Purchases and Savings**: Purchase history, Buy it again, **ExtraCare**, **ExtraCare savings**
  - Settings, Support

**Marketplace:**

| Item | Suggested location |
|------|-------------------|
| Marketplace purchase history | Purchases and Savings → new row or under ExtraCare savings |
| Disputes / help | Support or nested under history |
| Seller payouts (case study) | ExtraCare savings or Marketplace hub |

---

## 9. Component checklist (for prototype)

Use when building FEAT-00+ in Tailwind:

- [ ] Pill search input with scanner affordance  
- [ ] Horizontal **chip** scroller  
- [ ] **Segmented pill tabs** (3–4 segments)  
- [ ] Outline **Sort & refine** + count text  
- [ ] **Coupon/deal card** (status pills, red amount, dual CTAs)  
- [ ] **Bottom sheet** (handle, title, footer CTAs)  
- [ ] **Grouped list card** (chevron rows)  
- [ ] **FAB** Scan / wallet (contextual)  
- [ ] **5-tab** or **4-tab** bottom nav (pick one model per prototype shell)  
- [ ] Fulfillment-style **selectable cards** (for buy vs trade or filters)  

---

## 10. Suggested APP.md IA tree (aligned to screenshots)

```text
CVS app shell (Model B for marketplace focus)
├── Home
├── Savings  ← anchor for marketplace
│   ├── Coupons (All | On card | For you | Marketplace*)
│   ├── Weekly Ad (link)
│   └── Marketplace* (browse, listing detail — FEAT-01)
│       ├── Checkout sheet (FEAT-01)
│       └── My listings* (FEAT-02/04) — or sub-nav from Savings header
├── Shop / Cart / Account (existing patterns)
└── Modals: consent (FEAT-00), dispute (FEAT-05)

* new for case study
```

Entry points from [FLOWS.md](../../FLOWS.md) should land on nodes above, not orphan screens.

---

## 11. Persona quick map

| Pattern | Jordan P1 | Sam P2 |
|---------|-----------|--------|
| Savings coupon card | Lists from wallet / “not for me” | Reads amount + expiry before buy |
| Segmented tabs | Unlikely to refine | **For you** + Marketplace + filters |
| Bottom sheet | Short list/publish confirm | **Buy** confirm + escrow |
| Send to Card | Familiar metaphor → **List on Marketplace** | N/A (buys completed transfer) |
| Sort & refine | Low | High |

---

## Changelog

| Date | Notes |
|------|-------|
| 2026-03-24 | Initial breakdown from user screenshot batch |
