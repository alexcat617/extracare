import { useEffect, useMemo, useState } from 'react'
import { ADD_TO_CARD_SUCCESS_MS, AddToCardButton } from '../components/AddToCardButton'
import { CouponCard } from '../components/CouponCard'
import { EmptyStateCard, EmptyStateLink } from '../components/EmptyStateCard'
import { MarketplaceFilterSheet } from '../components/MarketplaceFilterSheet'
import { MarketplaceTabBar } from '../components/MarketplaceTabBar'
import { SegmentBar } from '../components/SegmentBar'
import { usePrototype } from '../context/PrototypeContext'
import {
  DEFAULT_MARKETPLACE_FILTERS,
  filterListings,
  type MarketplaceFilters,
} from '../lib/marketplaceFilters'
import type { Listing, Offer } from '../types/marketplace'
import { isPurchasedWalletOffer, isTradedWalletOffer } from '../lib/escrowTimeline'
import { isOfferOnCard } from '../store/clipActions'
import { getOfferForListing } from '../store/prototypeStore'
import { MarketplaceActivityPanel } from './MarketplaceActivityPanel'
import { MyListingsPanel } from './MyListingsPanel'

const HIDE_LISTING_ANIMATION_MS = 720
const CLIP_DISMISS_MS = 720

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
    clipOfferToCard,
  } = usePrototype()
  const [loading, setLoading] = useState(false)
  const [dismissingClipOfferIds, setDismissingClipOfferIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [marketplaceFilters, setMarketplaceFilters] = useState<MarketplaceFilters>(
    DEFAULT_MARKETPLACE_FILTERS,
  )
  const [marketplaceFiltersOpen, setMarketplaceFiltersOpen] = useState(false)

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

  const visibleCatalogOffers = useMemo(
    () =>
      state.offers
        .filter((o) => o.transferable)
        .filter(
          (o) =>
            !isOfferOnCard(state, o.entitlementId) || dismissingClipOfferIds.has(o.id),
        ),
    [state.offers, state.walletOffers, dismissingClipOfferIds],
  )

  const catalogSlice = useMemo(
    () =>
      savingsSegment === 'for-you'
        ? visibleCatalogOffers.slice(0, 6)
        : visibleCatalogOffers.slice(0, 12),
    [visibleCatalogOffers, savingsSegment],
  )

  const activeWalletCount = state.walletOffers.filter((o) => o.status === 'active').length

  const filtersActive =
    marketplaceFilters.category !== 'all' ||
    marketplaceFilters.expiresSoon ||
    marketplaceFilters.discountType !== 'all' ||
    marketplaceFilters.sort !== 'recommended'

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
            {marketplaceView === 'browse' ? (
              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMarketplaceFiltersOpen(true)}
                  className="rounded-full border-2 border-cvs-blue px-4 py-1.5 text-sm font-semibold text-cvs-blue"
                  aria-expanded={marketplaceFiltersOpen}
                >
                  Sort &amp; refine
                  {filtersActive ? (
                    <span className="sr-only"> (filters applied)</span>
                  ) : null}
                  {filtersActive ? (
                    <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-cvs-blue align-middle" aria-hidden />
                  ) : null}
                </button>
                <span className="text-sm text-cvs-gray-muted">
                  {browseListings.length} listing{browseListings.length === 1 ? '' : 's'}
                </span>
              </div>
            ) : null}
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
          activeWalletCount === 0 ? (
            <EmptyStateCard
              title="No deals on your card"
              description="Clip offers from For you or All, or buy a coupon on Marketplace."
            >
              <EmptyStateLink onClick={() => setSavingsSegment('for-you')}>
                Browse For you
              </EmptyStateLink>
              <EmptyStateLink onClick={() => navigateToMarketplace()}>
                Open Marketplace
              </EmptyStateLink>
            </EmptyStateCard>
          ) : (
            state.walletOffers
              .filter((o) => o.status === 'active')
              .map((offer) => (
              <CouponCard
                key={offer.id}
                offer={offer}
                transferId={offer.transferId}
                traded={isTradedWalletOffer(state.transfers, offer)}
                bought={isPurchasedWalletOffer(state.transfers, offer)}
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
          catalogSlice.length === 0 ? (
            <EmptyStateCard
              title={
                visibleCatalogOffers.length === 0 && state.offers.some((o) => o.transferable)
                  ? 'Deals are on your card'
                  : 'No deals to show'
              }
              description={
                visibleCatalogOffers.length === 0 && state.offers.some((o) => o.transferable)
                  ? 'You clipped everything in this view. Check On card or browse Marketplace.'
                  : 'New savings offers will show up here when they’re available.'
              }
              icon={savingsSegment === 'for-you' ? '✨' : '🎟️'}
            >
              {visibleCatalogOffers.length === 0 && state.offers.some((o) => o.transferable) ? (
                <>
                  {activeWalletCount > 0 ? (
                    <EmptyStateLink onClick={() => setSavingsSegment('on-card')}>
                      View On card
                    </EmptyStateLink>
                  ) : null}
                  <EmptyStateLink onClick={() => navigateToMarketplace()}>
                    Browse Marketplace
                  </EmptyStateLink>
                </>
              ) : null}
            </EmptyStateCard>
          ) : (
            catalogSlice.map((offer) => (
              <CatalogOfferCard
                key={offer.id}
                offer={offer}
                alreadyOnCard={isOfferOnCard(state, offer.entitlementId)}
                onClip={() => {
                  setDismissingClipOfferIds((prev) => new Set(prev).add(offer.id))
                  clipOfferToCard(offer.id)
                }}
                onDismissed={() => {
                  setDismissingClipOfferIds((prev) => {
                    const next = new Set(prev)
                    next.delete(offer.id)
                    return next
                  })
                }}
              />
            ))
          )
        ) : null}
      </div>

      <MarketplaceFilterSheet
        open={marketplaceFiltersOpen}
        filters={marketplaceFilters}
        onChange={setMarketplaceFilters}
        onClose={() => setMarketplaceFiltersOpen(false)}
      />
    </div>
  )
}

