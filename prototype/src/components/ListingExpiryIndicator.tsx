import type { Listing } from '../types/marketplace'
import type { ListingExpiryBarColor } from '../lib/listingExpiry'
import { getListingExpiryPresentation } from '../lib/listingExpiry'

const BAR_FILL: Record<ListingExpiryBarColor, string> = {
  green: 'bg-green-600',
  yellow: 'bg-amber-400',
  orange: 'bg-orange-500',
  red: 'bg-cvs-red',
}

const BADGE: Record<
  ReturnType<typeof getListingExpiryPresentation>['urgency'],
  string
> = {
  comfortable: 'bg-cvs-gray-bg text-cvs-gray-muted',
  soon: 'bg-amber-50 text-amber-950',
  urgent: 'bg-red-50 text-cvs-red',
}

export function ListingExpiryIndicator({
  listing,
  compact = false,
}: {
  listing: Listing
  compact?: boolean
}) {
  const meta = getListingExpiryPresentation(listing)

  if (compact) {
    return (
      <div className="mt-2 space-y-1.5">
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-cvs-gray-border/50"
          role="progressbar"
          aria-valuenow={meta.percentRemaining}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={meta.barAriaLabel}
        >
          <div
            className={`h-full rounded-full ${BAR_FILL[meta.barColor]}`}
            style={{ width: `${meta.percentRemaining}%` }}
          />
        </div>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${BADGE[meta.urgency]}`}
        >
          {meta.badgeLabel}
        </span>
      </div>
    )
  }

  return (
    <div className="border-t border-cvs-gray-border/80 bg-cvs-gray-bg/30 px-4 py-3">
      <div
        className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-cvs-gray-border/50"
        role="progressbar"
        aria-valuenow={meta.percentRemaining}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={meta.barAriaLabel}
      >
        <div
          className={`h-full rounded-full transition-[width] ${BAR_FILL[meta.barColor]}`}
          style={{ width: `${meta.percentRemaining}%` }}
        />
      </div>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[meta.urgency]}`}
        >
          {meta.badgeLabel}
        </span>
        {meta.hint ? (
          <p className="min-w-0 flex-1 text-right text-[11px] leading-snug text-cvs-gray-muted sm:text-left">
            {meta.hint}
          </p>
        ) : null}
      </div>
    </div>
  )
}
