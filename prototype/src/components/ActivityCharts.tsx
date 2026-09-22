import {
  ACTIVITY_TREND_RANGE_LABEL,
  type ActivityTrendPoint,
  type ActivityTrendRange,
  type ListingStatusBreakdown,
} from '../lib/marketplaceActivity'

const TREND_RANGES: ActivityTrendRange[] = ['week', 'month', '6m', 'year']

function linePath(
  values: number[],
  width: number,
  height: number,
  padding: number,
  maxVal: number,
): string {
  const step = (width - padding * 2) / Math.max(values.length - 1, 1)
  const points = values.map((v, i) => {
    const x = padding + i * step
    const y = padding + (height - padding * 2) * (1 - v / maxVal)
    return `${x},${y}`
  })
  return `M ${points.join(' L ')}`
}

function areaPath(
  values: number[],
  width: number,
  height: number,
  padding: number,
  maxVal: number,
): string {
  const step = (width - padding * 2) / Math.max(values.length - 1, 1)
  const baseY = height - padding
  let d = `M ${padding},${baseY}`
  values.forEach((v, i) => {
    const x = padding + i * step
    const y = padding + (height - padding * 2) * (1 - v / maxVal)
    d += ` L ${x},${y}`
  })
  d += ` L ${padding + (values.length - 1) * step},${baseY} Z`
  return d
}

const TREND_TAB_LABEL: Record<ActivityTrendRange, string> = {
  week: 'Week',
  month: 'Month',
  '6m': '6 mo',
  year: 'Year',
}

export function SavingsTrendChart({
  points,
  range,
  onRangeChange,
}: {
  points: ActivityTrendPoint[]
  range: ActivityTrendRange
  onRangeChange: (range: ActivityTrendRange) => void
}) {
  const width = 320
  const height = 120
  const pad = 8
  const saved = points.map((d) => d.saved)
  const earned = points.map((d) => d.earned)
  const maxVal = Math.max(1, ...saved, ...earned)
  const savedPath = linePath(saved, width, height, pad, maxVal)
  const earnedPath = linePath(earned, width, height, pad, maxVal)
  const savedArea = areaPath(saved, width, height, pad, maxVal)
  const earnedArea = areaPath(earned, width, height, pad, maxVal)
  const periodSaved = saved.reduce((a, b) => a + b, 0)
  const periodEarned = earned.reduce((a, b) => a + b, 0)
  const xStep = (width - pad * 2) / Math.max(points.length - 1, 1)
  const rangeCaption = ACTIVITY_TREND_RANGE_LABEL[range]

  return (
    <div className="rounded-[var(--radius-card)] border border-cvs-gray-border bg-white p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-black">Savings trend</h2>
        <div
          className="flex max-w-full rounded-full bg-cvs-gray-border/50 p-0.5"
          role="tablist"
          aria-label="Trend time range"
        >
          {TREND_RANGES.map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={range === id}
              onClick={() => onRangeChange(id)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition sm:px-3 sm:text-xs ${
                range === id ? 'bg-white text-black shadow-sm' : 'text-cvs-gray-muted'
              }`}
            >
              {TREND_TAB_LABEL[id]}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-3 text-xs text-cvs-gray-muted">
        Red = coupon value saved · Blue = cash earned · {rangeCaption}
      </p>
      <svg
        width="100%"
        viewBox={`0 0 ${width} ${height + 22}`}
        role="img"
        aria-label={`${rangeCaption} trend: about ${periodSaved.toFixed(0)} dollars saved and ${periodEarned.toFixed(0)} dollars earned`}
        className="max-h-[150px]"
      >
        <path d={earnedArea} className="fill-cvs-blue/15" />
        <path d={savedArea} className="fill-cvs-red/15" />
        <path
          d={savedPath}
          fill="none"
          className="stroke-cvs-red"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={earnedPath}
          fill="none"
          className="stroke-cvs-blue"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((day, i) => {
          const x = pad + i * xStep
          const showLabel =
            points.length <= 7 || i === 0 || i === points.length - 1 || i % 2 === 0
          if (!showLabel) return null
          return (
            <text
              key={`${day.label}-${i}`}
              x={x}
              y={height + 14}
              textAnchor="middle"
              className="fill-cvs-gray-muted text-[9px]"
            >
              {day.label}
            </text>
          )
        })}
      </svg>
      <div className="mt-2 flex justify-between gap-3 text-xs text-cvs-gray-muted">
        <span>
          Period saved:{' '}
          <strong className="font-semibold text-black">${periodSaved.toFixed(0)}</strong>
        </span>
        <span>
          Period earned:{' '}
          <strong className="font-semibold text-black">${periodEarned.toFixed(0)}</strong>
        </span>
      </div>
    </div>
  )
}

/** @deprecated use SavingsTrendChart */
export function WeeklyTrendChart({ days }: { days: ActivityTrendPoint[] }) {
  return (
    <SavingsTrendChart points={days} range="week" onRangeChange={() => {}} />
  )
}

const STATUS_COLORS: Record<keyof ListingStatusBreakdown, string> = {
  active: 'bg-cvs-blue',
  sold: 'bg-emerald-600',
  expired: 'bg-amber-600',
  cancelled: 'bg-cvs-gray-border',
}

const STATUS_LABELS: Record<keyof ListingStatusBreakdown, string> = {
  active: 'Active',
  sold: 'Sold',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

export function ListingStatusChart({ status }: { status: ListingStatusBreakdown }) {
  const total = status.active + status.sold + status.expired + status.cancelled
  const keys = Object.keys(STATUS_LABELS) as (keyof ListingStatusBreakdown)[]

  if (total === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-cvs-gray-border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-bold text-black">Listing history</h2>
        <p className="text-sm text-cvs-gray-muted">No listings yet — publish from On card to see breakdown.</p>
      </div>
    )
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-cvs-gray-border bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-bold text-black">Listing history</h2>
      <div
        className="flex h-4 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={`Listing breakdown: ${status.active} active, ${status.sold} sold, ${status.expired} expired, ${status.cancelled} cancelled`}
      >
        {keys.map((key) => {
          const n = status[key]
          if (n === 0) return null
          const pct = (n / total) * 100
          return (
            <div
              key={key}
              className={`${STATUS_COLORS[key]} h-full`}
              style={{ width: `${pct}%` }}
              title={`${STATUS_LABELS[key]}: ${n}`}
            />
          )
        })}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-cvs-gray-muted">
        {keys.map((key) => (
          <li key={key} className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${STATUS_COLORS[key]}`} aria-hidden />
            {STATUS_LABELS[key]}: <strong className="text-black">{status[key]}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
