import type { ListingSnapshot, Transfer, WalletOffer } from '../types/marketplace'

export type EscrowStepId = 'paid' | 'escrow' | 'wallet' | 'released'

export type EscrowStepState = 'done' | 'current' | 'upcoming' | 'failed'

export interface EscrowStep {
  id: EscrowStepId
  label: string
  detail: string
  state: EscrowStepState
}

const MS_24H = 24 * 60 * 60 * 1000

export function isWithinDisputeWindow(transfer: Transfer, now = Date.now()): boolean {
  const anchor = transfer.completedAt ?? transfer.createdAt
  const t = Date.parse(anchor)
  if (Number.isNaN(t)) return true
  return now - t < MS_24H
}

export function findWalletOfferForTransfer(
  walletOffers: WalletOffer[],
  transferId: string,
): WalletOffer | undefined {
  return walletOffers.find((w) => w.transferId === transferId)
}

export function buildEscrowTimeline(
  transfer: Transfer,
  walletOffers: WalletOffer[],
): EscrowStep[] {
  const wallet = findWalletOfferForTransfer(walletOffers, transfer.id)
  const refunded = transfer.refundStatus === 'completed'
  const pending = transfer.status === 'pending'

  const paid: EscrowStep = {
    id: 'paid',
    label: 'Payment received',
    detail: 'Your payment is secured by CVS.',
    state: 'done',
  }

  let escrowState: EscrowStepState = pending ? 'current' : 'done'
  if (refunded && !wallet) escrowState = 'failed'

  const escrow: EscrowStep = {
    id: 'escrow',
    label: 'In escrow',
    detail: refunded
      ? 'Escrow released for refund.'
      : 'Held until your wallet is verified.',
    state: escrowState,
  }

  let walletState: EscrowStepState = 'upcoming'
  if (wallet) walletState = 'done'
  else if (!pending && !refunded) walletState = 'current'
  else if (refunded && !wallet) walletState = 'failed'

  const walletStep: EscrowStep = {
    id: 'wallet',
    label: 'Wallet verified',
    detail: wallet
      ? 'Offer found on your ExtraCare card.'
      : refunded
        ? 'Offer was not delivered in time.'
        : 'We are confirming the offer on your card.',
    state: walletState,
  }

  let releasedState: EscrowStepState = 'upcoming'
  if (refunded) releasedState = 'done'
  else if (wallet && transfer.status === 'completed') releasedState = 'done'
  else if (wallet) releasedState = 'current'

  const released: EscrowStep = {
    id: 'released',
    label: refunded ? 'Refunded' : 'Seller paid',
    detail: refunded
      ? 'Funds returned to your payment method.'
      : 'Escrow released to the seller.',
    state: releasedState,
  }

  return [paid, escrow, walletStep, released]
}

export function termsMatchSnapshot(
  snapshot: ListingSnapshot | undefined,
  wallet: WalletOffer | undefined,
): boolean {
  if (!snapshot || !wallet) return false
  return (
    wallet.savingsAmount === snapshot.savingsAmount &&
    wallet.expiry === snapshot.expiry &&
    (wallet.minPurchase ?? undefined) === (snapshot.minPurchase ?? undefined)
  )
}
