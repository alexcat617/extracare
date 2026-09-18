import { usePrototype } from '../context/PrototypeContext'

const TABS = [
  { id: 'browse' as const, label: 'Browse' },
  { id: 'activity' as const, label: 'Activity' },
]

export function MarketplaceTabBar() {
  const { marketplaceView, closeMarketplaceActivity, openMarketplaceActivity } = usePrototype()

  return (
    <div
      className="mt-3 flex border-b border-cvs-gray-border"
      role="tablist"
      aria-label="Marketplace"
    >
      {TABS.map((tab) => {
        const selected = marketplaceView === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() =>
              tab.id === 'activity' ? openMarketplaceActivity() : closeMarketplaceActivity()
            }
            className={`relative min-h-[44px] flex-1 pb-2 text-sm font-semibold transition-colors ${
              selected ? 'text-cvs-blue' : 'text-cvs-gray-muted'
            }`}
          >
            {tab.label}
            {selected ? (
              <span
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-cvs-blue"
                aria-hidden
              />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
