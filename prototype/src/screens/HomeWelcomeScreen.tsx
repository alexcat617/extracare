import { PrimaryButton } from '../components/BottomSheet'
import { markWelcomeSeen } from '../lib/welcomeGate'

interface HomeWelcomeScreenProps {
  onStart: () => void
}

export function HomeWelcomeScreen({ onStart }: HomeWelcomeScreenProps) {
  const handleStart = () => {
    markWelcomeSeen()
    onStart()
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-white px-6 pb-28">
      <div
        className="flex w-full max-w-sm flex-col items-center text-center animate-welcome-logo-in motion-reduce:animate-none"
        style={{ transformOrigin: 'center center' }}
      >
        <p className="text-5xl font-black leading-none tracking-tight text-cvs-red">CVS</p>
        <p className="mt-2 text-sm font-semibold tracking-wide text-cvs-gray-muted">ExtraCare</p>
        <p className="mt-8 max-w-[320px] text-lg font-medium leading-snug text-cvs-gray-muted">
          Case-study prototype — coupons, Marketplace, and protected buys.
        </p>
      </div>
      <div className="mt-10 w-full max-w-sm px-2">
        <PrimaryButton onClick={handleStart}>Start</PrimaryButton>
      </div>
    </div>
  )
}
