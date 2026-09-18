import { MOCK_SELLER_ID } from '../data/seed'
import { isUserPublishedListing } from '../lib/marketplaceActivity'
import type { Listing, ListingType, WalletOffer } from '../types/marketplace'
import { type PrototypeState } from './prototypeStore'
import { isPriceInBand, normalizePrice, sellerPayout } from '../lib/sellPricing'

export type SellBlockReason = 'not-transferable' | 'already-listed' | 'ineligible' | 'price' | 'expired'

export interface SellEligibility {
  ok: boolean
  daysRemaining?: number
  reason?: 'account-age' | 'listing-cap' | 'phone'
}

export function checkSellEligibility(state: PrototypeState): SellEligibility {
  if (!state.demoPhoneVerified) {
    return { ok: false, reason: 'phone' }
  }
  if (state.demoSellerListingCapReached) {
    return { ok: false, reason: 'listing-cap' }
  }
  if (!state.demoSellerEligible || state.demoSellerAccountDays < 7) {
    const daysRemaining = Math.max(1, 7 - state.demoSellerAccountDays)
    return { ok: false, daysRemaining, reason: 'account-age' }
  }
  return { ok: true }
}

/** Active listing published from this member’s wallet (not other sellers’ browse listings). */
export function findUserActiveListingForEntitlement(
  state: PrototypeState,
  entitlementId: string,
): Listing | undefined {
  return state.listings.find(
    (l) =>
      l.offerEntitlementId === entitlementId &&
      l.status === 'active' &&
      isUserPublishedListing(l),
  )
}

export function canListWalletOffer(
  state: PrototypeState,
  offer: WalletOffer,
): { ok: true } | { ok: false; reason: SellBlockReason } {
  if (!offer.transferable) return { ok: false, reason: 'not-transferable' }
  if (offer.status === 'reserved' || offer.status === 'voided') {
    return { ok: false, reason: 'already-listed' }
  }
  if (findUserActiveListingForEntitlement(state, offer.entitlementId)) {
    return { ok: false, reason: 'already-listed' }
  }
  const exp = new Date(offer.expiry + 'T23:59:59').getTime()
  if (exp < Date.now()) return { ok: false, reason: 'expired' }
  return { ok: true }
}

export function publishListing(
  state: PrototypeState,
  walletOfferId: string,
  askingPrice: number,
  listingType: ListingType = 'sale',
): { ok: true; listing: Listing } | { ok: false; reason: SellBlockReason } {
  const offer = state.walletOffers.find((w) => w.id === walletOfferId)
  if (!offer) return { ok: false, reason: 'not-transferable' }

  const listCheck = canListWalletOffer(state, offer)
  if (!listCheck.ok) return listCheck

  const price = normalizePrice(askingPrice)
  if (!isPriceInBand(price, offer.savingsAmount)) {
    return { ok: false, reason: 'price' }
  }

  const eligibility = checkSellEligibility(state)
  if (!eligibility.ok) return { ok: false, reason: 'ineligible' }

  const now = new Date().toISOString()
  const catalogOffer = state.offers.find((o) => o.entitlementId === offer.entitlementId)

  const listing: Listing = {
    id: `lst-user-${Date.now().toString(36)}`,
    offerEntitlementId: offer.entitlementId,
    offerId: catalogOffer?.id ?? offer.id,
    sellerMemberId: MOCK_SELLER_ID,
    type: listingType,
    price,
    status: 'active',
    createdAt: now,
    expiresAt: offer.expiry,
    badge:
      listingType === 'trade' ? 'Open to trades · From your wallet' : 'From your wallet',
  }

  return { ok: true, listing }
}

export function applyPublishListing(
  state: PrototypeState,
  walletOfferId: string,
  listing: Listing,
): PrototypeState {
  const walletOffers = state.walletOffers.map((w) =>
    w.id === walletOfferId ? { ...w, status: 'reserved' as const } : w,
  )
  return {
    ...state,
    listings: [...state.listings, listing],
    walletOffers,
    sellerHasPublishedBefore: true,
  }
}

export function formatPayoutPreview(price: number): string {
  const { platformFee, payout } = sellerPayout(price)
  return `Fee $${platformFee.toFixed(2)} · You get about $${payout.toFixed(2)}`
}
