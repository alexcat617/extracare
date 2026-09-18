import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  clearConsent,
  loadState,
  persistState,
  recordConsent,
  applyMyListingsDemoSeed,
  reseedListingsAndWalletState,
  resetAllPrototypeData,
  type PrototypeState,
} from '../store/prototypeStore'
import {
  applyPurchaseSuccess,
  clearDemoPurchaseOutcome,
  clearWalletPurchases as clearWalletPurchasesState,
  executePurchase,
  type PurchaseError,
} from '../store/purchaseActions'
import type { DemoPurchaseOutcome } from '../store/prototypeStore'
import {
  applyPublishListing,
  canListWalletOffer,
  checkSellEligibility,
  publishListing,
} from '../store/sellActions'
import type { ListingType } from '../types/marketplace'
import {
  applyCancelListing,
  applyDemoEscrowOnListing,
  applyUpdateListingPrice,
  processAutoExpireListings,
} from '../store/listingManageActions'
import {
  applyTradeProposalSent,
  createTradeProposal,
  sellerRespondTrade,
} from '../store/tradeActions'
import { applyDemoPreset, type DemoPreset } from '../lib/demoPresets'

export type SheetId =
  | 'consent'
  | 'linkExtraCare'
  | 'blockedConsent'
  | 'offline'
  | 'listingDetail'
  | 'buyConfirm'
  | 'buySuccess'
  | 'buyPaymentFailed'
  | 'buyUnavailable'
  | 'buyRefundTimeout'
  | 'sellBlocked'
  | 'sellChoosePath'
  | 'sellListingForm'
  | 'sellIneligible'
  | 'sellSuccess'
  | 'tradePickBundle'
  | 'tradeProposalSent'
  | 'tradeSellerReview'
  | 'tradeSuccess'
  | 'tradeDeclined'
  | 'myListingManage'
  | 'myListingEditPrice'
  | 'myListingCancelConfirm'
  | 'myListingBlocked'
  | 'myListingCancelled'
  | null

export type PublishOutcome = 'success' | 'price' | 'ineligible' | 'error'

export type PurchaseOutcome = 'success' | PurchaseError

interface PrototypeContextValue {
  state: PrototypeState
  activeSheet: SheetId
  selectedListingId: string | null
  selectedWalletOfferId: string | null
  setConsentMode: (mode: ConsentMode) => void
  setExtraCareMode: (linked: boolean) => void
  setOfflineMode: (offline: boolean) => void
  setDemoNextPurchaseOutcome: (outcome: DemoPurchaseOutcome) => void
  setSellerDemoMode: (mode: SellerDemoMode) => void
  runDataAction: (action: DataAction) => void
  runDemoPreset: (preset: DemoPreset) => void
  beginSellFromWallet: (walletOfferId: string) => void
  publishWalletListing: (
    walletOfferId: string,
    askingPrice: number,
    listingType?: ListingType,
  ) => PublishOutcome
  beginTradeProposal: (listingId: string) => void
  submitTradeBundle: (walletOfferIds: string[]) => 'sent' | 'error'
  openTradeSellerReview: (proposalId?: string) => void
  respondTradeAsSeller: (
    action: 'accept' | 'decline',
    proposalId?: string,
  ) => void
  acceptMarketplaceRules: () => void
  declineMarketplaceRules: () => void
  openSheet: (sheet: SheetId, listingId?: string) => void
  closeSheet: () => void
  tryTransactionalAction: (action: () => void) => void
  confirmPurchase: (listingId: string) => Promise<PurchaseOutcome>
  navigateToMarketplace: () => void
  marketplaceView: MarketplaceView
  openMarketplaceActivity: () => void
  openMarketplaceListings: () => void
  closeMarketplaceActivity: () => void
  goToWallet: () => void
  refreshListingExpiry: () => void
  updateMyListingPrice: (
    listingId: string,
    price: number,
  ) => 'success' | 'price' | 'blocked' | 'error'
  cancelMyListing: (listingId: string) => 'success' | 'blocked' | 'error'
  setDemoEscrowOnListing: (listingId: string | null) => void
  savingsSegment: SavingsSegment
  setSavingsSegment: (seg: SavingsSegment) => void
  mainTab: MainTab
  setMainTab: (tab: MainTab) => void
}

export type MainTab = 'home' | 'savings' | 'shop' | 'photo' | 'orders'
export type SavingsSegment = 'all' | 'on-card' | 'for-you' | 'marketplace'
export type MarketplaceView = 'browse' | 'activity' | 'listings'
export type ConsentMode = 'not-given' | 'given' | 'browse-only'
export type DataAction =
  | 'undo-purchases'
  | 'reseed'
  | 'seed-my-listings'
  | 'factory-reset'
  | 'open-marketplace'
