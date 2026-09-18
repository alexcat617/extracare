import type { OfferCategory } from '../types/marketplace'
import {
  categoryLabel,
  DEFAULT_MARKETPLACE_FILTERS,
  type DiscountFilter,
  type MarketplaceFilters,
  type MarketplaceSort,
  sortLabel,
} from '../lib/marketplaceFilters'
import { BottomSheet, OutlineButton, PrimaryButton } from './BottomSheet'

const CATEGORIES: (OfferCategory | 'all')[] = [
  'all',
  'oral-care',
  'baby',
  'vitamins',
  'threshold',
  'skin-care',
]

interface MarketplaceFilterSheetProps {
  open: boolean
  filters: MarketplaceFilters
  onChange: (filters: MarketplaceFilters) => void
  onClose: () => void
}

export function MarketplaceFilterSheet({
  open,
  filters,
  onChange,
  onClose,
}: MarketplaceFilterSheetProps) {
  return (
    <BottomSheet
      title="Sort & refine"
      open={open}
      onClose={onClose}
      ariaLabel="Marketplace filters"
      size="tall"
      footer={
        <div className="space-y-3">
          <PrimaryButton onClick={onClose}>Show results</PrimaryButton>
          <OutlineButton
            onClick={() => {
              onChange(DEFAULT_MARKETPLACE_FILTERS)
            }}
          >
            Clear filters
          </OutlineButton>
        </div>
      }
    >
      <div className="space-y-5 text-sm">
        <fieldset>
          <legend className="mb-2 font-semibold text-black">Sort by</legend>
          <div className="flex flex-col gap-2">
            {(
              [
                'recommended',
                'price-low',
                'price-high',
                'savings-high',
              ] as MarketplaceSort[]
            ).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ ...filters, sort: value })}
                className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold ${
                  filters.sort === value
                    ? 'border-cvs-blue bg-blue-50 text-cvs-blue-dark'
                    : 'border-cvs-gray-border text-black'
                }`}
              >
                {sortLabel(value)}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-semibold text-black">Category</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => onChange({ ...filters, category: cat })}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  filters.category === cat
                    ? 'bg-cvs-blue text-white'
                    : 'border border-cvs-gray-border text-cvs-gray-muted'
                }`}
              >
                {categoryLabel(cat)}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex items-center justify-between gap-4">
          <span className="font-semibold text-black">Expires soon</span>
          <input
            type="checkbox"
            checked={filters.expiresSoon}
            onChange={(e) => onChange({ ...filters, expiresSoon: e.target.checked })}
            aria-label="Filter expires soon"
          />
        </label>

        <fieldset>
          <legend className="mb-2 font-semibold text-black">Discount type</legend>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['all', 'All'],
                ['dollar-off', 'Dollar off'],
                ['threshold', 'Spend & save'],
              ] as [DiscountFilter, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ ...filters, discountType: value })}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  filters.discountType === value
                    ? 'bg-cvs-blue text-white'
                    : 'border border-cvs-gray-border text-cvs-gray-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>
    </BottomSheet>
  )
}
