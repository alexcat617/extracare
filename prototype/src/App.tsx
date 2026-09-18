import { BottomNav } from './components/BottomNav'
import { DemoControls } from './components/DemoControls'
import { SheetHost } from './components/Sheets'
import { PrototypeProvider, usePrototype } from './context/PrototypeContext'
import { HomeWelcomeScreen } from './screens/HomeWelcomeScreen'
import { OrdersScreen } from './screens/OrdersScreen'
import { PlaceholderTab } from './screens/PlaceholderTab'
import { SavingsScreen } from './screens/SavingsScreen'

function AppFrame() {
  const { mainTab, setMainTab } = usePrototype()

  return (
    <div className="mx-auto min-h-full max-w-[430px] bg-cvs-gray-bg shadow-xl">
      {mainTab === 'home' ? (
        <HomeWelcomeScreen onStart={() => setMainTab('savings')} />
      ) : mainTab === 'savings' ? (
        <SavingsScreen />
      ) : mainTab === 'orders' ? (
        <OrdersScreen />
      ) : (
        <PlaceholderTab tab={mainTab} />
      )}
      <BottomNav active={mainTab} onChange={setMainTab} />
      <SheetHost />
      <DemoControls />
    </div>
  )
}

export default function App() {
  return (
    <PrototypeProvider>
      <AppFrame />
    </PrototypeProvider>
  )
}
