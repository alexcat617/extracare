import { useEffect, useState } from 'react'
import { normalizePrice, priceBand } from '../lib/sellPricing'
import { usePrototype } from '../context/PrototypeContext'
import { checkSellEligibility, formatPayoutPreview } from '../store/sellActions'
import type { PrototypeState } from '../store/prototypeStore'
import { BottomSheet, OutlineButton, PrimaryButton } from './BottomSheet'

export function SellFlowSheets() {
  const {
    state,
    activeSheet,
    selectedWalletOfferId,
    closeSheet,
    openSheet,
    publishWalletListing,
    navigateToMarketplace,
    openMarketplaceActivity,
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
            <PrimaryButton
              onClick={() => {
                setListingType('sale')
                openSheet('sellListingForm')
              }}
            >
              Sell on Marketplace
            </PrimaryButton>
            <OutlineButton
              onClick={() => {
                setListingType('trade')
                openSheet('sellListingForm')
              }}
            >
              List for trade
            </OutlineButton>
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
        title="Set your price"
        size="flow"
        open={activeSheet === 'sellListingForm'}
        onClose={closeSheet}
        footer={
          walletOffer && band ? (
            <div className="space-y-3">
              <PrimaryButton onClick={handlePublish}>Publish listing</PrimaryButton>
              <OutlineButton onClick={closeSheet}>Cancel</OutlineButton>
              <p className="text-center text-xs text-cvs-gray-muted">
                {formatPayoutPreview(parseFloat(askingPrice) || band.suggested)}
              </p>
            </div>
          ) : undefined
        }
      >
        {walletOffer && band ? (
          <div className="space-y-4 text-sm">
            {listingType === 'trade' ? (
              <p className="rounded-lg bg-amber-50 p-3 text-amber-950">
                Trade preferred: buyers can propose a swap. Cash buy stays available at your listed
                price for fairness hints.
              </p>
            ) : null}
            {!state.sellerHasPublishedBefore ? (
              <p className="rounded-lg border border-cvs-blue/30 bg-blue-50 p-3 text-cvs-blue-dark">
                <strong>First listing?</strong> Your offer is held in escrow on Marketplace—not on
                your card—until a buyer purchases or you cancel in My listings (coming soon).
              </p>
            ) : null}
            <ul className="space-y-1 text-cvs-gray-muted">
              <li>Expires {walletOffer.expiry}</li>
              <li>
                Allowed range ${band.floor.toFixed(2)}–${band.ceiling.toFixed(2)} (20–80% of $
                {walletOffer.savingsAmount} savings)
              </li>
            </ul>
            <button
              type="button"
              onClick={applySuggestedPrice}
              className="flex min-h-[48px] w-full flex-col items-center justify-center rounded-xl border border-cvs-gray-border bg-cvs-gray-bg px-4 py-2.5 text-center"
            >
              <span className="text-base font-semibold text-cvs-gray-muted">
                Apply suggested price · ${band.suggested.toFixed(2)}
              </span>
              <span className="mt-0.5 text-xs text-cvs-gray-muted">Fills the field only—not publish</span>
            </button>
            <label className="block">
              <span className="mb-2 block font-semibold text-black">Asking price</span>
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
              />
            </label>
            {priceError ? (
              <p className="text-sm text-cvs-red" role="alert">
                Enter a price in the allowed range, or tap Use suggested price above.
              </p>
            ) : null}
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
            <OutlineButton
              onClick={() => {
                closeSheet()
                openMarketplaceActivity()
              }}
            >
              My listings
            </OutlineButton>
          </div>
        }
      >
        <p className="text-sm text-cvs-gray-muted">
          Your offer is reserved and buyers can find it under Savings → Marketplace. You’ll get paid
          after a protected purchase completes.
        </p>
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
