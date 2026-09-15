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

export interface Transfer {
  id: string
  listingId: string
  offerEntitlementId: string
  fromMemberId: string
  toMemberId: string
  status: TransferStatus
  createdAt: string
  completedAt?: string
}

export interface WalletOffer extends Offer {
  transferId?: string
}

export const CONSENT_VERSION = '1.0'
