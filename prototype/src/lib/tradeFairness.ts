import type { Offer, WalletOffer } from '../types/marketplace'

export const MAX_TRADE_BUNDLE = 3

export function sumOfferSavings(offers: Pick<Offer, 'savingsAmount'>[]): number {
  return offers.reduce((sum, o) => sum + o.savingsAmount, 0)
}

/** Non-blocking fairness hint vs listing savings value (FLOW-03 step 3) */
export function tradeFairnessHint(
  counterSavings: number,
  listingSavings: number,
): { tone: 'balanced' | 'you-more' | 'you-less'; message: string } {
  const diff = counterSavings - listingSavings
  if (Math.abs(diff) < 0.5) {
    return { tone: 'balanced', message: 'Your bundle is about even with this listing.' }
  }
  if (diff > 0) {
    return {
      tone: 'you-more',
      message: `You’re offering about $${diff.toFixed(2)} more in savings than this listing.`,
    }
  }
  return {
    tone: 'you-less',
    message: `You’re offering about $${Math.abs(diff).toFixed(2)} less in savings than this listing.`,
  }
}

export function walletOfferEligibleForTradeBundle(
  offer: WalletOffer,
  hasActiveListing: boolean,
): { ok: true } | { ok: false; reason: string } {
  if (!offer.transferable) return { ok: false, reason: 'Not transferable' }
  if (offer.status === 'reserved') {
    return { ok: false, reason: 'Held for a listing or pending trade — cancel or finish first' }
  }
  if (offer.status === 'voided') {
    return { ok: false, reason: 'No longer on your card' }
  }
  if (hasActiveListing) {
    return { ok: false, reason: 'Listed on Marketplace — delist first (FEAT-04)' }
  }
  const exp = new Date(offer.expiry + 'T23:59:59').getTime()
  if (exp < Date.now()) return { ok: false, reason: 'Expired' }
  return { ok: true }
}

export function tradeBundleWalletCandidates(state: {
  walletOffers: WalletOffer[]
  listings: { offerEntitlementId: string; status: string }[]
}): WalletOffer[] {
  return state.walletOffers.filter((w) => w.transferable)
}
