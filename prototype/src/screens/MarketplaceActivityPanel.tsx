import { useMemo, useState } from 'react'
import { ListingStatusChart, SavingsTrendChart } from '../components/ActivityCharts'
import { usePrototype } from '../context/PrototypeContext'
import {
  computeActivityTrend,
  computeMarketplaceActivity,
  type ActivityTrendRange,
} from '../lib/marketplaceActivity'

const cardClass =
  'rounded-[var(--radius-card)] border border-cvs-gray-border bg-white shadow-sm'

/** Body-only activity dashboard — rendered inside Savings → Marketplace */
export function MarketplaceActivityPanel() {
  const { state } = usePrototype()
  const [valueMode, setValueMode] = useState<'saved' | 'earned'>('saved')
  const [trendRange, setTrendRange] = useState<ActivityTrendRange>('week')

  const activity = useMemo(() => computeMarketplaceActivity(state), [state])
  const trendPoints = useMemo(
    () => computeActivityTrend(state, trendRange, activity.usesDemoShowcase),
    [state, trendRange, activity.usesDemoShowcase],
  )
  const displayValue =
    valueMode === 'saved' ? activity.totalSaved : activity.totalEarned

  return (
    <div className="space-y-4">
      <div
        className="overflow-hidden rounded-[var(--radius-card)] border border-cvs-blue/20 bg-gradient-to-br from-blue-50/95 via-white/90 to-blue-100/50 shadow-sm backdrop-blur-md"
      >
        <div className="p-4">
          <p className="text-sm font-medium text-cvs-gray-muted">Available balance</p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-black">
            ${activity.availableBalance.toFixed(2)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 shadow-sm backdrop-blur-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-cvs-gray-muted">
                In escrow
              </p>
              <p className="text-lg font-semibold text-black">
                ${activity.pendingEscrow.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 shadow-sm backdrop-blur-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-cvs-gray-muted">
                Trust
              </p>
              <p className="text-sm font-semibold leading-snug text-black">
                {activity.fulfillmentRatePercent}% · {activity.ratingStars.toFixed(1)}★
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${cardClass} grid grid-cols-3 divide-x divide-cvs-gray-border`}>
        <MetricCell label="Active" value={activity.activeListings} sub="listings" />
        <MetricCell label="Expiring" value={activity.expiringSoon} sub="< 48h" />
        <MetricCell label="Trades" value={activity.pendingTradeOffers} sub="pending" />
      </div>

      <div className={`${cardClass} p-4`}>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-black">Your value</h2>
          <div
            className="flex rounded-full bg-cvs-gray-border/50 p-0.5"
            role="tablist"
            aria-label="Saved or earned"
          >
            <ValueTab
              selected={valueMode === 'saved'}
              onClick={() => setValueMode('saved')}
              label="Saved"
            />
            <ValueTab
              selected={valueMode === 'earned'}
              onClick={() => setValueMode('earned')}
              label="Earned"
            />
          </div>
        </div>
        <p className="text-center text-4xl font-bold text-black">${displayValue.toFixed(2)}</p>
        <p className="mt-1 text-center text-xs text-cvs-gray-muted">
          {valueMode === 'saved'
            ? 'Coupon savings from purchases and trades'
            : 'Payouts after platform fees'}
        </p>
      </div>

      <SavingsTrendChart
        points={trendPoints}
        range={trendRange}
        onRangeChange={setTrendRange}
      />
      <ListingStatusChart status={activity.listingStatus} />
    </div>
  )
}

function MetricCell({
  label,
  value,
  sub,
}: {
  label: string
  value: number
  sub: string
}) {
  return (
    <div className="px-2 py-3 text-center">
      <p className="text-2xl font-bold text-black">{value}</p>
      <p className="text-xs font-semibold text-black">{label}</p>
      <p className="text-[10px] text-cvs-gray-muted">{sub}</p>
    </div>
  )
}

function ValueTab({
  selected,
  onClick,
  label,
}: {
  selected: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
        selected ? 'bg-white text-black shadow-sm' : 'text-cvs-gray-muted'
      }`}
    >
      {label}
    </button>
  )
}
