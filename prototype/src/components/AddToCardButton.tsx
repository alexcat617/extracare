import { useEffect, useState } from 'react'

/** Keep in sync with dismiss timing in SavingsScreen and .animate-clip-btn-success (index.css) */
export const ADD_TO_CARD_SUCCESS_MS = 900

interface AddToCardButtonProps {
  alreadyOnCard: boolean
  onClip: () => void
}

export function AddToCardButton({ alreadyOnCard, onClip }: AddToCardButtonProps) {
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!justAdded) return
    const id = window.setTimeout(() => setJustAdded(false), ADD_TO_CARD_SUCCESS_MS)
    return () => window.clearTimeout(id)
  }, [justAdded])

  const handleClick = () => {
    if (alreadyOnCard || justAdded) return
    onClip()
    setJustAdded(true)
  }

  const onCard = alreadyOnCard && !justAdded
  const label = justAdded ? 'Added' : onCard ? 'On card' : 'Add to card'

  return (
    <>
      <span className="sr-only" aria-live="polite">
        {justAdded ? 'Added to card' : ''}
      </span>
      <button
        type="button"
        disabled={onCard}
        aria-disabled={onCard}
        aria-label={onCard ? 'Already on card' : 'Add to card'}
        onClick={handleClick}
        className={`rounded-full border-2 px-5 py-2 text-sm font-semibold transition-all duration-500 ease-out motion-reduce:transition-none active:scale-[0.97] motion-reduce:active:scale-100 disabled:cursor-default ${
          justAdded
            ? 'animate-clip-btn-success border-green-600 bg-green-50 text-green-800'
            : onCard
              ? 'border-green-600 text-green-800 disabled:opacity-100'
              : 'border-cvs-blue text-cvs-blue'
        }`}
      >
        {justAdded ? (
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden>✓</span>
            {label}
          </span>
        ) : (
          label
        )}
      </button>
    </>
  )
}
