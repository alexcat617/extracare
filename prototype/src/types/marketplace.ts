/** FLOWS shared rules 1–8 — types for mock marketplace data */

export type OfferStatus = 'active' | 'reserved' | 'voided' | 'transferred'
export type ListingStatus = 'active' | 'sold' | 'cancelled' | 'expired'
export type TransferStatus = 'pending' | 'completed' | 'failed' | 'disputed'
export type ListingType = 'sale' | 'trade'

export type OfferCategory =
  | 'oral-care'
  | 'baby'
  | 'vitamins'
  | 'threshold'
  | 'skin-care'
  | 'household'

export interface Offer {
  id: string
  entitlementId: string
  title: string
  savingsAmount: number
  headline: string
  expiry: string
  channel: 'in-store' | 'online' | 'both'
  category: OfferCategory
  transferable: boolean
  status: OfferStatus
  minPurchase?: number
  stackSummary?: string
}

export interface Listing {
  id: string
  offerEntitlementId: string
  offerId: string
  sellerMemberId: string
  type: ListingType
  price: number
  status: ListingStatus
  createdAt: string
  expiresAt: string
  badge?: string
}

/** Immutable listing terms at purchase time (FLOW-06 dispute compare) */
export interface ListingSnapshot {
  title: string
  headline: string
  savingsAmount: number
  price: number
  minPurchase?: number
  expiry: string
  channel: string
}

export type TransferRefundStatus = 'none' | 'completed'

export interface Transfer {
  id: string
  listingId: string
  offerEntitlementId: string
  fromMemberId: string
  toMemberId: string
  status: TransferStatus
  createdAt: string
  completedAt?: string
  /** FEAT-05: frozen terms for dispute comparison */
  listingSnapshot?: ListingSnapshot
  refundStatus?: TransferRefundStatus
  disputeCaseId?: string
  /** FEAT-03: paired transfer on atomic trade swap */
  linkedTransferId?: string
  tradeProposalId?: string
}

export type TradeProposalStatus =
  | 'pending_seller'
  | 'pending_buyer'
  | 'awaiting_confirm'
  | 'completed'
  | 'declined'
  | 'expired'

export interface TradeProposal {
  id: string
  listingId: string
  buyerMemberId: string
  sellerMemberId: string
  /** Wallet offer IDs the buyer offers in exchange */
  buyerWalletOfferIds: string[]
  message?: string
  status: TradeProposalStatus
  sellerNote?: string
  buyerConfirmedAt?: string
  sellerConfirmedAt?: string
  linkedTransferIds?: [string, string]
  createdAt: string
  updatedAt: string
}

export interface WalletOffer extends Offer {
  transferId?: string
}

export const CONSENT_VERSION = '1.0'
