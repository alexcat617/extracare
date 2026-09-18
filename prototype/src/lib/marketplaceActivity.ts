import { MOCK_MEMBER_ID } from '../data/seed'
import { getOfferForListing, type PrototypeState } from '../store/prototypeStore'
import { pendingSellerProposals } from '../store/tradeActions'
import { sellerPayout } from './sellPricing'

export interface MarketplaceActivitySnapshot {
  availableBalance: number
  pendingEscrow: number
  activeListings: number
  expiringSoon: number
  pendingTradeOffers: number
  totalSaved: number
  totalEarned: number
  fulfillmentRatePercent: number
  ratingStars: number
  userActiveListings: Array<{ id: string; title: string; price: number }>
  weeklyActivity: WeeklyActivityDay[]
  listingStatus: ListingStatusBreakdown
  /** Case-study sample layered when your live counts are empty */
  usesDemoShowcase: boolean
}

export interface WeeklyActivityDay {
  label: string
  saved: number
  earned: number
}

export interface ListingStatusBreakdown {
  active: number
  sold: number
  expired: number
  cancelled: number
}

const USER_LISTING_BADGE = 'From your wallet'
const MS_48H = 48 * 60 * 60 * 1000

export function isUserPublishedListing(listing: { badge?: string }): boolean {
  return Boolean(listing.badge?.includes(USER_LISTING_BADGE))
}

function userListings(state: PrototypeState) {
  return state.listings.filter((l) => isUserPublishedListing(l))
}

function listingExpiresWithin48h(listing: { expiresAt: string }): boolean {
  const exp = new Date(listing.expiresAt + 'T23:59:59').getTime()
  return exp <= Date.now() + MS_48H
}

function countBuyerTradeAttention(state: PrototypeState): number {
  return state.tradeProposals.filter(
    (p) =>
      p.buyerMemberId === MOCK_MEMBER_ID &&
      (p.status === 'pending_buyer' || p.status === 'awaiting_confirm'),
  ).length
}

/** Portfolio showcase — merged when live seller/buyer activity is still empty */
const DEMO_SHOWCASE = {
  availableBalance: 18.4,
  pendingEscrow: 5.25,
  activeListings: 2,
  expiringSoon: 1,
  pendingTradeOffers: 1,
  totalSaved: 52,
  totalEarned: 23.4,
  listingStatus: { active: 2, sold: 5, expired: 1, cancelled: 0 } as ListingStatusBreakdown,
  weeklySaved: [6, 9, 7, 12, 11, 14, 13],
  weeklyEarned: [0, 2.5, 1.5, 5.5, 3.5, 6.5, 4.5],
  previewListings: [
    { id: 'demo-1', title: 'Colgate Total', price: 1.25 },
    { id: 'demo-2', title: 'Pampers Swaddlers', price: 3.0 },
    { id: 'demo-3', title: 'Sensodyne Pronamel', price: 1.5 },
  ],
}

function liveActivityIsEmpty(state: PrototypeState, saved: number, earned: number): boolean {
  const mine = userListings(state)
  return mine.length === 0 && saved === 0 && earned === 0
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function dayKey(iso: string): string {
  return startOfDay(new Date(iso)).toISOString().slice(0, 10)
}

function lastSevenDays(): Array<{ key: string; label: string }> {
  const days: Array<{ key: string; label: string }> = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = startOfDay(d).toISOString().slice(0, 10)
    const label = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
    days.push({ key, label })
  }
  return days
}

