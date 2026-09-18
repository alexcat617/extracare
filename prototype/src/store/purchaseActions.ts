import { createSeedListings, createSeedOffers, MOCK_MEMBER_ID } from '../data/seed'
import type { Listing, Transfer, WalletOffer } from '../types/marketplace'
import { getOfferForListing, type PrototypeState } from './prototypeStore'

export type PurchaseError = 'payment' | 'sold' | 'wallet-timeout' | 'not-found' | 'inactive'

export interface PurchaseSuccess {
  ok: true
  transfer: Transfer
  walletOffer: WalletOffer
}

export interface PurchaseFailure {
  ok: false
  error: PurchaseError
}

export type PurchaseResult = PurchaseSuccess | PurchaseFailure

function newTransferId(): string {
  return `TXN-${Date.now().toString(36).toUpperCase().slice(-8)}`
}

/** FLOWS rule 1: void seller listing + issue buyer offer with new transfer ID */
export function executePurchase(
  state: PrototypeState,
  listingId: string,
): PurchaseResult {
  const listing = state.listings.find((l) => l.id === listingId)
  if (!listing) return { ok: false, error: 'not-found' }

  if (listing.status !== 'active') {
    return { ok: false, error: 'sold' }
  }

  const offer = getOfferForListing(state.offers, listing)
  if (!offer) return { ok: false, error: 'not-found' }

  switch (state.demoNextPurchaseOutcome) {
    case 'sold-out':
      return { ok: false, error: 'sold' }
    case 'payment-fail':
      return { ok: false, error: 'payment' }
    case 'wallet-timeout':
      return { ok: false, error: 'wallet-timeout' }
    default:
      break
  }

  const now = new Date().toISOString()
  const transfer: Transfer = {
    id: newTransferId(),
    listingId: listing.id,
    offerEntitlementId: listing.offerEntitlementId,
    fromMemberId: listing.sellerMemberId,
    toMemberId: MOCK_MEMBER_ID,
    status: 'completed',
    createdAt: now,
    completedAt: now,
  }

  const walletOffer: WalletOffer = {
    ...offer,
    id: `wallet-${offer.id}-${transfer.id}`,
    status: 'active',
    transferId: transfer.id,
  }

  return { ok: true, transfer, walletOffer }
}

export function applyPurchaseSuccess(
  state: PrototypeState,
  listingId: string,
  result: PurchaseSuccess,
): PrototypeState {
  const listings: Listing[] = state.listings.map((l) =>
    l.id === listingId ? { ...l, status: 'sold' as const } : l,
  )
  return {
    ...state,
    listings,
    walletOffers: [...state.walletOffers, result.walletOffer],
    transfers: [...state.transfers, result.transfer],
    lastPurchaseTransferId: result.transfer.id,
  }
}

export function clearWalletPurchases(state: PrototypeState): PrototypeState {
  const offers = createSeedOffers()
  const seedWallet = state.walletOffers.filter((w) => !w.transferId)
  return {
    ...state,
    offers,
    listings: createSeedListings(offers),
    walletOffers: seedWallet,
    transfers: [],
    lastPurchaseTransferId: null,
    demoNextPurchaseOutcome: 'none',
  }
}

/** Clear one-shot demo outcome after a purchase attempt */
export function clearDemoPurchaseOutcome(state: PrototypeState): PrototypeState {
  if (state.demoNextPurchaseOutcome === 'none') return state
  return { ...state, demoNextPurchaseOutcome: 'none' }
}
