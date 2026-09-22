import type { ReactNode } from 'react'

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function IconShell({ children }: { children: ReactNode }) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      aria-hidden
      className="block shrink-0"
    >
      {children}
    </svg>
  )
}

export function NavIconHome() {
  return (
    <IconShell>
      <path {...strokeProps} d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </IconShell>
  )
}

export function NavIconSavings() {
  return (
    <IconShell>
      <path {...strokeProps} d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
      <path {...strokeProps} d="M4 8h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
      <path {...strokeProps} d="M16 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
    </IconShell>
  )
}

export function NavIconShop() {
  return (
    <IconShell>
      <path {...strokeProps} d="M6 8h12l-1.2 11H7.2L6 8Z" />
      <path {...strokeProps} d="M9 8V6a3 3 0 0 1 6 0v2" />
    </IconShell>
  )
}

export function NavIconPhoto() {
  return (
    <IconShell>
      <path {...strokeProps} d="M5 7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7Z" />
      <circle {...strokeProps} cx="12" cy="12" r="2.5" />
      <path {...strokeProps} d="M8.5 9.5h.01" />
    </IconShell>
  )
}

export function NavIconOrders() {
  return (
    <IconShell>
      <path {...strokeProps} d="M5 8h14l-1.5 11H6.5L5 8Z" />
      <path {...strokeProps} d="M9 8V6a1.5 1.5 0 0 1 3 0v2" />
      <path {...strokeProps} d="M8 12h8M8 15h6" />
    </IconShell>
  )
}
