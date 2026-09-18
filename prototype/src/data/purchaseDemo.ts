import { MOCK_MEMBER_ID, MOCK_SELLER_ID, createSeedListings, createSeedOffers } from './seed'
import type { PrototypeState } from '../store/prototypeStore'
import type { Transfer, WalletOffer } from '../types/marketplace'
import { snapshotFromOffer } from '../store/trustActions'
import { getOfferForListing } from '../store/prototypeStore'

/** Sam buyer: one recent marketplace purchase for Orders / escrow demo */
export function mergeSamPurchaseDemo(state: PrototypeState): PrototypeState {
  const hasBuyerTransfer = state.transfers.some((t) => t.toMemberId === MOCK_MEMBER_ID)
  if (hasBuyerTransfer) return state

  const offers = state.offers.length ? state.offers : createSeedOffers()
  const listings = state.listings.length ? state.listings : createSeedListings(offers)
  const listing = listings.find((l) => l.status === 'active' && l.sellerMemberId !== MOCK_MEMBER_ID)
  if (!listing) return state

  const offer = getOfferForListing(offers, listing)
  if (!offer) return state

  const now = new Date()
  const createdAt = new Date(now.getTime() - 45 * 60 * 1000).toISOString()
  const transferId = 'TXN-DEMO-SAM01'

  const transfer: Transfer = {
    id: transferId,
    listingId: listing.id,
    offerEntitlementId: listing.offerEntitlementId,
    fromMemberId: listing.sellerMemberId ?? MOCK_SELLER_ID,
    toMemberId: MOCK_MEMBER_ID,
    status: 'completed',
    createdAt,
    completedAt: createdAt,
    listingSnapshot: snapshotFromOffer(offer, listing.price),
    refundStatus: 'none',
  }

  const walletOffer: WalletOffer = {
    ...offer,
    id: `wallet-demo-${transferId}`,
    status: 'active',
    transferId,
  }

  const listingsNext = listings.map((l) =>
    l.id === listing.id ? { ...l, status: 'sold' as const } : l,
  )

  return {
    ...state,
    offers,
    listings: listingsNext,
    transfers: [...state.transfers, transfer],
    walletOffers: [...state.walletOffers, walletOffer],
    lastPurchaseTransferId: transferId,
  }
}
