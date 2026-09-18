import type { ReactNode } from 'react'
import type { Offer } from '../types/marketplace'

function formatExpiry(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function channelLabel(channel: Offer['channel']): string {
  if (channel === 'in-store') return 'In store'
  if (channel === 'online') return 'Online'
  return 'In store or online'
}

interface CouponCardProps {
  offer: Offer
  savingsLabel?: string
  badge?: string
  primaryAction?: { label: string; onClick: () => void; disabled?: boolean }
  secondaryAction?: { label: string; onClick: () => void }
  secondarySlot?: ReactNode
  marketplace?: boolean
  /** Marketplace browse feed — subtle commerce accent */
  marketplaceBrowse?: boolean
  price?: number
  transferId?: string
  /** Received via marketplace trade swap */
  traded?: boolean
  /** Received via protected marketplace purchase */
  bought?: boolean
  /** Product / brand line above headline (e.g. trade context) */
  productTitle?: string
}

export function CouponCard({
  offer,
  badge,
  primaryAction,
  secondaryAction,
  secondarySlot,
  marketplace,
  marketplaceBrowse,
  price,
  transferId,
  traded,
  bought,
  productTitle,
}: CouponCardProps) {
  const isExpiryBadge = badge === 'Expires soon' || badge === 'Last day'
  const isPriceDrop = badge === 'Price drop'

  return (
    <article
      className={`rounded-[var(--radius-card)] border bg-white p-4 ${
        marketplaceBrowse
          ? 'border-cvs-blue/35 shadow-[0_1px_0_0_rgba(0,76,151,0.06)]'
          : 'border-cvs-gray-border'
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        {isExpiryBadge ? (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900">
            {badge ?? 'Last day'}
          </span>
        ) : null}
        {isPriceDrop ? (
          <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-900">
            Price drop
          </span>
        ) : null}
        <span className="rounded-full border border-cvs-gray-border px-2 py-0.5 text-xs text-cvs-gray-muted">
          {channelLabel(offer.channel)}
        </span>
        {marketplace && !marketplaceBrowse ? (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-cvs-blue">
            Marketplace
          </span>
        ) : null}
        {traded ? (
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-900">
            Traded
          </span>
        ) : null}
        {bought ? (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-cvs-blue-dark">
            Bought
          </span>
        ) : null}
      </div>
      <div className="flex gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-2xl"
          aria-hidden
        >
          🎟️
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-bold text-cvs-red">
            ${offer.savingsAmount.toFixed(2).replace(/\.00$/, '')} off
          </p>
          {productTitle ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-cvs-gray-muted">
              {productTitle}
            </p>
          ) : null}
          <p className="text-sm font-medium text-black">{offer.headline}</p>
          {offer.minPurchase != null ? (
            <p className="mt-0.5 text-xs text-cvs-gray-muted">
              Min purchase ${offer.minPurchase.toFixed(2).replace(/\.00$/, '')}
            </p>
          ) : null}
          {offer.stackSummary ? (
            <p className="mt-0.5 text-xs text-cvs-gray-muted">{offer.stackSummary}</p>
          ) : null}
          <p className="mt-1 text-xs text-cvs-gray-muted">Exp {formatExpiry(offer.expiry)}</p>
          {transferId ? (
            <p className="mt-1 text-xs font-medium text-cvs-blue">
              Transfer ID: <span className="font-mono">{transferId}</span>
            </p>
          ) : null}
          {marketplace && price != null && !primaryAction ? (
            <p className="mt-1 text-sm font-semibold text-black">
              Listing price ${price.toFixed(2)}
            </p>
          ) : null}
        </div>
      </div>
      <div
        className={
          primaryAction || secondaryAction || secondarySlot
            ? 'mt-4 flex flex-wrap items-center gap-3'
            : 'hidden'
        }
      >
        {secondarySlot ? (
          secondarySlot
        ) : secondaryAction ? (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            className="rounded-full border-2 border-cvs-blue px-5 py-2 text-sm font-semibold text-cvs-blue"
          >
            {secondaryAction.label}
          </button>
        ) : null}
        {primaryAction ? (
          <button
            type="button"
            disabled={primaryAction.disabled}
            onClick={primaryAction.onClick}
            className="ml-auto rounded-full bg-cvs-blue px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {primaryAction.label}
          </button>
        ) : null}
      </div>
    </article>
  )
}
