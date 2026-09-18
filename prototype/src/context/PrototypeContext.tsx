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
  | 'feat02Stub'
  | 'feat03TradeStub'
  | null

export type PurchaseOutcome = 'success' | PurchaseError

interface PrototypeContextValue {
  state: PrototypeState
  activeSheet: SheetId
  selectedListingId: string | null
  setConsentMode: (mode: ConsentMode) => void
  setExtraCareMode: (linked: boolean) => void
  setOfflineMode: (offline: boolean) => void
  setDemoNextPurchaseOutcome: (outcome: DemoPurchaseOutcome) => void
  runDataAction: (action: DataAction) => void
  acceptMarketplaceRules: () => void
  declineMarketplaceRules: () => void
  openSheet: (sheet: SheetId, listingId?: string) => void
  closeSheet: () => void
  tryTransactionalAction: (action: () => void) => void
  confirmPurchase: (listingId: string) => Promise<PurchaseOutcome>
  navigateToMarketplace: () => void
  goToWallet: () => void
  savingsSegment: SavingsSegment
  setSavingsSegment: (seg: SavingsSegment) => void
  mainTab: MainTab
  setMainTab: (tab: MainTab) => void
}

export type MainTab = 'home' | 'savings' | 'shop' | 'photo' | 'orders'
export type SavingsSegment = 'all' | 'on-card' | 'for-you' | 'marketplace'
export type ConsentMode = 'not-given' | 'given' | 'browse-only'
export type DataAction = 'undo-purchases' | 'reseed' | 'factory-reset' | 'open-marketplace'

const PrototypeContext = createContext<PrototypeContextValue | null>(null)

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrototypeState>(() => loadState())
  const [activeSheet, setActiveSheet] = useState<SheetId>(null)
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('savings')
  const [savingsSegment, setSavingsSegment] = useState<SavingsSegment>('all')

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
  }, [])

  const goToWallet = useCallback(() => {
    setMainTab('savings')
    setSavingsSegment('on-card')
  }, [])

  const value = useMemo(
    () => ({
      state,
      activeSheet,
      selectedListingId,
      setConsentMode,
      setExtraCareMode,
      setOfflineMode,
      setDemoNextPurchaseOutcome,
      acceptMarketplaceRules,
      declineMarketplaceRules,
      runDataAction,
      openSheet,
      closeSheet,
      tryTransactionalAction,
      confirmPurchase,
      navigateToMarketplace,
      goToWallet,
      savingsSegment,
      setSavingsSegment,
      mainTab,
      setMainTab,
    }),
    [
      state,
      activeSheet,
      selectedListingId,
      setConsentMode,
      setExtraCareMode,
      setOfflineMode,
      setDemoNextPurchaseOutcome,
      acceptMarketplaceRules,
      declineMarketplaceRules,
      runDataAction,
      openSheet,
      closeSheet,
      tryTransactionalAction,
      confirmPurchase,
      navigateToMarketplace,
      goToWallet,
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
