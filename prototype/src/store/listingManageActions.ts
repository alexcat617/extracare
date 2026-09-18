import { isUserPublishedListing } from '../lib/marketplaceActivity'
import { isPriceInBand, normalizePrice } from '../lib/sellPricing'
import type { Listing, Transfer } from '../types/marketplace'
import { getOfferForListing, type PrototypeState } from './prototypeStore'

export type ListingManageBlock = 'escrow' | 'trade' | 'inactive'

export function getUserPublishedListings(state: PrototypeState): Listing[] {
  return state.listings.filter((l) => isUserPublishedListing(l))
}

const TRADE_LOCK_STATUSES = new Set(['pending_seller', 'pending_buyer', 'awaiting_confirm'])

export function listingHasEscrowLock(state: PrototypeState, listingId: string): boolean {
  return state.transfers.some(
    (t) => t.listingId === listingId && t.status === 'pending',
  )
}

export function listingHasTradeLock(state: PrototypeState, listingId: string): boolean {
  return state.tradeProposals.some(
    (p) => p.listingId === listingId && TRADE_LOCK_STATUSES.has(p.status),
  )
}

export function getListingManageBlock(
  state: PrototypeState,
  listing: Listing,
): ListingManageBlock | null {
  if (listing.status !== 'active') return 'inactive'
  if (listingHasEscrowLock(state, listing.id)) return 'escrow'
  if (listingHasTradeLock(state, listing.id)) return 'trade'
  return null
}

export function applyUpdateListingPrice(
  state: PrototypeState,
  listingId: string,
  askingPrice: number,
): { ok: true; state: PrototypeState } | { ok: false; reason: 'not-found' | 'inactive' | 'blocked' | 'price' } {
  const listing = state.listings.find((l) => l.id === listingId)
  if (!listing || !isUserPublishedListing(listing)) return { ok: false, reason: 'not-found' }
  if (listing.status !== 'active') return { ok: false, reason: 'inactive' }
  if (getListingManageBlock(state, listing)) return { ok: false, reason: 'blocked' }

  const offer = getOfferForListing(state.offers, listing)
  const savings = offer?.savingsAmount ?? listing.price
  const price = normalizePrice(askingPrice)
  if (!isPriceInBand(price, savings)) return { ok: false, reason: 'price' }

  const listings = state.listings.map((l) =>
    l.id === listingId ? { ...l, price } : l,
  )
  return { ok: true, state: { ...state, listings } }
}

function restoreWalletForListing(state: PrototypeState, listing: Listing): PrototypeState {
  const walletOffers = state.walletOffers.map((w) =>
    w.entitlementId === listing.offerEntitlementId && w.status === 'reserved'
      ? { ...w, status: 'active' as const }
      : w,
  )
  return { ...state, walletOffers }
}

export function applyCancelListing(
  state: PrototypeState,
  listingId: string,
): { ok: true; state: PrototypeState } | { ok: false; reason: 'not-found' | 'inactive' | 'blocked' } {
  const listing = state.listings.find((l) => l.id === listingId)
  if (!listing || !isUserPublishedListing(listing)) return { ok: false, reason: 'not-found' }
  if (listing.status !== 'active') return { ok: false, reason: 'inactive' }
  const block = getListingManageBlock(state, listing)
  if (block === 'escrow' || block === 'trade') return { ok: false, reason: 'blocked' }

  const listings = state.listings.map((l) =>
    l.id === listingId ? { ...l, status: 'cancelled' as const } : l,
  )
  const next = restoreWalletForListing({ ...state, listings }, listing)
  return { ok: true, state: next }
}

export function applyExpireListing(
  state: PrototypeState,
  listingId: string,
): { ok: true; state: PrototypeState } | { ok: false; reason: 'not-found' | 'inactive' } {
  const listing = state.listings.find((l) => l.id === listingId)
  if (!listing || !isUserPublishedListing(listing)) return { ok: false, reason: 'not-found' }
  if (listing.status !== 'active') return { ok: false, reason: 'inactive' }

  const listings = state.listings.map((l) =>
    l.id === listingId ? { ...l, status: 'expired' as const } : l,
  )
  const next = restoreWalletForListing({ ...state, listings }, listing)
  return { ok: true, state: next }
}

function listingPastExpiry(listing: Listing): boolean {
  const exp = new Date(listing.expiresAt + 'T23:59:59').getTime()
  return exp < Date.now()
}

/** FLOW-05 expiry — close active user listings past offer expiry */
export function processAutoExpireListings(state: PrototypeState): PrototypeState {
  let next = state
  for (const listing of getUserPublishedListings(state)) {
    if (listing.status !== 'active' || !listingPastExpiry(listing)) continue
    const result = applyExpireListing(next, listing.id)
    if (result.ok) next = result.state
  }
  return next
}

export function applyDemoEscrowOnListing(
  state: PrototypeState,
  listingId: string,
): PrototypeState {
  const listing = state.listings.find((l) => l.id === listingId)
  if (!listing || listing.status !== 'active') return state
  if (listingHasEscrowLock(state, listingId)) return state

  const transfer: Transfer = {
    id: `ESC-${Date.now().toString(36)}`,
    listingId,
    offerEntitlementId: listing.offerEntitlementId,
    fromMemberId: listing.sellerMemberId,
    toMemberId: 'member-buyer-demo',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  return { ...state, transfers: [...state.transfers, transfer] }
}

export function clearDemoEscrowOnListing(
  state: PrototypeState,
  listingId: string,
): PrototypeState {
  return {
    ...state,
    transfers: state.transfers.filter(
      (t) => !(t.listingId === listingId && t.status === 'pending'),
    ),
  }
}
