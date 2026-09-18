import { useEffect, useState } from 'react'
import { formatPayoutPreview } from '../store/sellActions'
import { getListingManageBlock } from '../store/listingManageActions'
import { getOfferForListing } from '../store/prototypeStore'
import { priceBand, normalizePrice } from '../lib/sellPricing'
import { usePrototype } from '../context/PrototypeContext'
import { CouponOfferSection } from './CouponOfferSection'
import { BottomSheet, OutlineButton, PrimaryButton, SuccessBanner } from './BottomSheet'

export function MyListingFlowSheets() {
  const {
    state,
    activeSheet,
    selectedListingId,
    closeSheet,
    openSheet,
    updateMyListingPrice,
    cancelMyListing,
  } = usePrototype()

  const listing = state.listings.find((l) => l.id === selectedListingId)
  const offer = listing ? getOfferForListing(state.offers, listing) : undefined
  const savings = offer?.savingsAmount ?? listing?.price ?? 0
  const band = priceBand(savings)
  const block = listing ? getListingManageBlock(state, listing) : null

  const [askingPrice, setAskingPrice] = useState('')
  const [priceError, setPriceError] = useState(false)

  useEffect(() => {
    setAskingPrice('')
    setPriceError(false)
  }, [selectedListingId, activeSheet])

  useEffect(() => {
    if (activeSheet === 'myListingEditPrice' && listing && askingPrice === '') {
      setAskingPrice(listing.price.toFixed(2))
    }
  }, [activeSheet, listing, askingPrice])

  const handleSavePrice = () => {
    if (!selectedListingId) return
    const parsed = parseFloat(askingPrice)
    if (Number.isNaN(parsed)) {
      setPriceError(true)
      return
    }
    const result = updateMyListingPrice(selectedListingId, parsed)
    if (result === 'price' || result === 'error') {
      setPriceError(true)
      return
    }
    if (result === 'blocked') {
      openSheet('myListingBlocked', selectedListingId)
      return
    }
    closeSheet()
  }

  const handleCancelConfirm = () => {
    if (!selectedListingId) return
    const result = cancelMyListing(selectedListingId)
    if (result === 'blocked') {
      openSheet('myListingBlocked', selectedListingId)
      return
    }
    if (result === 'success') {
      closeSheet()
      openSheet('myListingCancelled')
    }
  }

  const tryEditPrice = () => {
    if (!selectedListingId || !listing) return
    if (block === 'escrow' || block === 'trade') {
      openSheet('myListingBlocked', selectedListingId)
      return
    }
    openSheet('myListingEditPrice', selectedListingId)
  }

  const tryCancel = () => {
    if (!selectedListingId || !listing) return
    if (block === 'escrow' || block === 'trade') {
      openSheet('myListingBlocked', selectedListingId)
      return
    }
    openSheet('myListingCancelConfirm', selectedListingId)
  }

  return (
    <>
      <BottomSheet
        title="Manage listing"
        size="flow"
        open={activeSheet === 'myListingManage'}
        onClose={closeSheet}
        footer={
          listing?.status === 'active' ? (
            <div className="space-y-3">
              <PrimaryButton onClick={tryEditPrice}>Edit price</PrimaryButton>
              <OutlineButton variant="destructive" onClick={tryCancel}>
                Cancel listing
              </OutlineButton>
              <OutlineButton onClick={closeSheet}>Close</OutlineButton>
            </div>
          ) : (
            <OutlineButton onClick={closeSheet}>Close</OutlineButton>
          )
        }
      >
        {listing && offer ? (
          <div className="space-y-4 text-sm">
            <CouponOfferSection
              label="Listed coupon"
              tone="listing"
              offers={[offer]}
              marketplace
              price={listing.price}
              badge={
                listing.type === 'trade'
                  ? 'Open to trades'
                  : listing.badge && listing.badge !== 'From your wallet'
                    ? listing.badge
                    : undefined
              }
            />
            <p className="rounded-lg border border-cvs-gray-border bg-cvs-gray-bg/80 px-3 py-2 text-xs text-cvs-gray-muted">
              Offer expires {listing.expiresAt}. While listed, this coupon stays reserved and
              won&apos;t appear on your card for in-store use.
            </p>
            {block === 'escrow' ? (
              <p className="rounded-lg border border-cvs-gray-border bg-white px-3 py-2 text-xs text-black" role="status">
                A buyer purchase is processing. Edit and cancel unlock when escrow completes.
              </p>
            ) : null}
            {block === 'trade' ? (
              <p className="rounded-lg border border-cvs-gray-border bg-white px-3 py-2 text-xs text-black" role="status">
                A trade is in progress on this listing. Finish or decline the offer before
                changing price or cancelling.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-cvs-gray-muted">Listing not found.</p>
        )}
      </BottomSheet>

      <BottomSheet
        title="Edit price"
        size="flow"
        open={activeSheet === 'myListingEditPrice'}
        onClose={closeSheet}
        footer={
          <div className="space-y-3">
            <PrimaryButton onClick={handleSavePrice}>Save price</PrimaryButton>
            <OutlineButton
              onClick={() =>
                selectedListingId
                  ? openSheet('myListingManage', selectedListingId)
                  : closeSheet()
              }
            >
              Cancel
            </OutlineButton>
          </div>
        }
      >
        {listing ? (
          <div className="space-y-4 text-sm">
            <p className="text-cvs-gray-muted">
              Allowed range ${band.floor.toFixed(2)}–${band.ceiling.toFixed(2)} based on coupon
              value.
            </p>
            <p className="text-sm">
              <span className="text-cvs-gray-muted">Current listing price </span>
              <span className="font-bold text-cvs-red">${listing.price.toFixed(2)}</span>
            </p>
            <label className="block">
              <span className="mb-1 block font-semibold text-black">Asking price</span>
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
                className="w-full rounded-xl border border-cvs-gray-border px-4 py-3 text-base text-black"
              />
            </label>
            {priceError ? (
              <p className="text-xs text-black" role="alert">
                Enter a price between ${band.floor.toFixed(2)} and ${band.ceiling.toFixed(2)}.
              </p>
            ) : null}
            <p className="text-xs text-cvs-gray-muted">
              {formatPayoutPreview(normalizePrice(parseFloat(askingPrice) || listing.price))}
            </p>
          </div>
        ) : null}
      </BottomSheet>

      <BottomSheet
        title="Cancel listing?"
        size="flow"
        open={activeSheet === 'myListingCancelConfirm'}
        onClose={closeSheet}
        footer={
          <div className="space-y-3">
            <PrimaryButton onClick={handleCancelConfirm}>Yes, cancel listing</PrimaryButton>
            <OutlineButton onClick={closeSheet}>Keep listing</OutlineButton>
          </div>
        }
      >
        <p className="text-sm text-cvs-gray-muted">
          Your offer will return to <strong className="text-black">On card</strong> and you can use
          or list it again. Buyers will no longer see this listing on Marketplace.
        </p>
      </BottomSheet>

      <BottomSheet
        title="Can’t change listing yet"
        size="flow"
        open={activeSheet === 'myListingBlocked'}
        onClose={closeSheet}
        footer={<PrimaryButton onClick={closeSheet}>OK</PrimaryButton>}
      >
        <p className="text-sm text-cvs-gray-muted">
          {block === 'escrow'
            ? 'Purchase processing — try again after the buyer’s payment and transfer finish.'
            : block === 'trade'
              ? 'Trade in progress — respond to the offer or wait until it expires.'
              : 'This listing can’t be edited right now.'}
        </p>
      </BottomSheet>

      <BottomSheet
        title="Listing cancelled"
        size="flow"
        open={activeSheet === 'myListingCancelled'}
        onClose={closeSheet}
        footer={<PrimaryButton onClick={closeSheet}>Done</PrimaryButton>}
      >
        <div className="space-y-4 text-sm text-cvs-gray-muted">
          <SuccessBanner title="Listing cancelled" />
          <p>
            Your coupon is back on your card. Check <strong className="text-black">On card</strong>{' '}
            to use or list it again.
          </p>
        </div>
      </BottomSheet>
    </>
  )
}