function computeWeeklyActivity(state: PrototypeState, useDemoCurve: boolean): WeeklyActivityDay[] {
  const days = lastSevenDays()
  const savedByDay = new Map<string, number>()
  const earnedByDay = new Map<string, number>()

  for (const t of state.transfers) {
    if (t.status !== 'completed' || !t.completedAt) continue
    const key = dayKey(t.completedAt)
    const offer = state.offers.find((o) => o.entitlementId === t.offerEntitlementId)
    const savings = offer?.savingsAmount ?? 0

    if (t.toMemberId === MOCK_MEMBER_ID) {
      savedByDay.set(key, (savedByDay.get(key) ?? 0) + savings)
    }

    const listing = state.listings.find((l) => l.id === t.listingId)
    if (listing && isUserPublishedListing(listing) && listing.status === 'sold') {
      const payout = sellerPayout(listing.price).payout
      earnedByDay.set(key, (earnedByDay.get(key) ?? 0) + payout)
    }
  }

  return days.map((day, i) => {
    const savedLive = savedByDay.get(day.key) ?? 0
    const earnedLive = earnedByDay.get(day.key) ?? 0
    const saved = useDemoCurve ? DEMO_SHOWCASE.weeklySaved[i] + savedLive : savedLive
    const earned = useDemoCurve ? DEMO_SHOWCASE.weeklyEarned[i] + earnedLive : earnedLive
    return {
      label: day.label,
      saved: Math.round(saved * 10) / 10,
      earned: Math.round(earned * 10) / 10,
    }
  })
}

function computeListingStatus(state: PrototypeState): ListingStatusBreakdown {
  const mine = userListings(state)
  return {
    active: mine.filter((l) => l.status === 'active').length,
    sold: mine.filter((l) => l.status === 'sold').length,
    expired: mine.filter((l) => l.status === 'expired').length,
    cancelled: mine.filter((l) => l.status === 'cancelled').length,
  }
}

export function computeMarketplaceActivity(state: PrototypeState): MarketplaceActivitySnapshot {
  const mine = userListings(state)
  const active = mine.filter((l) => l.status === 'active')
  const sold = mine.filter((l) => l.status === 'sold')

  const totalEarned = sold.reduce((sum, l) => sum + sellerPayout(l.price).payout, 0)
  const totalSaved = state.walletOffers
    .filter((w) => w.transferId)
    .reduce((sum, w) => sum + w.savingsAmount, 0)

  const pendingSeller = pendingSellerProposals(state).length
  const pendingBuyer = countBuyerTradeAttention(state)
  const pendingTradeOffers = pendingSeller + pendingBuyer

  const disputed = state.transfers.some((t) => t.status === 'disputed')
  const fulfillmentRatePercent = disputed ? 94 : 99
  const ratingStars = disputed ? 4.6 : 4.9

  const userActiveListings = active.slice(0, 3).map((l) => {
    const offer = getOfferForListing(state.offers, l)
    return {
      id: l.id,
      title: offer?.title ?? 'Listing',
      price: l.price,
    }
  })

  const listingStatus = computeListingStatus(state)
  const roundedSaved = Math.round(totalSaved * 100) / 100
  const roundedEarned = Math.round(totalEarned * 100) / 100
  const usesDemoShowcase = liveActivityIsEmpty(state, roundedSaved, roundedEarned)
  const weeklyActivity = computeWeeklyActivity(state, usesDemoShowcase)

  const live = {
    availableBalance: Math.round(totalEarned * 100) / 100,
    pendingEscrow: 0,
    activeListings: active.length,
    expiringSoon: active.filter(listingExpiresWithin48h).length,
    pendingTradeOffers,
    totalSaved: roundedSaved,
    totalEarned: roundedEarned,
    fulfillmentRatePercent,
    ratingStars,
    userActiveListings,
    weeklyActivity,
    listingStatus,
    usesDemoShowcase: false,
  }

  if (!usesDemoShowcase) {
    return live
  }

  return {
    ...live,
    availableBalance: DEMO_SHOWCASE.availableBalance,
    pendingEscrow: DEMO_SHOWCASE.pendingEscrow,
    activeListings: DEMO_SHOWCASE.activeListings,
    expiringSoon: DEMO_SHOWCASE.expiringSoon,
    pendingTradeOffers: Math.max(live.pendingTradeOffers, DEMO_SHOWCASE.pendingTradeOffers),
    totalSaved: DEMO_SHOWCASE.totalSaved,
    totalEarned: DEMO_SHOWCASE.totalEarned,
    userActiveListings: DEMO_SHOWCASE.previewListings,
    listingStatus: DEMO_SHOWCASE.listingStatus,
    usesDemoShowcase: true,
  }
}
