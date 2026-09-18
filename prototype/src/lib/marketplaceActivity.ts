import { MOCK_MEMBER_ID } from '../data/seed'
import { getOfferForListing, type PrototypeState } from '../store/prototypeStore'
import { pendingSellerProposals } from '../store/tradeActions'
import { sellerPayout } from './sellPricing'

export type ActivityTrendRange = 'week' | 'month' | '6m' | 'year'

export interface ActivityTrendPoint {
  label: string
  saved: number
  earned: number
}

/** @deprecated use ActivityTrendPoint */
export type WeeklyActivityDay = ActivityTrendPoint

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
  listingStatus: ListingStatusBreakdown
  /** Case-study sample layered when your live counts are empty */
  usesDemoShowcase: boolean
}

export interface ListingStatusBreakdown {
  active: number
  sold: number
  expired: number
  cancelled: number
}

const USER_LISTING_BADGE = 'From your wallet'
const MS_48H = 48 * 60 * 60 * 1000
const MS_DAY = 24 * 60 * 60 * 1000

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
  weekSaved: [3, 9, 5, 14, 8, 18, 11],
  weekEarned: [0, 1.2, 0, 2.8, 1.5, 3.2, 2.1],
  monthSaved: [18, 24, 31, 42],
  monthEarned: [2.5, 4, 3.5, 6.5],
  sixMonthSaved: [22, 48, 35, 58, 44, 62],
  sixMonthEarned: [4, 9, 6, 12, 8, 14],
  yearSaved: [12, 18, 22, 28, 32, 38, 35, 45, 52, 48, 58, 64],
  yearEarned: [2, 3, 4, 5, 6, 8, 7, 9, 11, 10, 12, 14],
  previewListings: [
    { id: 'demo-1', title: 'Colgate Total', price: 1.25 },
    { id: 'demo-2', title: 'Pampers Swaddlers', price: 3.0 },
    { id: 'demo-3', title: 'Sensodyne Pronamel', price: 1.5 },
  ],
}

export const ACTIVITY_TREND_RANGE_LABEL: Record<ActivityTrendRange, string> = {
  week: '7 days',
  month: '4 weeks',
  '6m': '6 months',
  year: '12 months',
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

function startOfMonth(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), 1)
  x.setHours(0, 0, 0, 0)
  return x
}

interface TrendBucket {
  key: string
  label: string
  startMs: number
  endMs: number
}

function buildTrendBuckets(range: ActivityTrendRange): TrendBucket[] {
  const now = Date.now()
  const buckets: TrendBucket[] = []

  if (range === 'week') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const start = startOfDay(d)
      const endMs = start.getTime() + MS_DAY
      buckets.push({
        key: start.toISOString().slice(0, 10),
        label: d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
        startMs: start.getTime(),
        endMs,
      })
    }
    return buckets
  }

  if (range === 'month') {
    for (let w = 3; w >= 0; w--) {
      const end = new Date(now - w * 7 * MS_DAY)
      const start = startOfDay(new Date(end.getTime() - 6 * MS_DAY))
      const endMs = startOfDay(new Date(end.getTime() + MS_DAY)).getTime()
      buckets.push({
        key: `wk-${start.toISOString().slice(0, 10)}`,
        label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        startMs: start.getTime(),
        endMs,
      })
    }
    return buckets
  }

  const monthCount = range === '6m' ? 6 : 12
  for (let i = monthCount - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const start = startOfMonth(d)
    const end = startOfMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1))
    buckets.push({
      key: start.toISOString().slice(0, 7),
      label: start.toLocaleDateString('en-US', { month: 'short' }),
      startMs: start.getTime(),
      endMs: end.getTime(),
    })
  }
  return buckets
}

function demoSeriesForRange(range: ActivityTrendRange): { saved: number[]; earned: number[] } {
  switch (range) {
    case 'week':
      return { saved: DEMO_SHOWCASE.weekSaved, earned: DEMO_SHOWCASE.weekEarned }
    case 'month':
      return { saved: DEMO_SHOWCASE.monthSaved, earned: DEMO_SHOWCASE.monthEarned }
    case '6m':
      return { saved: DEMO_SHOWCASE.sixMonthSaved, earned: DEMO_SHOWCASE.sixMonthEarned }
    case 'year':
      return { saved: DEMO_SHOWCASE.yearSaved, earned: DEMO_SHOWCASE.yearEarned }
  }
}

function bucketForTime(buckets: TrendBucket[], timeMs: number): TrendBucket | undefined {
  return buckets.find((b) => timeMs >= b.startMs && timeMs < b.endMs)
}

function accumulateTransferTotals(
  state: PrototypeState,
  buckets: TrendBucket[],
): Map<string, { saved: number; earned: number }> {
  const totals = new Map<string, { saved: number; earned: number }>()
  for (const b of buckets) {
    totals.set(b.key, { saved: 0, earned: 0 })
  }

  for (const t of state.transfers) {
    if (t.status !== 'completed' || !t.completedAt) continue
    const timeMs = Date.parse(t.completedAt)
    if (Number.isNaN(timeMs)) continue
    const bucket = bucketForTime(buckets, timeMs)
    if (!bucket) continue

    const row = totals.get(bucket.key)!
    const offer = state.offers.find((o) => o.entitlementId === t.offerEntitlementId)
    const savings = offer?.savingsAmount ?? 0

    if (t.toMemberId === MOCK_MEMBER_ID) {
      row.saved += savings
    }

    const listing = state.listings.find((l) => l.id === t.listingId)
    if (
      listing &&
      isUserPublishedListing(listing) &&
      listing.status === 'sold' &&
      listing.sellerMemberId === MOCK_MEMBER_ID
    ) {
      row.earned += sellerPayout(listing.price).payout
    }
  }

  return totals
}

export function computeActivityTrend(
  state: PrototypeState,
  range: ActivityTrendRange,
  useDemoShowcase: boolean,
): ActivityTrendPoint[] {
  const buckets = buildTrendBuckets(range)
  const liveTotals = accumulateTransferTotals(state, buckets)
  const demo = demoSeriesForRange(range)

  return buckets.map((bucket, i) => {
    const live = liveTotals.get(bucket.key) ?? { saved: 0, earned: 0 }
    const demoSaved = demo.saved[i] ?? 0
    const demoEarned = demo.earned[i] ?? 0
    const saved = useDemoShowcase ? demoSaved + live.saved : live.saved
    const earned = useDemoShowcase ? demoEarned + live.earned : live.earned
    return {
      label: bucket.label,
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
