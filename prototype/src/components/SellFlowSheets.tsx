import { useEffect, useState } from 'react'
import { normalizePrice, priceBand } from '../lib/sellPricing'
import { usePrototype } from '../context/PrototypeContext'
import { checkSellEligibility, formatPayoutPreview } from '../store/sellActions'
import type { PrototypeState } from '../store/prototypeStore'
import { BottomSheet, OutlineButton, PrimaryButton, SuccessBanner } from './BottomSheet'

export function SellFlowSheets() {
  const {
    state,
    activeSheet,
    selectedWalletOfferId,
    closeSheet,
    openSheet,
    publishWalletListing,
    navigateToMarketplace,
  } = usePrototype()

  const walletOffer = state.walletOffers.find((w) => w.id === selectedWalletOfferId)
  const band = walletOffer ? priceBand(walletOffer.savingsAmount) : null
  const [askingPrice, setAskingPrice] = useState('')
  const [priceError, setPriceError] = useState(false)
  const [listingType, setListingType] = useState<'sale' | 'trade'>('sale')

  useEffect(() => {
    setAskingPrice('')
    setPriceError(false)
    setListingType('sale')
  }, [selectedWalletOfferId])

  useEffect(() => {
    if (activeSheet === 'sellListingForm' && band && askingPrice === '') {
      setAskingPrice(band.suggested.toFixed(2))
    }
  }, [activeSheet, band, askingPrice])

  const applySuggestedPrice = () => {
    if (!band) return
    setAskingPrice(band.suggested.toFixed(2))
    setPriceError(false)
  }

  const handlePublish = () => {
    if (!selectedWalletOfferId) return
    const parsed = parseFloat(askingPrice)
    if (Number.isNaN(parsed)) {
      setPriceError(true)
      return
    }
    const price = normalizePrice(parsed)
    const result = publishWalletListing(selectedWalletOfferId, price, listingType)
    if (result === 'price') {
      setPriceError(true)
      return
    }
    if (result === 'ineligible') {
      openSheet('sellIneligible')
      return
    }
    if (result === 'success') openSheet('sellSuccess')
  }

  return (
    <>
      <BottomSheet
        title="Can’t sell this offer"
        size="flow"
        open={activeSheet === 'sellBlocked'}
        onClose={closeSheet}
        footer={<PrimaryButton onClick={closeSheet}>Back to wallet</PrimaryButton>}
      >
        <p className="text-sm text-cvs-gray-muted">
          {walletOffer?.entitlementId === 'ent-rx'
            ? 'Prescription and non-transferable offers can’t be sold on Marketplace.'
            : 'This offer type can’t be transferred. You can still use it in store or online before it expires.'}
        </p>
      </BottomSheet>

      <BottomSheet
        title="Not for me"
        size="flow"
        open={activeSheet === 'sellChoosePath'}
        onClose={closeSheet}
        footer={
          <div className="space-y-3">
            <PrimaryButton onClick={() => openSheet('sellListingForm')}>
              List on Marketplace
            </PrimaryButton>
            <OutlineButton onClick={closeSheet}>Close</OutlineButton>
          </div>
        }
      >
        {walletOffer ? (
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-black">{walletOffer.headline}</p>
            <p className="text-cvs-red font-bold">${walletOffer.savingsAmount} off</p>
            <p className="rounded-lg bg-amber-50 p-3 text-amber-950">
              Listing removes this offer from your card until it sells or you cancel. You can’t use
              it in store while it’s listed.
            </p>
          </div>
        ) : null}
      </BottomSheet>

      <BottomSheet
        title="List on Marketplace"
        size="flow"
        open={activeSheet === 'sellListingForm'}
        onClose={closeSheet}
        footer={
          walletOffer && band ? (
            <div className="space-y-3">
              <PrimaryButton onClick={handlePublish}>Publish listing</PrimaryButton>
              <OutlineButton onClick={closeSheet}>Cancel</OutlineButton>
            </div>
          ) : undefined
        }
      >
        {walletOffer && band ? (
          <div className="space-y-3 text-sm">
            <p className="font-semibold text-black">{walletOffer.headline}</p>
            <div>
              <p className="mb-2 font-semibold text-black">Listing type</p>
              <div
                className="flex rounded-full bg-cvs-gray-border/60 p-1"
                role="tablist"
                aria-label="Listing type"
              >
                {(
                  [
                    { id: 'sale' as const, label: 'Sale only' },
                    { id: 'trade' as const, label: 'Open to trades' },
                  ] as const
                ).map((opt) => {
                  const selected = listingType === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setListingType(opt.id)}
                      className={`flex-1 rounded-full py-2.5 text-center text-xs font-semibold transition ${
                        selected
                          ? 'bg-white text-black shadow-sm'
                          : 'text-cvs-gray-muted hover:text-black'
                      }`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              {listingType === 'trade' ? (
                <p className="mt-2 text-xs text-cvs-gray-muted">
                  Buyers can propose a swap; cash buy uses your asking price.
                </p>
              ) : null}
            </div>
            <p className="text-xs text-cvs-gray-muted">
              Expires {walletOffer.expiry} · Price ${band.floor.toFixed(2)}–$
              {band.ceiling.toFixed(2)}
            </p>
            {!state.sellerHasPublishedBefore ? (
              <p className="text-xs text-cvs-blue-dark">
                First listing: your offer stays in escrow until it sells or you cancel.
              </p>
            ) : null}
            <label className="block">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <span className="font-semibold text-black">Asking price</span>
                <button
                  type="button"
                  onClick={applySuggestedPrice}
                  className="min-h-[44px] shrink-0 text-sm font-semibold text-cvs-blue"
                >
                  Use ${band.suggested.toFixed(2)} suggested
                </button>
              </div>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min={band.floor}
                max={band.ceiling}
                value={askingPrice}
                onChange={(e) => {
                  setAskingPrice(e.target.value)
                  setPriceError(false)
                }}
                className={`w-full rounded-xl border px-4 py-3 text-base ${
                  priceError ? 'border-cvs-red' : 'border-cvs-gray-border'
                }`}
                aria-invalid={priceError}
                aria-describedby="sell-payout-hint"
              />
            </label>
            {priceError ? (
              <p className="text-sm text-cvs-red" role="alert">
                Enter a price between ${band.floor.toFixed(2)} and ${band.ceiling.toFixed(2)}, or use
                suggested.
              </p>
            ) : null}
            <p id="sell-payout-hint" className="text-xs text-cvs-gray-muted">
              {formatPayoutPreview(parseFloat(askingPrice) || band.suggested)}
            </p>
          </div>
        ) : null}
      </BottomSheet>

      <BottomSheet
        title="Selling not available yet"
        size="flow"
        open={activeSheet === 'sellIneligible'}
        onClose={closeSheet}
        footer={<OutlineButton onClick={closeSheet}>OK</OutlineButton>}
      >
        <SellIneligibleCopy state={state} />
      </BottomSheet>

      <BottomSheet
        title="Listing live"
        size="flow"
        open={activeSheet === 'sellSuccess'}
        onClose={closeSheet}
        footer={
          <div className="space-y-3">
            <PrimaryButton
              onClick={() => {
                closeSheet()
                navigateToMarketplace()
              }}
            >
              View on Marketplace
            </PrimaryButton>
            <OutlineButton onClick={closeSheet}>Close</OutlineButton>
          </div>
        }
      >
        <div className="space-y-4 text-sm text-cvs-gray-muted">
          <SuccessBanner title="Your listing is live" />
          <p>
            Your offer is reserved and buyers can find it under Savings → Marketplace. You’ll get
            paid after a protected purchase completes.
          </p>
        </div>
      </BottomSheet>

    </>
  )
}

function SellIneligibleCopy({ state }: { state: PrototypeState }) {
  const elig = checkSellEligibility(state)
  if (elig.reason === 'account-age' && elig.daysRemaining) {
    return (
      <p className="text-sm text-cvs-gray-muted">
        Paid selling opens after <strong className="text-black">7 days</strong> on ExtraCare.
        Check back in <strong className="text-black">{elig.daysRemaining} days</strong>. You can
        still browse and buy on Marketplace.
      </p>
    )
  }
  if (elig.reason === 'listing-cap') {
    return (
      <p className="text-sm text-cvs-gray-muted">
        New sellers can have one active listing until their first successful sale. Finish or cancel
        your current listing to add another.
      </p>
    )
  }
  return (
    <p className="text-sm text-cvs-gray-muted">
      Verify your phone in Account settings to sell on Marketplace (mock).
    </p>
  )
}
