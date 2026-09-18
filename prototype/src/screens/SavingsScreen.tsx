import { useEffect, useMemo, useState } from 'react'
import { CouponCard } from '../components/CouponCard'
import { MarketplaceTabBar } from '../components/MarketplaceTabBar'
import { SegmentBar } from '../components/SegmentBar'
import { usePrototype } from '../context/PrototypeContext'
import {
  DEFAULT_MARKETPLACE_FILTERS,
  filterListings,
  type MarketplaceFilters,
} from '../lib/marketplaceFilters'
import type { Listing, Offer } from '../types/marketplace'
import { getOfferForListing } from '../store/prototypeStore'
import { MarketplaceActivityPanel } from './MarketplaceActivityPanel'
import { MyListingsPanel } from './MyListingsPanel'

const HIDE_LISTING_ANIMATION_MS = 720

export function SavingsScreen() {
  const {
    state,
    savingsSegment,
    setSavingsSegment,
    navigateToMarketplace,
    marketplaceView,
    openSheet,
    beginSellFromWallet,
    hideMarketplaceListing,
    runDataAction,
  } = usePrototype()
  const [loading, setLoading] = useState(false)
  const [marketplaceFilters, setMarketplaceFilters] = useState<MarketplaceFilters>(
    DEFAULT_MARKETPLACE_FILTERS,
  )

  useEffect(() => {
    if (savingsSegment !== 'marketplace') return
    if (!state.extraCareLinked) {
      openSheet('linkExtraCare')
      return
    }
    if (!state.marketplaceConsent && !state.marketplaceBrowseOnly) {
      const timer = window.setTimeout(() => openSheet('consent'), 0)
      return () => window.clearTimeout(timer)
    }
  }, [
    savingsSegment,
    state.extraCareLinked,
    state.marketplaceConsent,
    state.marketplaceBrowseOnly,
    openSheet,
  ])

  useEffect(() => {
    if (savingsSegment === 'marketplace') {
      setLoading(true)
      const t = window.setTimeout(() => setLoading(false), 400)
      return () => window.clearTimeout(t)
    }
    setLoading(false)
  }, [savingsSegment])

  const activeListings = useMemo(
    () => filterListings(state.listings, state.offers, marketplaceFilters),
    [state.listings, state.offers, marketplaceFilters],
  )

  const browseListings = useMemo(() => {
    const hidden = new Set(state.hiddenMarketplaceListingIds)
    return activeListings.filter((l) => !hidden.has(l.id))
  }, [activeListings, state.hiddenMarketplaceListingIds])

  const filtersActive =
    marketplaceFilters.category !== 'all' ||
    marketplaceFilters.expiresSoon ||
    marketplaceFilters.discountType !== 'all'

  const browseReadOnly = !state.marketplaceConsent

  const dealCount =
    savingsSegment === 'marketplace'
      ? browseListings.length
      : savingsSegment === 'on-card'
        ? state.walletOffers.length
        : state.offers.length

  const marketplaceBrowse =
    savingsSegment === 'marketplace' && marketplaceView === 'browse'
  const marketplaceActivity =
    savingsSegment === 'marketplace' && marketplaceView === 'activity'
  const marketplaceListings =
    savingsSegment === 'marketplace' && marketplaceView === 'listings'

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-20 border-b border-cvs-gray-border bg-cvs-gray-bg px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Savings</h1>
          <div className="flex gap-3">
            <button type="button" className="text-xl" aria-label="Chat with CVS">💬</button>
            <button type="button" className="text-xl" aria-label="Cart">🛒</button>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Coupons</h2>
          <button type="button" className="text-sm font-semibold text-cvs-blue">
            Weekly Ad
          </button>
        </div>

        <SegmentBar
          value={savingsSegment}
          onChange={(seg) => {
            setSavingsSegment(seg)
            if (seg === 'marketplace') navigateToMarketplace()
          }}
        />

        {savingsSegment === 'marketplace' ? (
          <>
            <MarketplaceTabBar />
          </>
        ) : (
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className="rounded-full border-2 border-cvs-blue px-4 py-1.5 text-sm font-semibold text-cvs-blue"
            >
              Sort &amp; refine
            </button>
            <span className="text-sm text-cvs-gray-muted">
              {dealCount} deal{dealCount === 1 ? '' : 's'}
            </span>
          </div>
        )}

        {browseReadOnly && savingsSegment === 'marketplace' ? (
          <p
            className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950"
            role="status"
          >
            Read-only browse: accept marketplace rules to buy, sell, or trade.
          </p>
        ) : null}

        {state.offline && savingsSegment === 'marketplace' ? (
          <p className="mt-3 rounded-lg border border-cvs-gray-border bg-white px-3 py-2 text-xs text-cvs-gray-muted">
            Offline: cached listings shown. Transactional actions are disabled.
          </p>
        ) : null}
      </div>

      <div className="mt-4 space-y-3 px-4">
        {marketplaceActivity ? <MarketplaceActivityPanel /> : null}
        {marketplaceListings ? <MyListingsPanel /> : null}

        {loading && marketplaceBrowse ? (
          <div className="space-y-3" aria-live="polite" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-[var(--radius-card)] border border-cvs-gray-border bg-white"
              />
            ))}
          </div>
        ) : null}

        {!loading && marketplaceBrowse ? (
          browseListings.length === 0 ? (
            <EmptyMarketplace
              onReseed={() => runDataAction('reseed')}
              filtered={
                filtersActive ||
                (activeListings.length > 0 && browseListings.length === 0)
              }
              onClearFilters={() => setMarketplaceFilters(DEFAULT_MARKETPLACE_FILTERS)}
            />
          ) : (
            browseListings.map((listing) => {
              const offer = getOfferForListing(state.offers, listing)
              if (!offer) return null
              return (
                <MarketplaceBrowseCard
                  key={listing.id}
                  listing={listing}
                  offer={offer}
                  browseReadOnly={browseReadOnly}
                  onHide={hideMarketplaceListing}
                  onBuy={() => openSheet('listingDetail', listing.id)}
                />
              )
            })
          )
        ) : null}

        {!loading && savingsSegment === 'on-card' ? (
          state.walletOffers.filter((o) => o.status === 'active').length === 0 ? (
            <p className="text-center text-sm text-cvs-gray-muted py-8">No offers on your card.</p>
          ) : (
            state.walletOffers
              .filter((o) => o.status === 'active')
              .map((offer) => (
              <CouponCard
                key={offer.id}
                offer={offer}
                transferId={offer.transferId}
                secondaryAction={{
                  label: 'Shop now',
                  onClick: () => {},
                }}
                primaryAction={
                  offer.transferable
                    ? {
                        label: 'Not for me',
                        onClick: () => beginSellFromWallet(offer.id),
                      }
                    : {
                        label: 'Can’t sell',
                        onClick: () => beginSellFromWallet(offer.id),
                      }
                }
              />
            ))
          )
        ) : null}

        {!loading && (savingsSegment === 'all' || savingsSegment === 'for-you') ? (
          state.offers
            .filter((o) => o.transferable)
            .slice(0, savingsSegment === 'for-you' ? 6 : 12)
            .map((offer) => (
              <CouponCard
                key={offer.id}
                offer={offer}
                secondaryAction={{ label: 'Shop now', onClick: () => {} }}
              />
            ))
        ) : null}
      </div>
    </div>
  )
}

