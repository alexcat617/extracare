import { MOCK_MEMBER_ID, MOCK_SELLER_ID } from './seed'
import type { PrototypeState } from '../store/prototypeStore'
import { snapshotFromOffer } from '../store/trustActions'
import type { Listing, Offer, Transfer } from '../types/marketplace'

export const ACTIVITY_HIST_TRANSFER_PREFIX = 'TXN-HIST-'
const FROM_WALLET = 'From your wallet'

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

function offerByEnt(offers: Offer[], entitlementId: string): Offer | undefined {
  return offers.find((o) => o.entitlementId === entitlementId)
}

interface HistPurchase {
  id: string
  listingId: string
  entitlementId: string
  daysAgo: number
  price: number
}

interface HistSale {
  id: string
  listingId: string
  entitlementId: string
  daysAgo: number
  price: number
}

/** Purchases Sam made — drives “saved” on the trend chart */
const HIST_PURCHASES: HistPurchase[] = [
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P01`, listingId: 'lst-hist-buy-01', entitlementId: 'ent-001', daysAgo: 2, price: 2.5 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P02`, listingId: 'lst-hist-buy-02', entitlementId: 'ent-003', daysAgo: 5, price: 1.75 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P03`, listingId: 'lst-hist-buy-03', entitlementId: 'ent-007', daysAgo: 9, price: 3.5 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P04`, listingId: 'lst-hist-buy-04', entitlementId: 'ent-008', daysAgo: 14, price: 2.75 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P05`, listingId: 'lst-hist-buy-05', entitlementId: 'ent-012', daysAgo: 21, price: 3 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P06`, listingId: 'lst-hist-buy-06', entitlementId: 'ent-004', daysAgo: 32, price: 6 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P07`, listingId: 'lst-hist-buy-07', entitlementId: 'ent-009', daysAgo: 48, price: 2 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P08`, listingId: 'lst-hist-buy-08', entitlementId: 'ent-001', daysAgo: 67, price: 2.25 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P09`, listingId: 'lst-hist-buy-09', entitlementId: 'ent-003', daysAgo: 95, price: 1.5 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P10`, listingId: 'lst-hist-buy-10', entitlementId: 'ent-007', daysAgo: 128, price: 3.25 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P11`, listingId: 'lst-hist-buy-11', entitlementId: 'ent-008', daysAgo: 165, price: 2.5 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P12`, listingId: 'lst-hist-buy-12', entitlementId: 'ent-012', daysAgo: 210, price: 2.75 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P13`, listingId: 'lst-hist-buy-13', entitlementId: 'ent-004', daysAgo: 255, price: 5.5 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P14`, listingId: 'lst-hist-buy-14', entitlementId: 'ent-009', daysAgo: 300, price: 1.85 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}P15`, listingId: 'lst-hist-buy-15', entitlementId: 'ent-001', daysAgo: 340, price: 2.4 },
]

/** Sales Sam completed — drives “earned” on the trend chart */
const HIST_SALES: HistSale[] = [
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}S01`, listingId: 'lst-hist-sold-01', entitlementId: 'ent-010', daysAgo: 4, price: 1.5 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}S02`, listingId: 'lst-hist-sold-02', entitlementId: 'ent-002', daysAgo: 18, price: 2 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}S03`, listingId: 'lst-hist-sold-03', entitlementId: 'ent-005', daysAgo: 40, price: 1.25 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}S04`, listingId: 'lst-hist-sold-04', entitlementId: 'ent-011', daysAgo: 72, price: 1 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}S05`, listingId: 'lst-hist-sold-05', entitlementId: 'ent-006', daysAgo: 110, price: 2.5 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}S06`, listingId: 'lst-hist-sold-06', entitlementId: 'ent-010', daysAgo: 155, price: 1.35 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}S07`, listingId: 'lst-hist-sold-07', entitlementId: 'ent-002', daysAgo: 200, price: 1.75 },
  { id: `${ACTIVITY_HIST_TRANSFER_PREFIX}S08`, listingId: 'lst-hist-sold-08', entitlementId: 'ent-005', daysAgo: 280, price: 1.15 },
]

