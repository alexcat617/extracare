import { computeMarketplaceActivity } from './marketplaceActivity'
import type { PrototypeState } from '../store/prototypeStore'

/** Clipped CVS ExtraBucks (non-marketplace) — case-study floor for demo buys */
const BASE_EXTRABUCKS = 12
/** On-card rewards not spendable yet (matches Activity escrow when showcase is on) */
const DEMO_HELD_ON_CARD = 5.25

export interface ExtraBucksBalances {
  /** Rewards on card including funds in escrow */
  totalOnCard: number
  /** Spendable now (ExtraBucks checkout or Marketplace listing price) */
  available: number
  pendingEscrow: number
}

/**
 * Single source for Savings rewards card + buy flow “ExtraBucks balance”.
 * Marketplace payouts add to spendable balance; escrow holds reduce “Available”.
 */
export function computeExtraBucksBalances(state: PrototypeState): ExtraBucksBalances {
  const activity = computeMarketplaceActivity(state)
  const marketplaceSpendable = activity.availableBalance
  const available = Math.round((BASE_EXTRABUCKS + marketplaceSpendable) * 100) / 100

  // Total on card includes spendable + held (escrow / not yet sent to spendable balance)
  const heldOnCard =
    activity.pendingEscrow > 0 ? activity.pendingEscrow : DEMO_HELD_ON_CARD
  const totalOnCard = Math.round((available + heldOnCard) * 100) / 100

  return { totalOnCard, available, pendingEscrow: heldOnCard }
}
