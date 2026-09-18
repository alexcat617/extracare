import { useEffect, useState } from 'react'
import { usePrototype } from '../context/PrototypeContext'
import { isWithinDisputeWindow } from '../lib/escrowTimeline'
import { BottomSheet, OutlineButton, PrimaryButton } from './BottomSheet'
import { EscrowTimeline } from './EscrowTimeline'
import { MobileRadioCard } from './MobileFormControls'

type DisputeType = 'not-in-wallet' | 'terms-mismatch'

export function PurchaseTrustFlowSheets() {
  const {
    state,
    activeSheet,
    selectedTransferId,
    closeSheet,
    openSheet,
    goToWallet,
    runDisputeWalletCheck,
    runDisputeTermsResolution,
  } = usePrototype()

  const [disputeType, setDisputeType] = useState<DisputeType | null>(null)
  const [checking, setChecking] = useState(false)

  const transfer = selectedTransferId
    ? state.transfers.find((t) => t.id === selectedTransferId)
    : undefined
  const snap = transfer?.listingSnapshot

  useEffect(() => {
    if (activeSheet !== 'disputeCheckingWallet' || !selectedTransferId) return
    setChecking(true)
    const id = selectedTransferId
    const timer = window.setTimeout(() => {
      setChecking(false)
      if (disputeType === 'terms-mismatch') {
        const outcome = runDisputeTermsResolution(id)
        if (outcome === 'match') openSheet('disputeTermsEducate')
        else if (outcome === 'denied') openSheet('disputeRefundDenied')
        else if (outcome === 'refunded') openSheet('disputeRefundSuccess')
        else openSheet('disputeTermsEducate')
        return
      }
      const check = runDisputeWalletCheck(id)
      if (check === 'found') openSheet('disputeOfferInWallet')
      else if (check === 'denied') openSheet('disputeRefundDenied')
      else if (check === 'refunded') openSheet('disputeRefundSuccess')
      else if (check === 'retry') openSheet('disputeRetryPending')
    }, 900)
    return () => window.clearTimeout(timer)
  }, [
    activeSheet,
    selectedTransferId,
    disputeType,
    openSheet,
    runDisputeWalletCheck,
    runDisputeTermsResolution,
  ])

  const beginHelp = () => {
    if (!transfer) return
    if (!isWithinDisputeWindow(transfer)) {
      openSheet('disputeLateSupport')
      return
    }
    setDisputeType(null)
    openSheet('disputeTypePick')
  }

  const submitDisputeType = () => {
    if (!disputeType || !selectedTransferId) return
    openSheet('disputeCheckingWallet')
  }

  return (
    <>
      <BottomSheet
        title="Purchase status"
        size="flow"
        open={activeSheet === 'purchaseStatus'}
        onClose={closeSheet}
        footer={
          transfer ? (
            <div className="space-y-3">
              {transfer.refundStatus !== 'completed' ? (
                <OutlineButton onClick={beginHelp}>Get help</OutlineButton>
              ) : null}
              <PrimaryButton onClick={closeSheet}>Done</PrimaryButton>
            </div>
          ) : (
            <PrimaryButton onClick={closeSheet}>Done</PrimaryButton>
          )
        }
      >
        {transfer ? (
          <div className="space-y-4 text-sm text-cvs-gray-muted">
            <p className="text-base font-semibold text-black">
              {snap?.title ?? 'Protected purchase'}
            </p>
            <p className="rounded-lg border border-cvs-gray-border bg-cvs-gray-bg p-3 font-mono text-xs text-black">
              Transfer ID: {transfer.id}
            </p>
            <EscrowTimeline transfer={transfer} walletOffers={state.walletOffers} />
            <p className="text-xs">
              Report issues within 24 hours of purchase for in-app resolution. After that, contact
              CVS support with your transfer ID.
            </p>
          </div>
        ) : (
          <p className="text-sm text-cvs-gray-muted">Purchase not found.</p>
        )}
      </BottomSheet>

      <BottomSheet
        title="Report an issue"
        size="flow"
        open={activeSheet === 'disputeTypePick'}
        onClose={() => openSheet('purchaseStatus')}
        footer={
          <PrimaryButton disabled={!disputeType} onClick={submitDisputeType}>
            Continue
          </PrimaryButton>
        }
      >
        <fieldset className="space-y-3">
          <legend className="sr-only">Issue type</legend>
          <MobileRadioCard
            name="dispute-type"
            value="not-in-wallet"
            checked={disputeType === 'not-in-wallet'}
            onSelect={() => setDisputeType('not-in-wallet')}
            label="Offer not in my wallet"
            hint="We will check your ExtraCare card and retry the transfer if needed."
          />
          <MobileRadioCard
            name="dispute-type"
            value="terms-mismatch"
            checked={disputeType === 'terms-mismatch'}
            onSelect={() => setDisputeType('terms-mismatch')}
            label="Different terms than listing"
            hint="We compare the listing snapshot to what was issued on your card."
          />
        </fieldset>
      </BottomSheet>

      <BottomSheet
        title="Outside the 24-hour window"
        size="flow"
        open={activeSheet === 'disputeLateSupport'}
        onClose={() => openSheet('purchaseStatus')}
        footer={<PrimaryButton onClick={closeSheet}>OK</PrimaryButton>}
      >
        <p className="text-sm text-cvs-gray-muted">
          Automatic refunds and wallet retries are only available within 24 hours of purchase. Please
          call CVS support with your transfer ID for help.
        </p>
      </BottomSheet>

      <BottomSheet
        title="Checking your wallet"
        size="flow"
        open={activeSheet === 'disputeCheckingWallet'}
        onClose={() => openSheet('purchaseStatus')}
        footer={null}
      >
        <p className="text-sm text-cvs-gray-muted" role="status">
          {checking
            ? 'Looking for this offer on your ExtraCare card…'
            : 'Finishing wallet check…'}
        </p>
      </BottomSheet>

      <BottomSheet
        title="Offer found on your card"
        size="flow"
        open={activeSheet === 'disputeOfferInWallet'}
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
            <OutlineButton onClick={closeSheet}>Close</OutlineButton>
          </div>
        }
      >
        <p className="text-sm text-cvs-gray-muted">
          We found this offer on your ExtraCare wallet with transfer ID{' '}
          <span className="font-mono text-black">{transfer?.id}</span>. Marketplace protection only
          covers official transfers on your card—not barcode screenshots or off-app trades.
        </p>
      </BottomSheet>

      <BottomSheet
        title="Retrying transfer"
        size="flow"
        open={activeSheet === 'disputeRetryPending'}
        onClose={() => openSheet('purchaseStatus')}
        footer={<PrimaryButton onClick={() => openSheet('disputeCheckingWallet')}>Continue</PrimaryButton>}
      >
        <p className="text-sm text-cvs-gray-muted">
          The offer was still missing, so we queued one automatic retry to your ExtraCare card. Tap
          continue to check again.
        </p>
      </BottomSheet>

      <BottomSheet
        title="Refund issued"
        size="flow"
        open={activeSheet === 'disputeRefundSuccess'}
        onClose={closeSheet}
        footer={<PrimaryButton onClick={closeSheet}>OK</PrimaryButton>}
      >
        <p className="text-sm text-cvs-gray-muted">
          Your payment was refunded from escrow. Funds typically return in 3–5 business days. Case ID:{' '}
          <span className="font-mono text-black">{transfer?.disputeCaseId ?? '—'}</span>
        </p>
      </BottomSheet>

      <BottomSheet
        title="Refund not available"
        size="flow"
        open={activeSheet === 'disputeRefundDenied'}
        onClose={closeSheet}
        footer={<PrimaryButton onClick={closeSheet}>OK</PrimaryButton>}
      >
        <p className="text-sm text-cvs-gray-muted">
          This transfer is already tied to a store redemption, so a refund cannot be issued in the
          app. If you believe this is an error, contact CVS support with your transfer ID.
        </p>
      </BottomSheet>

      <BottomSheet
        title="Terms match the listing"
        size="flow"
        open={activeSheet === 'disputeTermsEducate'}
        onClose={closeSheet}
        footer={
          <div className="space-y-3">
            <PrimaryButton
              onClick={() => {
                closeSheet()
                goToWallet()
              }}
            >
              View offer on card
            </PrimaryButton>
            <OutlineButton onClick={closeSheet}>Close</OutlineButton>
          </div>
        }
      >
        <p className="text-sm text-cvs-gray-muted">
          The offer on your card matches what was listed at purchase. At checkout, scan your
          ExtraCare card or use the app wallet—the savings apply automatically when terms are met.
        </p>
      </BottomSheet>

      <BottomSheet
        title="Marketplace protection"
        size="flow"
        open={activeSheet === 'disputeProtection'}
        onClose={closeSheet}
        footer={<PrimaryButton onClick={closeSheet}>Got it</PrimaryButton>}
      >
        <div className="space-y-3 text-sm text-cvs-gray-muted">
          <p>
            <strong className="text-black">Official transfers only:</strong> Valid offers live on your
            ExtraCare card with a transfer ID. Never trust barcode photos or trades outside the CVS
            app.
          </p>
          <p>
            <strong className="text-black">Escrow on paid buys:</strong> Payment stays with CVS until
            we verify the offer on your wallet, usually within minutes.
          </p>
          <p>
            <strong className="text-black">24-hour help:</strong> Report missing offers or term issues
            within a day of purchase for automatic checks and refunds when eligible.
          </p>
        </div>
      </BottomSheet>
    </>
  )
}
