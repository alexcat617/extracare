import type { ReactNode } from 'react'

interface EmptyStateCardProps {
  title: string
  description: string
  /** Decorative icon in coupon-style tile */
  icon?: string
  children?: ReactNode
  className?: string
}

export function EmptyStateCard({
  title,
  description,
  icon = '🎟️',
  children,
  className = '',
}: EmptyStateCardProps) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-cvs-gray-border bg-white p-6 text-center ${className}`}
      role="status"
    >
      <div
        className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100 text-2xl"
        aria-hidden
      >
        {icon}
      </div>
      <p className="font-semibold text-black">{title}</p>
      <p className="mt-2 text-sm text-cvs-gray-muted">{description}</p>
      {children ? <div className="mt-4 flex flex-col items-center gap-2">{children}</div> : null}
    </div>
  )
}

export function EmptyStateLink({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-semibold text-cvs-blue"
    >
      {children}
    </button>
  )
}
