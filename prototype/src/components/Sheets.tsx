import { useState } from 'react'
import { usePrototype } from '../context/PrototypeContext'
import { getOfferForListing } from '../store/prototypeStore'
import { BottomSheet, OutlineButton, PrimaryButton } from './BottomSheet'

export function SheetHost() {
  const {
    state,
    activeSheet,
    selectedListingId,
    closeSheet,
    acceptMarketplaceRules,
    declineMarketplaceRules,
    setExtraCareLinked,
    openSheet,
    tryTransactionalAction,
  } = usePrototype()

  const [consentChecked, setConsentChecked] = useState(false)

  const listing = state.listings.find((l) => l.id === selectedListingId)
  const listingOffer = listing ? getOfferForListing(state.offers, listing) : undefined

  const openConsentFromBlocked = () => {
    closeSheet()
    openSheet('consent')
    setConsentChecked(false)
  }

  return (
    <>
      <BottomSheet
        title="Marketplace rules"
        open={activeSheet === 'consent'}
        onClose={declineMarketplaceRules}
        ariaLabel="Marketplace rules and consent"
        footer={
          <div className="space-y-3">
            <label className="flex items-start gap-3 text-sm text-black">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              <span>
                I agree to marketplace terms. Offers move to the buyer&apos;s ExtraCare card through
                an official transfer—no barcode screenshots or phone-number trades.
              </span>
            </label>
            <PrimaryButton
              disabled={!consentChecked}
              onClick={() => {
                acceptMarketplaceRules()
                setConsentChecked(false)
              }}
            >
              Continue
            </PrimaryButton>
            <OutlineButton onClick={declineMarketplaceRules}>Browse without accepting</OutlineButton>
          </div>
        }
      >
        <div className="space-y-4 text-sm text-cvs-gray-muted">
          <p className="text-base font-semibold text-black">How ExtraCare Marketplace works</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-black">Official transfer:</strong> When you buy, sell, or trade,
              the offer leaves the seller&apos;s card and is re-issued on the buyer&apos;s card with a
              transfer ID for support.
            </li>
            <li>
              <strong className="text-black">No barcode resale:</strong> Listings show terms and
              category art—not scannable barcodes. Your wallet is the source of truth after purchase.
            </li>
            <li>
              <strong className="text-black">Protected purchases:</strong> For paid buys, payment is
              held in CVS escrow until the offer appears in your wallet (usually within minutes).
            </li>
          </ul>
          <p className="text-xs">
            Consent version {state.consentVersion ?? 'not yet accepted'} · Case study prototype
          </p>
        </div>
      </BottomSheet>

      <BottomSheet
        title="Link ExtraCare"
        open={activeSheet === 'linkExtraCare'}
        onClose={closeSheet}
        footer={
          <PrimaryButton
            onClick={() => {
              setExtraCareLinked(true)
              closeSheet()
            }}
          >
            Link ExtraCare (mock)
          </PrimaryButton>
        }
      >
        <p className="text-sm text-cvs-gray-muted">
          Link your ExtraCare card before you buy, sell, or trade on Marketplace. This matches the CVS
          app pattern for wallet and savings features.
        </p>
      </BottomSheet>

      <BottomSheet
        title="Accept marketplace rules"
        open={activeSheet === 'blockedConsent'}
        onClose={closeSheet}
        footer={
          <div className="space-y-3">
            <PrimaryButton onClick={openConsentFromBlocked}>Review rules</PrimaryButton>
            <OutlineButton onClick={closeSheet}>Not now</OutlineButton>
          </div>
        }
      >
        <p className="text-sm text-cvs-gray-muted">
          You can browse listings, but buying, selling, and trading require accepting marketplace
          rules first.
        </p>
      </BottomSheet>

      <BottomSheet
        title="You&apos;re offline"
        open={activeSheet === 'offline'}
        onClose={closeSheet}
        footer={<PrimaryButton onClick={closeSheet}>OK</PrimaryButton>}
      >
        <p className="text-sm text-cvs-gray-muted">
          Marketplace browse may be available from cache, but purchases and listing actions are
          paused. Check your connection and try again.
        </p>
      </BottomSheet>

      <BottomSheet
        title={listingOffer?.title ?? 'Listing'}
        open={activeSheet === 'listingDetail'}
        onClose={closeSheet}
        footer={
          listing && listingOffer ? (
            <PrimaryButton
              onClick={() =>
                tryTransactionalAction(() => {
                  closeSheet()
                  openSheet('feat01Stub')
                })
              }
            >
              Buy — ${listing.price.toFixed(2)}
            </PrimaryButton>
          ) : undefined
        }
      >
        {listing && listingOffer ? (
          <div className="space-y-3 text-sm">
            <p className="text-xl font-bold text-cvs-red">
              ${listingOffer.savingsAmount} off — ${listing.price.toFixed(2)} to buy
            </p>
            <p>{listingOffer.headline}</p>
            <ul className="list-disc space-y-1 pl-5 text-cvs-gray-muted">
              {listingOffer.minPurchase ? (
                <li>Minimum purchase: ${listingOffer.minPurchase}</li>
              ) : null}
              <li>Channel: {listingOffer.channel.replace('-', ' ')}</li>
              <li>Expires: {listingOffer.expiry}</li>
              {listingOffer.stackSummary ? <li>{listingOffer.stackSummary}</li> : null}
            </ul>
            <p className="rounded-lg bg-blue-50 p-3 text-xs text-cvs-blue-dark">
              Terms preview only—no scannable barcode. Full offer appears in wallet after official
              transfer (FEAT-01).
            </p>
          </div>
        ) : (
          <p className="text-sm text-cvs-gray-muted">Listing not found.</p>
        )}
      </BottomSheet>

      <BottomSheet
        title="Buy flow"
        open={activeSheet === 'feat01Stub'}
        onClose={closeSheet}
        footer={<OutlineButton onClick={closeSheet}>Close</OutlineButton>}
      >
        <p className="text-sm text-cvs-gray-muted">
          <strong className="text-black">FEAT-01 stub:</strong> Browse, escrow confirm, and wallet
          success will ship in the next build package. Consent and ExtraCare gates are wired.
        </p>
      </BottomSheet>

      <BottomSheet
        title="Sell on Marketplace"
        open={activeSheet === 'feat02Stub'}
        onClose={closeSheet}
        footer={<OutlineButton onClick={closeSheet}>Close</OutlineButton>}
      >
        <p className="text-sm text-cvs-gray-muted">
          <strong className="text-black">FEAT-02 stub:</strong> List-from-wallet pricing and publish
          flow comes next. ExtraCare link and marketplace consent are enforced here.
        </p>
      </BottomSheet>
    </>
  )
}
