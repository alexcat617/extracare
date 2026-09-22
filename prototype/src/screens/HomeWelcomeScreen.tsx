import { OutlineButton, PrimaryButton } from '../components/BottomSheet'

interface HomeWelcomeScreenProps {
  onStart: () => void
  onOpenCaseStudy: () => void
}

export function HomeWelcomeScreen({ onStart, onOpenCaseStudy }: HomeWelcomeScreenProps) {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-white px-6 pb-28">
      <div
        className="flex w-full max-w-sm flex-col items-center text-center animate-welcome-logo-in motion-reduce:animate-none"
        style={{ transformOrigin: 'center center' }}
      >
        <p className="text-5xl font-black leading-none tracking-tight text-cvs-red">CVS</p>
        <p className="mt-2 text-sm font-semibold tracking-wide text-cvs-gray-muted">ExtraCare</p>
        <p className="mt-8 max-w-[320px] text-lg font-medium leading-snug text-cvs-gray-muted">
          Reimagining ExtraCare: Coupon sharing, Marketplace, and secure buys
        </p>
      </div>
      <div className="mt-10 w-full max-w-sm space-y-3 px-2">
        <PrimaryButton onClick={onStart}>Start</PrimaryButton>
        <OutlineButton onClick={onOpenCaseStudy}>See process</OutlineButton>
      </div>
    </div>
  )
}
