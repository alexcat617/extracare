import { buildEscrowTimeline } from '../lib/escrowTimeline'
import type { Transfer, WalletOffer } from '../types/marketplace'

interface EscrowTimelineProps {
  transfer: Transfer
  walletOffers: WalletOffer[]
}

export function EscrowTimeline({ transfer, walletOffers }: EscrowTimelineProps) {
  const steps = buildEscrowTimeline(transfer, walletOffers)

  return (
    <ol className="space-y-0" aria-label="Protected purchase timeline">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        const dotClass =
          step.state === 'done'
            ? 'bg-cvs-blue border-cvs-blue'
            : step.state === 'current'
              ? 'border-cvs-blue bg-white ring-4 ring-cvs-blue/20'
              : step.state === 'failed'
                ? 'border-cvs-red bg-cvs-red'
                : 'border-cvs-gray-border bg-white'

        const lineClass =
          step.state === 'done' ? 'bg-cvs-blue' : 'bg-cvs-gray-border'

        return (
          <li key={step.id} className="relative flex gap-3 pb-5">
            {!isLast ? (
              <span
                className={`absolute left-[11px] top-6 h-[calc(100%-12px)] w-0.5 ${lineClass}`}
                aria-hidden
              />
            ) : null}
            <span
              className={`relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 ${dotClass}`}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-semibold ${
                  step.state === 'failed' ? 'text-cvs-red' : 'text-black'
                }`}
              >
                {step.label}
              </p>
              <p className="mt-0.5 text-xs text-cvs-gray-muted">{step.detail}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
