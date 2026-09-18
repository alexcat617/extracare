import { useState } from 'react'
import { usePrototype } from '../context/PrototypeContext'
import { BuyFlowSheets } from './BuyFlowSheets'
import { SellFlowSheets } from './SellFlowSheets'
import { TradeFlowSheets } from './TradeFlowSheets'
import { MyListingFlowSheets } from './MyListingFlowSheets'
import { BottomSheet, OutlineButton, PrimaryButton } from './BottomSheet'
import { MobileCheckboxCard } from './MobileFormControls'

export function SheetHost() {
  const {
    state,
    activeSheet,
    closeSheet,
    acceptMarketplaceRules,
    declineMarketplaceRules,
    setExtraCareMode,
    openSheet,
  } = usePrototype()

  const [consentChecked, setConsentChecked] = useState(false)

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
            <MobileCheckboxCard
              checked={consentChecked}
              onChange={setConsentChecked}
              label="I agree to marketplace terms"
              hint="Offers move to your ExtraCare card through an official transfer—no barcode screenshots or phone-number trades."
            />
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
              setExtraCareMode(true)
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

      <BuyFlowSheets />
      <SellFlowSheets />
      <TradeFlowSheets />
      <MyListingFlowSheets />
    </>
  )
}
