/** FLOWS rule 6 — floor/ceiling vs estimated savings (20–80%) */

export function priceBand(savingsAmount: number): { floor: number; ceiling: number; suggested: number } {
  const floor = Math.max(0.5, Math.round(savingsAmount * 0.2 * 100) / 100)
  const ceiling = Math.round(savingsAmount * 0.8 * 100) / 100
  const suggested = Math.round(savingsAmount * 0.45 * 100) / 100
  return {
    floor: Math.min(floor, ceiling),
    ceiling,
    suggested: Math.min(Math.max(suggested, floor), ceiling),
  }
}

export function normalizePrice(value: number): number {
  return Math.round(value * 100) / 100
}

export function isPriceInBand(price: number, savingsAmount: number): boolean {
  const p = normalizePrice(price)
  const { floor, ceiling } = priceBand(savingsAmount)
  return p >= floor - 0.001 && p <= ceiling + 0.001
}

export function sellerPayout(listPrice: number): { platformFee: number; payout: number } {
  const platformFee = Math.max(0.25, Math.round(listPrice * 0.1 * 100) / 100)
  const payout = Math.round((listPrice - platformFee) * 100) / 100
  return { platformFee, payout }
}