function CatalogOfferCard({
  offer,
  alreadyOnCard,
  onClip,
  onDismissed,
}: {
  offer: Offer
  alreadyOnCard: boolean
  onClip: () => void
  onDismissed: () => void
}) {
  const [dismissing, setDismissing] = useState(false)

  const handleClip = () => {
    if (dismissing || alreadyOnCard) return
    onClip()
    window.setTimeout(() => setDismissing(true), ADD_TO_CARD_SUCCESS_MS)
    window.setTimeout(() => {
      onDismissed()
    }, ADD_TO_CARD_SUCCESS_MS + CLIP_DISMISS_MS)
  }

  return (
    <div
      className={`grid transition-[grid-template-rows,margin] duration-[720ms] ease-in-out motion-reduce:transition-none ${
        dismissing ? 'grid-rows-[0fr] !mt-0' : 'grid-rows-[1fr]'
      }`}
      aria-hidden={dismissing}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={`transition-all duration-[720ms] ease-in-out motion-reduce:transition-none ${
            dismissing
              ? 'pointer-events-none -translate-y-2 opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
          <CouponCard
            offer={offer}
            secondarySlot={
              <AddToCardButton alreadyOnCard={alreadyOnCard} onClip={handleClip} />
            }
          />
        </div>
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
            marketplaceBrowse
            price={listing.price}
            secondaryAction={{
              label: hiding ? 'Hiding…' : 'Hide',
              onClick: handleHide,
            }}
            primaryAction={{
              label: browseReadOnly
                ? `Buy — $${listing.price.toFixed(2)} (rules required)`
                : `Buy — $${listing.price.toFixed(2)}`,
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
  filtered,
  onClearFilters,
}: {
  filtered: boolean
  onClearFilters: () => void
}) {
  return (
    <EmptyStateCard
      title={filtered ? 'No listings match your filters' : 'No listings yet'}
      description={
        filtered
          ? 'Try clearing filters or browse all marketplace deals.'
          : 'Check back soon — members list coupons here when they’re ready to sell or trade.'
      }
      icon="🛒"
    >
      {filtered ? (
        <EmptyStateLink onClick={onClearFilters}>Clear filters</EmptyStateLink>
      ) : null}
    </EmptyStateCard>
  )
}
