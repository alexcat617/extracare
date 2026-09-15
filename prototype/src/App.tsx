import { BottomNav } from './components/BottomNav'
import { DemoControls } from './components/DemoControls'
import { SheetHost } from './components/Sheets'
import { PrototypeProvider, usePrototype } from './context/PrototypeContext'
import { PlaceholderTab } from './screens/PlaceholderTab'
import { SavingsScreen } from './screens/SavingsScreen'

function AppFrame() {
  const { mainTab, setMainTab } = usePrototype()

  return (
    <div className="mx-auto min-h-full max-w-[430px] bg-cvs-gray-bg shadow-xl">
      {mainTab === 'savings' ? <SavingsScreen /> : <PlaceholderTab tab={mainTab} />}
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
