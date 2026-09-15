import type { ReactNode } from 'react'

interface BottomSheetProps {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  ariaLabel?: string
}

export function BottomSheet({
  title,
  open,
  onClose,
  children,
  footer,
  ariaLabel,
}: BottomSheetProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Dismiss sheet"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        className="relative z-10 w-full max-w-[430px] max-h-[90vh] flex flex-col rounded-t-2xl bg-white shadow-xl"
      >
        <div className="flex shrink-0 flex-col items-center pt-2 pb-1">
          <div className="h-1 w-10 rounded-full bg-cvs-gray-border" aria-hidden />
        </div>
        <div className="shrink-0 border-b border-cvs-gray-border px-4 pb-3 text-center">
          <h2 className="text-lg font-bold text-black">{title}</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-cvs-gray-border px-4 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  )
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full rounded-full bg-cvs-blue py-3.5 text-center text-base font-semibold text-white disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export function OutlineButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-full border-2 border-cvs-blue py-3.5 text-center text-base font-semibold text-cvs-blue"
    >
      {children}
    </button>
  )
}