function MarketplaceBrowseCard({
  listing,
  offer,
  browseReadOnly,
  onHide,
  onBuy,
}: {
  listing: Listing
  offer: Offer
  browseReadOnly: boolean
  onHide: (listingId: string) => void
  onBuy: () => void
}) {
  const [hiding, setHiding] = useState(false)

  const handleHide = () => {
    if (hiding) return
    setHiding(true)
    window.setTimeout(() => onHide(listing.id), HIDE_LISTING_ANIMATION_MS)
  }

  return (
    <div
      className={`grid transition-[grid-template-rows,margin] duration-[720ms] ease-in-out motion-reduce:transition-none ${
        hiding ? 'grid-rows-[0fr] !mt-0' : 'grid-rows-[1fr]'
      }`}
      aria-hidden={hiding}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={`transition-all duration-[720ms] ease-in-out motion-reduce:transition-none ${
            hiding
              ? 'pointer-events-none -translate-y-2 scale-[0.97] opacity-0'
              : 'translate-y-0 scale-100 opacity-100'
          }`}
        >
          <CouponCard
            offer={offer}
            badge={listing.badge}
            marketplace
            price={listing.price}
            secondaryAction={{
              label: hiding ? 'Hiding…' : 'Hide',
              onClick: handleHide,
            }}
            primaryAction={{
              label: browseReadOnly ? 'Buy (rules required)' : 'Buy',
              onClick: onBuy,
              disabled: hiding,
            }}
          />
        </div>
      </div>
    </div>
  )
}

function EmptyMarketplace({
  onReseed,
  filtered,
  onClearFilters,
}: {
  onReseed: () => void
  filtered: boolean
  onClearFilters: () => void
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-cvs-gray-border bg-white p-6 text-center">
      <p className="font-semibold text-black">
        {filtered ? 'No listings match your filters' : 'No listings yet'}
      </p>
      <p className="mt-2 text-sm text-cvs-gray-muted">
        {filtered
          ? 'Try clearing filters or browse all marketplace deals.'
          : 'Seed data loads automatically. Use Prototype → Reseed if needed.'}
      </p>
      {filtered ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 text-sm font-semibold text-cvs-blue"
        >
          Clear filters
        </button>
      ) : null}
      <button
        type="button"
        onClick={onReseed}
        className="mt-4 text-sm font-semibold text-cvs-blue"
      >
        Reload listings
      </button>
    </div>
  )
}
