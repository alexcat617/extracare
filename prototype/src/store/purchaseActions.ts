import {
  createSeedListings,
  createSeedOffers,
  createSeedWalletOffers,
  MOCK_MEMBER_ID,
} from '../data/seed'
import type { Listing, Transfer, WalletOffer } from '../types/marketplace'
import { getOfferForListing, type PrototypeState } from './prototypeStore'
import { snapshotFromOffer } from './trustActions'

export type PurchaseError = 'payment' | 'sold' | 'wallet-timeout' | 'not-found' | 'inactive'

export interface PurchaseSuccess {
  ok: true
  transfer: Transfer
  walletOffer: WalletOffer | null
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
  const snapshot = snapshotFromOffer(offer, listing.price)
  const transfer: Transfer = {
    id: newTransferId(),
    listingId: listing.id,
    offerEntitlementId: listing.offerEntitlementId,
    fromMemberId: listing.sellerMemberId,
    toMemberId: MOCK_MEMBER_ID,
    status: 'completed',
    createdAt: now,
    completedAt: now,
    listingSnapshot: snapshot,
    refundStatus: 'none',
  }

  const missingWallet = state.demoNextPurchaseMissingWallet
  const termsMismatch = state.demoNextPurchaseTermsMismatch

  let walletOffer: WalletOffer | null = null
  if (!missingWallet) {
    const issued: WalletOffer = {
      ...offer,
      id: `wallet-${offer.id}-${transfer.id}`,
      status: 'active',
      transferId: transfer.id,
    }
    if (termsMismatch) {
      issued.savingsAmount = offer.savingsAmount + 1
    }
    walletOffer = issued
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
  const walletOffers = result.walletOffer
    ? [...state.walletOffers, result.walletOffer]
    : state.walletOffers
  const forceMissing = result.walletOffer
    ? state.demoForceMissingWalletTransferIds
    : [...state.demoForceMissingWalletTransferIds, result.transfer.id]
  return {
    ...state,
    listings,
    walletOffers,
    transfers: [...state.transfers, result.transfer],
    lastPurchaseTransferId: result.transfer.id,
    demoNextPurchaseMissingWallet: false,
    demoNextPurchaseTermsMismatch: false,
    demoForceMissingWalletTransferIds: forceMissing,
  }
}

export function clearWalletPurchases(state: PrototypeState): PrototypeState {
  const offers = createSeedOffers()
  const purchased = state.walletOffers.filter((w) => w.transferId)
  return {
    ...state,
    offers,
    listings: createSeedListings(offers),
    walletOffers: [...createSeedWalletOffers(), ...purchased],
    transfers: [],
    lastPurchaseTransferId: null,
    demoNextPurchaseOutcome: 'none',
    demoNextPurchaseMissingWallet: false,
    demoNextPurchaseTermsMismatch: false,
    redeemedTransferIds: [],
    disputeRetriedTransferIds: {},
    demoForceMissingWalletTransferIds: [],
    tradeProposals: [],
    activeTradeProposalId: null,
    lastTradeTransferIds: null,
    demoTradeConfirmTimeout: false,
  }
}

/** Clear one-shot demo outcome after a purchase attempt */
export function clearDemoPurchaseOutcome(state: PrototypeState): PrototypeState {
  if (state.demoNextPurchaseOutcome === 'none') return state
  return { ...state, demoNextPurchaseOutcome: 'none' }
}
