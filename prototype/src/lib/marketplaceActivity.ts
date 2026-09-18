import { MOCK_MEMBER_ID } from '../data/seed'
import { getOfferForListing, type PrototypeState } from '../store/prototypeStore'
import { pendingSellerProposals } from '../store/tradeActions'
import { sellerPayout } from './sellPricing'

export interface MarketplaceActivitySnapshot {
  availableBalance: number
  pendingEscrow: number
  activeListings: number
  expiringSoon: number
  pendingTradeOffers: number
  totalSaved: number
  totalEarned: number
  fulfillmentRatePercent: number
  ratingStars: number
  userActiveListings: Array<{ id: string; title: string; price: number }>
}

const USER_LISTING_BADGE = 'From your wallet'
const MS_48H = 48 * 60 * 60 * 1000

export function isUserPublishedListing(listing: { badge?: string }): boolean {
  return Boolean(listing.badge?.includes(USER_LISTING_BADGE))
}

function userListings(state: PrototypeState) {
  return state.listings.filter((l) => isUserPublishedListing(l))
}

function listingExpiresWithin48h(listing: { expiresAt: string }): boolean {
  const exp = new Date(listing.expiresAt + 'T23:59:59').getTime()
  return exp <= Date.now() + MS_48H
}

function countBuyerTradeAttention(state: PrototypeState): number {
  return state.tradeProposals.filter(
    (p) =>
      p.buyerMemberId === MOCK_MEMBER_ID &&
      (p.status === 'pending_buyer' || p.status === 'awaiting_confirm'),
  ).length
}

export function computeMarketplaceActivity(state: PrototypeState): MarketplaceActivitySnapshot {
  const mine = userListings(state)
  const active = mine.filter((l) => l.status === 'active')
  const sold = mine.filter((l) => l.status === 'sold')

  const totalEarned = sold.reduce((sum, l) => sum + sellerPayout(l.price).payout, 0)
  const totalSaved = state.walletOffers
    .filter((w) => w.transferId)
    .reduce((sum, w) => sum + w.savingsAmount, 0)

  const pendingSeller = pendingSellerProposals(state).length
  const pendingBuyer = countBuyerTradeAttention(state)
  const pendingTradeOffers = pendingSeller + pendingBuyer

  const disputed = state.transfers.some((t) => t.status === 'disputed')
  const fulfillmentRatePercent = disputed ? 94 : 99
  const ratingStars = disputed ? 4.6 : 4.9

  const userActiveListings = active.slice(0, 3).map((l) => {
    const offer = getOfferForListing(state.offers, l)
    return {
      id: l.id,
      title: offer?.title ?? 'Listing',
      price: l.price,
    }
  })

  return {
    availableBalance: Math.round(totalEarned * 100) / 100,
    pendingEscrow: 0,
    activeListings: active.length,
    expiringSoon: active.filter(listingExpiresWithin48h).length,
    pendingTradeOffers,
    totalSaved: Math.round(totalSaved * 100) / 100,
    totalEarned: Math.round(totalEarned * 100) / 100,
    fulfillmentRatePercent,
    ratingStars,
    userActiveListings,
  }
}
