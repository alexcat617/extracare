import { mergeMyListingsDemoIntoState } from '../data/myListingsDemo'
import { mergeSamPurchaseDemo } from '../data/purchaseDemo'
import {
  recordConsent,
  reseedListingsAndWalletState,
  resetAllPrototypeData,
  type PrototypeState,
} from '../store/prototypeStore'

export type DemoPreset = 'fresh-start' | 'sam-buy' | 'sam-orders' | 'jordan-listings'

export interface DemoPresetOutcome {
  state: PrototypeState
  openSheet: null
  selectedListingId: string | null
  savingsSegment: 'all' | 'on-card' | 'for-you' | 'marketplace'
  marketplaceView: 'browse' | 'activity' | 'listings'
  mainTab: 'home' | 'savings' | 'shop' | 'photo' | 'orders'
}

function withConsentAndJordanPack(prev: PrototypeState): PrototypeState {
  const cleared: PrototypeState = {
    ...prev,
    transfers: [],
    lastPurchaseTransferId: null,
    lastTradeTransferIds: null,
    demoTradeConfirmTimeout: false,
    activeTradeProposalId: null,
  }
  let next = reseedListingsAndWalletState(cleared)
  next = recordConsent(next)
  next = mergeMyListingsDemoIntoState(next)
  return next
}

export function applyDemoPreset(
  prev: PrototypeState,
  preset: DemoPreset,
): DemoPresetOutcome {
  switch (preset) {
    case 'fresh-start': {
      const state = resetAllPrototypeData()
      return {
        state,
        openSheet: null,
        selectedListingId: null,
        savingsSegment: 'all',
        marketplaceView: 'browse',
        mainTab: 'home',
      }
    }
    case 'sam-buy': {
      return {
        state: withConsentAndJordanPack(prev),
        openSheet: null,
        selectedListingId: null,
        savingsSegment: 'marketplace',
        marketplaceView: 'browse',
        mainTab: 'savings',
      }
    }
    case 'sam-orders': {
      const packed = withConsentAndJordanPack(prev)
      return {
        state: mergeSamPurchaseDemo(packed),
        openSheet: null,
        selectedListingId: null,
        savingsSegment: 'marketplace',
        marketplaceView: 'browse',
        mainTab: 'orders',
      }
    }
    case 'jordan-listings': {
      return {
        state: withConsentAndJordanPack(prev),
        openSheet: null,
        selectedListingId: null,
        savingsSegment: 'marketplace',
        marketplaceView: 'listings',
        mainTab: 'savings',
      }
    }
  }
}
