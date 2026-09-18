import { useContext, useEffect, useState, type ReactNode } from 'react'
import { PrototypeContext } from '../context/PrototypeContext'

/**
 * compact — rare one-offs; height follows content (max 90vh).
 * flow — journeys and standard sheets; fixed 90dvh so steps don’t jump.
 * tall — alias of flow (filters/refine); kept for call-site clarity.
 */
export type BottomSheetSize = 'compact' | 'flow' | 'tall'

const SHEET_FIXED_HEIGHT = 'h-[90dvh] max-h-[90dvh]'

/** Keep in sync with sheet motion `transition` duration below */
export const BOTTOM_SHEET_MOTION_MS = 480

const MOTION_CLASS =
  'transition-all duration-[480ms] ease-out motion-reduce:transition-none'

export const BOTTOM_SHEET_HEIGHT: Record<BottomSheetSize, string> = {
  compact: 'max-h-[90vh]',
  flow: SHEET_FIXED_HEIGHT,
  tall: SHEET_FIXED_HEIGHT,
}

type DismissAnimation = 'auto' | 'always'

interface BottomSheetProps {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  ariaLabel?: string
  size?: BottomSheetSize
  /**
   * auto — slide down on dismiss (activeSheet cleared); instant when swapping flow steps.
   * always — slide down whenever this sheet closes (e.g. prototype panel).
   */
  dismissAnimation?: DismissAnimation
}

export function BottomSheet({
  title,
  open,
  onClose,
  children,
  footer,
  ariaLabel,
  size = 'flow',
  dismissAnimation = 'auto',
}: BottomSheetProps) {
  const prototype = useContext(PrototypeContext)
  const [visible, setVisible] = useState(open)
  const [exiting, setExiting] = useState(false)
  const [entered, setEntered] = useState(false)

  const shouldAnimateDismiss =
    dismissAnimation === 'always' ||
    (dismissAnimation === 'auto' && (prototype ? prototype.activeSheet === null : true))

  const shouldAnimateEnter =
    dismissAnimation === 'always' ||
    (prototype ? prototype.previousActiveSheet === null : true)

  useEffect(() => {
    if (open) {
      setVisible(true)
      setExiting(false)
      if (shouldAnimateEnter) {
        setEntered(false)
        const id = requestAnimationFrame(() => {
          requestAnimationFrame(() => setEntered(true))
        })
        return () => cancelAnimationFrame(id)
      }
      setEntered(true)
      return
    }

    if (!visible) return

    if (shouldAnimateDismiss) {
      setExiting(true)
      const timer = window.setTimeout(() => {
        setVisible(false)
        setExiting(false)
        setEntered(false)
      }, BOTTOM_SHEET_MOTION_MS)
      return () => window.clearTimeout(timer)
    }

    setVisible(false)
    setExiting(false)
    setEntered(false)
  }, [open, visible, shouldAnimateDismiss, shouldAnimateEnter])

  const requestClose = () => {
    if (exiting) return
    onClose()
  }

  if (!visible) return null

  const panelHeight = BOTTOM_SHEET_HEIGHT[size]
  const offScreen = exiting || !entered

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="presentation">
      <button
        type="button"
        className={`absolute inset-0 ${MOTION_CLASS} ${offScreen ? 'bg-black/0' : 'bg-black/40'}`}
        aria-label="Dismiss sheet"
        onClick={requestClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        className={`relative z-10 flex w-full max-w-[430px] flex-col rounded-t-2xl bg-white shadow-xl ${panelHeight} ${MOTION_CLASS} ${
          offScreen ? 'translate-y-full' : 'translate-y-0'
        }`}
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
      disabled={false}
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
