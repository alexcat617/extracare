import { useState } from 'react'
import { usePrototype } from '../context/PrototypeContext'
import { BottomSheet, OutlineButton, PrimaryButton } from './BottomSheet'

export function DemoControls() {
  const [open, setOpen] = useState(false)
  const {
    state,
    setExtraCareLinked,
    setMarketplaceConsent,
    setOffline,
    reseedListingsAndWallet,
    resetAll,
    navigateToMarketplace,
  } = usePrototype()

  // expose clearConsent via setMarketplaceConsent(false) - need to add clear or use setMarketplaceConsent

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-3 z-40 rounded-full border-2 border-dashed border-purple-600 bg-purple-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-purple-900 shadow-md"
        aria-label="Open prototype controls"
      >
        Prototype
      </button>

      <BottomSheet
        title="Prototype controls"
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel="Prototype demo controls — not shopper UI"
      >
        <p className="mb-4 text-xs text-purple-800">
          Not production UI. Resets use localStorage.
        </p>

        <div className="space-y-5 text-sm">
          <label className="flex items-center justify-between gap-4">
            <span className="font-medium">ExtraCare linked</span>
            <input
              type="checkbox"
              checked={state.extraCareLinked}
              onChange={(e) => setExtraCareLinked(e.target.checked)}
              aria-label="Toggle ExtraCare linked"
            />
          </label>

          <fieldset>
            <legend className="mb-2 font-medium">Marketplace consent</legend>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  !state.marketplaceConsent
                    ? 'bg-cvs-blue text-white'
                    : 'border border-cvs-gray-border'
                }`}
                onClick={() => setMarketplaceConsent(false)}
              >
                Not given
              </button>
              <button
                type="button"
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  state.marketplaceConsent
                    ? 'bg-cvs-blue text-white'
                    : 'border border-cvs-gray-border'
                }`}
                onClick={() => setMarketplaceConsent(true)}
              >
                Given
              </button>
              <button
                type="button"
                className="rounded-full border border-cvs-gray-border px-3 py-1 text-xs font-semibold"
                onClick={() => {
                  setMarketplaceConsent(false)
                  setOpen(false)
                }}
              >
                Clear consent
              </button>
            </div>
          </fieldset>

          <label className="flex items-center justify-between gap-4">
            <span className="font-medium">Simulate offline</span>
            <input
              type="checkbox"
              checked={state.offline}
              onChange={(e) => setOffline(e.target.checked)}
              aria-label="Simulate offline"
            />
          </label>

          <div className="space-y-2">
            <PrimaryButton onClick={() => reseedListingsAndWallet()}>
              Reseed listings &amp; wallet
            </PrimaryButton>
            <OutlineButton
              onClick={() => {
                resetAll()
                setOpen(false)
              }}
            >
              Reset all prototype data
            </OutlineButton>
            <button
              type="button"
              className="w-full text-center text-xs text-cvs-gray-muted underline"
              onClick={() => {
                navigateToMarketplace()
                setOpen(false)
              }}
            >
              Dev: Skip to Marketplace hub
            </button>
          </div>

          <p className="text-xs text-cvs-gray-muted">
            Listings: {state.listings.filter((l) => l.status === 'active').length} active · Wallet:{' '}
            {state.walletOffers.length} offers · Consent v{state.consentVersion ?? '—'}
          </p>
        </div>
      </BottomSheet>
    </>
  )
}