export type SellerDemoMode = 'eligible' | 'new-account' | 'listing-cap' | 'no-phone'

const PrototypeContext = createContext<PrototypeContextValue | null>(null)

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrototypeState>(() => loadState())
  const [activeSheet, setActiveSheet] = useState<SheetId>(null)
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)
  const [selectedWalletOfferId, setSelectedWalletOfferId] = useState<string | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('savings')
  const [savingsSegment, setSavingsSegment] = useState<SavingsSegment>('all')
  const [marketplaceView, setMarketplaceView] = useState<MarketplaceView>('browse')

  const patchState = useCallback((updater: (prev: PrototypeState) => PrototypeState) => {
    setState((prev) => {
      const next = updater(prev)
      persistState(next)
      return next
    })
  }, [])

  const setExtraCareMode = useCallback(
    (linked: boolean) => patchState((prev) => ({ ...prev, extraCareLinked: linked })),
    [patchState],
  )

  const setConsentMode = useCallback(
    (mode: ConsentMode) => {
      patchState((prev) => {
        if (mode === 'given') return recordConsent(prev)
        if (mode === 'browse-only') {
          return {
            ...clearConsent(prev),
            marketplaceBrowseOnly: true,
          }
        }
        return clearConsent(prev)
      })
    },
    [patchState],
  )

  const setOfflineMode = useCallback(
    (offline: boolean) => patchState((prev) => ({ ...prev, offline })),
    [patchState],
  )

  const setDemoNextPurchaseOutcome = useCallback(
    (outcome: DemoPurchaseOutcome) =>
      patchState((prev) => ({ ...prev, demoNextPurchaseOutcome: outcome })),
    [patchState],
  )

  const setSellerDemoMode = useCallback(
    (mode: SellerDemoMode) => {
      patchState((prev) => {
        switch (mode) {
          case 'eligible':
            return {
              ...prev,
              demoSellerEligible: true,
              demoSellerAccountDays: 14,
              demoPhoneVerified: true,
              demoSellerListingCapReached: false,
            }
          case 'new-account':
            return {
              ...prev,
              demoSellerEligible: true,
              demoSellerAccountDays: 3,
              demoPhoneVerified: true,
              demoSellerListingCapReached: false,
            }
          case 'listing-cap':
            return {
              ...prev,
              demoSellerEligible: true,
              demoSellerAccountDays: 14,
              demoPhoneVerified: true,
              demoSellerListingCapReached: true,
            }
          case 'no-phone':
            return {
              ...prev,
              demoSellerEligible: true,
              demoSellerAccountDays: 14,
              demoPhoneVerified: false,
              demoSellerListingCapReached: false,
            }
        }
      })
    },
    [patchState],
  )

  const acceptMarketplaceRules = useCallback(() => {
    setState((prev) => recordConsent(prev))
    setActiveSheet(null)
    setSavingsSegment('marketplace')
  }, [])

  const declineMarketplaceRules = useCallback(() => {
    patchState((prev) => ({ ...prev, marketplaceBrowseOnly: true }))
    setActiveSheet(null)
    setSavingsSegment('marketplace')
  }, [patchState])

  const runDataAction = useCallback(
    (action: DataAction) => {
      if (action === 'undo-purchases') {
        patchState((prev) => clearWalletPurchasesState(prev))
        return
      }
      if (action === 'reseed') {
        patchState((prev) => reseedListingsAndWalletState(prev))
        return
      }
      if (action === 'seed-my-listings') {
        patchState((prev) => applyMyListingsDemoSeed(prev))
        return
      }
      if (action === 'factory-reset') {
        const fresh = resetAllPrototypeData()
        setState(fresh)
        setActiveSheet(null)
        setSavingsSegment('all')
        return
      }
      if (action === 'open-marketplace') {
        setMainTab('savings')
        setSavingsSegment('marketplace')
      }
    },
    [patchState],
  )

  const runDemoPreset = useCallback(
    (preset: DemoPreset) => {
      setState((prev) => {
        const outcome = applyDemoPreset(prev, preset)
        if (preset !== 'fresh-start') {
          persistState(outcome.state)
        }
        queueMicrotask(() => {
          setMainTab('savings')
          setSavingsSegment(outcome.savingsSegment)
          setMarketplaceView(outcome.marketplaceView)
          setSelectedListingId(outcome.selectedListingId)
          if (outcome.openSheet) {
            setActiveSheet(outcome.openSheet)
          } else {
            setActiveSheet(null)
          }
        })
        return outcome.state
      })
    },
    [],
  )

  const openSheet = useCallback((sheet: SheetId, listingId?: string) => {
    setActiveSheet(sheet)
    if (listingId) setSelectedListingId(listingId)
  }, [])

  const closeSheet = useCallback(() => {
    setActiveSheet(null)
  }, [])

  const tryTransactionalAction = useCallback(
    (action: () => void) => {
      if (state.offline) {
        openSheet('offline')
        return
      }
      if (!state.extraCareLinked) {
        openSheet('linkExtraCare')
        return
      }
      if (!state.marketplaceConsent || state.marketplaceBrowseOnly) {
        openSheet('blockedConsent')
        return
      }
      action()
    },
    [
      state.offline,
      state.extraCareLinked,
      state.marketplaceConsent,
      state.marketplaceBrowseOnly,
      openSheet,
    ],
  )

  const confirmPurchase = useCallback((listingId: string): Promise<PurchaseOutcome> => {
    return new Promise((resolve) => {
      setState((prev) => {
        const result = executePurchase(prev, listingId)
        const cleared = clearDemoPurchaseOutcome(prev)
        if (!result.ok) {
          persistState(cleared)
          queueMicrotask(() => resolve(result.error))
          return cleared
        }
        const next = applyPurchaseSuccess(cleared, listingId, result)
        persistState(next)
        queueMicrotask(() => resolve('success'))
        return next
      })
    })
  }, [])

  const navigateToMarketplace = useCallback(() => {
    setMainTab('savings')
    setSavingsSegment('marketplace')
    setMarketplaceView('browse')
  }, [])

  const openMarketplaceActivity = useCallback(() => {
    setMainTab('savings')
    setSavingsSegment('marketplace')
    setMarketplaceView('activity')
  }, [])

  const openMarketplaceListings = useCallback(() => {
    setMainTab('savings')
    setSavingsSegment('marketplace')
    setMarketplaceView('listings')
    patchState((prev) => processAutoExpireListings(prev))
  }, [patchState])

  const closeMarketplaceActivity = useCallback(() => {
    setMarketplaceView('browse')
  }, [])

  const refreshListingExpiry = useCallback(() => {
    patchState((prev) => processAutoExpireListings(prev))
  }, [patchState])

  const updateMyListingPrice = useCallback(
    (listingId: string, price: number): 'success' | 'price' | 'blocked' | 'error' => {
      let outcome: 'success' | 'price' | 'blocked' | 'error' = 'error'
      patchState((prev) => {
        const result = applyUpdateListingPrice(prev, listingId, price)
        if (!result.ok) {
          if (result.reason === 'price') outcome = 'price'
          else if (result.reason === 'blocked') outcome = 'blocked'
          else outcome = 'error'
          return prev
        }
        outcome = 'success'
        return result.state
      })
      return outcome
    },
    [patchState],
  )

  const cancelMyListing = useCallback(
    (listingId: string): 'success' | 'blocked' | 'error' => {
      let outcome: 'success' | 'blocked' | 'error' = 'error'
      patchState((prev) => {
        const result = applyCancelListing(prev, listingId)
        if (!result.ok) {
          outcome = result.reason === 'blocked' ? 'blocked' : 'error'
          return prev
        }
        outcome = 'success'
        return result.state
      })
      return outcome
    },
    [patchState],
  )

  const setDemoEscrowOnListing = useCallback(
    (listingId: string | null) => {
      patchState((prev) => {
        const cleared = prev.transfers.filter((t) => t.status !== 'pending' || !t.id.startsWith('ESC-'))
        const base = { ...prev, transfers: cleared }
        if (!listingId) return base
        return applyDemoEscrowOnListing(base, listingId)
      })
    },
    [patchState],
  )

  const goToWallet = useCallback(() => {
    setMainTab('savings')
    setSavingsSegment('on-card')
  }, [])

  const beginSellFromWallet = useCallback(
    (walletOfferId: string) => {
      setSelectedWalletOfferId(walletOfferId)
      const offer = state.walletOffers.find((w) => w.id === walletOfferId)
      if (!offer) return

      if (!offer.transferable) {
        openSheet('sellBlocked')
        return
      }

      const listCheck = canListWalletOffer(state, offer)
      if (!listCheck.ok && listCheck.reason === 'already-listed') {
        setMainTab('savings')
        setSavingsSegment('marketplace')
        setMarketplaceView('listings')
        return
      }

      tryTransactionalAction(() => {
        const elig = checkSellEligibility(state)
        if (!elig.ok) openSheet('sellIneligible')
        else openSheet('sellChoosePath')
      })
    },
    [state, openSheet, tryTransactionalAction],
  )

  const beginTradeProposal = useCallback(
    (listingId: string) => {
      setSelectedListingId(listingId)
      tryTransactionalAction(() => {
        const listing = state.listings.find((l) => l.id === listingId)
        if (!listing || listing.status !== 'active') {
          openSheet('buyUnavailable')
          return
        }
        openSheet('tradePickBundle', listingId)
      })
    },
    [state.listings, tryTransactionalAction, openSheet],
  )

  const submitTradeBundle = useCallback(
    (walletOfferIds: string[]): 'sent' | 'error' => {
      if (!selectedListingId) return 'error'
      let result: 'sent' | 'error' = 'error'
      patchState((prev) => {
        const created = createTradeProposal(prev, selectedListingId, walletOfferIds)
        if (!created.ok) return prev
        result = 'sent'
        return applyTradeProposalSent(prev, created.proposal)
      })
      if (result !== 'error') openSheet('tradeProposalSent')
      return result
    },
    [patchState, selectedListingId, openSheet],
  )

  const openTradeSellerReview = useCallback(
    (proposalId?: string) => {
      const proposal = proposalId
        ? state.tradeProposals.find((p) => p.id === proposalId)
        : state.tradeProposals.find((p) => p.status === 'pending_seller')
      if (!proposal) return
      setSelectedListingId(proposal.listingId)
      patchState((prev) => ({ ...prev, activeTradeProposalId: proposal.id }))
      openSheet('tradeSellerReview')
    },
    [state.tradeProposals, patchState, openSheet],
  )

  const respondTradeAsSeller = useCallback(
    (action: 'accept' | 'decline', explicitProposalId?: string) => {
      patchState((prev) => {
        const proposalId = explicitProposalId ?? prev.activeTradeProposalId
        if (!proposalId) return prev
        const result = sellerRespondTrade(prev, proposalId, action)
        if (!result.ok) return prev
        const listingId = result.state.tradeProposals.find((p) => p.id === proposalId)?.listingId
        if (listingId) queueMicrotask(() => setSelectedListingId(listingId))
        const nextSheet: SheetId =
          action === 'accept' ? 'tradeSuccess' : 'tradeDeclined'
        queueMicrotask(() => openSheet(nextSheet))
        return result.state
      })
    },
    [patchState, openSheet],
  )

  const publishWalletListing = useCallback(
    (walletOfferId: string, askingPrice: number, listingType: ListingType = 'sale'): PublishOutcome => {
      let outcome: PublishOutcome = 'error'
      patchState((prev) => {
        const result = publishListing(prev, walletOfferId, askingPrice, listingType)
        if (!result.ok) {
          if (result.reason === 'price') outcome = 'price'
          else if (result.reason === 'ineligible') outcome = 'ineligible'
          else outcome = 'error'
          return prev
        }
        outcome = 'success'
        return applyPublishListing(prev, walletOfferId, result.listing)
      })
      return outcome
    },
    [patchState],
  )

  const value = useMemo(
    () => ({
      state,
      activeSheet,
      selectedListingId,
      selectedWalletOfferId,
      setConsentMode,
      setExtraCareMode,
      setOfflineMode,
      setDemoNextPurchaseOutcome,
      setSellerDemoMode,
      acceptMarketplaceRules,
      declineMarketplaceRules,
      runDataAction,
      runDemoPreset,
      beginSellFromWallet,
      publishWalletListing,
      beginTradeProposal,
      submitTradeBundle,
      openTradeSellerReview,
      respondTradeAsSeller,
      openSheet,
      closeSheet,
      tryTransactionalAction,
      confirmPurchase,
      navigateToMarketplace,
      marketplaceView,
      openMarketplaceActivity,
      openMarketplaceListings,
      closeMarketplaceActivity,
      goToWallet,
      refreshListingExpiry,
      updateMyListingPrice,
      cancelMyListing,
      setDemoEscrowOnListing,
      savingsSegment,
      setSavingsSegment,
      mainTab,
      setMainTab,
    }),
    [
      state,
      activeSheet,
      selectedListingId,
      selectedWalletOfferId,
      setConsentMode,
      setExtraCareMode,
      setOfflineMode,
      setDemoNextPurchaseOutcome,
      setSellerDemoMode,
      acceptMarketplaceRules,
      declineMarketplaceRules,
      runDataAction,
      runDemoPreset,
      beginSellFromWallet,
      publishWalletListing,
      beginTradeProposal,
      submitTradeBundle,
      openTradeSellerReview,
      respondTradeAsSeller,
      openSheet,
      closeSheet,
      tryTransactionalAction,
      confirmPurchase,
      navigateToMarketplace,
      marketplaceView,
      openMarketplaceActivity,
      openMarketplaceListings,
      closeMarketplaceActivity,
      goToWallet,
      refreshListingExpiry,
      updateMyListingPrice,
      cancelMyListing,
      setDemoEscrowOnListing,
      savingsSegment,
      mainTab,
    ],
  )

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>
}

export function usePrototype(): PrototypeContextValue {
  const ctx = useContext(PrototypeContext)
  if (!ctx) throw new Error('usePrototype must be used within PrototypeProvider')
  return ctx
}
