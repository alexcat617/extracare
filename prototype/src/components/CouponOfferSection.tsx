import type { Offer } from '../types/marketplace'
import { CouponCard } from './CouponCard'

export type CouponOfferSectionTone = 'listing' | 'bundle'

const SECTION_STYLES: Record<CouponOfferSectionTone, string> = {
  listing: 'rounded-xl bg-blue-50/70 p-3',
  bundle: 'rounded-xl bg-amber-50/60 p-3',
}

export function CouponOfferSection({
  label,
  tone,
  offers,
  marketplace,
  price,
  badge,
}: {
  label: string
  tone: CouponOfferSectionTone
  offers: Offer[]
  marketplace?: boolean
  price?: number
  badge?: string
}) {
  if (offers.length === 0) return null
  return (
    <section className={SECTION_STYLES[tone]}>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-cvs-gray-muted">
        {label}
      </h3>
      <ul className="space-y-3">
        {offers.map((offer) => (
          <li key={offer.id}>
            <CouponCard
              offer={offer}
              productTitle={offer.title}
              marketplace={marketplace}
              price={price}
              badge={badge}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
