import { hasActivityTrendSeed, mergeActivityTrendSeed } from '../data/activityTrendSeed'
import { mergeMyListingsDemoIntoState, stateHasMyListingsDemo } from '../data/myListingsDemo'
import {
  createSeedListings,
  createSeedOffers,
  createSeedWalletOffers,
} from '../data/seed'

/** Add new seed wallet coupons without wiping purchases or in-progress state */
function normalizeWalletOffer(offer: WalletOffer): WalletOffer {
  return {
    ...offer,
    status: offer.status ?? 'active',
    transferable: offer.transferable ?? true,
  }
}

function mergeMissingSeedWalletOffers(walletOffers: WalletOffer[]): WalletOffer[] {
  const normalized = walletOffers.map(normalizeWalletOffer)
  const seed = createSeedWalletOffers()
  const have = new Set(normalized.map((w) => w.entitlementId))
  const missing = seed.filter((s) => !have.has(s.entitlementId))
  const merged = missing.length ? [...normalized, ...missing] : normalized
  return merged.map(normalizeWalletOffer)
}
import type { Listing, Offer, TradeProposal, Transfer, WalletOffer } from '../types/marketplace'
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
  /** FEAT-02 seller eligibility mocks */
  demoSellerEligible: boolean
  demoSellerAccountDays: number
  demoPhoneVerified: boolean
  demoSellerListingCapReached: boolean
  sellerHasPublishedBefore: boolean
  /** FEAT-03 trade proposals and dual confirm */
  tradeProposals: TradeProposal[]
  activeTradeProposalId: string | null
  lastTradeTransferIds: [string, string] | null
  /** One-shot: next seller confirm simulates timeout / lock release */
  demoTradeConfirmTimeout: boolean
  /** Marketplace browse — listing IDs hidden for this member only */
  hiddenMarketplaceListingIds: string[]
  /** FEAT-05: one-shot — success transfer without wallet offer */
  demoNextPurchaseMissingWallet: boolean
  /** FEAT-05: one-shot — wallet offer terms differ from listing snapshot */
  demoNextPurchaseTermsMismatch: boolean
  /** FEAT-05: transfer IDs with POS redemption (blocks refund) */
  redeemedTransferIds: string[]
  /** FEAT-05: transfer IDs that already had a retry delivery attempt */
  disputeRetriedTransferIds: Record<string, boolean>
  /** Transfer IDs where retry delivery is simulated to fail (missing-wallet demo) */
  demoForceMissingWalletTransferIds: string[]
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
  demoSellerEligible: true,
  demoSellerAccountDays: 14,
  demoPhoneVerified: true,
  demoSellerListingCapReached: false,
  sellerHasPublishedBefore: false,
  tradeProposals: [],
  activeTradeProposalId: null,
  lastTradeTransferIds: null,
  demoTradeConfirmTimeout: false,
  hiddenMarketplaceListingIds: [],
  demoNextPurchaseMissingWallet: false,
  demoNextPurchaseTermsMismatch: false,
  redeemedTransferIds: [],
  disputeRetriedTransferIds: {},
  demoForceMissingWalletTransferIds: [],
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

export function reseedData(): Pick<
  PrototypeState,
  'offers' | 'listings' | 'walletOffers' | 'transfers' | 'tradeProposals' | 'sellerHasPublishedBefore'
> {
  const offers = createSeedOffers()
  const base = {
    offers,
    listings: createSeedListings(offers),
    walletOffers: createSeedWalletOffers(),
    transfers: [] as Transfer[],
    tradeProposals: [] as TradeProposal[],
    sellerHasPublishedBefore: false,
  }
  const withListingsDemo = mergeMyListingsDemoIntoState(base)
  const withTrend = mergeActivityTrendSeed({ ...DEFAULT_STATE, ...withListingsDemo })
  return {
    offers: withTrend.offers,
    listings: withTrend.listings,
    walletOffers: withTrend.walletOffers,
    transfers: withTrend.transfers,
    tradeProposals: withTrend.tradeProposals,
    sellerHasPublishedBefore: withTrend.sellerHasPublishedBefore,
  }
}

