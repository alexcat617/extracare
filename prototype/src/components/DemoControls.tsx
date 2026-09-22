import { useState } from 'react'
import { usePrototype } from '../context/PrototypeContext'
import { BottomSheet } from './BottomSheet'

const actionButtonClass =
  'w-full rounded-xl border-2 border-purple-700 bg-purple-50 px-4 py-3 text-left text-sm font-semibold text-purple-950 active:bg-purple-100'

const DEMO_ACTIONS: {
  id: 'fresh-start' | 'reseed' | 'browse-marketplace'
  label: string
  hint: string
}[] = [
  {
    id: 'fresh-start',
    label: 'Fresh start',
    hint: 'Back to Home. Marketplace rules reset like a first visit.',
  },
  {
    id: 'reseed',
    label: 'Reload coupons and listings',
    hint: 'Restore sample deals. Keeps your current screen and settings.',
  },
  {
    id: 'browse-marketplace',
    label: 'Browse the marketplace',
    hint: 'Sample listings ready—opens Savings → Marketplace.',
  },
]

export function DemoControls() {
  const [open, setOpen] = useState(false)
  const { runDataAction, runDemoPreset } = usePrototype()

  const runAction = (id: (typeof DEMO_ACTIONS)[number]['id']) => {
    if (id === 'fresh-start') runDemoPreset('fresh-start')
    else if (id === 'reseed') runDataAction('reseed')
    else runDemoPreset('sam-buy')
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-3 z-40 rounded-full border-2 border-dashed border-purple-600 bg-purple-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-purple-900 shadow-md"
        aria-label="Open demo reset options"
      >
        Reset
      </button>

      <BottomSheet
        title="Reset demo"
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel="Demo reset options — not shopper UI"
        size="compact"
        dismissAnimation="always"
      >
        <p className="mb-4 text-sm text-purple-900">
          If the walkthrough gets messy, use one of these. Not part of the real CVS app.
        </p>

        <ul className="space-y-2">
          {DEMO_ACTIONS.map((action) => (
            <li key={action.id}>
              <button
                type="button"
                className={actionButtonClass}
                onClick={() => runAction(action.id)}
              >
                <span className="block">{action.label}</span>
                <span className="mt-0.5 block text-xs font-normal text-purple-800">{action.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </>
  )
}
