import { mergeMyListingsDemoIntoState } from '../data/myListingsDemo'
import {
  recordConsent,
  reseedListingsAndWalletState,
  resetAllPrototypeData,
  type PrototypeState,
} from '../store/prototypeStore'

export type DemoPreset = 'fresh-start' | 'sam-buy' | 'jordan-listings'

export interface DemoPresetOutcome {
  state: PrototypeState
  openSheet: null
  selectedListingId: string | null
  savingsSegment: 'all' | 'on-card' | 'for-you' | 'marketplace'
  marketplaceView: 'browse' | 'activity' | 'listings'
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
      }
    }
    case 'sam-buy': {
      return {
        state: withConsentAndJordanPack(prev),
        openSheet: null,
        selectedListingId: null,
        savingsSegment: 'marketplace',
        marketplaceView: 'browse',
      }
    }
    case 'jordan-listings': {
      return {
        state: withConsentAndJordanPack(prev),
        openSheet: null,
        selectedListingId: null,
        savingsSegment: 'marketplace',
        marketplaceView: 'listings',
      }
    }
  }
}
