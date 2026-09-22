import type { WalletOffer } from '../types/marketplace'
import type { PrototypeState } from './prototypeStore'

export function isOfferOnCard(state: PrototypeState, entitlementId: string): boolean {
  return state.walletOffers.some(
    (w) => w.entitlementId === entitlementId && w.status === 'active',
  )
}

export function clipCatalogOfferToWallet(
  state: PrototypeState,
  catalogOfferId: string,
): PrototypeState {
  const offer = state.offers.find((o) => o.id === catalogOfferId)
  if (!offer) return state
  if (isOfferOnCard(state, offer.entitlementId)) return state

  const walletOffer: WalletOffer = {
    ...offer,
    id: `wallet-clip-${offer.entitlementId}`,
    status: 'active',
    transferable: offer.transferable ?? true,
  }

  return {
    ...state,
    walletOffers: [...state.walletOffers, walletOffer],
  }
}
