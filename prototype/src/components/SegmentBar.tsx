import type { SavingsSegment } from '../context/PrototypeContext'

const SEGMENTS: { id: SavingsSegment; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'on-card', label: 'On card' },
  { id: 'for-you', label: 'For you' },
  { id: 'marketplace', label: 'Marketplace' },
]

interface SegmentBarProps {
  value: SavingsSegment
  onChange: (seg: SavingsSegment) => void
}

export function SegmentBar({ value, onChange }: SegmentBarProps) {
  return (
    <div
      className="flex rounded-full bg-cvs-gray-border/60 p-1"
      role="tablist"
      aria-label="Coupon filters"
    >
      {SEGMENTS.map((seg) => {
        const selected = value === seg.id
        return (
          <button
            key={seg.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(seg.id)}
            className={`flex-1 rounded-full py-2 text-center text-xs font-semibold transition sm:text-sm ${
              selected
                ? 'bg-white text-black shadow-sm'
                : 'text-cvs-gray-muted hover:text-black'
            }`}
          >
            {seg.label}
          </button>
        )
      })}
    </div>
  )
}
