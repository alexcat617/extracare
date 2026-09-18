import type { Listing, Offer } from '../types/marketplace'
import type { OfferCategory } from '../types/marketplace'
import { getOfferForListing } from '../store/prototypeStore'

export type DiscountFilter = 'all' | 'dollar-off' | 'threshold'

export interface MarketplaceFilters {
  category: OfferCategory | 'all'
  expiresSoon: boolean
  discountType: DiscountFilter
}

export const DEFAULT_MARKETPLACE_FILTERS: MarketplaceFilters = {
  category: 'all',
  expiresSoon: false,
  discountType: 'all',
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

export function filterListings(
  listings: Listing[],
  offers: Offer[],
  filters: MarketplaceFilters,
): Listing[] {
  return listings.filter((listing) => {
    if (listing.status !== 'active') return false
    const offer = getOfferForListing(offers, listing)
    if (!offer) return false
    if (filters.category !== 'all' && offer.category !== filters.category) return false
    if (filters.expiresSoon && !isExpiresSoon(offer, listing)) return false
    if (!matchesDiscountType(offer, filters.discountType)) return false
    return true
  })
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