/** Full marketplace + wallet seed; keeps consent/ExtraCare/demo scenario flags */
export function reseedListingsAndWalletState(prev: PrototypeState): PrototypeState {
  const seed = reseedData()
  const purchased = prev.walletOffers.filter((w) => w.transferId)
  const userTransfers = prev.transfers.filter(
    (t) => !t.id.startsWith('TXN-HIST-'),
  )
  return {
    ...prev,
    offers: seed.offers,
    listings: seed.listings,
    walletOffers: [...seed.walletOffers, ...purchased],
    transfers: [...seed.transfers, ...userTransfers],
    lastPurchaseTransferId: prev.lastPurchaseTransferId,
    tradeProposals: seed.tradeProposals ?? [],
    activeTradeProposalId: null,
    lastTradeTransferIds: null,
    demoTradeConfirmTimeout: false,
    sellerHasPublishedBefore: seed.sellerHasPublishedBefore ?? prev.sellerHasPublishedBefore,
  }
}

function stateFromSaved(saved: Partial<PrototypeState>, seed: ReturnType<typeof reseedData>): PrototypeState {
  return {
    ...DEFAULT_STATE,
    ...seed,
    extraCareLinked: saved.extraCareLinked ?? DEFAULT_STATE.extraCareLinked,
    marketplaceConsent: saved.marketplaceConsent ?? DEFAULT_STATE.marketplaceConsent,
    marketplaceBrowseOnly: saved.marketplaceBrowseOnly ?? DEFAULT_STATE.marketplaceBrowseOnly,
    consentVersion: saved.consentVersion ?? null,
    offline: saved.offline ?? false,
    listings: saved.listings?.length ? saved.listings : seed.listings,
    walletOffers: mergeMissingSeedWalletOffers(
      saved.walletOffers?.length ? saved.walletOffers : seed.walletOffers,
    ),
    transfers: saved.transfers ?? [],
    lastPurchaseTransferId: saved.lastPurchaseTransferId ?? null,
    demoNextPurchaseOutcome: migrateDemoOutcome(saved),
    demoSellerEligible: saved.demoSellerEligible ?? DEFAULT_STATE.demoSellerEligible,
    demoSellerAccountDays: saved.demoSellerAccountDays ?? DEFAULT_STATE.demoSellerAccountDays,
    demoPhoneVerified: saved.demoPhoneVerified ?? DEFAULT_STATE.demoPhoneVerified,
    demoSellerListingCapReached:
      saved.demoSellerListingCapReached ?? DEFAULT_STATE.demoSellerListingCapReached,
    sellerHasPublishedBefore:
      saved.sellerHasPublishedBefore ?? seed.sellerHasPublishedBefore ?? false,
    tradeProposals: saved.tradeProposals?.length ? saved.tradeProposals : seed.tradeProposals,
    activeTradeProposalId: saved.activeTradeProposalId ?? null,
    lastTradeTransferIds: saved.lastTradeTransferIds ?? null,
    demoTradeConfirmTimeout: saved.demoTradeConfirmTimeout ?? false,
    hiddenMarketplaceListingIds: saved.hiddenMarketplaceListingIds ?? [],
    demoNextPurchaseMissingWallet: saved.demoNextPurchaseMissingWallet ?? false,
    demoNextPurchaseTermsMismatch: saved.demoNextPurchaseTermsMismatch ?? false,
    redeemedTransferIds: saved.redeemedTransferIds ?? [],
    disputeRetriedTransferIds: saved.disputeRetriedTransferIds ?? {},
    demoForceMissingWalletTransferIds: saved.demoForceMissingWalletTransferIds ?? [],
  }
}

export function applyMyListingsDemoSeed(state: PrototypeState): PrototypeState {
  const next = mergeMyListingsDemoIntoState(state)
  persistState(next)
  return next
}

export function loadState(): PrototypeState {
  const seed = reseedData()
  const saved = loadRaw()
  let state = saved ? stateFromSaved(saved, seed) : { ...DEFAULT_STATE, ...seed }
  let migrated = false
  if (!stateHasMyListingsDemo(state.listings)) {
    state = mergeMyListingsDemoIntoState(state)
    migrated = true
  }
  if (!hasActivityTrendSeed(state.transfers)) {
    state = mergeActivityTrendSeed(state)
    migrated = true
  }
  if (migrated) persistState(state)
  return state
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
    demoSellerEligible: true,
    demoSellerAccountDays: 14,
    demoPhoneVerified: true,
    demoSellerListingCapReached: false,
    activeTradeProposalId: null,
    lastTradeTransferIds: null,
    demoTradeConfirmTimeout: false,
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
