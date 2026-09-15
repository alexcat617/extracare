import type { MainTab } from '../context/PrototypeContext'

const TITLES: Record<Exclude<MainTab, 'savings'>, string> = {
  home: 'Home',
  shop: 'Shop',
  photo: 'Photo',
  orders: 'Orders',
}

export function PlaceholderTab({ tab }: { tab: Exclude<MainTab, 'savings'> }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 pb-28 text-center">
      <p className="text-2xl font-bold">{TITLES[tab]}</p>
      <p className="mt-2 text-sm text-cvs-gray-muted">
        Shell placeholder for FEAT-00. Use Savings → Marketplace for the demo path.
      </p>
    </div>
  )
}
