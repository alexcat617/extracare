import type { Listing, Offer, TradeProposal, WalletOffer } from '../types/marketplace'
import { MOCK_MEMBER_ID, MOCK_SELLER_ID } from './seed'

export const MY_LISTINGS_DEMO_LISTING_PREFIX = 'lst-jordan-demo-'
export const MY_LISTINGS_DEMO_TRADE_ID = 'trd-demo-my-listings'

const FROM_WALLET = 'From your wallet'

function offerForEnt(offers: Offer[], ent: string): Offer {
  const o = offers.find((x) => x.entitlementId === ent)
  if (!o) throw new Error(`Missing seed offer ${ent}`)
  return o
}

function isoDaysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

/** Demo listing window — bar fill = time left ÷ (listed → expiry) */
function buildListing(
  id: string,
  offer: Offer,
  status: Listing['status'],
  price: number,
  type: Listing['type'],
  timing: { listedDaysAgo: number; expiresInDays: number },
  badge?: string,
): Listing {
  return {
    id,
    offerEntitlementId: offer.entitlementId,
    offerId: offer.id,
    sellerMemberId: MOCK_SELLER_ID,
    type,
    price,
    status,
    createdAt: isoDaysAgo(timing.listedDaysAgo),
    expiresAt: isoDaysFromNow(timing.expiresInDays),
    badge: badge ?? FROM_WALLET,
  }
}

export interface MyListingsDemoPack {
  listings: Listing[]
  walletOffers: WalletOffer[]
  tradeProposals: TradeProposal[]
}

/** Jordan seller pack for FEAT-04 — active listings + one pending trade (case study scope) */
export function buildMyListingsDemoPack(
  offers: Offer[],
  walletOffers: WalletOffer[],
): MyListingsDemoPack {
  const colgate = offerForEnt(offers, 'ent-005')
  const huggies = offerForEnt(offers, 'ent-006')
  const sensodyne = offerForEnt(offers, 'ent-011')

  const listings: Listing[] = [
    buildListing(
      `${MY_LISTINGS_DEMO_LISTING_PREFIX}active-1`,
      colgate,
      'active',
      1.25,
      'sale',
      { listedDaysAgo: 4, expiresInDays: 21 },
    ),
    buildListing(
      `${MY_LISTINGS_DEMO_LISTING_PREFIX}active-2`,
      huggies,
      'active',
      2.5,
      'trade',
      { listedDaysAgo: 16, expiresInDays: 5 },
      `${FROM_WALLET} · Open to trades`,
    ),
    buildListing(
      `${MY_LISTINGS_DEMO_LISTING_PREFIX}active-3`,
      sensodyne,
      'active',
      1,
      'sale',
      { listedDaysAgo: 9, expiresInDays: 2 },
    ),
    buildListing(
      `${MY_LISTINGS_DEMO_LISTING_PREFIX}active-4`,
      offerForEnt(offers, 'ent-002'),
      'active',
      1.5,
      'sale',
      { listedDaysAgo: 6, expiresInDays: 1 },
    ),
  ]

  const reserved = new Set(['ent-005', 'ent-006', 'ent-011', 'ent-002'])
  const nextWallet = walletOffers.map((w) =>
    reserved.has(w.entitlementId) ? { ...w, status: 'reserved' as const } : w,
  )

  const tradeBundle = nextWallet.find((w) => w.entitlementId === 'ent-010' && w.status === 'active')
  const tradeProposals: TradeProposal[] = tradeBundle
    ? [
        {
          id: MY_LISTINGS_DEMO_TRADE_ID,
          listingId: `${MY_LISTINGS_DEMO_LISTING_PREFIX}active-2`,
          buyerMemberId: MOCK_MEMBER_ID,
          sellerMemberId: MOCK_SELLER_ID,
          buyerWalletOfferIds: [tradeBundle.id],
          status: 'pending_seller',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
    : []

  return { listings, walletOffers: nextWallet, tradeProposals }
}

export function mergeMyListingsDemoIntoState<T extends {
  offers: Offer[]
  listings: Listing[]
  walletOffers: WalletOffer[]
  tradeProposals: TradeProposal[]
  sellerHasPublishedBefore: boolean
}>(state: T): T {
  const withoutDemoListings = state.listings.filter(
    (l) => !l.id.startsWith(MY_LISTINGS_DEMO_LISTING_PREFIX),
  )
  const withoutDemoTrades = state.tradeProposals.filter((p) => p.id !== MY_LISTINGS_DEMO_TRADE_ID)
  const pack = buildMyListingsDemoPack(state.offers, state.walletOffers)

  return {
    ...state,
    listings: [...withoutDemoListings, ...pack.listings],
    walletOffers: pack.walletOffers,
    tradeProposals: [...withoutDemoTrades, ...pack.tradeProposals],
    sellerHasPublishedBefore: true,
  }
}

export function stateHasMyListingsDemo(listings: Listing[]): boolean {
  return listings.some((l) => l.id.startsWith(MY_LISTINGS_DEMO_LISTING_PREFIX))
}
