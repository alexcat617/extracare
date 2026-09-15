import type { MainTab } from '../context/PrototypeContext'

const TABS: { id: MainTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'savings', label: 'Savings', icon: '💰' },
  { id: 'shop', label: 'Shop', icon: '🛒' },
  { id: 'photo', label: 'Photo', icon: '📷' },
  { id: 'orders', label: 'Orders', icon: '📦' },
]

interface BottomNavProps {
  active: MainTab
  onChange: (tab: MainTab) => void
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-cvs-gray-border bg-white/95 backdrop-blur"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-[430px] justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {TABS.map((tab) => {
          const isSavings = tab.id === 'savings'
          const selected = active === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex min-w-[56px] flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-medium ${
                selected && isSavings ? 'text-cvs-red' : selected ? 'text-cvs-blue' : 'text-cvs-gray-muted'
              }`}
              aria-current={selected ? 'page' : undefined}
            >
              <span className="text-xl" aria-hidden>{tab.icon}</span>
              {tab.label}
              {tab.id === 'orders' ? (
                <span className="absolute top-1 text-[8px] font-bold text-cvs-red">New</span>
              ) : null}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
