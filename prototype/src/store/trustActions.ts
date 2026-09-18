import type { ListingSnapshot, Offer, Transfer, WalletOffer } from '../types/marketplace'
import type { PrototypeState } from './prototypeStore'
import { getOfferForListing } from './prototypeStore'
import { findWalletOfferForTransfer, termsMatchSnapshot } from '../lib/escrowTimeline'

export function snapshotFromOffer(offer: Offer, price: number): ListingSnapshot {
  return {
    title: offer.title,
    headline: offer.headline,
    savingsAmount: offer.savingsAmount,
    price,
    minPurchase: offer.minPurchase,
    expiry: offer.expiry,
    channel: offer.channel,
  }
}

function newCaseId(): string {
  return `CASE-${Date.now().toString(36).toUpperCase().slice(-6)}`
}

export function walletHasTransfer(state: PrototypeState, transferId: string): boolean {
  return Boolean(findWalletOfferForTransfer(state.walletOffers, transferId))
}

export function isTransferRedeemed(state: PrototypeState, transferId: string): boolean {
  return state.redeemedTransferIds.includes(transferId)
}

/** Retry transfer once — adds wallet offer if still missing (mock). */
export function applyRetryTransferDelivery(
  state: PrototypeState,
  transferId: string,
): PrototypeState {
  if (walletHasTransfer(state, transferId)) return state
  const transfer = state.transfers.find((t) => t.id === transferId)
  if (!transfer) return state

  if (state.demoForceMissingWalletTransferIds.includes(transferId)) {
    return {
      ...state,
      disputeRetriedTransferIds: { ...state.disputeRetriedTransferIds, [transferId]: true },
    }
  }

  const listing = state.listings.find((l) => l.id === transfer.listingId)
  const offer = listing ? getOfferForListing(state.offers, listing) : undefined
  if (!offer) return state

  const walletOffer: WalletOffer = {
    ...offer,
    id: `wallet-retry-${transfer.id}`,
    status: 'active',
    transferId: transfer.id,
  }

  return {
    ...state,
    walletOffers: [...state.walletOffers, walletOffer],
    disputeRetriedTransferIds: { ...state.disputeRetriedTransferIds, [transferId]: true },
  }
}

export function applyRefundForTransfer(
  state: PrototypeState,
  transferId: string,
): { state: PrototypeState; caseId: string } | { state: PrototypeState; denied: true } {
  if (isTransferRedeemed(state, transferId)) {
    return { state, denied: true }
  }

  const caseId = newCaseId()
  const transfers: Transfer[] = state.transfers.map((t) =>
    t.id === transferId
      ? {
          ...t,
          refundStatus: 'completed',
          disputeCaseId: caseId,
          status: t.status === 'pending' ? 'failed' : t.status,
        }
      : t,
  )

  const walletOffers = state.walletOffers.filter((w) => w.transferId !== transferId)

  return {
    state: {
      ...state,
      transfers,
      walletOffers,
    },
    caseId,
  }
}

export function compareTermsForTransfer(
  state: PrototypeState,
  transferId: string,
): 'match' | 'mismatch' | 'no-data' {
  const transfer = state.transfers.find((t) => t.id === transferId)
  const wallet = findWalletOfferForTransfer(state.walletOffers, transferId)
  if (!transfer?.listingSnapshot || !wallet) return 'no-data'
  return termsMatchSnapshot(transfer.listingSnapshot, wallet) ? 'match' : 'mismatch'
}

export type NotInWalletDisputeOutcome = 'found' | 'retry' | 'refunded' | 'denied'

export function stepNotInWalletDispute(
  state: PrototypeState,
  transferId: string,
): { state: PrototypeState; outcome: NotInWalletDisputeOutcome } {
  if (walletHasTransfer(state, transferId)) {
    return { state, outcome: 'found' }
  }

  if (!state.disputeRetriedTransferIds[transferId]) {
    const next = applyRetryTransferDelivery(state, transferId)
    if (walletHasTransfer(next, transferId)) {
      return { state: next, outcome: 'found' }
    }
    return { state: next, outcome: 'retry' }
  }

  const refund = applyRefundForTransfer(state, transferId)
  if ('denied' in refund) {
    return { state, outcome: 'denied' }
  }
  return { state: refund.state, outcome: 'refunded' }
}

export type TermsDisputeOutcome = 'match' | 'refunded' | 'denied'

export function stepTermsMismatchDispute(
  state: PrototypeState,
  transferId: string,
): { state: PrototypeState; outcome: TermsDisputeOutcome } {
  const compare = compareTermsForTransfer(state, transferId)
  if (compare === 'match' || compare === 'no-data') {
    return { state, outcome: 'match' }
  }
  const refund = applyRefundForTransfer(state, transferId)
  if ('denied' in refund) {
    return { state, outcome: 'denied' }
  }
  return { state: refund.state, outcome: 'refunded' }
}
