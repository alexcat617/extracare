import type { Listing, Offer, WalletOffer } from '../types/marketplace'

const memberSeller = 'member-jordan'
const memberBuyer = 'member-sam'

export function createSeedOffers(): Offer[] {
  return [
    {
      id: 'off-001',
      entitlementId: 'ent-001',
      title: 'Crest 3D White',
      savingsAmount: 4,
      headline: '$4 off your next Crest 3D White toothpaste purchase',
      expiry: '2026-10-15',
      channel: 'both',
      category: 'oral-care',
      transferable: true,
      status: 'active',
      minPurchase: 1,
      stackSummary: 'Limit 1 per household',
    },
    {
      id: 'off-002',
      entitlementId: 'ent-002',
      title: 'Pampers Swaddlers',
      savingsAmount: 5,
      headline: '$5 off Pampers Swaddlers super pack',
      expiry: '2026-09-30',
      channel: 'in-store',
      category: 'baby',
      transferable: true,
      status: 'active',
      minPurchase: 1,
    },
    {
      id: 'off-003',
      entitlementId: 'ent-003',
      title: 'Nature Made Vitamins',
      savingsAmount: 3,
      headline: '$3 off Nature Made vitamins',
      expiry: '2026-11-01',
      channel: 'both',
      category: 'vitamins',
      transferable: true,
      status: 'active',
    },
    {
      id: 'off-004',
      entitlementId: 'ent-004',
      title: 'Spend $30 save $10',
      savingsAmount: 10,
      headline: '$10 off when you spend $30 on household essentials',
      expiry: '2026-09-20',
      channel: 'both',
      category: 'threshold',
      transferable: true,
      status: 'active',
      minPurchase: 30,
    },
    {
      id: 'off-005',
      entitlementId: 'ent-005',
      title: 'Colgate Total',
      savingsAmount: 2.5,
      headline: '$2.50 off Colgate Total toothpaste',
      expiry: '2026-10-05',
      channel: 'both',
      category: 'oral-care',
      transferable: true,
      status: 'active',
    },
    {
      id: 'off-006',
      entitlementId: 'ent-006',
      title: 'Huggies Little Snugglers',
      savingsAmount: 4,
      headline: '$4 off Huggies Little Snugglers',
      expiry: '2026-10-12',
      channel: 'in-store',
      category: 'baby',
      transferable: true,
      status: 'active',
    },
    {
      id: 'off-007',
      entitlementId: 'ent-007',
      title: 'One A Day Multivitamin',
      savingsAmount: 6,
      headline: '$6 off One A Day multivitamin 100ct',
      expiry: '2026-09-25',
      channel: 'both',
      category: 'vitamins',
      transferable: true,
      status: 'active',
    },
    {
      id: 'off-008',
      entitlementId: 'ent-008',
      title: 'Spend $25 save $5',
      savingsAmount: 5,
      headline: '$5 off when you spend $25 on oral care',
      expiry: '2026-09-28',
      channel: 'both',
      category: 'threshold',
      transferable: true,
      status: 'active',
      minPurchase: 25,
    },
    {
      id: 'off-009',
      entitlementId: 'ent-009',
      title: 'CeraVe Moisturizer',
      savingsAmount: 4,
      headline: '$4 off CeraVe daily moisturizer',
      expiry: '2026-10-20',
      channel: 'both',
      category: 'skin-care',
      transferable: true,
      status: 'active',
    },
    {
      id: 'off-010',
      entitlementId: 'ent-010',
      title: 'Sensodyne Pronamel',
      savingsAmount: 3,
      headline: '$3 off Sensodyne Pronamel',
      expiry: '2026-09-22',
      channel: 'both',
      category: 'oral-care',
      transferable: true,
      status: 'active',
    },
    {
      id: 'off-011',
      entitlementId: 'ent-011',
      title: 'Gerber Snacks',
      savingsAmount: 2,
      headline: '$2 off Gerber baby snacks',
      expiry: '2026-10-08',
      channel: 'in-store',
      category: 'baby',
      transferable: true,
      status: 'active',
    },
    {
      id: 'off-012',
      entitlementId: 'ent-012',
      title: 'Centrum Silver',
      savingsAmount: 5,
      headline: '$5 off Centrum Silver 80ct',
      expiry: '2026-11-15',
      channel: 'both',
      category: 'vitamins',
      transferable: true,
      status: 'active',
    },
    {
      id: 'off-rx',
      entitlementId: 'ent-rx',
      title: 'Prescription savings',
      savingsAmount: 10,
      headline: 'Rx coupon — not transferable',
      expiry: '2026-12-01',
      channel: 'in-store',
      category: 'household',
      transferable: false,
      status: 'active',
    },
  ]
}

export function createSeedListings(offers: Offer[]): Listing[] {
  const listed = offers.filter((o) =>
    ['ent-001', 'ent-003', 'ent-004', 'ent-007', 'ent-008', 'ent-009', 'ent-012'].includes(
      o.entitlementId,
    ),
  )
  const prices: Record<string, number> = {
    'ent-001': 2.5,
    'ent-003': 1.75,
    'ent-004': 6,
    'ent-005': 1.25,
    'ent-007': 3.5,
    'ent-008': 2.75,
    'ent-009': 2,
    'ent-010': 1.5,
    'ent-011': 1,
    'ent-012': 3,
  }
  const now = new Date().toISOString()
  return listed.map((o, i) => ({
    id: `lst-${String(i + 1).padStart(3, '0')}`,
    offerEntitlementId: o.entitlementId,
    offerId: o.id,
    sellerMemberId: memberSeller,
    type: 'sale' as const,
    price: prices[o.entitlementId] ?? 2,
    status: 'active' as const,
    createdAt: now,
    expiresAt: o.expiry,
    badge:
      i % 4 === 0
        ? 'Expires soon'
        : i % 4 === 1
          ? 'Price drop'
          : undefined,
  }))
}

/** Sam (buyer) wallet — transferable coupons for buy / sell / trade demos */
export function createSeedWalletOffers(): WalletOffer[] {
  const offers = createSeedOffers()
  const onCard = offers.filter((o) =>
    ['ent-002', 'ent-005', 'ent-006', 'ent-010', 'ent-011', 'ent-rx'].includes(o.entitlementId),
  )
  return onCard.map((o) => ({ ...o, status: 'active' as const }))
}

export const MOCK_MEMBER_ID = memberBuyer
export const MOCK_SELLER_ID = memberSeller
