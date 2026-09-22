import type { MainTab } from '../context/PrototypeContext'
import { NavIconHome, NavIconOrders, NavIconSavings } from './BottomNavIcons'

const TABS: {
  id: MainTab
  label: string
  Icon: () => JSX.Element
}[] = [
  { id: 'home', label: 'Home', Icon: NavIconHome },
  { id: 'savings', label: 'Savings', Icon: NavIconSavings },
  { id: 'orders', label: 'Orders', Icon: NavIconOrders },
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
          const { Icon } = tab
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative flex min-w-[56px] flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-medium ${
                selected && isSavings ? 'text-cvs-red' : selected ? 'text-cvs-blue' : 'text-cvs-gray-muted'
              }`}
              aria-current={selected ? 'page' : undefined}
            >
              <Icon />
              {tab.label}
              {tab.id === 'orders' ? (
                <span className="absolute right-1 top-0 text-[8px] font-bold text-cvs-red">New</span>
              ) : null}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
