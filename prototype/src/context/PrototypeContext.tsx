import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { hasSeenWelcome } from '../lib/welcomeGate'
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
  findUserActiveListingForEntitlement,
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
import {
  stepNotInWalletDispute,
  stepTermsMismatchDispute,
  type NotInWalletDisputeOutcome,
  type TermsDisputeOutcome,
} from '../store/trustActions'
import { clipCatalogOfferToWallet } from '../store/clipActions'

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
  | 'purchaseStatus'
  | 'disputeTypePick'
  | 'disputeLateSupport'
  | 'disputeCheckingWallet'
  | 'disputeOfferInWallet'
  | 'disputeRetryPending'
  | 'disputeRefundSuccess'
  | 'disputeRefundDenied'
  | 'disputeTermsEducate'
  | 'disputeProtection'
  | null

export type PublishOutcome = 'success' | 'price' | 'ineligible' | 'error'

export type PurchaseOutcome = 'success' | PurchaseError

interface PrototypeContextValue {
  state: PrototypeState
  activeSheet: SheetId
  /** Sheet id before the latest openSheet/closeSheet (for motion: enter only when null). */
  previousActiveSheet: SheetId | null
  selectedListingId: string | null
  selectedWalletOfferId: string | null
  selectedTransferId: string | null
  setConsentMode: (mode: ConsentMode) => void
  setExtraCareMode: (linked: boolean) => void
  setOfflineMode: (offline: boolean) => void
  setDemoNextPurchaseOutcome: (outcome: DemoPurchaseOutcome) => void
  setDemoTrustScenario: (
    scenario: 'none' | 'missing-wallet' | 'terms-mismatch' | 'redeemed',
    transferId?: string,
  ) => void
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
  hideMarketplaceListing: (listingId: string) => void
  clipOfferToCard: (catalogOfferId: string) => void
  openPurchaseStatus: (transferId: string) => void
  runDisputeWalletCheck: (transferId: string) => NotInWalletDisputeOutcome
  runDisputeTermsResolution: (transferId: string) => TermsDisputeOutcome
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

export const PrototypeContext = createContext<PrototypeContextValue | null>(null)

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrototypeState>(() => loadState())
  const [activeSheet, setActiveSheet] = useState<SheetId>(null)
  const previousActiveSheetRef = useRef<SheetId | null>(null)
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)
  const [selectedWalletOfferId, setSelectedWalletOfferId] = useState<string | null>(null)
  const [selectedTransferId, setSelectedTransferId] = useState<string | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>(() =>
    hasSeenWelcome() ? 'savings' : 'home',
  )
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

  const setDemoTrustScenario = useCallback(
    (
      scenario: 'none' | 'missing-wallet' | 'terms-mismatch' | 'redeemed',
      transferId?: string,
    ) => {
      patchState((prev) => {
        const base = {
          ...prev,
          demoNextPurchaseMissingWallet: scenario === 'missing-wallet',
          demoNextPurchaseTermsMismatch: scenario === 'terms-mismatch',
        }
        if (scenario !== 'redeemed' || !transferId) return base
        if (prev.redeemedTransferIds.includes(transferId)) return base
        return {
          ...base,
          redeemedTransferIds: [...prev.redeemedTransferIds, transferId],
        }
      })
    },
    [patchState],
  )

  const runDisputeWalletCheck = useCallback(
    (transferId: string): NotInWalletDisputeOutcome => {
      let outcome: NotInWalletDisputeOutcome = 'retry'
      patchState((prev) => {
        const result = stepNotInWalletDispute(prev, transferId)
        outcome = result.outcome
        return result.state
      })
      return outcome
    },
    [patchState],
  )

  const runDisputeTermsResolution = useCallback(
    (transferId: string): TermsDisputeOutcome => {
      let outcome: TermsDisputeOutcome = 'match'
      patchState((prev) => {
        const result = stepTermsMismatchDispute(prev, transferId)
        outcome = result.outcome
        return result.state
      })
      return outcome
    },
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
        setMainTab('home')
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
          setMainTab(outcome.mainTab)
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
    setActiveSheet((current) => {
      previousActiveSheetRef.current = current
      return sheet
    })
    if (listingId) setSelectedListingId(listingId)
  }, [])

  const closeSheet = useCallback(() => {
    setActiveSheet((current) => {
      previousActiveSheetRef.current = current
      return null
    })
  }, [])

  const openPurchaseStatus = useCallback(
    (transferId: string) => {
      setSelectedTransferId(transferId)
      openSheet('purchaseStatus')
    },
    [openSheet],
  )

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
        queueMicrotask(() => {
          setSelectedTransferId(next.lastPurchaseTransferId)
          resolve('success')
        })
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

  const hideMarketplaceListing = useCallback(
    (listingId: string) => {
      patchState((prev) => {
        if (prev.hiddenMarketplaceListingIds.includes(listingId)) return prev
        return {
          ...prev,
          hiddenMarketplaceListingIds: [...prev.hiddenMarketplaceListingIds, listingId],
        }
      })
    },
    [patchState],
  )

  const clipOfferToCard = useCallback(
    (catalogOfferId: string) => {
      patchState((prev) => clipCatalogOfferToWallet(prev, catalogOfferId))
    },
    [patchState],
  )

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
        const existing = findUserActiveListingForEntitlement(state, offer.entitlementId)
        if (existing) {
          tryTransactionalAction(() => openSheet('myListingManage', existing.id))
        }
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
        if (action === 'accept') {
          queueMicrotask(() => openSheet('tradeSuccess'))
        }
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
      previousActiveSheet: previousActiveSheetRef.current,
      selectedListingId,
      selectedWalletOfferId,
      selectedTransferId,
      setConsentMode,
      setExtraCareMode,
      setOfflineMode,
      setDemoNextPurchaseOutcome,
      setDemoTrustScenario,
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
      hideMarketplaceListing,
      clipOfferToCard,
      openPurchaseStatus,
      runDisputeWalletCheck,
      runDisputeTermsResolution,
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
      selectedTransferId,
      setConsentMode,
      setExtraCareMode,
      setOfflineMode,
      setDemoNextPurchaseOutcome,
      setDemoTrustScenario,
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
      hideMarketplaceListing,
      clipOfferToCard,
      openPurchaseStatus,
      runDisputeWalletCheck,
      runDisputeTermsResolution,
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
