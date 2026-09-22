import { useEffect, useMemo } from 'react'
import { usePrototype } from '../context/PrototypeContext'
import { getOfferForListing } from '../store/prototypeStore'
import {
  getUserPublishedListings,
  listingHasEscrowLock,
  listingHasTradeLock,
} from '../store/listingManageActions'
import { EmptyStateCard } from '../components/EmptyStateCard'
import { ListingExpiryIndicator } from '../components/ListingExpiryIndicator'
import type { Listing, TradeProposal } from '../types/marketplace'

export function MyListingsPanel() {
  const { state, openSheet, openTradeSellerReview, refreshListingExpiry, tryTransactionalAction } =
    usePrototype()

  useEffect(() => {
    refreshListingExpiry()
  }, [refreshListingExpiry])

  const mine = useMemo(() => getUserPublishedListings(state), [state])
  const active = mine.filter((l) => l.status === 'active')
  const tradeItems = useMemo(() => {
    const mineIds = new Set(mine.map((l) => l.id))
    return state.tradeProposals.filter(
      (p) =>
        mineIds.has(p.listingId) &&
        (p.status === 'pending_seller' ||
          p.status === 'pending_buyer'),
    )
  }, [state.tradeProposals, mine])

  return (
    <div className="space-y-6">
      {tradeItems.length > 0 ? (
        <section aria-labelledby="listings-trade-offers-heading">
          <SectionHeader
            id="listings-trade-offers-heading"
            title="Trade offers"
            count={tradeItems.length}
          />
          <ul className="mt-3 space-y-2">
            {tradeItems.map((proposal) => (
              <TradeRow
                key={proposal.id}
                proposal={proposal}
                state={state}
                onView={() => openTradeSellerReview(proposal.id)}
              />
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="listings-active-heading">
        <SectionHeader id="listings-active-heading" title="Active listings" count={active.length} />
        {active.length === 0 ? (
          <EmptyStateCard
            className="mt-3"
            title="No active listings"
            description="List from Savings → On card → Not for me when you’re ready to sell or trade."
            icon="📋"
          />
        ) : (
          <ul className="mt-3 space-y-2">
            {active.map((listing) => (
              <ListingRow
                key={listing.id}
                listing={listing}
                state={state}
                onManage={() =>
                  tryTransactionalAction(() => openSheet('myListingManage', listing.id))
                }
              />
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-cvs-gray-muted">
          Cancelled or expired listings return to On card automatically.
        </p>
      </section>
    </div>
  )
}

function SectionHeader({
  id,
  title,
  count,
}: {
  id: string
  title: string
  count?: number
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <h2 id={id} className="text-sm font-bold text-black">
        {title}
      </h2>
      {count !== undefined ? (
        <span className="text-xs font-medium text-cvs-gray-muted">{count}</span>
      ) : null}
    </div>
  )
}

function ListingRow({
  listing,
  state,
  onManage,
}: {
  listing: Listing
  state: ReturnType<typeof usePrototype>['state']
  onManage: () => void
}) {
  const offer = getOfferForListing(state.offers, listing)
  const title = offer?.headline ?? 'Marketplace listing'
  const escrow = listingHasEscrowLock(state, listing.id)
  const tradeLock = listingHasTradeLock(state, listing.id)
  const statusLabel = escrow ? 'Purchase processing' : tradeLock ? 'Trade in progress' : null

  return (
    <li className="overflow-hidden rounded-[var(--radius-card)] border border-cvs-gray-border bg-white shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-black">{title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {statusLabel ? (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900">
                {statusLabel}
              </span>
            ) : null}
            <span
              className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-800"
            >
              ${listing.price.toFixed(2)}
            </span>
            {listing.type === 'trade' ? (
              <span className="text-xs text-cvs-gray-muted">Open to trades</span>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={onManage}
          className="shrink-0 rounded-full border-2 border-cvs-blue px-3 py-1.5 text-xs font-semibold text-cvs-blue"
        >
          Manage
        </button>
      </div>
      <ListingExpiryIndicator listing={listing} />
    </li>
  )
}

function TradeRow({
  proposal,
  state,
  onView,
}: {
  proposal: TradeProposal
  state: ReturnType<typeof usePrototype>['state']
  onView: () => void
}) {
  const listing = state.listings.find((l) => l.id === proposal.listingId)
  const offer = listing ? getOfferForListing(state.offers, listing) : undefined
  const ctaLabel =
    proposal.status === 'pending_seller' ? 'View proposal' : 'View details'

  return (
    <li className="rounded-[var(--radius-card)] border border-cvs-gray-border bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-cvs-gray-muted">
        {offer?.title ?? 'Your listing'}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-black">
        {offer?.headline ?? 'Your listing'}
      </p>
      <button
        type="button"
        onClick={onView}
        className="mt-4 w-full rounded-full bg-cvs-blue py-2.5 text-sm font-semibold text-white"
      >
        {ctaLabel}
      </button>
    </li>
  )
}

