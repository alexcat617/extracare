import { MOCK_MEMBER_ID, MOCK_SELLER_ID } from '../data/seed'
import type { Listing, TradeProposal, Transfer, WalletOffer } from '../types/marketplace'
import { MAX_TRADE_BUNDLE } from '../lib/tradeFairness'
import {
  getOfferForListing,
  hasActiveListingForEntitlement,
  type PrototypeState,
} from './prototypeStore'
import { walletOfferEligibleForTradeBundle } from '../lib/tradeFairness'

export type TradeError =
  | 'not-found'
  | 'inactive'
  | 'own-listing'
  | 'invalid-bundle'
  | 'wrong-status'
  | 'already-confirmed'
  | 'confirm-timeout'

function newTransferId(): string {
  return `TXN-${Date.now().toString(36).toUpperCase().slice(-8)}`
}

function newProposalId(): string {
  return `trd-${Date.now().toString(36)}`
}

export function getEligibleTradeWalletOffers(state: PrototypeState): WalletOffer[] {
  return state.walletOffers.filter((w) => {
    const listed = hasActiveListingForEntitlement(state.listings, w.entitlementId)
    const check = walletOfferEligibleForTradeBundle(w, listed)
    return check.ok
  })
}

export function createTradeProposal(
  state: PrototypeState,
  listingId: string,
  buyerWalletOfferIds: string[],
  message?: string,
): { ok: true; proposal: TradeProposal } | { ok: false; error: TradeError } {
  const listing = state.listings.find((l) => l.id === listingId)
  if (!listing) return { ok: false, error: 'not-found' }
  if (listing.status !== 'active') return { ok: false, error: 'inactive' }
  if (listing.sellerMemberId === MOCK_MEMBER_ID) return { ok: false, error: 'own-listing' }

  const unique = [...new Set(buyerWalletOfferIds)]
  if (unique.length < 1 || unique.length > MAX_TRADE_BUNDLE) {
    return { ok: false, error: 'invalid-bundle' }
  }

  for (const id of unique) {
    const offer = state.walletOffers.find((w) => w.id === id)
    if (!offer) return { ok: false, error: 'invalid-bundle' }
    const listed = hasActiveListingForEntitlement(state.listings, offer.entitlementId)
    const check = walletOfferEligibleForTradeBundle(offer, listed)
    if (!check.ok) return { ok: false, error: 'invalid-bundle' }
  }

  const now = new Date().toISOString()
  const proposal: TradeProposal = {
    id: newProposalId(),
    listingId,
    buyerMemberId: MOCK_MEMBER_ID,
    sellerMemberId: listing.sellerMemberId,
    buyerWalletOfferIds: unique,
    message: message?.trim() || undefined,
    status: 'pending_seller',
    createdAt: now,
    updatedAt: now,
  }

  return { ok: true, proposal }
}

export function applyTradeProposalSent(
  state: PrototypeState,
  proposal: TradeProposal,
): PrototypeState {
  return {
    ...state,
    tradeProposals: [...state.tradeProposals, proposal],
    activeTradeProposalId: proposal.id,
  }
}

export function sellerRespondTrade(
  state: PrototypeState,
  proposalId: string,
  action: 'accept' | 'decline',
): { ok: true; state: PrototypeState } | { ok: false; error: TradeError } {
  const proposal = state.tradeProposals.find((p) => p.id === proposalId)
  if (!proposal) return { ok: false, error: 'not-found' }
  const now = new Date().toISOString()

  if (action === 'decline') {
    if (proposal.status !== 'pending_seller' && proposal.status !== 'awaiting_confirm') {
      return { ok: false, error: 'wrong-status' }
    }
    return {
      ok: true,
      state: {
        ...state,
        tradeProposals: state.tradeProposals.map((p) =>
          p.id === proposalId
            ? { ...p, status: 'declined' as const, updatedAt: now }
            : p,
        ),
      },
    }
  }

  if (proposal.status !== 'pending_seller' && proposal.status !== 'awaiting_confirm') {
    return { ok: false, error: 'wrong-status' }
  }

  const swap = executeTradeSwap(state, { ...proposal, updatedAt: now })
  if (!swap.ok) return { ok: false, error: swap.error }

  return { ok: true, state: swap.state }
}

function executeTradeSwap(
  state: PrototypeState,
  proposal: TradeProposal,
): { ok: true; state: PrototypeState } | { ok: false; error: TradeError } {
  const listing = state.listings.find((l) => l.id === proposal.listingId)
  if (!listing || listing.status !== 'active') {
    return { ok: false, error: 'inactive' }
  }

  const catalogOffer = getOfferForListing(state.offers, listing)
  if (!catalogOffer) return { ok: false, error: 'not-found' }

  const buyerOffers = proposal.buyerWalletOfferIds
    .map((id) => state.walletOffers.find((w) => w.id === id))
    .filter((w): w is WalletOffer => Boolean(w))

  if (buyerOffers.length !== proposal.buyerWalletOfferIds.length) {
    return { ok: false, error: 'invalid-bundle' }
  }

  const now = new Date().toISOString()
  const transferToBuyerId = newTransferId()
  const transferToSellerId = newTransferId()

  const transferToBuyer: Transfer = {
    id: transferToBuyerId,
    listingId: listing.id,
    offerEntitlementId: listing.offerEntitlementId,
    fromMemberId: listing.sellerMemberId,
    toMemberId: proposal.buyerMemberId,
    status: 'completed',
    createdAt: now,
    completedAt: now,
    linkedTransferId: transferToSellerId,
    tradeProposalId: proposal.id,
  }

  const transferToSeller: Transfer = {
    id: transferToSellerId,
    listingId: listing.id,
    offerEntitlementId: buyerOffers[0].entitlementId,
    fromMemberId: proposal.buyerMemberId,
    toMemberId: listing.sellerMemberId,
    status: 'completed',
    createdAt: now,
    completedAt: now,
    linkedTransferId: transferToBuyerId,
    tradeProposalId: proposal.id,
  }

  const receivedListingOffer: WalletOffer = {
    ...catalogOffer,
    id: `wallet-${catalogOffer.id}-${transferToBuyerId}`,
    status: 'active',
    transferId: transferToBuyerId,
  }

  const remainingWallet = state.walletOffers.filter(
    (w) => !proposal.buyerWalletOfferIds.includes(w.id),
  )

  const listings: Listing[] = state.listings.map((l) =>
    l.id === listing.id ? { ...l, status: 'sold' as const } : l,
  )

  const completedProposal: TradeProposal = {
    ...proposal,
    status: 'completed',
    linkedTransferIds: [transferToBuyerId, transferToSellerId],
    updatedAt: now,
  }

  return {
    ok: true,
    state: {
      ...state,
      listings,
      walletOffers: [...remainingWallet, receivedListingOffer],
      transfers: [...state.transfers, transferToBuyer, transferToSeller],
      tradeProposals: state.tradeProposals.map((p) =>
        p.id === proposal.id ? completedProposal : p,
      ),
      lastTradeTransferIds: [transferToBuyerId, transferToSellerId],
      activeTradeProposalId: proposal.id,
    },
  }
}

export function pendingSellerProposals(state: PrototypeState): TradeProposal[] {
  return state.tradeProposals.filter(
    (p) => p.status === 'pending_seller' && p.sellerMemberId === MOCK_SELLER_ID,
  )
}

