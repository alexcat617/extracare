import type { Listing } from '../types/marketplace'

export type ListingExpiryUrgency = 'comfortable' | 'soon' | 'urgent'
export type ListingExpiryBarColor = 'green' | 'yellow' | 'orange' | 'red'

const MS_HOUR = 60 * 60 * 1000
const MS_DAY = 24 * MS_HOUR
const URGENT_WITHIN_MS = 48 * MS_HOUR
const SOON_WITHIN_MS = 7 * MS_DAY
const ORANGE_WITHIN_MS = 3 * MS_DAY

function expiryEndMs(expiresAt: string): number {
  return new Date(expiresAt + 'T23:59:59').getTime()
}

export interface ListingExpiryPresentation {
  urgency: ListingExpiryUrgency
  /** 0–100 — share of listing window still remaining (bar fill) */
  percentRemaining: number
  barColor: ListingExpiryBarColor
  badgeLabel: string
  barAriaLabel: string
  hint?: string
}

function barColorForTimeLeft(msLeft: number): ListingExpiryBarColor {
  if (msLeft <= URGENT_WITHIN_MS) return 'red'
  if (msLeft <= ORANGE_WITHIN_MS) return 'orange'
  if (msLeft <= SOON_WITHIN_MS) return 'yellow'
  return 'green'
}

function formatShortDate(expiresAt: string): string {
  const d = new Date(expiresAt + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function daysLeftLabel(days: number): string {
  if (days <= 0) return 'Expires today'
  if (days === 1) return 'Expires tomorrow'
  return `Expires in ${days} days`
}

export function getListingExpiryPresentation(listing: Listing): ListingExpiryPresentation {
  const end = expiryEndMs(listing.expiresAt)
  const now = Date.now()
  const msLeft = Math.max(0, end - now)
  const daysLeft = Math.ceil(msLeft / MS_DAY)

  let urgency: ListingExpiryUrgency = 'comfortable'
  if (msLeft <= URGENT_WITHIN_MS) urgency = 'urgent'
  else if (msLeft <= SOON_WITHIN_MS) urgency = 'soon'

  const start = new Date(listing.createdAt).getTime()
  const totalWindow = Math.max(end - start, MS_DAY)
  const percentRemaining =
    msLeft <= 0 ? 0 : Math.min(100, Math.round((msLeft / totalWindow) * 100))
  const barColor = barColorForTimeLeft(msLeft)

  let badgeLabel: string
  if (urgency === 'urgent') {
    if (msLeft < MS_HOUR) badgeLabel = 'Expires in under 1 hour'
    else if (daysLeft <= 1) badgeLabel = daysLeftLabel(daysLeft)
    else badgeLabel = `Expires in ${daysLeft} days`
  } else if (urgency === 'soon') {
    badgeLabel = daysLeftLabel(daysLeft)
  } else {
    badgeLabel = `Expires ${formatShortDate(listing.expiresAt)}`
  }

  const barAriaLabel = `Offer validity: ${percentRemaining}% of listing window remaining`

  const hint =
    urgency === 'urgent'
      ? 'Lower your price or remove from Marketplace before this offer expires.'
      : urgency === 'soon'
        ? 'Expiring soon — consider lowering price or cancelling the listing.'
        : undefined

  return { urgency, percentRemaining, barColor, badgeLabel, barAriaLabel, hint }
}