function buildSoldListing(offer: Offer, row: HistSale): Listing {
  const listedDaysAgo = row.daysAgo + 8
  return {
    id: row.listingId,
    offerEntitlementId: offer.entitlementId,
    offerId: offer.id,
    sellerMemberId: MOCK_MEMBER_ID,
    type: 'sale',
    price: row.price,
    status: 'sold',
    createdAt: daysAgoIso(listedDaysAgo),
    expiresAt: daysAgoIso(row.daysAgo - 30),
    badge: FROM_WALLET,
  }
}

function buildPurchaseListing(offer: Offer, row: HistPurchase): Listing {
  return {
    id: row.listingId,
    offerEntitlementId: offer.entitlementId,
    offerId: offer.id,
    sellerMemberId: MOCK_SELLER_ID,
    type: 'sale',
    price: row.price,
    status: 'sold',
    createdAt: daysAgoIso(row.daysAgo + 12),
    expiresAt: daysAgoIso(row.daysAgo - 14),
  }
}

function purchaseTransfer(row: HistPurchase, offer: Offer, listing: Listing): Transfer {
  const completedAt = daysAgoIso(row.daysAgo)
  return {
    id: row.id,
    listingId: listing.id,
    offerEntitlementId: offer.entitlementId,
    fromMemberId: MOCK_SELLER_ID,
    toMemberId: MOCK_MEMBER_ID,
    status: 'completed',
    createdAt: completedAt,
    completedAt,
    listingSnapshot: snapshotFromOffer(offer, listing.price),
    refundStatus: 'none',
  }
}

function saleTransfer(row: HistSale, offer: Offer, listing: Listing): Transfer {
  const completedAt = daysAgoIso(row.daysAgo)
  return {
    id: row.id,
    listingId: listing.id,
    offerEntitlementId: offer.entitlementId,
    fromMemberId: MOCK_MEMBER_ID,
    toMemberId: MOCK_SELLER_ID,
    status: 'completed',
    createdAt: completedAt,
    completedAt,
    listingSnapshot: snapshotFromOffer(offer, listing.price),
    refundStatus: 'none',
  }
}

export function hasActivityTrendSeed(transfers: Transfer[]): boolean {
  return transfers.some((t) => t.id.startsWith(ACTIVITY_HIST_TRANSFER_PREFIX))
}

/** Spread purchases & sales across ~11 months for Activity trend ranges */
export function mergeActivityTrendSeed(state: PrototypeState): PrototypeState {
  if (hasActivityTrendSeed(state.transfers)) return state

  const histListingIds = new Set([
    ...HIST_PURCHASES.map((p) => p.listingId),
    ...HIST_SALES.map((s) => s.listingId),
  ])
  const listings = state.listings.filter((l) => !histListingIds.has(l.id))
  const transfers: Transfer[] = [...state.transfers]

  for (const row of HIST_PURCHASES) {
    const offer = offerByEnt(state.offers, row.entitlementId)
    if (!offer) continue
    const listing = buildPurchaseListing(offer, row)
    listings.push(listing)
    transfers.push(purchaseTransfer(row, offer, listing))
  }

  for (const row of HIST_SALES) {
    const offer = offerByEnt(state.offers, row.entitlementId)
    if (!offer) continue
    const listing = buildSoldListing(offer, row)
    listings.push(listing)
    transfers.push(saleTransfer(row, offer, listing))
  }

  return {
    ...state,
    listings,
    transfers,
    sellerHasPublishedBefore: true,
  }
}

export function stripActivityTrendSeed(state: PrototypeState): PrototypeState {
  const histListingIds = new Set([
    ...HIST_PURCHASES.map((p) => p.listingId),
    ...HIST_SALES.map((s) => s.listingId),
  ])
  return {
    ...state,
    listings: state.listings.filter((l) => !histListingIds.has(l.id)),
    transfers: state.transfers.filter((t) => !t.id.startsWith(ACTIVITY_HIST_TRANSFER_PREFIX)),
  }
}
