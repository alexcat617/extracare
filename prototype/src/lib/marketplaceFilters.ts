import type { Listing, Offer } from '../types/marketplace'
import type { OfferCategory } from '../types/marketplace'
import { getOfferForListing } from '../store/prototypeStore'

export type DiscountFilter = 'all' | 'dollar-off' | 'threshold'

export type MarketplaceSort =
  | 'recommended'
  | 'price-low'
  | 'price-high'
  | 'savings-high'

export interface MarketplaceFilters {
  category: OfferCategory | 'all'
  expiresSoon: boolean
  discountType: DiscountFilter
  sort: MarketplaceSort
}

export const DEFAULT_MARKETPLACE_FILTERS: MarketplaceFilters = {
  category: 'all',
  expiresSoon: false,
  discountType: 'all',
  sort: 'recommended',
}

function isExpiresSoon(offer: Offer, listing: Listing): boolean {
  if (listing.badge === 'Expires soon') return true
  const exp = new Date(offer.expiry + 'T12:00:00').getTime()
  const soon = Date.now() + 14 * 24 * 60 * 60 * 1000
  return exp <= soon
}

function matchesDiscountType(offer: Offer, discountType: DiscountFilter): boolean {
  if (discountType === 'all') return true
  if (discountType === 'threshold') return offer.category === 'threshold'
  return offer.category !== 'threshold'
}

function compareListings(
  a: Listing,
  b: Listing,
  offers: Offer[],
  sort: MarketplaceSort,
): number {
  if (sort === 'recommended') return 0
  const offerA = getOfferForListing(offers, a)
  const offerB = getOfferForListing(offers, b)
  if (!offerA || !offerB) return 0
  switch (sort) {
    case 'price-low':
      return a.price - b.price
    case 'price-high':
      return b.price - a.price
    case 'savings-high':
      return offerB.savingsAmount - offerA.savingsAmount
    default:
      return 0
  }
}

export function filterListings(
  listings: Listing[],
  offers: Offer[],
  filters: MarketplaceFilters,
): Listing[] {
  const filtered = listings.filter((listing) => {
    if (listing.status !== 'active') return false
    const offer = getOfferForListing(offers, listing)
    if (!offer) return false
    if (filters.category !== 'all' && offer.category !== filters.category) return false
    if (filters.expiresSoon && !isExpiresSoon(offer, listing)) return false
    if (!matchesDiscountType(offer, filters.discountType)) return false
    return true
  })
  if (filters.sort === 'recommended') return filtered
  return [...filtered].sort((a, b) => compareListings(a, b, offers, filters.sort))
}

export function categoryLabel(cat: OfferCategory | 'all'): string {
  const map: Record<OfferCategory | 'all', string> = {
    all: 'All categories',
    'oral-care': 'Oral care',
    baby: 'Baby',
    vitamins: 'Vitamins',
    threshold: 'Threshold deals',
    'skin-care': 'Skin care',
    household: 'Household',
  }
  return map[cat]
}

export function sortLabel(sort: MarketplaceSort): string {
  const map: Record<MarketplaceSort, string> = {
    recommended: 'Recommended',
    'price-low': 'Price: low to high',
    'price-high': 'Price: high to low',
    'savings-high': 'Highest savings',
  }
  return map[sort]
}
