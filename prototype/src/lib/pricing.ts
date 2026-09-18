/** Mock platform fee — FLOWS rule 3 / FEAT-01 REQ-01-03 */
export function calcOrderTotal(listPrice: number): {
  price: number
  platformFee: number
  total: number
} {
  const platformFee = Math.max(0.25, Math.round(listPrice * 0.1 * 100) / 100)
  return {
    price: listPrice,
    platformFee,
    total: Math.round((listPrice + platformFee) * 100) / 100,
  }
}
