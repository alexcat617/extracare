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
  reseedData,
  resetAllPrototypeData,
  type PrototypeState,
} from '../store/prototypeStore'

type SheetId =
  | 'consent'
  | 'linkExtraCare'
  | 'blockedConsent'
  | 'offline'
  | 'listingDetail'
  | 'feat01Stub'
  | 'feat02Stub'
  | null

interface PrototypeContextValue {
  state: PrototypeState
  activeSheet: SheetId
  selectedListingId: string | null
  setExtraCareLinked: (linked: boolean) => void
  setMarketplaceConsent: (given: boolean) => void
  setOffline: (offline: boolean) => void
  acceptMarketplaceRules: () => void
  declineMarketplaceRules: () => void
  reseedListingsAndWallet: () => void
  resetAll: () => void
  openSheet: (sheet: SheetId, listingId?: string) => void
  closeSheet: () => void
  tryTransactionalAction: (action: () => void) => void
  navigateToMarketplace: () => void
  savingsSegment: SavingsSegment
  setSavingsSegment: (seg: SavingsSegment) => void
  mainTab: MainTab
  setMainTab: (tab: MainTab) => void
}

export type MainTab = 'home' | 'savings' | 'shop' | 'photo' | 'orders'
export type SavingsSegment = 'all' | 'on-card' | 'for-you' | 'marketplace'

const PrototypeContext = createContext<PrototypeContextValue | null>(null)

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrototypeState>(() => loadState())
  const [activeSheet, setActiveSheet] = useState<SheetId>(null)
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)
  const [mainTab, setMainTab] = useState<MainTab>('savings')
  const [savingsSegment, setSavingsSegment] = useState<SavingsSegment>('all')
  const updateState = useCallback((next: PrototypeState) => {
    setState(next)
    persistState(next)
  }, [])

  const setExtraCareLinked = useCallback((linked: boolean) => {
    setState((prev) => {
      const next = { ...prev, extraCareLinked: linked }
      persistState(next)
      return next
    })
  }, [])

  const setMarketplaceConsent = useCallback((given: boolean) => {
    setState((prev) => {
      const next = given ? recordConsent(prev) : clearConsent(prev)
      return next
    })
  }, [])

  const setOffline = useCallback((offline: boolean) => {
    setState((prev) => {
      const next = { ...prev, offline }
      persistState(next)
      return next
    })
  }, [])

  const acceptMarketplaceRules = useCallback(() => {
    setState((prev) => {
      const next = recordConsent(prev)
      return next
    })
    setActiveSheet(null)
    setSavingsSegment('marketplace')
  }, [])

  const declineMarketplaceRules = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, marketplaceBrowseOnly: true }
      persistState(next)
      return next
    })
    setActiveSheet(null)
    setSavingsSegment('marketplace')
  }, [])

  const reseedListingsAndWallet = useCallback(() => {
    const seed = reseedData()
    updateState({ ...state, ...seed })
  }, [state, updateState])

  const resetAll = useCallback(() => {
    const fresh = resetAllPrototypeData()
    setState(fresh)
    setActiveSheet(null)
    setSavingsSegment('all')
  }, [])

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
      state.extraCareLinked,
      state.marketplaceConsent,
      state.marketplaceBrowseOnly,
      state.offline,
      openSheet,
    ],
  )

  const navigateToMarketplace = useCallback(() => {
    setMainTab('savings')
    setSavingsSegment('marketplace')
  }, [])

  const value = useMemo(
    () => ({
      state,
      activeSheet,
      selectedListingId,
      setExtraCareLinked,
      setMarketplaceConsent,
      setOffline,
      acceptMarketplaceRules,
      declineMarketplaceRules,
      reseedListingsAndWallet,
      resetAll,
      openSheet,
      closeSheet,
      tryTransactionalAction,
      navigateToMarketplace,
      savingsSegment,
      setSavingsSegment,
      mainTab,
      setMainTab,
    }),
    [
      state,
      activeSheet,
      selectedListingId,
      setExtraCareLinked,
      setMarketplaceConsent,
      setOffline,
      acceptMarketplaceRules,
      declineMarketplaceRules,
      reseedListingsAndWallet,
      resetAll,
      openSheet,
      closeSheet,
      tryTransactionalAction,
      navigateToMarketplace,
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
