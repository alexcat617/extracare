import type { ReactNode } from 'react'

const controlClass = 'h-6 w-6 shrink-0 accent-cvs-blue'

const cardBase =
  'flex min-h-[56px] cursor-pointer items-start gap-4 rounded-2xl border-2 px-4 py-3 transition-colors'

function selectedCardClass(selected: boolean): string {
  return selected
    ? 'border-cvs-blue bg-blue-50/80'
    : 'border-cvs-gray-border bg-white active:bg-cvs-gray-bg'
}

/** Mobile-first checkbox: full-width card, ≥56px tap target, 24px control */
export function MobileCheckboxCard({
  checked,
  onChange,
  label,
  hint,
  disabled = false,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  hint?: string
  disabled?: boolean
}) {
  return (
    <label
      className={`${cardBase} items-center ${selectedCardClass(checked)} ${
        disabled ? 'cursor-not-allowed opacity-60' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={controlClass}
      />
      <span className="min-w-0 flex-1 text-sm text-black">
        <span className="block text-base font-semibold leading-snug">{label}</span>
        {hint ? <span className="mt-0.5 block text-sm font-normal text-cvs-gray-muted">{hint}</span> : null}
      </span>
    </label>
  )
}

/** Mobile-first radio: full-width card, ≥56px tap target, 24px control */
export function MobileRadioCard({
  name,
  value,
  checked,
  onSelect,
  label,
  hint,
}: {
  name: string
  value: string
  checked: boolean
  onSelect: () => void
  label: ReactNode
  hint?: string
}) {
  return (
    <label className={`${cardBase} items-center ${selectedCardClass(checked)}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onSelect}
        className={controlClass}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-black">{label}</span>
        {hint ? <span className="block text-sm text-cvs-gray-muted">{hint}</span> : null}
      </span>
    </label>
  )
}
