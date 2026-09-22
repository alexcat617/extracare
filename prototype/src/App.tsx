import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { DemoControls } from './components/DemoControls'
import { SheetHost } from './components/Sheets'
import { PrototypeProvider, usePrototype } from './context/PrototypeContext'
import { markWelcomeSeen } from './lib/welcomeGate'
import { CaseStudyScreen } from './screens/CaseStudyScreen'
import { HomeWelcomeScreen } from './screens/HomeWelcomeScreen'
import { OrdersScreen } from './screens/OrdersScreen'
import { PlaceholderTab } from './screens/PlaceholderTab'
import { SavingsScreen } from './screens/SavingsScreen'

function AppFrame() {
  const { mainTab, setMainTab } = usePrototype()
  const [caseStudyOpen, setCaseStudyOpen] = useState(false)

  const enterPrototypeFromWelcome = () => {
    markWelcomeSeen()
    setCaseStudyOpen(false)
    setMainTab('savings')
  }

  return (
    <>
      <div className="mx-auto min-h-full max-w-[430px] bg-cvs-gray-bg shadow-xl">
        {mainTab === 'home' ? (
          <HomeWelcomeScreen
            onStart={enterPrototypeFromWelcome}
            onOpenCaseStudy={() => setCaseStudyOpen(true)}
          />
        ) : mainTab === 'savings' ? (
          <SavingsScreen />
        ) : mainTab === 'orders' ? (
          <OrdersScreen />
        ) : (
          <PlaceholderTab tab={mainTab} />
        )}
        {!caseStudyOpen ? <BottomNav active={mainTab} onChange={setMainTab} /> : null}
        <SheetHost />
        {!caseStudyOpen ? <DemoControls /> : null}
      </div>
      {caseStudyOpen ? (
        <CaseStudyScreen
          onClose={() => setCaseStudyOpen(false)}
          onStart={enterPrototypeFromWelcome}
        />
      ) : null}
    </>
  )
}

export default function App() {
  return (
    <PrototypeProvider>
      <AppFrame />
    </PrototypeProvider>
  )
}
