import {
  createSeedListings,
  createSeedOffers,
  createSeedWalletOffers,
} from '../data/seed'
import type { Listing, Offer, Transfer, WalletOffer } from '../types/marketplace'
import { CONSENT_VERSION } from '../types/marketplace'

const STORAGE_KEY = 'extracare-prototype-v1'

export interface PrototypeState {
  extraCareLinked: boolean
  marketplaceConsent: boolean
  /** User chose browse without accepting — do not auto-show rules until transactional retry */
  marketplaceBrowseOnly: boolean
  consentVersion: string | null
  offline: boolean
  offers: Offer[]
  listings: Listing[]
  walletOffers: WalletOffer[]
  transfers: Transfer[]
  lastPurchaseTransferId: string | null
  /** FEAT-01: one-shot outcome for the next Pay tap (then resets to none) */
  demoNextPurchaseOutcome: DemoPurchaseOutcome
}

export type DemoPurchaseOutcome = 'none' | 'payment-fail' | 'sold-out' | 'wallet-timeout'

export const DEFAULT_STATE: PrototypeState = {
  extraCareLinked: true,
  marketplaceConsent: false,
  marketplaceBrowseOnly: false,
  consentVersion: null,
  offline: false,
  offers: [],
  listings: [],
  walletOffers: [],
  transfers: [],
  lastPurchaseTransferId: null,
  demoNextPurchaseOutcome: 'none',
}

function loadRaw(): Partial<PrototypeState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Partial<PrototypeState>
  } catch {
    return null
  }
}

export function reseedData(): Pick<PrototypeState, 'offers' | 'listings' | 'walletOffers' | 'transfers'> {
  const offers = createSeedOffers()
  return {
    offers,
    listings: createSeedListings(offers),
    walletOffers: createSeedWalletOffers(),
    transfers: [],
  }
}

/** Full marketplace + wallet seed; keeps consent/ExtraCare/demo scenario flags */
export function reseedListingsAndWalletState(prev: PrototypeState): PrototypeState {
  const seed = reseedData()
  return {
    ...prev,
    offers: seed.offers,
    listings: seed.listings,
    walletOffers: seed.walletOffers,
    transfers: [],
    lastPurchaseTransferId: null,
  }
}

export function loadState(): PrototypeState {
  const saved = loadRaw()
  const seed = reseedData()
  if (!saved) {
    return { ...DEFAULT_STATE, ...seed }
  }
  return {
    ...DEFAULT_STATE,
    ...seed,
    extraCareLinked: saved.extraCareLinked ?? DEFAULT_STATE.extraCareLinked,
    marketplaceConsent: saved.marketplaceConsent ?? DEFAULT_STATE.marketplaceConsent,
    marketplaceBrowseOnly: saved.marketplaceBrowseOnly ?? DEFAULT_STATE.marketplaceBrowseOnly,
    consentVersion: saved.consentVersion ?? null,
    offline: saved.offline ?? false,
    listings: saved.listings?.length ? saved.listings : seed.listings,
    walletOffers: saved.walletOffers?.length ? saved.walletOffers : seed.walletOffers,
    transfers: saved.transfers ?? [],
    lastPurchaseTransferId: saved.lastPurchaseTransferId ?? null,
    demoNextPurchaseOutcome: migrateDemoOutcome(saved),
  }
}

function migrateDemoOutcome(saved: Partial<PrototypeState>): DemoPurchaseOutcome {
  if (saved.demoNextPurchaseOutcome) return saved.demoNextPurchaseOutcome
  const legacy = saved as Record<string, unknown>
  if (legacy.demoSimulatePaymentFail) return 'payment-fail'
  if (legacy.demoSimulateWalletTimeout) return 'wallet-timeout'
  if (legacy.demoSimulateSoldListingId) return 'sold-out'
  return 'none'
}

export function persistState(state: PrototypeState): void {
  const toSave: PrototypeState = {
    ...state,
    offers: createSeedOffers(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
}

export function resetAllPrototypeData(): PrototypeState {
  const seed = reseedData()
  const fresh: PrototypeState = {
    ...DEFAULT_STATE,
    ...seed,
    extraCareLinked: true,
    marketplaceConsent: false,
    marketplaceBrowseOnly: false,
    consentVersion: null,
    offline: false,
    lastPurchaseTransferId: null,
    demoNextPurchaseOutcome: 'none',
  }
  persistState(fresh)
  return fresh
}

export function recordConsent(state: PrototypeState): PrototypeState {
  const next = {
    ...state,
    marketplaceConsent: true,
    marketplaceBrowseOnly: false,
    consentVersion: CONSENT_VERSION,
  }
  persistState(next)
  return next
}

export function clearConsent(state: PrototypeState): PrototypeState {
  const next = {
    ...state,
    marketplaceConsent: false,
    marketplaceBrowseOnly: false,
    consentVersion: null,
  }
  persistState(next)
  return next
}

/** FLOWS rule 2: one active listing per offer entitlement ID */
export function hasActiveListingForEntitlement(
  listings: Listing[],
  entitlementId: string,
): boolean {
  return listings.some(
    (l) => l.offerEntitlementId === entitlementId && l.status === 'active',
  )
}

export function getOfferForListing(offers: Offer[], listing: Listing): Offer | undefined {
  return offers.find((o) => o.id === listing.offerId)
}
