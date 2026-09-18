import type { ReactNode } from 'react'

/**
 * compact — rare one-offs; height follows content (max 90vh).
 * flow — journeys and standard sheets; fixed 90dvh so steps don’t jump.
 * tall — alias of flow (filters/refine); kept for call-site clarity.
 */
export type BottomSheetSize = 'compact' | 'flow' | 'tall'

const SHEET_FIXED_HEIGHT = 'h-[90dvh] max-h-[90dvh]'

export const BOTTOM_SHEET_HEIGHT: Record<BottomSheetSize, string> = {
  compact: 'max-h-[90vh]',
  flow: SHEET_FIXED_HEIGHT,
  tall: SHEET_FIXED_HEIGHT,
}

interface BottomSheetProps {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  ariaLabel?: string
  size?: BottomSheetSize
}

export function BottomSheet({
  title,
  open,
  onClose,
  children,
  footer,
  ariaLabel,
  size = 'flow',
}: BottomSheetProps) {
  if (!open) return null

  const panelHeight = BOTTOM_SHEET_HEIGHT[size]

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
        className={`relative z-10 flex w-full max-w-[430px] flex-col rounded-t-2xl bg-white shadow-xl ${panelHeight}`}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
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

/** Success confirmation sheets — green status banner */
export function SuccessBanner({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <div
      className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-950"
      role="status"
    >
      <p className="flex items-center gap-3 font-semibold text-green-900">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600 text-lg text-white"
          aria-hidden
        >
          ✓
        </span>
        <span className="text-base">{title}</span>
      </p>
      {children ? <div className="mt-2 pl-12 text-sm text-green-900/90">{children}</div> : null}
    </div>
  )
}

export function OutlineButton({
  children,
  onClick,
  variant = 'default',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'destructive'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-full border-2 py-3.5 text-center text-base font-semibold ${
        variant === 'destructive'
          ? 'border-cvs-red/30 bg-red-50 text-cvs-red'
          : 'border-cvs-blue text-cvs-blue'
      }`}
    >
      {children}
    </button>
  )
}
