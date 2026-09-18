import { useEffect, useMemo, useState } from 'react'
import { usePrototype } from '../context/PrototypeContext'
import { getOfferForListing } from '../store/prototypeStore'
import {
  getUserPublishedListings,
  listingHasEscrowLock,
  listingHasTradeLock,
} from '../store/listingManageActions'
import { pendingSellerProposals } from '../store/tradeActions'
import type { Listing, TradeProposal } from '../types/marketplace'

type ListingsTab = 'active' | 'trades' | 'sold' | 'expired'

const TABS: { id: ListingsTab; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'trades', label: 'Trades' },
  { id: 'sold', label: 'Sold' },
  { id: 'expired', label: 'Expired' },
]

export function MyListingsPanel() {
  const { state, openSheet, openTradeSellerReview, refreshListingExpiry, tryTransactionalAction } =
    usePrototype()
  const [tab, setTab] = useState<ListingsTab>('active')

  useEffect(() => {
    refreshListingExpiry()
  }, [refreshListingExpiry])

  const mine = useMemo(() => getUserPublishedListings(state), [state])
  const active = mine.filter((l) => l.status === 'active')
  const sold = mine.filter((l) => l.status === 'sold')
  const expired = mine.filter(
    (l) => l.status === 'expired' || l.status === 'cancelled',
  )
  const tradeItems = useMemo(() => {
    const mineIds = new Set(mine.map((l) => l.id))
    return state.tradeProposals.filter(
      (p) =>
        mineIds.has(p.listingId) &&
        (p.status === 'pending_seller' ||
          p.status === 'pending_buyer' ||
          p.status === 'awaiting_confirm'),
    )
  }, [state.tradeProposals, mine])

  const sellerInbox = pendingSellerProposals(state).length

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-black">My listings</h2>
        <p className="mt-1 text-sm text-cvs-gray-muted">
          Edit price, cancel, or respond to trade offers on your marketplace listings.
        </p>
      </div>

      <div
        className="flex gap-1 overflow-x-auto border-b border-cvs-gray-border pb-px"
        role="tablist"
        aria-label="Listing status"
      >
        {TABS.map((t) => {
          const selected = tab === t.id
          const badge =
            t.id === 'trades' && sellerInbox > 0 ? sellerInbox : null
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(t.id)}
              className={`relative shrink-0 px-3 pb-2 text-sm font-semibold ${
                selected ? 'text-cvs-blue' : 'text-cvs-gray-muted'
              }`}
            >
              {t.label}
              {badge ? (
                <span className="ml-1 inline-flex min-w-[1.25rem] justify-center rounded-full bg-cvs-blue px-1.5 text-[10px] font-bold text-white">
                  {badge}
                </span>
              ) : null}
              {selected ? (
                <span
                  className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-cvs-blue"
                  aria-hidden
                />
              ) : null}
            </button>
          )
        })}
      </div>

      {tab === 'active' ? (
        active.length === 0 ? (
          <EmptyCopy
            title="No active listings"
            body="List from Savings → On card → Not for me when you’re ready to sell or trade."
          />
        ) : (
          <ul className="space-y-2">
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
        )
      ) : null}

      {tab === 'trades' ? (
        tradeItems.length === 0 ? (
          <EmptyCopy
            title="No pending trades"
            body="When someone proposes a trade on your listing, it will show up here."
          />
        ) : (
          <ul className="space-y-2">
            {tradeItems.map((proposal) => (
              <TradeRow
                key={proposal.id}
                proposal={proposal}
                state={state}
                onReview={() => openTradeSellerReview(proposal.id)}
              />
            ))}
          </ul>
        )
      ) : null}

      {tab === 'sold' ? (
        sold.length === 0 ? (
          <EmptyCopy title="No sold listings yet" body="Completed sales appear here for your records." />
        ) : (
          <ul className="space-y-2">
            {sold.map((listing) => (
              <ListingRow key={listing.id} listing={listing} state={state} readonly />
            ))}
          </ul>
        )
      ) : null}

      {tab === 'expired' ? (
        expired.length === 0 ? (
          <EmptyCopy
            title="No expired or cancelled listings"
            body="Cancelled listings return the offer to your On card wallet."
          />
        ) : (
          <ul className="space-y-2">
            {expired.map((listing) => (
              <ListingRow key={listing.id} listing={listing} state={state} readonly />
            ))}
          </ul>
        )
      ) : null}
    </div>
  )
}

function ListingRow({
  listing,
  state,
  onManage,
  readonly,
}: {
  listing: Listing
  state: ReturnType<typeof usePrototype>['state']
  onManage?: () => void
  readonly?: boolean
}) {
  const offer = getOfferForListing(state.offers, listing)
  const title = offer?.headline ?? 'Marketplace listing'
  const escrow = listing.status === 'active' && listingHasEscrowLock(state, listing.id)
  const tradeLock = listing.status === 'active' && listingHasTradeLock(state, listing.id)
  const statusLabel =
    listing.status === 'cancelled'
      ? 'Cancelled'
      : listing.status === 'expired'
        ? 'Expired'
        : listing.status === 'sold'
          ? 'Sold'
          : escrow
            ? 'Purchase processing'
            : tradeLock
              ? 'Trade in progress'
              : 'Active'

  return (
    <li className="rounded-[var(--radius-card)] border border-cvs-gray-border bg-white p-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-black">{title}</p>
          <p className="mt-0.5 text-xs text-cvs-gray-muted">
            {statusLabel} · ${listing.price.toFixed(2)}
            {listing.type === 'trade' ? ' · Open to trades' : ''}
          </p>
        </div>
        {readonly ? null : (
          <button
            type="button"
            onClick={onManage}
            className="shrink-0 rounded-full border-2 border-cvs-blue px-3 py-1.5 text-xs font-semibold text-cvs-blue"
          >
            Manage
          </button>
        )}
      </div>
    </li>
  )
}

function TradeRow({
  proposal,
  state,
  onReview,
}: {
  proposal: TradeProposal
  state: ReturnType<typeof usePrototype>['state']
  onReview: () => void
}) {
  const listing = state.listings.find((l) => l.id === proposal.listingId)
  const offer = listing ? getOfferForListing(state.offers, listing) : undefined
  const statusCopy =
    proposal.status === 'pending_seller'
      ? 'Needs your response'
      : proposal.status === 'pending_buyer'
        ? 'Waiting on buyer'
        : 'Confirm swap'

  return (
    <li className="rounded-[var(--radius-card)] border border-cvs-gray-border bg-white p-3 shadow-sm">
      <p className="text-sm font-semibold text-black">{offer?.headline ?? 'Your listing'}</p>
      <p className="mt-0.5 text-xs text-cvs-gray-muted">{statusCopy}</p>
      {proposal.status === 'pending_seller' ? (
        <button
          type="button"
          onClick={onReview}
          className="mt-3 w-full rounded-full bg-cvs-blue py-2.5 text-sm font-semibold text-white"
        >
          Review trade offer
        </button>
      ) : (
        <button
          type="button"
          onClick={onReview}
          className="mt-3 text-sm font-semibold text-cvs-blue"
        >
          View details
        </button>
      )}
    </li>
  )
}

function EmptyCopy({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-cvs-gray-border bg-white p-6 text-center shadow-sm">
      <p className="font-semibold text-black">{title}</p>
      <p className="mt-2 text-sm text-cvs-gray-muted">{body}</p>
    </div>
  )
}
