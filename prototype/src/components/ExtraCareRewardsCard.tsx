import { computeExtraBucksBalances } from '../lib/extraBucksBalance'
import { usePrototype } from '../context/PrototypeContext'

/** Savings header — CVS ExtraBucks Rewards card (reference: SCREEN-INVENTORY #3) */
export function ExtraCareRewardsCard() {
  const { state, setSavingsSegment, openSheet } = usePrototype()

  const { totalOnCard, available } = computeExtraBucksBalances(state)

  const handleSendToCard = () => {
    if (!state.extraCareLinked) {
      openSheet('linkExtraCare')
      return
    }
    setSavingsSegment('all')
  }

  if (!state.extraCareLinked) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border border-cvs-blue/15 bg-gradient-to-br from-sky-100 via-blue-50 to-white p-4 shadow-sm"
      >
        <RewardsPattern />
        <div className="relative">
          <p className="text-base font-bold text-black">
            ExtraBucks Rewards<sup className="text-[10px] font-normal">®</sup>
          </p>
          <p className="mt-2 text-sm text-cvs-gray-muted">Link ExtraCare to view balances and clip coupons.</p>
          <button
            type="button"
            onClick={() => openSheet('linkExtraCare')}
            className="mt-3 rounded-full border border-cvs-blue/50 bg-white/80 px-4 py-2 text-sm font-semibold text-cvs-blue"
          >
            Link ExtraCare
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-cvs-blue/10 bg-gradient-to-br from-sky-100 via-[#e8f2fc] to-blue-50/80 shadow-sm"
      aria-label={`ExtraBucks Rewards, ${totalOnCard.toFixed(2)} dollars total on card`}
    >
      <RewardsPattern />
      <div className="relative p-4 pb-3.5">
        <p className="text-base font-bold leading-tight text-black">
          ExtraBucks Rewards<sup className="text-[10px] font-normal">®</sup>
        </p>
        <div className="mt-3 flex items-end gap-2">
          <div className="flex min-w-0 flex-1 items-end gap-3">
            <div className="shrink-0">
              <p className="text-[26px] font-bold leading-none tracking-tight text-black">
                ${totalOnCard.toFixed(2)}
              </p>
              <p className="mt-1 text-[11px] font-medium text-black/80">Total on card</p>
            </div>
            <div className="mb-1 h-9 w-px shrink-0 bg-black/15" aria-hidden />
            <div className="shrink-0">
              <p className="text-[26px] font-bold leading-none tracking-tight text-black">
                ${available.toFixed(2)}
              </p>
              <p className="mt-1 text-[11px] font-medium text-black/80">Available</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSendToCard}
            className="shrink-0 rounded-full border border-cvs-blue/45 bg-white/75 px-3 py-2 text-xs font-semibold leading-tight text-cvs-blue"
          >
            Send to card
          </button>
        </div>
      </div>
    </div>
  )
}

function RewardsPattern() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full text-white/55"
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="ec-hearts" width="56" height="56" patternUnits="userSpaceOnUse">
          <path
            d="M28 42c-8-6-14-12-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 8-6 14-14 20Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            opacity="0.9"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ec-hearts)" />
      <rect width="100%" height="100%" fill="url(#ec-hearts)" transform="translate(12 8)" opacity="0.5" />
    </svg>
  )
}
