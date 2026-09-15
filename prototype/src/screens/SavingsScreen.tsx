import { useEffect, useMemo, useState } from 'react'
import { CouponCard } from '../components/CouponCard'
import { SegmentBar } from '../components/SegmentBar'
import { usePrototype } from '../context/PrototypeContext'
import { getOfferForListing } from '../store/prototypeStore'

export function SavingsScreen() {
  const {
    state,
    savingsSegment,
    setSavingsSegment,
    navigateToMarketplace,
    openSheet,
    tryTransactionalAction,
    reseedListingsAndWallet,
  } = usePrototype()
  const [loading, setLoading] = useState(false)

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
    () => state.listings.filter((l) => l.status === 'active'),
    [state.listings],
  )

  const browseReadOnly = !state.marketplaceConsent

  const dealCount =
    savingsSegment === 'marketplace'
      ? activeListings.length
      : savingsSegment === 'on-card'
        ? state.walletOffers.length
        : state.offers.length

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-20 border-b border-cvs-gray-border bg-cvs-gray-bg px-4 pb-3 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Savings</h1>
          <div className="flex gap-3">
            <button type="button" className="text-xl" aria-label="Chat with CVS">💬</button>
            <button type="button" className="text-xl" aria-label="Cart">🛒</button>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-cvs-gray-border bg-white px-4 py-2.5">
          <span aria-hidden>🔍</span>
          <span className="text-sm text-cvs-gray-muted">Find deals</span>
          <button type="button" className="ml-auto text-lg" aria-label="Scan barcode">📷</button>
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

        <div className="mt-3 flex items-center justify-between">
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
        {loading && savingsSegment === 'marketplace' ? (
          <div className="space-y-3" aria-live="polite" aria-busy="true">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-[var(--radius-card)] border border-cvs-gray-border bg-white"
              />
            ))}
          </div>
        ) : null}

        {!loading && savingsSegment === 'marketplace' ? (
          activeListings.length === 0 ? (
            <EmptyMarketplace onReseed={reseedListingsAndWallet} />
          ) : (
            activeListings.map((listing) => {
              const offer = getOfferForListing(state.offers, listing)
              if (!offer) return null
              return (
                <CouponCard
                  key={listing.id}
                  offer={offer}
                  badge={listing.badge}
                  marketplace
                  price={listing.price}
                  secondaryAction={{
                    label: 'See terms',
                    onClick: () => openSheet('listingDetail', listing.id),
                  }}
                  primaryAction={{
                    label: browseReadOnly ? 'Buy (rules required)' : 'Buy',
                    onClick: () => {
                      openSheet('listingDetail', listing.id)
                    },
                  }}
                />
              )
            })
          )
        ) : null}

        {!loading && savingsSegment === 'on-card' ? (
          state.walletOffers.length === 0 ? (
            <p className="text-center text-sm text-cvs-gray-muted py-8">No offers on your card.</p>
          ) : (
            state.walletOffers.map((offer) => (
              <CouponCard
                key={offer.id}
                offer={offer}
                secondaryAction={{
                  label: 'Shop now',
                  onClick: () => {},
                }}
                primaryAction={
                  offer.transferable
                    ? {
                        label: 'Not for me',
                        onClick: () =>
                          tryTransactionalAction(() => openSheet('feat02Stub')),
                      }
                    : undefined
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

      <button
        type="button"
        className="fixed bottom-20 left-1/2 z-20 -translate-x-1/2 rounded-full bg-cvs-blue px-6 py-3 text-sm font-semibold text-white shadow-lg"
        aria-label="Scan in store"
      >
        Scan in store
      </button>
    </div>
  )
}

function EmptyMarketplace({ onReseed }: { onReseed: () => void }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-cvs-gray-border bg-white p-6 text-center">
      <p className="font-semibold text-black">No listings yet</p>
      <p className="mt-2 text-sm text-cvs-gray-muted">
        Seed data loads automatically. Use Prototype → Reseed if needed.
      </p>
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
