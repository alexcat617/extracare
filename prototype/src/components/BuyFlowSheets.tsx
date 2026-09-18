import { useState } from 'react'
import { computeExtraBucksBalances } from '../lib/extraBucksBalance'
import { calcOrderTotal } from '../lib/pricing'
import { usePrototype } from '../context/PrototypeContext'
import { getOfferForListing } from '../store/prototypeStore'
import { BottomSheet, OutlineButton, PrimaryButton, SuccessBanner } from './BottomSheet'
import { MobileRadioCard } from './MobileFormControls'

function channelLabel(channel: string): string {
  if (channel === 'in-store') return 'In store only'
  if (channel === 'online') return 'Online only'
  return 'In store or online'
}

export function BuyFlowSheets() {
  const {
    state,
    activeSheet,
    selectedListingId,
    closeSheet,
    openSheet,
    tryTransactionalAction,
    confirmPurchase,
    beginTradeProposal,
    goToWallet,
  } = usePrototype()

  const [paymentMethod, setPaymentMethod] = useState<'extrabucks' | 'card'>('extrabucks')
  const [purchasing, setPurchasing] = useState(false)

  const listing = state.listings.find((l) => l.id === selectedListingId)
  const listingOffer = listing ? getOfferForListing(state.offers, listing) : undefined
  const order = listing ? calcOrderTotal(listing.price) : null
  const extraBucks = computeExtraBucksBalances(state)

  const startBuy = () => {
    tryTransactionalAction(() => {
      if (!listing || listing.status !== 'active') {
        openSheet('buyUnavailable')
        return
      }
      openSheet('buyConfirm')
    })
  }

  const handleConfirmPay = async () => {
    if (!selectedListingId) return
    setPurchasing(true)
    const result = await confirmPurchase(selectedListingId)
    setPurchasing(false)
    if (result === 'success') openSheet('buySuccess')
    else if (result === 'payment') openSheet('buyPaymentFailed')
    else if (result === 'sold') openSheet('buyUnavailable')
    else if (result === 'wallet-timeout') openSheet('buyRefundTimeout')
  }

  return (
    <>
      <BottomSheet
        title={listingOffer?.title ?? 'Listing'}
        size="flow"
        open={activeSheet === 'listingDetail'}
        onClose={closeSheet}
        footer={
          listing && listingOffer ? (
            <div className="space-y-3">
              {listing.status !== 'active' ? (
                <p className="text-center text-sm font-medium text-cvs-red" role="status">
                  No longer available
                </p>
              ) : listing.type === 'trade' ? (
                <PrimaryButton onClick={() => beginTradeProposal(listing.id)}>
                  Propose trade
                </PrimaryButton>
              ) : (
                <PrimaryButton onClick={startBuy}>
                  Buy — ${listing.price.toFixed(2)}
                </PrimaryButton>
              )}
              {listing.status === 'active' && listing.type !== 'trade' ? (
                <OutlineButton onClick={() => beginTradeProposal(listing.id)}>
                  Propose trade
                </OutlineButton>
              ) : null}
              {listing.type === 'trade' ? (
                <OutlineButton onClick={startBuy}>
                  Buy instead — ${listing.price.toFixed(2)}
                </OutlineButton>
              ) : null}
            </div>
          ) : undefined
        }
      >
        {listing && listingOffer ? (
          <div className="space-y-4 text-sm">
            <p className="text-xl font-bold text-cvs-red">
              ${listingOffer.savingsAmount} off — ${listing.price.toFixed(2)} to buy
            </p>
            <p>{listingOffer.headline}</p>
            <div>
              <p className="mb-2 font-semibold text-black">Terms checklist</p>
              <ul className="space-y-2">
                <TermsRow
                  label="Minimum purchase"
                  value={
                    listingOffer.minPurchase
                      ? `$${listingOffer.minPurchase}`
                      : 'No minimum'
                  }
                />
                <TermsRow label="Where to use" value={channelLabel(listingOffer.channel)} />
                <TermsRow label="Expires" value={listingOffer.expiry} />
                <TermsRow
                  label="Stacking"
                  value={listingOffer.stackSummary ?? 'Standard ExtraCare rules apply'}
                />
              </ul>
            </div>
            {listing.type === 'trade' ? (
              <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-950">
                Trade preferred: seller is open to swapping coupons. You can still buy with cash if
                you prefer.
              </p>
            ) : (
              <p className="rounded-lg bg-blue-50 p-3 text-xs text-cvs-blue-dark">
                Protected purchase: payment stays in CVS escrow until this offer appears in your
                Deals wallet. No scannable barcode on this screen.
              </p>
            )}
            {listing.badge ? (
              <p className="text-xs text-amber-800" role="status">
                {listing.badge} — popular listings may sell quickly.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-cvs-gray-muted">Listing not found.</p>
        )}
      </BottomSheet>

      <BottomSheet
        title="Buy now"
        size="flow"
        open={activeSheet === 'buyConfirm'}
        onClose={closeSheet}
        footer={
          order ? (
            <div className="space-y-3">
              <PrimaryButton onClick={handleConfirmPay} disabled={purchasing}>
                {purchasing ? 'Processing…' : `Pay $${order.total.toFixed(2)}`}
              </PrimaryButton>
              <p className="text-center text-xs text-cvs-gray-muted">
                Funds held in escrow until wallet sync completes.
              </p>
            </div>
          ) : undefined
        }
      >
        {listing && listingOffer && order ? (
          <div className="space-y-4 text-sm">
            <div className="flex gap-3 rounded-xl border border-cvs-gray-border p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-xl" aria-hidden>
                🎟️
              </div>
              <div>
                <p className="font-semibold text-black">{listingOffer.title}</p>
                <p className="text-cvs-red font-bold">${listingOffer.savingsAmount} off</p>
              </div>
            </div>
            <div className="space-y-2 border-b border-cvs-gray-border pb-3">
              <Row label="Listing price" value={`$${order.price.toFixed(2)}`} />
              <Row label="Platform fee" value={`$${order.platformFee.toFixed(2)}`} />
              <Row label="Total" value={`$${order.total.toFixed(2)}`} bold />
            </div>
            <fieldset className="space-y-3">
              <legend className="mb-1 font-semibold text-black">Payment</legend>
              <MobileRadioCard
                name="pay"
                value="extrabucks"
                checked={paymentMethod === 'extrabucks'}
                onSelect={() => setPaymentMethod('extrabucks')}
                label="ExtraBucks balance"
                hint={`$${extraBucks.available.toFixed(2)} available · use for this purchase`}
              />
              <MobileRadioCard
                name="pay"
                value="card"
                checked={paymentMethod === 'card'}
                onSelect={() => setPaymentMethod('card')}
                label="Card on file"
                hint="Visa •••• 4242 (mock)"
              />
            </fieldset>
          </div>
        ) : null}
      </BottomSheet>

      <BottomSheet
        title="Offer in your wallet"
        size="flow"
        open={activeSheet === 'buySuccess'}
        onClose={closeSheet}
        footer={
          <div className="space-y-3">
            <PrimaryButton
              onClick={() => {
                closeSheet()
                goToWallet()
              }}
            >
              View on card
            </PrimaryButton>
            <OutlineButton onClick={closeSheet}>Continue shopping</OutlineButton>
          </div>
        }
      >
        <div className="space-y-4 text-sm text-cvs-gray-muted">
          <SuccessBanner title="Protected purchase complete" />
          <p>
            Your payment was released to the seller after we confirmed the offer on your ExtraCare
            card.
          </p>
          <p className="rounded-lg border border-cvs-gray-border bg-cvs-gray-bg p-3 font-mono text-xs text-black">
            Transfer ID: {state.lastPurchaseTransferId ?? '—'}
          </p>
          <p className="text-xs">Save this ID if you need help from CVS support.</p>
        </div>
      </BottomSheet>

      <BottomSheet
        title="Payment didn’t go through"
        size="flow"
        open={activeSheet === 'buyPaymentFailed'}
        onClose={closeSheet}
        footer={
          <div className="space-y-3">
            <PrimaryButton onClick={() => openSheet('buyConfirm')}>Try again</PrimaryButton>
            <OutlineButton onClick={closeSheet}>Back to listing</OutlineButton>
          </div>
        }
      >
        <p className="text-sm text-cvs-gray-muted">
          We couldn’t charge your payment method. No transfer was started and the listing is still
          available.
        </p>
      </BottomSheet>

      <BottomSheet
        title="No longer available"
        size="flow"
        open={activeSheet === 'buyUnavailable'}
        onClose={closeSheet}
        footer={<PrimaryButton onClick={closeSheet}>Browse marketplace</PrimaryButton>}
      >
        <p className="text-sm text-cvs-gray-muted">
          Another member bought this listing just before you confirmed. You were not charged.
        </p>
      </BottomSheet>

      <BottomSheet
        title="Purchase refunded"
        size="flow"
        open={activeSheet === 'buyRefundTimeout'}
        onClose={closeSheet}
        footer={<PrimaryButton onClick={closeSheet}>OK</PrimaryButton>}
      >
        <p className="text-sm text-cvs-gray-muted">
          We couldn’t add this offer to your wallet within 15 minutes, so your payment was
          automatically refunded from escrow. The seller has been notified. They may list again
          from their wallet.
        </p>
      </BottomSheet>

    </>
  )
}

function TermsRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex justify-between gap-4 border-b border-cvs-gray-border/60 py-2">
      <span className="text-cvs-gray-muted">{label}</span>
      <span className="font-medium text-black text-right">{value}</span>
    </li>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? 'font-semibold text-black' : 'text-cvs-gray-muted'}>{label}</span>
      <span className={bold ? 'font-bold text-black' : 'text-black'}>{value}</span>
    </div>
  )
}
